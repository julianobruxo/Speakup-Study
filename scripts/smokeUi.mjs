import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://127.0.0.1:5173";
const outputDirectory = mkdtempSync(join(tmpdir(), "ingles-em-jogo-ui-smoke-"));
const viewports = [
  [360, 800],
  [390, 844],
  [412, 915],
  [768, 1024],
  [1000, 800],
  [1024, 768],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
];

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
        payload.params?.entry?.source !== "intervention" &&
        // Edge requests /favicon.ico while the smoke temporarily opens the
        // standalone SVG used as a same-origin migration test document.
        !payload.params?.entry?.url?.endsWith("/favicon.ico") &&
        !payload.params?.entry?.text?.includes(
          "message port closed before a response was received",
        ))
    ) {
      browserErrors.push(payload.params);
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

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(predicate, message, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (await predicate()) return;
    } catch {
      // Client-side navigation briefly replaces the execution context.
    }
    await delay(50);
  }
  throw new Error(`Timeout: ${message}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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
    const result = await send(
      "Runtime.evaluate",
      { expression, awaitPromise: true, returnByValue: true },
      sessionId,
    );
    if (result.exceptionDetails) {
      throw new Error(
        `${result.exceptionDetails.text}; ${expression.replace(/\s+/g, " ").slice(0, 180)}`,
      );
    }
    return result.result.value;
  };

  const navigate = async (path) => {
    const expectedPath = new URL(path, BASE_URL).pathname;
    await send("Page.navigate", { url: `${BASE_URL}${path}` }, sessionId);
    await waitFor(
      () =>
        evaluate(
          `document.readyState === "complete" && location.pathname === ${JSON.stringify(expectedPath)}`,
        ),
      `navigate ${path}`,
    );
    try {
      await waitFor(
        () => evaluate(`Boolean(document.querySelector("#root > *"))`),
        `React mount ${path}`,
        3000,
      );
    } catch {
      await send("Page.reload", {}, sessionId);
      await waitFor(
        () =>
          evaluate(
            `document.readyState === "complete" && location.pathname === ${JSON.stringify(expectedPath)} && Boolean(document.querySelector("#root > *"))`,
          ),
        `React remount ${path}`,
      );
    }
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

  const hasText = (text) =>
    evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);

  const click = async (selector) => {
    const clicked = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
      element.click();
      return true;
    })()`);
    assert(clicked, `Missing element to click: ${selector}`);
  };

  const clickText = async (text, selector = "button") => {
    const clicked = await evaluate(`(() => {
      const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
        .find((item) => item.textContent.trim().includes(${JSON.stringify(text)}));
      if (!element) return false;
      element.click();
      return true;
    })()`);
    assert(clicked, `Missing ${selector} with text: ${text}`);
  };

  const screenshot = async (name) => {
    await send("Page.captureScreenshot", { format: "png" }, sessionId);
    const result = await send(
      "Page.captureScreenshot",
      { format: "png", fromSurface: true },
      sessionId,
    );
    const path = join(outputDirectory, `${name}.png`);
    const { writeFileSync } = await import("node:fs");
    writeFileSync(path, Buffer.from(result.data, "base64"));
    return path;
  };

  const assertNoOverflow = async (label) => {
    const dimensions = await evaluate(`({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    })`);
    assert(
      dimensions.document <= dimensions.viewport + 1 &&
        dimensions.body <= dimensions.viewport + 1,
      `${label} has horizontal overflow: ${JSON.stringify(dimensions)}`,
    );
  };

  await setViewport(1366, 768);
  await send("Page.navigate", { url: `${BASE_URL}/favicon.svg` }, sessionId);
  await waitFor(
    () => evaluate(`document.readyState === "complete"`),
    "open same-origin test document",
  );

  const migration = await evaluate(`(async () => {
    const progress = await import('/src/services/progress/localProgress.ts');
    const engagement = await import('/src/services/progress/engagement.ts');
    await engagement.resetAllLocalData();
    await progress.recordQuestionAnswer({
      questionId: 'migration-question',
      topicId: 'present_tobe',
      difficulty: 'easy',
      correct: true,
      answeredAt: new Date().toISOString()
    });
    await progress.saveCompletedSession({
      sessionId: 'migration-session',
      topicId: 'present_tobe',
      difficulty: 'easy',
      questionCount: 10,
      correctCount: 10,
      wrongCount: 0,
      percentage: 100,
      bestStreak: 10,
      completedAt: new Date().toISOString()
    });
    const first = await engagement.getEngagementSnapshot();
    const second = await engagement.getEngagementSnapshot();
    return {
      totalXp: first.state.totalXp,
      sameXp: first.state.totalXp === second.state.totalXp,
      migrationVersion: first.state.migrationVersion,
      firstStep: first.state.achievements['first-step'].unlocked,
      sharpAim: first.state.achievements['sharp-aim'].unlocked,
      noStumble: first.state.achievements['no-stumble'].unlocked
    };
  })()`);
  assert(
    migration.totalXp === 30 &&
      migration.sameXp &&
      migration.migrationVersion === 1 &&
      migration.firstStep &&
      migration.sharpAim &&
      migration.noStumble,
    `Engagement migration failed: ${JSON.stringify(migration)}`,
  );

  const engagementRules = await evaluate(`(async () => {
    const e = await import('/src/services/progress/engagement.ts');
    await e.resetAllLocalData();
    await e.getEngagementSnapshot();
    await e.recordGrammarAnswerEngagement('g1', true);
    await e.recordGrammarAnswerEngagement('g1', true);
    await e.recordGrammarAnswerEngagement('g2', false);
    await e.recordGrammarAnswerEngagement('g3', true);
    await e.recordGrammarAnswerEngagement('g4', true);
    await e.recordGrammarAnswerEngagement('g5', true);
    await e.recordGrammarSessionEngagement('session-1', 80, 4, 5);
    await e.recordGrammarSessionEngagement('session-1', 80, 4, 5);
    for (const id of ['head','hair','face','eye','ear']) {
      await e.recordFlashcardReveal(id);
      await e.recordFlashcardReveal(id);
    }
    await e.recordFlashcardCompletion('cards-1', 23);
    await e.recordFlashcardCompletion('cards-1', 24);
    await e.recordFlashcardCompletion('cards-1', 24);
    const snapshot = await e.getEngagementSnapshot();
    const standingsA = e.getLeagueStandings(snapshot);
    const standingsB = e.getLeagueStandings(snapshot);
    const monday = new Date(e.getWeekKey() + 'T12:00:00').getDay();
    const levels = [0, 750, 1750, 3000, 4750].map((xp) => e.getLevelSummary(xp));
    return {
      totalXp: snapshot.state.totalXp,
      weeklyXp: snapshot.state.weeklyXp,
      answers: snapshot.state.dailyMission.grammarAnswers,
      cards: snapshot.state.dailyMission.vocabularyCardsRevealed.length,
      mission: snapshot.state.dailyMission.completed,
      bonus: snapshot.state.dailyMission.bonusGranted,
      streak: snapshot.state.currentStreak,
      participants: snapshot.state.league.simulatedParticipants.length,
      uniqueIds: new Set(snapshot.state.league.simulatedParticipants.map((p) => p.id)).size,
      stableLeague: JSON.stringify(standingsA) === JSON.stringify(standingsB),
      playerIncluded: standingsA.some((item) => item.isPlayer),
      monday,
      levels: levels.map((item) => [item.level, item.title])
    };
  })()`);
  assert(
    engagementRules.totalXp === 182 &&
      engagementRules.weeklyXp === 182 &&
      engagementRules.answers === 5 &&
      engagementRules.cards === 5 &&
      engagementRules.mission &&
      engagementRules.bonus &&
      engagementRules.streak === 1 &&
      engagementRules.participants === 10 &&
      engagementRules.uniqueIds === 10 &&
      engagementRules.stableLeague &&
      engagementRules.playerIncluded &&
      engagementRules.monday === 1 &&
      JSON.stringify(engagementRules.levels) ===
        JSON.stringify([
          [1, "Iniciante"],
          [4, "Explorador"],
          [8, "Desbravador"],
          [13, "Estrategista"],
          [20, "Mestre de Jogo"],
        ]),
    `Engagement rules failed: ${JSON.stringify(engagementRules)}`,
  );

  const achievementRules = await evaluate(`(async () => {
    const e = await import('/src/services/progress/engagement.ts');
    await e.resetAllLocalData();
    await e.getEngagementSnapshot();
    for (let day = 1; day <= 7; day += 1) {
      await e.recordGrammarSessionEngagement(
        'achievement-session-' + day,
        day === 7 ? 80 : 50,
        day === 7 ? 10 : 2,
        day === 7 ? 50 : day,
        new Date(2026, 6, day, 12)
      );
    }
    await e.recordFlashcardCompletion('achievement-cards', 24, new Date(2026, 6, 7, 13));
    const snapshot = await e.getEngagementSnapshot();
    return Object.fromEntries(
      Object.entries(snapshot.state.achievements)
        .map(([id, state]) => [id, Boolean(state.unlocked && state.unlockedAt)])
    );
  })()`);
  assert(
    Object.values(achievementRules).length === 6 &&
      Object.values(achievementRules).every(Boolean),
    `Achievement unlocks failed: ${JSON.stringify(achievementRules)}`,
  );

  const streakRules = await evaluate(`(async () => {
    const e = await import('/src/services/progress/engagement.ts');
    await e.resetAllLocalData();
    const base = new Date(2026, 6, 1, 12);
    await e.getEngagementSnapshot();
    await e.recordGrammarSessionEngagement('s1', 50, 1, 1, base);
    await e.recordGrammarSessionEngagement('s2', 50, 1, 1, base);
    const day2 = new Date(2026, 6, 2, 12);
    await e.recordGrammarSessionEngagement('s3', 50, 1, 1, day2);
    const day5 = new Date(2026, 6, 5, 12);
    await e.recordGrammarSessionEngagement('s4', 50, 1, 1, day5);
    const snapshot = await e.getEngagementSnapshot();
    return {
      current: snapshot.state.currentStreak,
      longest: snapshot.state.longestStreak,
      activeDates: snapshot.state.activeDates.length
    };
  })()`);
  assert(
    streakRules.current === 1 &&
      streakRules.longest === 2 &&
      streakRules.activeDates === 3,
    `Streak rules failed: ${JSON.stringify(streakRules)}`,
  );

  const selectionRules = await evaluate(`(async () => {
    const { PRESENT_TOBE_QUESTIONS } = await import('/src/content/data/presentTobeQuestions.ts');
    const { selectPracticeQuestions } = await import('/src/services/sessions/selectPracticeQuestions.ts');
    const sizes = [10,20,30].map((count) => {
      const selected = selectPracticeQuestions(PRESENT_TOBE_QUESTIONS, 'medium', count, count);
      return [selected.length, new Set(selected.map((item) => item.id)).size];
    });
    return { sizes };
  })()`);
  assert(
    selectionRules.sizes.every(([length, unique]) => length === unique),
    `Session selection repeated questions: ${JSON.stringify(selectionRules)}`,
  );

  await evaluate(`(async () => {
    const { resetAllLocalData } = await import('/src/services/progress/engagement.ts');
    await resetAllLocalData();
  })()`);
  await navigate("/");
  await waitFor(
    () => evaluate("document.querySelectorAll('.podium-item').length === 3"),
    "Home engagement load",
  );
  for (const text of [
    "Jogue, aprenda e",
    "MISSÃO DE HOJE",
    "Liga Safira",
    "Gramática essencial",
    "Vocabulário visual",
    "Desafios rápidos",
  ]) {
    assert(await hasText(text), `Home is missing: ${text}`);
  }
  const homeState = await evaluate(`({
    product: document.body.innerText.includes('Inglês') && document.body.innerText.includes('em Jogo'),
    oldProduct: document.body.innerText.includes('Speak UP Study'),
    participants: document.querySelectorAll('.podium-item').length,
    simulatedDisclosure: document.body.innerText.includes('participantes simulados')
  })`);
  assert(
    homeState.product &&
      !homeState.oldProduct &&
      homeState.participants === 3 &&
      homeState.simulatedDisclosure,
    `Home product state is wrong: ${JSON.stringify(homeState)}`,
  );

  const screenshots = [];
  for (const [width, height] of viewports) {
    await setViewport(width, height);
    await navigate("/");
    await waitFor(() => hasText("Liga Safira"), `Home ${width}x${height}`);
    await assertNoOverflow(`Home ${width}x${height}`);
    const nav = await evaluate(`(() => {
      const sidebar = document.querySelector('.app-sidebar');
      const bottom = document.querySelector('.bottom-navigation');
      return {
        sidebar: sidebar ? getComputedStyle(sidebar).display : 'missing',
        sidebarWidth: sidebar?.getBoundingClientRect().width ?? 0,
        bottom: bottom ? getComputedStyle(bottom).display : 'missing'
      };
    })()`);
    if (width < 760) {
      assert(nav.sidebar === "none" && nav.bottom !== "none", `Mobile nav failed: ${JSON.stringify(nav)}`);
    } else {
      assert(nav.sidebar !== "none" && nav.bottom === "none", `Desktop nav failed: ${JSON.stringify(nav)}`);
      assert(
        width >= 1100 ? nav.sidebarWidth >= 240 : nav.sidebarWidth >= 88 && nav.sidebarWidth <= 96,
        `Sidebar width failed at ${width}: ${nav.sidebarWidth}`,
      );
    }
    screenshots.push(await screenshot(`home-${width}x${height}`));
  }

  await setViewport(1366, 768);
  const routeChecks = [
    ["/", "Jogue, aprenda e"],
    ["/praticar", "Escolha o que quer dominar hoje."],
    ["/gramatica", "Escolha um tópico"],
    ["/vocabulario", "Explore novas palavras"],
    ["/vocabulario/body", "Aprenda com imagem e pronúncia"],
    ["/jogos", "Mais maneiras de praticar"],
    ["/progresso", "ATIVIDADE SEMANAL"],
    ["/perfil", "Personalize sua experiência"],
  ];
  for (const [path, text] of routeChecks) {
    if (path !== "/") await navigate(path);
    await waitFor(() => hasText(text), `route ${path}`);
    await assertNoOverflow(path);
  }

  await navigate("/praticar");
  assert(
    (await evaluate("document.querySelectorAll('.filter-chip').length")) === 4,
    "Library filters are incomplete",
  );
  await clickText("Revisão", ".filter-chip");
  assert(await hasText("Nenhuma questão para revisar."), "Empty review state missing");

  await navigate("/praticar/present_tobe/sessao?difficulty=easy&count=10&seed=2026");
  await waitFor(() => hasText("Questão 1 de 10"), "grammar session load");
  const correctAnswer = await evaluate(`(async () => {
    const prompt = document.querySelector('.question-card h1').textContent;
    const { PRESENT_TOBE_QUESTIONS } = await import('/src/content/data/presentTobeQuestions.ts');
    return PRESENT_TOBE_QUESTIONS.find((item) => item.question === prompt).correctAnswer;
  })()`);
  await evaluate(`[...document.querySelectorAll('.answer-options button')]
    .find((button) => button.querySelector('strong').textContent === ${JSON.stringify(correctAnswer)}).click()`);
  await clickText("Confirmar resposta");
  assert(await hasText("Correto!"), "Correct feedback missing");
  await delay(1700);
  assert(await hasText("Questão 1 de 10"), "Correct answer advanced before three seconds");
  await waitFor(() => hasText("Questão 2 de 10"), "three-second automatic advance", 5000);

  const incorrectAnswer = await evaluate(`(async () => {
    const prompt = document.querySelector('.question-card h1').textContent;
    const { PRESENT_TOBE_QUESTIONS } = await import('/src/content/data/presentTobeQuestions.ts');
    const correct = PRESENT_TOBE_QUESTIONS.find((item) => item.question === prompt).correctAnswer;
    return [...document.querySelectorAll('.answer-options button')]
      .map((button) => button.querySelector('strong').textContent)
      .find((option) => option !== correct);
  })()`);
  await evaluate(`[...document.querySelectorAll('.answer-options button')]
    .find((button) => button.querySelector('strong').textContent === ${JSON.stringify(incorrectAnswer)}).click()`);
  await clickText("Confirmar resposta");
  assert(await hasText("Vamos entender."), "Incorrect feedback missing");
  await clickText("Estudar esse tópico");
  await waitFor(() => hasText("Como usar o Present TO BE"), "contextual study dialog");
  await clickText("Voltar ao jogo");
  assert(await hasText("Continuar"), "Manual continuation missing after incorrect answer");

  await setViewport(390, 844);
  await navigate("/vocabulario/body/flashcards");
  await waitFor(() => hasText("1 de 24"), "flashcards load");
  await click(".vocabulary-flashcard");
  await waitFor(
    () =>
      evaluate(
        "document.querySelector('.vocabulary-flashcard').getAttribute('aria-pressed') === 'true'",
      ),
    "flashcard reveal",
  );
  const rect = await evaluate(`(() => {
    const rect = document.querySelector('.vocabulary-flashcard').getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  })()`);
  const y = rect.y + rect.height / 2;
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: rect.x + rect.width * 0.8, y }],
  }, sessionId);
  for (const ratio of [0.68, 0.54, 0.4, 0.24]) {
    await send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: rect.x + rect.width * ratio, y }],
    }, sessionId);
    await delay(45);
  }
  await send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  }, sessionId);
  await waitFor(() => hasText("2 de 24"), "flashcard swipe");
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))");
  await waitFor(() => hasText("1 de 24"), "flashcard keyboard navigation");

  for (let index = 1; index <= 24; index += 1) {
    const pressed = await evaluate(
      "document.querySelector('.vocabulary-flashcard').getAttribute('aria-pressed') === 'true'",
    );
    if (!pressed) await click(".vocabulary-flashcard");
    await clickText(index === 24 ? "Concluir" : "Próximo", ".flashcard-navigation button");
    if (index < 24) {
      await waitFor(() => hasText(`${index + 1} de 24`), `flashcard ${index + 1}`);
    }
  }
  await waitFor(() => hasText("+25 XP de conclusão"), "valid flashcard completion");

  await navigate("/perfil");
  const beforeSound = await evaluate(
    "document.querySelector('.settings-card .setting-row').getAttribute('aria-pressed')",
  );
  await click(".settings-card .setting-row");
  const afterSound = await evaluate(
    "document.querySelector('.settings-card .setting-row').getAttribute('aria-pressed')",
  );
  assert(beforeSound !== afterSound, "Sound preference did not change");

  assert(
    browserErrors.length === 0,
    `Browser errors: ${JSON.stringify(browserErrors).slice(0, 3000)}`,
  );

  console.log(
    JSON.stringify(
      {
        status: "passed",
        viewports: viewports.map(([width, height]) => `${width}x${height}`),
        routes: routeChecks.map(([path]) => path),
        sessionSizes: [10, 20, 30],
        engagement: {
          migration: "passed",
          xpAndMission: "passed",
          streak: "passed",
          league: "passed",
          levels: "passed",
          flashcards: "passed",
        },
        screenshots,
        browserErrors: browserErrors.length,
      },
      null,
      2,
    ),
  );
  browser.kill();
  process.exit(0);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  browser.kill();
  process.exit(1);
});
