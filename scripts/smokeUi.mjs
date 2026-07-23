import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EDGE =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://127.0.0.1:5173";
const outputDirectory = mkdtempSync(join(tmpdir(), "speakup-ui-smoke-"));
const browser = spawn(
  EDGE,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--remote-debugging-pipe",
    `--user-data-dir=${join(outputDirectory, "profile")}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"] },
);

let nextId = 1;
let buffer = "";
const pending = new Map();
const browserErrors = [];

browser.stdio[4].on("data", (chunk) => {
  buffer += chunk.toString();
  const messages = buffer.split("\0");
  buffer = messages.pop() ?? "";
  for (const message of messages) {
    if (!message) continue;
    const payload = JSON.parse(message);
    if (payload.id && pending.has(payload.id)) {
      const { method, resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) reject(new Error(`${method}: ${payload.error.message}`));
      else resolve(payload.result);
    } else if (
      payload.method === "Runtime.exceptionThrown" ||
      (payload.method === "Log.entryAdded" &&
        payload.params?.entry?.level === "error" &&
        payload.params?.entry?.source !== "intervention")
    ) {
      browserErrors.push(payload.params);
    }
  }
});

browser.on("exit", (code) => {
  if (code && pending.size) {
    for (const { reject } of pending.values()) {
      reject(new Error(`Edge exited unexpectedly with code ${code}`));
    }
  }
});

function send(method, params = {}, sessionId) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { method, resolve, reject });
    browser.stdio[3].write(
      `${JSON.stringify({ id, method, params, sessionId })}\0`,
    );
  });
}

async function waitFor(predicate, message, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (await predicate()) return;
    } catch {
      // Reloads briefly destroy the JavaScript execution context.
    }
    await delay(50);
  }
  throw new Error(`Timeout: ${message}`);
}

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main() {
  const { targetInfos } = await send("Target.getTargets");
  const page = targetInfos.find((target) => target.type === "page");
  const { sessionId } = await send("Target.attachToTarget", {
    targetId: page.targetId,
    flatten: true,
  });

  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Log.enable", {}, sessionId);

  const evaluate = async (expression) => {
    let result;
    try {
      result = await send(
        "Runtime.evaluate",
        { expression, awaitPromise: true, returnByValue: true },
        sessionId,
      );
    } catch (error) {
      throw new Error(
        `${error.message}; expression: ${expression.replace(/\s+/g, " ").slice(0, 240)}`,
      );
    }
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text);
    }
    return result.result.value;
  };

  const setViewport = async (width, height) => {
    await send(
      "Emulation.setDeviceMetricsOverride",
      {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
        screenWidth: width,
        screenHeight: height,
      },
      sessionId,
    );
  };

  const navigate = async (path) => {
    await send("Page.navigate", { url: `${BASE_URL}${path}` }, sessionId);
    await waitFor(
      async () =>
        (await evaluate(
          "document.readyState === 'complete' && document.body.innerText.trim().length > 0",
        )) === true,
      `load ${path}`,
    );
    await delay(120);
  };

  const click = async (selector) => {
    const clicked = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
      element.click();
      return true;
    })()`);
    assert(clicked, `Missing clickable element: ${selector}`);
    await delay(100);
  };

  const clickText = async (text, selector = "button") => {
    const clicked = await evaluate(`(() => {
      const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
        .find((item) => item.textContent.trim().includes(${JSON.stringify(text)}));
      if (!element) return false;
      element.click();
      return true;
    })()`);
    assert(clicked, `Missing button text: ${text}`);
    await delay(100);
  };

  const hasText = (text) =>
    evaluate(
      `document.body.innerText.includes(${JSON.stringify(text)})`,
    );

  const assertPath = async (path) =>
    assert(
      (await evaluate("window.location.pathname")) === path,
      `Expected path ${path}`,
    );

  const assertNoOverflow = async (label) => {
    const metrics = await evaluate(`({
      innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      bodyMargin: getComputedStyle(document.body).margin,
      visualWidth: visualViewport?.width,
      offenders: [...document.querySelectorAll('*')]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            className: typeof element.className === 'string' ? element.className : '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          };
        })
        .filter((rect) => rect.left < -1 || rect.right > innerWidth + 1)
        .slice(0, 8)
    })`);
    assert(
      metrics.scrollWidth <= metrics.innerWidth &&
        metrics.bodyWidth <= metrics.innerWidth,
      `${label} has horizontal overflow: ${JSON.stringify(metrics)}`,
    );
  };

  const assertFocusedFlow = async (label) => {
    const navigation = await evaluate(`({
      bottom: Boolean(document.querySelector('.bottom-navigation')),
      desktop: Boolean(document.querySelector('.desktop-navigation'))
    })`);
    assert(
      !navigation.bottom && !navigation.desktop,
      `${label} should not show global navigation: ${JSON.stringify(navigation)}`,
    );
  };

  const assertMainNavigation = async (width) => {
    const state = await evaluate(`(() => {
      const bottom = document.querySelector('.bottom-navigation');
      const desktop = document.querySelector('.desktop-navigation');
      const content = document.querySelector('.app-content');
      return {
        bottomDisplay: bottom ? getComputedStyle(bottom).display : null,
        desktopDisplay: desktop ? getComputedStyle(desktop).display : null,
        contentWidth: content ? content.getBoundingClientRect().width : 0,
        contentBottom: content ? Math.round(content.getBoundingClientRect().bottom) : 0,
        paddingBottom: content ? parseFloat(getComputedStyle(content).paddingBottom) : 0,
        bottomHeight: bottom ? bottom.getBoundingClientRect().height : 0,
        bottomTop: bottom ? Math.round(bottom.getBoundingClientRect().top) : 0
      };
    })()`);
    if (width >= 900) {
      assert(state.desktopDisplay !== "none", "Desktop navigation is hidden");
      assert(state.bottomDisplay === "none", "Bottom navigation is visible on desktop");
      assert(
        state.contentWidth >= 1000,
        `Desktop content is too narrow: ${state.contentWidth}px`,
      );
    } else {
      assert(state.bottomDisplay !== "none", "Mobile navigation is hidden");
      assert(
        state.contentBottom <= state.bottomTop,
        `Mobile navigation overlaps content: ${JSON.stringify(state)}`,
      );
    }
  };

  const screenshot = async (name) => {
    const { data } = await send(
      "Page.captureScreenshot",
      { format: "png", captureBeyondViewport: false },
      sessionId,
    );
    const path = join(outputDirectory, `${name}.png`);
    await import("node:fs").then(({ writeFileSync }) =>
      writeFileSync(path, data, "base64"),
    );
    return path;
  };

  const currentQuestionNumber = () =>
    evaluate(`(() => {
      const text = document.querySelector('.session-meta span')?.textContent ?? '';
      return Number(text.match(/Questão\\s+(\\d+)/)?.[1] ?? 0);
    })()`);

  const chooseCurrentAnswer = async (correct) => {
    const selected = await evaluate(`(async () => {
      const { PRESENT_TOBE_QUESTIONS } = await import('/src/content/data/presentTobeQuestions.ts');
      const prompt = document.querySelector('.question-card h1')?.textContent;
      const question = PRESENT_TOBE_QUESTIONS.find((item) => item.question === prompt);
      const option = [...document.querySelectorAll('.answer-options button')]
        .find((button) => {
          const answer = button.querySelector('strong')?.textContent;
          return ${correct} ? answer === question.correctAnswer : answer !== question.correctAnswer;
        });
      if (!option) return false;
      option.click();
      return true;
    })()`);
    assert(selected, `Could not choose a ${correct ? "correct" : "wrong"} answer`);
    await delay(80);
  };

  const pressKey = async (key, code) => {
    await send(
      "Input.dispatchKeyEvent",
      { type: "keyDown", key, code, windowsVirtualKeyCode: code === "Escape" ? 27 : 0 },
      sessionId,
    );
    await send(
      "Input.dispatchKeyEvent",
      { type: "keyUp", key, code, windowsVirtualKeyCode: code === "Escape" ? 27 : 0 },
      sessionId,
    );
    await delay(100);
  };

  const viewports = [
    [360, 800],
    [390, 844],
    [768, 1024],
    [1366, 768],
    [1440, 900],
  ];
  const screenshots = [];

  await setViewport(390, 844);
  await navigate("/");
  await evaluate(`(async () => {
    const { clearLocalProgress } = await import('/src/services/progress/localProgress.ts');
    await clearLocalProgress();
    localStorage.removeItem('last-practice-configuration');
  })()`);
  await navigate("/");
  await waitFor(
    () => hasText("Seu progresso começa na primeira rodada."),
    "initial Home progress load",
  );
  assert(await hasText("0 de 130 questões"), "Initial progress is not zero");
  assert(await hasText("Seu progresso começa na primeira rodada."), "Initial progress copy missing");
  assert(await hasText("—"), "Initial accuracy should be an em dash");
  assert(
    (await evaluate("document.querySelectorAll('.practice-hero-card').length")) === 1,
    "Home has duplicate primary practice paths",
  );
  assert(!(await hasText("Comece por aqui")), "Duplicate start panel remains on Home");
  assert(
    (await evaluate("document.querySelectorAll('.quick-game-card').length")) === 3,
    "Home should show exactly three quick games",
  );
  await navigate("/progresso");
  await waitFor(
    () => hasText("Seu progresso começa na prática"),
    "initial Progress empty state load",
  );
  assert(await hasText("Seu progresso começa na prática"), "Initial Progress empty state missing");
  await navigate("/");

  for (const [width, height] of viewports) {
    await setViewport(width, height);
    await navigate("/");
    assert(await hasText("Treine inglês no seu ritmo."), "Home content missing");
    await assertNoOverflow(`home ${width}x${height}`);
    await assertMainNavigation(width);
    screenshots.push(await screenshot(`home-${width}x${height}`));
  }

  for (const [width, height] of viewports) {
    await setViewport(width, height);
    await navigate(
      `/praticar/present_tobe/sessao?difficulty=easy&count=10&seed=${width}`,
    );
    await chooseCurrentAnswer(false);
    await clickText("Confirmar resposta");
    assert(await hasText("Estudar esse tópico"), "Study action missing on error");
    await clickText("Estudar esse tópico");
    assert(await hasText("Entenda esta questão"), "Contextual study block missing");
    assert(await hasText("Como usar o Present TO BE"), "Complete guide missing");
    const dialogBounds = await evaluate(`(() => {
      const dialog = document.querySelector('.study-dialog');
      const panel = dialog?.querySelector('.dialog-panel');
      const rect = panel?.getBoundingClientRect();
      return {
        open: Boolean(dialog?.open),
        left: rect?.left ?? -1,
        top: rect?.top ?? -1,
        right: rect?.right ?? innerWidth + 1,
        bottom: rect?.bottom ?? innerHeight + 1,
        scrollable: Boolean(document.querySelector('.study-guide-content')?.scrollHeight >
          document.querySelector('.study-guide-content')?.clientHeight)
      };
    })()`);
    assert(
      dialogBounds.open &&
        dialogBounds.left >= 0 &&
        dialogBounds.top >= 0 &&
        dialogBounds.right <= width &&
        dialogBounds.bottom <= height &&
        dialogBounds.scrollable,
      `Study dialog does not fit ${width}x${height}: ${JSON.stringify(dialogBounds)}`,
    );
    await assertNoOverflow(`study dialog ${width}x${height}`);
    screenshots.push(await screenshot(`study-dialog-${width}x${height}`));
  }

  await evaluate(`(async () => {
    const { clearLocalProgress } = await import('/src/services/progress/localProgress.ts');
    await clearLocalProgress();
  })()`);

  await setViewport(390, 844);
  await navigate("/");
  await click(".practice-hero-card");
  assert(await hasText("O que você quer praticar?"), "Bottom sheet did not open");
  const navigationHiddenByDialog = await evaluate(`(() => {
    const nav = document.querySelector('.bottom-navigation');
    return nav && getComputedStyle(nav).visibility === 'hidden';
  })()`);
  assert(navigationHiddenByDialog, "Global navigation remained visible under dialog");
  screenshots.push(await screenshot("home-bottom-sheet"));
  await clickText("Gramática", ".sheet-choices button");
  await assertPath("/gramatica");
  await assertFocusedFlow("grammar topics");
  assert(await hasText("Verbo TO BE — presente"), "Grammar topics missing");
  await clickText("Verbo TO BE - passado");
  assert(await hasText("disponível em breve"), "Locked topic feedback missing");
  await click(".available-topic");
  await assertPath("/gramatica/present_tobe");
  await assertFocusedFlow("practice setup");

  await clickText("Médio", ".segmented-control button");
  await clickText("10", ".segmented-control button");
  await setViewport(1366, 768);
  await assertNoOverflow("setup 1366x768");
  screenshots.push(await screenshot("setup-desktop"));
  await setViewport(390, 844);
  await clickText("Iniciar desafio");
  await assertPath("/praticar/present_tobe/sessao");
  await assertFocusedFlow("practice session");
  assert(await hasText("Questão 1 de 10"), "10-question session missing");
  await assertNoOverflow("session 390x844");
  screenshots.push(await screenshot("session-question"));

  await chooseCurrentAnswer(true);
  const correctStartedAt = Date.now();
  await clickText("Confirmar resposta");
  assert(await hasText("Correto!"), "Correct confirmation missing");
  assert(
    !(await evaluate("Boolean(document.querySelector('.answer-feedback p'))")),
    "Pedagogical explanation appeared after a correct answer",
  );
  assert(!(await hasText("Estudar esse tópico")), "Study action appeared on correct");
  assert(!(await hasText("Continuar")), "Continue button appeared on correct");
  assert(
    await evaluate("Boolean(document.querySelector('.correct-transition-bar'))"),
    "Correct transition bar missing",
  );
  screenshots.push(await screenshot("session-correct-transition"));
  assert(
    await evaluate(
      "[...document.querySelectorAll('.answer-options button')].every((button) => button.disabled)",
    ),
    "Options remained enabled after correct answer",
  );
  await click(".question-prompt");
  await pressKey("Enter", "Enter");
  await pressKey(" ", "Space");
  await delay(1700);
  assert((await currentQuestionNumber()) === 1, "Correct answer advanced before 3 seconds");
  await waitFor(
    async () => (await currentQuestionNumber()) === 2,
    "correct answer automatic advance",
    1500,
  );
  const correctElapsed = Date.now() - correctStartedAt;
  assert(
    correctElapsed >= 2850 && correctElapsed <= 3900,
    `Correct transition duration was ${correctElapsed}ms`,
  );

  await chooseCurrentAnswer(false);
  await clickText("Confirmar resposta");
  const wrongQuestion = await evaluate(
    "document.querySelector('.question-card h1').textContent",
  );
  assert(await hasText("Resposta correta:"), "Wrong-answer feedback missing");
  assert(
    await evaluate("Boolean(document.querySelector('.answer-feedback.wrong p'))"),
    "Pedagogical explanation missing on error",
  );
  assert(await hasText("Continuar"), "Manual Continue button missing");
  assert(await hasText("Estudar esse tópico"), "Study action missing");
  screenshots.push(await screenshot("session-wrong-feedback"));
  await click(".question-prompt");
  await delay(3400);
  assert((await currentQuestionNumber()) === 2, "Wrong answer advanced automatically");

  await clickText("Estudar esse tópico");
  assert(await hasText("Entenda esta questão"), "Contextual explanation missing");
  for (const heading of [
    "Am, is e are",
    "Frases afirmativas",
    "Frases negativas",
    "Perguntas",
    "Respostas curtas",
    "Contrações",
    "Concordância com o sujeito",
    "Erros comuns",
  ]) {
    assert(await hasText(heading), `Study section missing: ${heading}`);
  }
  await click(".study-context");
  assert((await currentQuestionNumber()) === 2, "Click inside modal advanced session");
  await click(".study-dialog .dialog-close");
  assert(!(await hasText("Entenda esta questão")), "Study dialog did not close by X");
  assert(
    await evaluate("document.activeElement === document.querySelector('.study-topic-button')"),
    "Focus did not return to study action",
  );
  assert(
    (await evaluate("document.querySelector('.question-card h1').textContent")) ===
      wrongQuestion,
    "Closing study dialog changed the question",
  );

  await clickText("Estudar esse tópico");
  await pressKey("Escape", "Escape");
  assert(!(await hasText("Entenda esta questão")), "Study dialog did not close by Escape");
  assert((await currentQuestionNumber()) === 2, "Escape advanced the session");

  await clickText("Estudar esse tópico");
  await clickText("Voltar ao jogo");
  assert(!(await hasText("Entenda esta questão")), "Back-to-game button did not close dialog");
  assert(await hasText("Resposta correta:"), "Error feedback disappeared after study");
  assert((await currentQuestionNumber()) === 2, "Closing modal advanced the session");
  const modalRecordCount = await evaluate(`(async () => {
    const { PRESENT_TOBE_QUESTIONS } = await import('/src/content/data/presentTobeQuestions.ts');
    const { getProgressSnapshot } = await import('/src/services/progress/localProgress.ts');
    const prompt = document.querySelector('.question-card h1').textContent;
    const question = PRESENT_TOBE_QUESTIONS.find((item) => item.question === prompt);
    const snapshot = await getProgressSnapshot();
    return snapshot.questions.find((item) => item.questionId === question.id)?.timesSeen ?? 0;
  })()`);
  assert(modalRecordCount === 1, "Opening the study dialog duplicated the answer record");
  await clickText("Continuar");
  assert((await currentQuestionNumber()) === 3, "Continue button did not advance");

  await chooseCurrentAnswer(false);
  await clickText("Confirmar resposta");
  await click(".answer-feedback.wrong p");
  assert((await currentQuestionNumber()) === 4, "Feedback card did not advance");

  for (let question = 4; question <= 9; question += 1) {
    await chooseCurrentAnswer(false);
    await clickText("Confirmar resposta");
    await clickText("Continuar");
  }
  assert((await currentQuestionNumber()) === 10, "Did not reach final question");
  await chooseCurrentAnswer(true);
  await clickText("Confirmar resposta");
  assert(!(await hasText("Ver resultado")), "Final correct answer exposed manual result button");

  await waitFor(
    () => evaluate("Boolean(document.querySelector('.result-page'))"),
    "automatic result after final correct answer",
    5000,
  );
  await waitFor(
    async () =>
      (await evaluate(`(async () => {
        const { getProgressSnapshot } = await import('/src/services/progress/localProgress.ts');
        const snapshot = await getProgressSnapshot();
        return snapshot.sessions.length === 1 && snapshot.questions.length === 10;
      })()`)) === true,
    "completed session persistence",
  );
  assert(
    await hasText("Você já praticou 10 das 130 questões disponíveis."),
    "Result screen did not show persisted unique-question count",
  );
  const completedSummary = await evaluate(`(async () => {
    const { getProgressSummary } = await import('/src/services/progress/localProgress.ts');
    return getProgressSummary();
  })()`);
  assert(
    completedSummary.uniqueQuestions === 10 &&
      completedSummary.totalAnswers === 10 &&
      completedSummary.correctAnswers === 2 &&
      completedSummary.accuracy === 20 &&
      completedSummary.completedSessions === 1 &&
      completedSummary.bestStreak === 1 &&
      completedSummary.bestResult === 20 &&
      completedSummary.reviewCount === 8 &&
      Boolean(completedSummary.lastActivity),
    `Completed-session metrics are wrong: ${JSON.stringify(completedSummary)}`,
  );
  const score = await evaluate(`Object.fromEntries(
    [...document.querySelectorAll('.score-stats div')].map((item) => [
      item.querySelector('span').textContent,
      Number(item.querySelector('strong').textContent)
    ])
  )`);
  assert(
    score.Total === 10 &&
      score.Acertos === 2 &&
      score.Erros === 8 &&
      score["Melhor sequência"] === 1,
    `Score or streak changed unexpectedly: ${JSON.stringify(score)}`,
  );
  await assertFocusedFlow("result");
  await waitFor(
    async () =>
      Number(
        await evaluate(
          "getComputedStyle(document.querySelector('.result-hero')).opacity",
        ),
      ) >= 0.99,
    "result celebration animation",
  );
  const resultVisual = await evaluate(`(() => {
    const hero = document.querySelector('.result-hero');
    const style = getComputedStyle(hero);
    return { opacity: style.opacity, background: style.backgroundColor };
  })()`);
  assert(
    Number(resultVisual.opacity) >= 0.99,
    `Result celebration remained faded: ${JSON.stringify(resultVisual)}`,
  );
  await delay(400);
  screenshots.push(await screenshot("session-result"));
  await setViewport(1366, 768);
  await assertNoOverflow("result 1366x768");
  screenshots.push(await screenshot("session-result-desktop"));
  await clickText("Jogar novamente");
  assert(await hasText("Questão 1 de 10"), "Replay did not restart");
  screenshots.push(await screenshot("session-question-desktop"));

  await click(".page-header .icon-button");
  assert(await hasText("Sair da sessão?"), "Exit confirmation missing");
  await clickText("Continuar jogando");
  assert(!(await hasText("Sair da sessão?")), "Exit dialog did not close");
  await evaluate("window.history.back()");
  await delay(500);
  const backState = await evaluate(`({
    path: window.location.pathname,
    text: document.body.innerText.slice(-500),
    historyLength: window.history.length
  })`);
  assert(
    await hasText("Sair da sessão?"),
    `Browser back confirmation missing: ${JSON.stringify(backState)}`,
  );
  await clickText("Sair da sessão");
  await assertPath("/gramatica/present_tobe");

  await navigate(
    "/praticar/present_tobe/sessao?difficulty=medium&count=30&seed=3030",
  );
  const seenQuestions = [];
  for (let index = 1; index <= 30; index += 1) {
    seenQuestions.push(
      await evaluate("document.querySelector('.question-card h1').textContent"),
    );
    await chooseCurrentAnswer(false);
    await clickText("Confirmar resposta");
    if (index === 30) {
      await delay(3400);
      assert(
        await evaluate("Boolean(document.querySelector('.question-card'))"),
        "Final wrong answer opened result automatically",
      );
      await click(".answer-feedback.wrong p");
    } else {
      await clickText("Continuar");
    }
  }
  assert(
    new Set(seenQuestions).size === 30,
    "The 30-question session repeated a prompt",
  );
  await waitFor(
    () => evaluate("Boolean(document.querySelector('.result-page'))"),
    "manual result after final wrong answer",
  );
  const zeroScore = await evaluate(`Object.fromEntries(
    [...document.querySelectorAll('.score-stats div')].map((item) => [
      item.querySelector('span').textContent,
      Number(item.querySelector('strong').textContent)
    ])
  )`);
  assert(
    zeroScore.Total === 30 && zeroScore.Acertos === 0 && zeroScore.Erros === 30,
    `Final-wrong score is incorrect: ${JSON.stringify(zeroScore)}`,
  );

  for (const count of [10, 20, 30]) {
    await navigate(
      `/praticar/present_tobe/sessao?difficulty=easy&count=${count}&seed=${count}`,
    );
    assert(
      await hasText(`Questão 1 de ${count}`),
      `${count}-question session failed`,
    );
  }

  const routeChecks = [
    ["/", "Treine inglês no seu ritmo."],
    ["/praticar", "O que você quer praticar?"],
    ["/gramatica", "Escolha um tópico"],
    ["/vocabulario", "Explore novas palavras"],
    ["/vocabulario/body", "Conheça algumas palavras"],
    ["/jogos", "Mais maneiras de praticar"],
    ["/progresso", "Progresso por dificuldade"],
    ["/perfil", "MODO VISITANTE"],
  ];

  for (const [path, expectedText] of routeChecks) {
    await navigate(path);
    assert(await hasText(expectedText), `Route failed: ${path}`);
    await evaluate("document.body.dataset.smokeReload = 'pending'");
    await send("Page.reload", {}, sessionId);
    await waitFor(
      async () =>
        (await evaluate(`document.readyState === 'complete' &&
          !document.body.dataset.smokeReload &&
          getComputedStyle(document.body).margin === '0px' &&
          document.body.innerText.includes(${JSON.stringify(expectedText)})`)) ===
        true,
      `reload ${path}`,
    );
    await assertNoOverflow(path);
  }

  await navigate("/");
  assert(
    (await evaluate("document.querySelectorAll('.quick-game-card').length")) === 3,
    "Home quick-game count changed after persistence",
  );
  await navigate("/jogos");
  assert(
    (await evaluate("document.querySelectorAll('.game-list-row').length")) === 6,
    "Games page should keep all six games",
  );
  await navigate("/progresso");
  assert(await hasText("Melhor resultado"), "Best result is missing from Progress");
  assert(await hasText("Última atividade"), "Last activity is missing from Progress");
  await clickText("Praticar revisão");
  await assertPath("/gramatica/present_tobe");
  assert(
    await evaluate(`(() => {
      const selected = document.querySelector('.segmented-control.two button[aria-pressed="true"]');
      return selected?.textContent.includes('Médio') ?? false;
    })()`),
    "Review CTA did not select the difficulty with more recent errors",
  );

  const { targetId: secondTargetId } = await send("Target.createTarget", {
    url: `${BASE_URL}/progresso`,
  });
  const { sessionId: secondSessionId } = await send("Target.attachToTarget", {
    targetId: secondTargetId,
    flatten: true,
  });
  await send("Runtime.enable", {}, secondSessionId);
  await waitFor(async () => {
    const result = await send(
      "Runtime.evaluate",
      {
        expression: "document.readyState === 'complete' && document.body.innerText.includes('Progresso por dificuldade')",
        returnByValue: true,
      },
      secondSessionId,
    );
    return result.result.value === true;
  }, "progress persistence in a newly opened tab");
  const secondTabSummary = await send(
    "Runtime.evaluate",
    {
      expression: `(async () => {
        const { getProgressSummary } = await import('/src/services/progress/localProgress.ts');
        return getProgressSummary();
      })()`,
      awaitPromise: true,
      returnByValue: true,
    },
    secondSessionId,
  );
  assert(
    secondTabSummary.result.value.uniqueQuestions > 0 &&
      secondTabSummary.result.value.completedSessions > 0,
    "A newly opened tab did not preserve local progress",
  );
  await send("Target.closeTarget", { targetId: secondTargetId });

  const persistenceChecks = await evaluate(`(async () => {
    const {
      getProgressSnapshot,
      getProgressSummary,
      recordQuestionAnswer
    } = await import('/src/services/progress/localProgress.ts');
    const before = await getProgressSnapshot();
    const repeated = before.questions[0];
    await recordQuestionAnswer({
      questionId: repeated.questionId,
      topicId: repeated.topicId,
      difficulty: repeated.difficulty,
      correct: false,
      answeredAt: new Date(Date.now() + 1000).toISOString()
    });
    const afterWrong = await getProgressSummary();
    await recordQuestionAnswer({
      questionId: repeated.questionId,
      topicId: repeated.topicId,
      difficulty: repeated.difficulty,
      correct: true,
      answeredAt: new Date(Date.now() + 2000).toISOString()
    });
    const afterCorrect = await getProgressSummary();
    const after = await getProgressSnapshot();
    const updated = after.questions.find((item) => item.questionId === repeated.questionId);
    return {
      uniqueBefore: before.questions.length,
      uniqueAfter: after.questions.length,
      timesSeen: updated.timesSeen,
      reviewAfterWrong: afterWrong.reviewCount,
      reviewAfterCorrect: afterCorrect.reviewCount
    };
  })()`);
  assert(
    persistenceChecks.uniqueBefore === persistenceChecks.uniqueAfter &&
      persistenceChecks.timesSeen >= 3 &&
      persistenceChecks.reviewAfterCorrect === persistenceChecks.reviewAfterWrong - 1,
    `Repeated-answer persistence failed: ${JSON.stringify(persistenceChecks)}`,
  );

  const priorityChecks = await evaluate(`(async () => {
    const { PRESENT_TOBE_QUESTIONS } = await import('/src/content/data/presentTobeQuestions.ts');
    const { selectPracticeQuestions } = await import('/src/services/sessions/selectPracticeQuestions.ts');
    const easy = PRESENT_TOBE_QUESTIONS.filter((item) => item.difficulty === 'easy');
    const progress = [
      {
        questionId: easy[0].id, topicId: easy[0].topicId, difficulty: 'easy',
        timesSeen: 1, correctCount: 0, wrongCount: 1,
        lastSeenAt: '2026-07-22T10:00:00.000Z', lastResult: false
      },
      {
        questionId: easy[1].id, topicId: easy[1].topicId, difficulty: 'easy',
        timesSeen: 1, correctCount: 1, wrongCount: 0,
        lastSeenAt: '2026-07-20T10:00:00.000Z', lastResult: true
      }
    ];
    const unseenFirst = selectPracticeQuestions(PRESENT_TOBE_QUESTIONS, 'easy', 10, 44, progress);
    const allSeen = easy.map((question, index) => ({
      questionId: question.id,
      topicId: question.topicId,
      difficulty: 'easy',
      timesSeen: 1,
      correctCount: index === 0 ? 0 : 1,
      wrongCount: index === 0 ? 1 : 0,
      lastSeenAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      lastResult: index !== 0
    }));
    const reviewFirst = selectPracticeQuestions(PRESENT_TOBE_QUESTIONS, 'easy', 10, 45, allSeen);
    const { summarizeProgress } = await import('/src/services/progress/localProgress.ts');
    const fullSummary = summarizeProgress({
      questions: PRESENT_TOBE_QUESTIONS.map((question) => ({
        questionId: question.id,
        topicId: question.topicId,
        difficulty: question.difficulty,
        timesSeen: 1,
        correctCount: 1,
        wrongCount: 0,
        lastSeenAt: '2026-07-23T10:00:00.000Z',
        lastResult: true
      })),
      sessions: []
    });
    return {
      unseenAvoidsSeen: unseenFirst.every((item) => item.id !== easy[0].id && item.id !== easy[1].id),
      wrongFirst: reviewFirst[0].id === easy[0].id,
      unique: new Set(reviewFirst.map((item) => item.id)).size,
      maximum: fullSummary.uniqueQuestions
    };
  })()`);
  assert(
      priorityChecks.unseenAvoidsSeen &&
      priorityChecks.wrongFirst &&
      priorityChecks.unique === 10 &&
      priorityChecks.maximum === 130,
    `Question priority failed: ${JSON.stringify(priorityChecks)}`,
  );

  await navigate(
    "/praticar/present_tobe/sessao?difficulty=easy&count=10&seed=9090",
  );
  await evaluate(`(() => {
    window.__originalIdbPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () {
      throw new DOMException('Simulated storage failure', 'UnknownError');
    };
  })()`);
  await chooseCurrentAnswer(false);
  await clickText("Confirmar resposta");
  await waitFor(
    () => hasText("não pôde ser salva no dispositivo"),
    "non-blocking IndexedDB failure warning",
  );
  assert(await hasText("Continuar"), "Storage failure blocked the active session");
  await evaluate(`(() => {
    IDBObjectStore.prototype.put = window.__originalIdbPut;
    delete window.__originalIdbPut;
  })()`);

  await setViewport(390, 844);
  await navigate("/");
  await clickText("Estudar", ".bottom-navigation button");
  await assertPath("/praticar");
  await setViewport(1366, 768);
  await navigate("/");
  await clickText("Estudar", ".desktop-navigation button");
  await assertPath("/praticar");
  await navigate("/vocabulario/body");
  await click(".page-header .icon-button");
  await assertPath("/vocabulario");
  await navigate("/perfil");
  const soundBefore = await evaluate(
    "document.querySelector('.setting-row').getAttribute('aria-pressed')",
  );
  await click(".setting-row");
  const soundAfter = await evaluate(
    "document.querySelector('.setting-row').getAttribute('aria-pressed')",
  );
  assert(soundBefore !== soundAfter, "Sound toggle did not change");

  const overlay = await evaluate(
    "Boolean(document.querySelector('.vite-error-overlay, #webpack-dev-server-client-overlay'))",
  );
  assert(!overlay, "Vite error overlay detected");
  assert(
    browserErrors.length === 0,
    `Browser errors: ${JSON.stringify(browserErrors).slice(0, 2000)}`,
  );

  console.log(
    JSON.stringify(
      {
        status: "passed",
        viewports: viewports.map(([width, height]) => `${width}x${height}`),
        routes: routeChecks.map(([path]) => path),
        sessionSizes: [10, 20, 30],
        screenshots,
        browserErrors: browserErrors.length,
      },
      null,
      2,
    ),
  );
  await send("Browser.close");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

main().catch(async (error) => {
  console.error(error.stack ?? error.message);
  browser.kill();
  process.exitCode = 1;
});
