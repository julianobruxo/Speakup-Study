import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HOST = "127.0.0.1";

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, HOST, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Could not allocate a local smoke-test port.")));
        return;
      }
      server.close(() => resolve(address.port));
    });
  });
}

const PORT = await getAvailablePort();
const BASE_URL = `http://${HOST}:${PORT}`;
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

function pingServer(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(true);
    });
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
    request.on("error", () => resolve(false));
  });
}

async function waitForServer(url, timeoutMs, intervalMs = 200) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await pingServer(url, intervalMs)) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}

let ownedViteProcess = null;

async function ensureDevServer() {
  console.log(`Starting an isolated Vite server at ${BASE_URL}.`);
  const vite = spawn(
    process.execPath,
    [join(PROJECT_ROOT, "node_modules", "vite", "bin", "vite.js"), "--host", HOST, "--port", String(PORT), "--strictPort"],
    { cwd: PROJECT_ROOT, stdio: ["ignore", "pipe", "pipe"] },
  );
  vite.stdout.on("data", (chunk) => process.stdout.write(`[vite] ${chunk}`));
  vite.stderr.on("data", (chunk) => process.stderr.write(`[vite] ${chunk}`));
  vite.on("error", (error) => {
    throw new Error(`Failed to start Vite dev server: ${error.message}`);
  });
  ownedViteProcess = vite;

  const ready = await waitForServer(BASE_URL, 20000);
  if (!ready) {
    throw new Error(`Vite dev server did not become reachable at ${BASE_URL} within 20s.`);
  }
  console.log(`Vite dev server ready at ${BASE_URL}`);
}

async function stopOwnedServer() {
  const vite = ownedViteProcess;
  ownedViteProcess = null;
  if (!vite || vite.exitCode !== null) return;

  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 3000);
    vite.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    vite.kill();
  });
}

if (!existsSync(EDGE)) {
  console.error(`Microsoft Edge not found at expected path: ${EDGE}`);
  process.exit(1);
}

const browser = spawn(
  EDGE,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-component-extensions-with-background-pages",
    "--disable-features=ChromeWhatsNewUI,EdgeCollections",
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
  await ensureDevServer();

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
    await waitFor(
      () => evaluate(`!document.querySelector('.route-loading')`),
      `lazy route ready ${path}`,
      20000,
    );
  };

  const navigateSpa = async (path) => {
    const expectedPath = new URL(path, BASE_URL).pathname;
    await evaluate(`(() => {
      history.pushState({}, '', ${JSON.stringify(path)});
      window.dispatchEvent(new PopStateEvent('popstate'));
    })()`);
    await waitFor(
      () => evaluate(
        `location.pathname === ${JSON.stringify(expectedPath)} && !document.querySelector('.route-loading')`,
      ),
      `SPA navigate ${path}`,
      20000,
    );
  };

  const setViewport = async (width, height, deviceScaleFactor = 1) => {
    await send(
      "Emulation.setDeviceMetricsOverride",
      {
        width,
        height,
        deviceScaleFactor,
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

  const pressKey = async (key) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key }, sessionId);
    await send("Input.dispatchKeyEvent", { type: "keyUp", key }, sessionId);
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
    await e.recordGameRoundEngagement('game-session-1', 'grammar', 60, 10);
    await e.recordGameRoundEngagement('game-session-1', 'grammar', 60, 10);
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
      gameChallenges: snapshot.state.dailyMission.gameValidChallengesResolved,
      gameGrammarCompleted: snapshot.state.dailyMission.gameGrammarCompleted,
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
    engagementRules.totalXp === 242 &&
      engagementRules.weeklyXp === 242 &&
      engagementRules.answers === 5 &&
      engagementRules.cards === 5 &&
      engagementRules.gameChallenges === 10 &&
      engagementRules.gameGrammarCompleted &&
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

  const phaserLoadedOnHome = await evaluate(
    `performance.getEntriesByType('resource').some((entry) => entry.name.toLowerCase().includes('/deps/phaser.js'))`,
  );
  assert(!phaserLoadedOnHome, "Home must not download the lazy Phaser dependency");

  await send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] },
    sessionId,
  );
  await setViewport(390, 844);
  await navigate("/jogos/bridge-tecnica?mode=dom");
  const domFallbackState = await evaluate(`({
    canvasCount: document.querySelectorAll('canvas').length,
    choiceCount: document.querySelectorAll('.arcade-dom-choices button').length,
    phaserLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.toLowerCase().includes('/deps/phaser.js'))
  })`);
  assert(
    domFallbackState.canvasCount === 0 &&
      domFallbackState.choiceCount === 3 &&
      !domFallbackState.phaserLoaded,
    `DOM arcade fallback loaded Phaser or rendered incorrectly: ${JSON.stringify(domFallbackState)}`,
  );
  await clickText("Hair", ".arcade-dom-choices button");
  await waitFor(
    () => hasText("Outcome recebido pelo React: correto."),
    "DOM fallback returns a choice for React-owned outcome resolution",
  );
  await evaluate(`window.scrollTo(0, 0)`);
  screenshots.push(await screenshot("arcade-bridge-dom-390x844"));

  await navigate("/jogos/bubble-shooter?mode=dom&seed=2026");
  const bubbleDomState = await evaluate(`({
    canvasCount: document.querySelectorAll('canvas').length,
    choiceCount: document.querySelectorAll('.bubble-dom-choices button').length,
    minChoiceHeight: Math.min(...[...document.querySelectorAll('.bubble-dom-choices button')].map((button) => button.getBoundingClientRect().height)),
    minChoiceWidth: Math.min(...[...document.querySelectorAll('.bubble-dom-choices button')].map((button) => button.getBoundingClientRect().width)),
    phaserLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.toLowerCase().includes('/deps/phaser.js'))
  })`);
  assert(
    bubbleDomState.canvasCount === 0 &&
      bubbleDomState.choiceCount === 3 &&
      bubbleDomState.minChoiceHeight >= 44 &&
      bubbleDomState.minChoiceWidth >= 44 &&
      !bubbleDomState.phaserLoaded,
    `Bubble Shooter DOM mode loaded Phaser or rendered incorrectly: ${JSON.stringify(bubbleDomState)}`,
  );
  await assertNoOverflow("/jogos/bubble-shooter DOM 390x844");
  await evaluate(`window.scrollTo(0, 0)`);
  screenshots.push(await screenshot("bubble-shooter-dom-390x844"));
  for (let challengeIndex = 0; challengeIndex < 6; challengeIndex += 1) {
    const correctChoiceId = await evaluate(`(async () => {
      const { createBubbleShooterRound } = await import('/src/games/arcade/bubbleShooter/bubbleShooterRound.ts');
      return createBubbleShooterRound(2026).challenges[${challengeIndex}].correctChoiceId;
    })()`);
    let accepted;
    if (challengeIndex === 0) {
      accepted = await evaluate(`(() => {
        const button = document.querySelector('[data-choice-id="${correctChoiceId}"]');
        if (!button) return false;
        button.focus();
        return document.activeElement === button;
      })()`);
      if (accepted) {
        await delay(80);
        screenshots.push(await screenshot("bubble-shooter-dom-focus-390x844"));
        await send("Input.dispatchKeyEvent", {
          type: "rawKeyDown",
          key: " ",
          code: "Space",
          windowsVirtualKeyCode: 32,
          nativeVirtualKeyCode: 32,
        }, sessionId);
        await send("Input.dispatchKeyEvent", {
          type: "keyUp",
          key: " ",
          code: "Space",
          windowsVirtualKeyCode: 32,
          nativeVirtualKeyCode: 32,
        }, sessionId);
      }
    } else {
      const promptFocused = await evaluate(
        `document.activeElement?.classList.contains('bubble-dom-prompt')`,
      );
      assert(promptFocused, `Bubble Shooter DOM did not restore focus for challenge ${challengeIndex + 1}`);
      const correctChoiceIndex = await evaluate(
        `[...document.querySelectorAll('.bubble-dom-choices button')].findIndex((button) => button.dataset.choiceId === '${correctChoiceId}')`,
      );
      for (let tabIndex = 0; tabIndex <= correctChoiceIndex; tabIndex += 1) {
        await pressKey("Tab");
      }
      accepted = await evaluate(
        `document.activeElement?.dataset.choiceId === '${correctChoiceId}'`,
      );
      if (accepted) {
        await send("Input.dispatchKeyEvent", {
          type: "rawKeyDown",
          key: " ",
          code: "Space",
          windowsVirtualKeyCode: 32,
          nativeVirtualKeyCode: 32,
        }, sessionId);
        await send("Input.dispatchKeyEvent", {
          type: "keyUp",
          key: " ",
          code: "Space",
          windowsVirtualKeyCode: 32,
          nativeVirtualKeyCode: 32,
        }, sessionId);
      }
    }
    assert(accepted, `Bubble Shooter DOM choice ${challengeIndex + 1} was not available`);
    if (challengeIndex === 0) {
      await waitFor(() => hasText("Correto!"), "Bubble Shooter DOM correct feedback");
      screenshots.push(await screenshot("bubble-shooter-dom-correct-390x844"));
    }
    if (challengeIndex < 5) {
      await waitFor(
        () => evaluate(`document.querySelector('.bubble-shooter-dom')?.dataset.challengeIndex === '${challengeIndex + 1}'`),
        `Bubble Shooter DOM advances to challenge ${challengeIndex + 2}`,
      );
    }
  }
  await waitFor(
    () => evaluate(`document.querySelector('.game-progress')?.getAttribute('aria-valuenow') === '100'`),
    "Bubble Shooter DOM records all six outcomes",
  );
  await delay(1600);
  const bubbleDomResultState = await evaluate(`({
    bodyText: document.body.innerText.slice(0, 1200),
    hasResult: Boolean(document.querySelector('.game-result-page')),
    progress: document.querySelector('.game-progress')?.getAttribute('aria-valuenow') ?? null
  })`);
  assert(
    bubbleDomResultState.hasResult,
    `Bubble Shooter DOM did not open its result: ${JSON.stringify(bubbleDomResultState)}`,
  );
  const bubbleDomPersistence = await evaluate(`(async () => {
    const { getGameSessions } = await import('/src/services/progress/localProgress.ts');
    const sessions = await getGameSessions();
    const session = sessions.find((item) => item.gameId === 'bubble_shooter');
    return session ? {
      correctCount: session.correctCount,
      totalChallenges: session.totalChallenges,
      xpEarned: session.xpEarned,
    } : null;
  })()`);
  assert(
    bubbleDomPersistence?.correctCount === 6 &&
      bubbleDomPersistence.totalChallenges === 6 &&
      bubbleDomPersistence.xpEarned === 40,
    `Bubble Shooter DOM persistence failed: ${JSON.stringify(bubbleDomPersistence)}`,
  );
  await evaluate(`(async () => {
    const { resetAllLocalData } = await import('/src/services/progress/engagement.ts');
    await resetAllLocalData();
  })()`);

  await navigate("/jogos/corte-a-palavra?mode=dom&seed=2026");
  const wordSliceDomState = await evaluate(`({
    canvasCount: document.querySelectorAll('canvas').length,
    choiceCount: document.querySelectorAll('.word-slice-dom-choices button').length,
    minChoiceHeight: Math.min(...[...document.querySelectorAll('.word-slice-dom-choices button')].map((button) => button.getBoundingClientRect().height)),
    minChoiceWidth: Math.min(...[...document.querySelectorAll('.word-slice-dom-choices button')].map((button) => button.getBoundingClientRect().width)),
    phaserLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.toLowerCase().includes('/deps/phaser.js'))
  })`);
  assert(
    wordSliceDomState.canvasCount === 0 &&
      wordSliceDomState.choiceCount === 3 &&
      wordSliceDomState.minChoiceHeight >= 44 &&
      wordSliceDomState.minChoiceWidth >= 44 &&
      !wordSliceDomState.phaserLoaded,
    `Corte a palavra DOM mode loaded Phaser or rendered incorrectly: ${JSON.stringify(wordSliceDomState)}`,
  );
  await assertNoOverflow("/jogos/corte-a-palavra DOM 390x844");
  screenshots.push(await screenshot("word-slice-dom-390x844"));
  for (let challengeIndex = 0; challengeIndex < 8; challengeIndex += 1) {
    const correctChoiceId = await evaluate(`(async () => {
      const { createWordSliceRound } = await import('/src/games/arcade/wordSlice/wordSliceRound.ts');
      return createWordSliceRound(2026).challenges[${challengeIndex}].correctChoiceId;
    })()`);
    const focused = await evaluate(`(() => {
      const button = document.querySelector('[data-choice-id="${correctChoiceId}"]');
      button?.focus();
      return document.activeElement === button;
    })()`);
    assert(focused, `Corte a palavra DOM choice ${challengeIndex + 1} was not focusable`);
    await pressKey(" ");
    if (challengeIndex === 0) {
      await waitFor(() => hasText("Corte certeiro!"), "Corte a palavra DOM feedback");
      screenshots.push(await screenshot("word-slice-dom-correct-390x844"));
    }
    if (challengeIndex < 7) {
      await waitFor(
        () => evaluate(`document.querySelector('.word-slice-dom')?.dataset.challengeIndex === '${challengeIndex + 1}'`),
        `Corte a palavra DOM advances to challenge ${challengeIndex + 2}`,
      );
      assert(
        await evaluate(`document.activeElement?.classList.contains('word-slice-dom-prompt')`),
        `Corte a palavra DOM did not restore focus for challenge ${challengeIndex + 2}`,
      );
    }
  }
  await waitFor(
    () => evaluate(`Boolean(document.querySelector('.game-result-page'))`),
    "Corte a palavra DOM result",
    12000,
  );
  const wordSliceDomPersistence = await evaluate(`(async () => {
    const { getGameSessions } = await import('/src/services/progress/localProgress.ts');
    const sessions = await getGameSessions();
    return sessions.find((item) => item.gameId === 'word_slice');
  })()`);
  assert(
    wordSliceDomPersistence?.correctCount === 8 &&
      wordSliceDomPersistence.totalChallenges === 8 &&
      wordSliceDomPersistence.xpEarned === 50,
    `Corte a palavra DOM persistence failed: ${JSON.stringify(wordSliceDomPersistence)}`,
  );
  await evaluate(`(async () => {
    const { resetAllLocalData } = await import('/src/services/progress/engagement.ts');
    await resetAllLocalData();
  })()`);

  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [360, 800]]) {
    await setViewport(width, height);
    await navigate("/jogos/bridge-tecnica");
    await waitFor(
      () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.arcadeReady === 'true'`),
      `technical Phaser scene ready at ${width}x${height}`,
      20000,
    );
    const bridgeState = await evaluate(`(() => {
      const surface = document.querySelector('.phaser-arcade-surface');
      const canvas = surface?.querySelector('canvas');
      return {
        canvasCount: document.querySelectorAll('.phaser-arcade-surface canvas').length,
        canvasWidth: canvas?.width ?? 0,
        canvasHeight: canvas?.height ?? 0,
        surfaceWidth: surface?.clientWidth ?? 0,
        surfaceHeight: surface?.clientHeight ?? 0,
        version: surface?.dataset.phaserVersion ?? '',
      };
    })()`);
    assert(
      bridgeState.canvasCount === 1 &&
        bridgeState.canvasWidth === bridgeState.surfaceWidth &&
        bridgeState.canvasHeight === bridgeState.surfaceHeight &&
        bridgeState.version.startsWith("3."),
      `Technical bridge mount/resize failed at ${width}x${height}: ${JSON.stringify(bridgeState)}`,
    );
    await assertNoOverflow(`/jogos/bridge-tecnica ${width}x${height}`);
    await evaluate(`window.scrollTo(0, 0)`);
    screenshots.push(await screenshot(`arcade-bridge-${width}x${height}`));
  }

  await setViewport(390, 844, 2);
  await navigate("/jogos/bridge-tecnica");
  await waitFor(
    () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.arcadeReady === 'true'`),
    "technical Phaser scene ready at DPR 2",
    20000,
  );
  const highDensityState = await evaluate(`(() => {
    const surface = document.querySelector('.phaser-arcade-surface');
    const canvas = surface?.querySelector('canvas');
    const resolution = Number(surface?.dataset.runtimeRenderResolution ?? 0);
    return {
      backingHeight: canvas?.height ?? 0,
      backingWidth: canvas?.width ?? 0,
      devicePixelRatio: window.devicePixelRatio,
      renderResolution: resolution,
      surfaceHeight: surface?.clientHeight ?? 0,
      surfaceWidth: surface?.clientWidth ?? 0,
    };
  })()`);
  assert(
    highDensityState.devicePixelRatio === 2 &&
      highDensityState.renderResolution === 2 &&
      highDensityState.backingWidth === highDensityState.surfaceWidth * 2 &&
      highDensityState.backingHeight === highDensityState.surfaceHeight * 2,
    `Technical bridge ignored high-density rendering: ${JSON.stringify(highDensityState)}`,
  );
  await evaluate(`window.scrollTo(0, 0)`);
  screenshots.push(await screenshot("arcade-bridge-390x844-dpr2"));

  await setViewport(1440, 900);
  await navigate("/jogos/bridge-tecnica");
  await waitFor(
    () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.arcadeReady === 'true'`),
    "technical Phaser scene ready for controls",
    20000,
  );
  await evaluate(`(() => {
    const surface = document.querySelector('.phaser-arcade-surface');
    window.__arcadePauseTransitions = [surface?.dataset.runtimePaused];
    window.__arcadePauseObserver = new MutationObserver(() => {
      window.__arcadePauseTransitions.push(surface?.dataset.runtimePaused);
    });
    window.__arcadePauseObserver.observe(surface, {
      attributes: true,
      attributeFilter: ['data-runtime-paused'],
    });
  })()`);
  const currentTarget = await send("Target.getTargetInfo", {}, sessionId);
  const backgroundTarget = await send("Target.createTarget", { url: "about:blank" });
  await send("Target.activateTarget", { targetId: backgroundTarget.targetId });
  await delay(150);
  await send("Target.activateTarget", { targetId: currentTarget.targetInfo.targetId });
  await waitFor(
    () => evaluate(`
      window.__arcadePauseTransitions.includes('true') &&
      document.querySelector('.phaser-arcade-surface')?.dataset.runtimePaused === 'false'
    `),
    "Phaser pauses while the document is hidden and resumes when visible",
  );
  await send("Target.closeTarget", { targetId: backgroundTarget.targetId });
  await evaluate(`window.__arcadePauseObserver.disconnect()`);
  await clickText("Pausar");
  await waitFor(
    () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.runtimePaused === 'true'`),
    "React pauses the active Phaser scene",
  );
  await clickText("Retomar");
  await waitFor(
    () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.runtimePaused === 'false'`),
    "React resumes the host-paused Phaser scene",
  );
  const motionStateBeforeToggle = await evaluate(`(() => {
    const surface = document.querySelector('.phaser-arcade-surface');
    return {
      reducedMotion: surface?.dataset.runtimeReducedMotion,
      tweenCount: Number(surface?.dataset.runtimeTweenCount ?? 0),
    };
  })()`);
  assert(
    motionStateBeforeToggle.reducedMotion === "false" &&
      motionStateBeforeToggle.tweenCount > 0,
    `Phaser scene did not expose active motion: ${JSON.stringify(motionStateBeforeToggle)}`,
  );
  await clickText("Movimento reduzido");
  await waitFor(
    () => evaluate(
      `(() => {
        const surface = document.querySelector('.phaser-arcade-surface');
        return surface?.dataset.runtimeReducedMotion === 'true' &&
          surface?.dataset.runtimeTweenCount === '0';
      })()`,
    ),
    "Phaser removes scene tweens for reduced motion",
  );
  await click('button[aria-label="Desativar som"]');
  await waitFor(
    () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.runtimeSoundMuted === 'true'`),
    "React mutes the Phaser sound manager",
  );
  await click('button[aria-label="Ativar som"]');
  await waitFor(
    () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.runtimeSoundMuted === 'false'`),
    "React unmutes the Phaser sound manager",
  );
  const correctBridgeTarget = await evaluate(`(() => {
    const surface = document.querySelector('.phaser-arcade-surface');
    const rect = surface.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 + 18 };
  })()`);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: correctBridgeTarget.x,
    y: correctBridgeTarget.y,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: correctBridgeTarget.x,
    y: correctBridgeTarget.y,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await waitFor(
    () => hasText("Outcome recebido pelo React: correto."),
    "Phaser returns a choice for React-owned outcome resolution",
  );

  const phaserLoadedAfterArcade = await evaluate(
    `performance.getEntriesByType('resource').some((entry) => entry.name.toLowerCase().includes('/deps/phaser.js'))`,
  );
  assert(phaserLoadedAfterArcade, "Arcade route must download the lazy Phaser dependency");
  await evaluate(`(() => {
    window.__arcadeRuntimeDestroyCount = 0;
    window.__arcadeRuntimeDestroyDetails = [];
    window.addEventListener(
      "ingles-em-jogo:arcade-runtime-destroyed",
      (event) => {
        window.__arcadeRuntimeDestroyCount += 1;
        window.__arcadeRuntimeDestroyDetails.push(event.detail);
      },
    );
  })()`);
  const destroyCountBeforeFirstTeardown = await evaluate(
    `window.__arcadeRuntimeDestroyCount`,
  );
  await navigateSpa("/jogos");
  await waitFor(
    () => evaluate(
      `document.querySelectorAll('canvas').length === 0 &&
        window.__arcadeRuntimeDestroyCount > ${destroyCountBeforeFirstTeardown}`,
    ),
    "Phaser runtime destroyed after route change",
  );
  const firstDestroyDetail = await evaluate(
    `window.__arcadeRuntimeDestroyDetails.at(-1)`,
  );
  assert(
    firstDestroyDetail.removedNativeVisibilityListeners > 0,
    `Phaser native visibility listener was not removed: ${JSON.stringify(firstDestroyDetail)}`,
  );
  await navigateSpa("/jogos/bridge-tecnica");
  await waitFor(
    () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.arcadeReady === 'true'`),
    "technical Phaser scene remount",
    20000,
  );
  const remountedCanvasCount = await evaluate(
    `document.querySelectorAll('.phaser-arcade-surface canvas').length`,
  );
  assert(remountedCanvasCount === 1, `StrictMode remount created ${remountedCanvasCount} canvases`);
  const destroyCountBeforeSecondTeardown = await evaluate(
    `window.__arcadeRuntimeDestroyCount`,
  );
  await evaluate(`(() => {
    window.__documentHiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  })()`);
  await waitFor(
    () => evaluate(`document.querySelector('.phaser-arcade-surface')?.dataset.runtimePaused === 'true'`),
    "Phaser pauses before hidden-document teardown",
  );
  await navigateSpa("/jogos");
  await waitFor(
    () => evaluate(
      `document.querySelectorAll('canvas').length === 0 &&
        window.__arcadeRuntimeDestroyCount > ${destroyCountBeforeSecondTeardown}`,
    ),
    "Remounted Phaser runtime destroyed while document is hidden",
  );
  const secondDestroyDetail = await evaluate(
    `window.__arcadeRuntimeDestroyDetails.at(-1)`,
  );
  assert(
    secondDestroyDetail.removedNativeVisibilityListeners > 0,
    `Remounted Phaser visibility listener was not removed: ${JSON.stringify(secondDestroyDetail)}`,
  );
  await evaluate(`(() => {
    if (window.__documentHiddenDescriptor) {
      Object.defineProperty(document, 'hidden', window.__documentHiddenDescriptor);
    } else {
      delete document.hidden;
    }
  })()`);
  await send("Emulation.setEmulatedMedia", { features: [] }, sessionId);

  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [360, 800]]) {
    await setViewport(width, height);
    await navigate("/jogos/bubble-shooter?seed=2026");
    await waitFor(
      () => evaluate(`document.querySelector('.bubble-shooter-canvas')?.dataset.arcadeReady === 'true'`),
      `Bubble Shooter ready at ${width}x${height}`,
      20000,
    );
    const bubbleLayout = await evaluate(`(() => {
      const surface = document.querySelector('.bubble-shooter-canvas');
      return {
        boardBubbleCount: Number(surface?.dataset.runtimeBoardBubbleCount ?? 0),
        canvasCount: surface?.querySelectorAll('canvas').length ?? 0,
        height: surface?.clientHeight ?? 0,
        minControlSize: Math.min(...[...document.querySelectorAll('.game-play-page .icon-button, .arcade-mode-switch button')].flatMap((control) => {
          const rect = control.getBoundingClientRect();
          return [rect.width, rect.height];
        })),
        width: surface?.clientWidth ?? 0,
      };
    })()`);
    assert(
      bubbleLayout.canvasCount === 1 &&
        bubbleLayout.boardBubbleCount === 9 &&
        bubbleLayout.width > 0 &&
        bubbleLayout.minControlSize >= 44 &&
        bubbleLayout.height >= 470,
      `Bubble Shooter initial board failed at ${width}x${height}: ${JSON.stringify(bubbleLayout)}`,
    );
    await assertNoOverflow(`/jogos/bubble-shooter ${width}x${height}`);
    await evaluate(`window.scrollTo(0, 0)`);
    screenshots.push(await screenshot(`bubble-shooter-${width}x${height}`));
  }

  await setViewport(390, 844);
  await navigate("/jogos/bubble-shooter?seed=2026");
  await waitFor(
    () => evaluate(`document.querySelector('.bubble-shooter-canvas')?.dataset.arcadeReady === 'true'`),
    "Bubble Shooter ready for keyboard rebound and in-flight resize",
    20000,
  );
  await evaluate(`document.querySelector('.bubble-shooter-canvas')?.focus()`);
  for (let turn = 0; turn < 12; turn += 1) {
    await send("Input.dispatchKeyEvent", {
      type: "rawKeyDown",
      key: "ArrowLeft",
      code: "ArrowLeft",
      windowsVirtualKeyCode: 37,
      nativeVirtualKeyCode: 37,
    }, sessionId);
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "ArrowLeft",
      code: "ArrowLeft",
      windowsVirtualKeyCode: 37,
      nativeVirtualKeyCode: 37,
    }, sessionId);
    await delay(40);
  }
  await send("Input.dispatchKeyEvent", {
    type: "rawKeyDown",
    key: " ",
    code: "Space",
    windowsVirtualKeyCode: 32,
    nativeVirtualKeyCode: 32,
  }, sessionId);
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: " ",
    code: "Space",
    windowsVirtualKeyCode: 32,
    nativeVirtualKeyCode: 32,
  }, sessionId);
  await waitFor(
    () => evaluate(`document.querySelector('.bubble-shooter-canvas')?.dataset.runtimeShotInFlight === 'true'`),
    "Bubble Shooter launches with the keyboard",
  );
  await waitFor(
    () => evaluate(`Number(document.querySelector('.bubble-shooter-canvas')?.dataset.runtimeWallBounceCount ?? 0) >= 1`),
    "Bubble Shooter projectile rebounds from a side wall",
  );
  await setViewport(768, 1024);
  await waitFor(
    () => evaluate(`(() => {
      const surface = document.querySelector('.bubble-shooter-canvas');
      return surface?.dataset.runtimeResizeDeferred === 'true' &&
        surface?.dataset.runtimeShotInFlight === 'true';
    })()`),
    "Bubble Shooter preserves an in-flight shot through resize",
  );
  screenshots.push(await screenshot("bubble-shooter-keyboard-rebound-resize-768x1024"));

  await setViewport(390, 844);
  await navigate("/jogos/bubble-shooter?seed=2026");
  await waitFor(
    () => evaluate(`document.querySelector('.bubble-shooter-canvas')?.dataset.arcadeReady === 'true'`),
    "Bubble Shooter ready for complete mobile round",
    20000,
  );

  const getBubbleTarget = async (challengeIndex, chooseCorrect, clearGroup = false) => evaluate(`(async () => {
    const { createBubbleShooterRound } = await import('/src/games/arcade/bubbleShooter/bubbleShooterRound.ts');
    const challenge = createBubbleShooterRound(2026).challenges[${challengeIndex}];
    const correctIndex = challenge.choices.findIndex((choice) => choice.id === challenge.correctChoiceId);
    const choiceIndex = ${chooseCorrect} ? correctIndex : (correctIndex + 1) % challenge.choices.length;
    const columns = [0, 2, 4];
    const surface = document.querySelector('.bubble-shooter-canvas');
    const rect = surface.getBoundingClientRect();
    const radius = Math.min(52, Math.max(24, (surface.clientWidth - 24) / 13));
    const left = (surface.clientWidth - radius * 13) / 2;
    return {
      x: rect.left + left + radius + columns[choiceIndex] * radius * 2 + (${clearGroup} ? radius * 2.4 : 0),
      y: rect.top + 116 + (${clearGroup} ? Math.sqrt(3) * radius : 0),
    };
  })()`);

  const bubbleWrongTarget = await getBubbleTarget(0, false);
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: bubbleWrongTarget.x, y: bubbleWrongTarget.y, radiusX: 4, radiusY: 4, force: 1, id: 41 }],
  }, sessionId);
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }, sessionId);
  await waitFor(
    () => evaluate(`document.querySelector('.bubble-shooter-canvas')?.dataset.runtimeLastAnswer === 'incorrect'`),
    "Bubble Shooter reports an incorrect touch shot",
  );
  const bubbleScrollAfterTouch = await evaluate(`window.scrollY`);
  assert(
    bubbleScrollAfterTouch === 0,
    `Bubble Shooter touch moved the page by ${bubbleScrollAfterTouch}px`,
  );
  screenshots.push(await screenshot("bubble-shooter-incorrect-390x844"));
  await waitFor(
    () => evaluate(`document.querySelector('.bubble-shooter-canvas')?.dataset.runtimeChallengeIndex === '1'`),
    "Bubble Shooter advances after incorrect shot",
  );

  for (let challengeIndex = 1; challengeIndex < 6; challengeIndex += 1) {
    const target = await getBubbleTarget(challengeIndex, true, challengeIndex === 1);
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: target.x,
      y: target.y,
      button: "left",
      clickCount: 1,
    }, sessionId);
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: target.x,
      y: target.y,
      button: "left",
      clickCount: 1,
    }, sessionId);
    await waitFor(
      () => evaluate(`document.querySelector('.bubble-shooter-canvas')?.dataset.runtimeShotInFlight === 'true'`),
      `Bubble Shooter launches shot ${challengeIndex + 1}`,
    );
    await waitFor(
      () => evaluate(`(() => {
        const surface = document.querySelector('.bubble-shooter-canvas');
        return surface?.dataset.runtimeLastAnswer === 'correct' &&
          surface?.dataset.runtimeShotInFlight === 'false';
      })()`),
      `Bubble Shooter accepts correct shot ${challengeIndex + 1}`,
    );
    if (challengeIndex === 1) {
      const removalState = await evaluate(`(() => {
        const surface = document.querySelector('.bubble-shooter-canvas');
        return {
          disconnected: Number(surface?.dataset.runtimeDisconnectedDropped ?? 0),
          impactId: surface?.dataset.runtimeImpactId,
          removed: Number(surface?.dataset.runtimeRemovedGroupSize ?? 0),
          shotSnapColumn: Number(surface?.dataset.runtimeShotSnapColumn ?? -1),
          shotSnapRow: Number(surface?.dataset.runtimeShotSnapRow ?? -1),
        };
      })()`);
      assert(
        removalState.removed === 3 && removalState.disconnected === 1,
        `Bubble Shooter group/disconnection failed: ${JSON.stringify(removalState)}`,
      );
      screenshots.push(await screenshot("bubble-shooter-correct-390x844"));
    }
    if (challengeIndex < 5) {
      await waitFor(
        () => evaluate(`document.querySelector('.bubble-shooter-canvas')?.dataset.runtimeChallengeIndex === '${challengeIndex + 1}'`),
        `Bubble Shooter advances to challenge ${challengeIndex + 2}`,
      );
    }
  }

  await waitFor(
    () => evaluate(`document.querySelector('.game-progress')?.getAttribute('aria-valuenow') === '100'`),
    "Bubble Shooter Canvas records all six outcomes",
  );
  await waitFor(
    () => evaluate(`Boolean(document.querySelector('.game-result-page'))`),
    "Bubble Shooter Canvas result",
    12000,
  );
  await assertNoOverflow("/jogos/bubble-shooter completed mobile round");
  const bubbleCanvasResult = await evaluate(`(async () => {
    const stats = [...document.querySelectorAll('.score-stats > div')].map((item) => item.innerText.trim());
    const { getGameSessions } = await import('/src/services/progress/localProgress.ts');
    const sessions = await getGameSessions();
    const session = sessions.find((item) => item.gameId === 'bubble_shooter');
    return { session, stats };
  })()`);
  assert(
    bubbleCanvasResult.session?.correctCount === 5 &&
      bubbleCanvasResult.session.totalChallenges === 6 &&
      bubbleCanvasResult.session.xpEarned === 35 &&
      bubbleCanvasResult.session.score === 750,
    `Bubble Shooter Canvas result/persistence failed: ${JSON.stringify(bubbleCanvasResult)}`,
  );
  screenshots.push(await screenshot("bubble-shooter-result-390x844"));
  await evaluate(`(async () => {
    const { resetAllLocalData } = await import('/src/services/progress/engagement.ts');
    await resetAllLocalData();
  })()`);

  await send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "prefers-reduced-motion", value: "reduce" }] },
    sessionId,
  );
  await navigate("/jogos/bubble-shooter?seed=2026");
  await waitFor(
    () => evaluate(`(() => {
      const surface = document.querySelector('.bubble-shooter-canvas');
      return surface?.dataset.runtimeReducedMotion === 'true' &&
        surface?.dataset.runtimeTweenCount === '0';
    })()`),
    "Bubble Shooter respects reduced motion",
    20000,
  );
  screenshots.push(await screenshot("bubble-shooter-reduced-motion-390x844"));
  await navigateSpa("/jogos");
  await waitFor(
    () => evaluate(`document.querySelectorAll('canvas').length === 0`),
    "Bubble Shooter destroys its canvas on exit",
  );
  await send("Emulation.setEmulatedMedia", { features: [] }, sessionId);

  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [360, 800]]) {
    await setViewport(width, height);
    await navigate("/jogos/corte-a-palavra?seed=2026");
    await waitFor(
      () => evaluate(`document.querySelector('.word-slice-canvas')?.dataset.arcadeReady === 'true'`),
      `Corte a palavra ready at ${width}x${height}`,
      20000,
    );
    const wordSliceLayout = await evaluate(`(() => {
      const surface = document.querySelector('.word-slice-canvas');
      return {
        activeObjects: Number(surface?.dataset.runtimeActiveObjectCount ?? 0),
        canvasCount: surface?.querySelectorAll('canvas').length ?? 0,
        height: surface?.clientHeight ?? 0,
        minControlSize: Math.min(...[...document.querySelectorAll('.game-play-page .icon-button, .arcade-mode-switch button')].flatMap((control) => {
          const rect = control.getBoundingClientRect();
          return [rect.width, rect.height];
        })),
        width: surface?.clientWidth ?? 0,
      };
    })()`);
    assert(
      wordSliceLayout.canvasCount === 1 &&
        wordSliceLayout.activeObjects === 3 &&
        wordSliceLayout.width > 0 &&
        wordSliceLayout.height >= 470 &&
        wordSliceLayout.minControlSize >= 44,
      `Corte a palavra initial board failed at ${width}x${height}: ${JSON.stringify(wordSliceLayout)}`,
    );
    await assertNoOverflow(`/jogos/corte-a-palavra ${width}x${height}`);
    screenshots.push(await screenshot(`word-slice-${width}x${height}`));
  }

  await setViewport(390, 844);
  await navigate("/jogos/corte-a-palavra?seed=2026");
  await waitFor(
    () => evaluate(`document.querySelector('.word-slice-canvas')?.dataset.arcadeReady === 'true'`),
    "Corte a palavra ready for gesture checks",
    20000,
  );
  const wordSliceSurfaceRect = await evaluate(`(() => {
    const rect = document.querySelector('.word-slice-canvas').getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top };
  })()`);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: wordSliceSurfaceRect.left + 18,
    y: wordSliceSurfaceRect.top + 92,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: wordSliceSurfaceRect.left + 48,
    y: wordSliceSurfaceRect.top + 92,
    button: "left",
    buttons: 1,
  }, sessionId);
  await waitFor(
    () => evaluate(`(() => {
      const surface = document.querySelector('.word-slice-canvas');
      return surface?.dataset.runtimeGestureActive === 'true' &&
        Number(surface?.dataset.runtimeTrailPointCount ?? 0) > 1;
    })()`),
    "Corte a palavra draws an armed trail",
  );
  screenshots.push(await screenshot("word-slice-trail-390x844"));
  await evaluate(`document.querySelector('.word-slice-pause-button')?.click()`);
  await waitFor(
    () => evaluate(`(() => {
      const surface = document.querySelector('.word-slice-canvas');
      return surface?.dataset.runtimePaused === 'true' &&
        surface?.dataset.runtimeGestureActive === 'false';
    })()`),
    "Corte a palavra cancels an active gesture on pause",
  );
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: wordSliceSurfaceRect.left + 48,
    y: wordSliceSurfaceRect.top + 92,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await evaluate(`document.querySelector('.word-slice-pause-button')?.click()`);
  await waitFor(
    () => evaluate(`document.querySelector('.word-slice-canvas')?.dataset.runtimePaused === 'false'`),
    "Corte a palavra resumes after gesture cancellation",
  );

  const resizeGestureRect = await evaluate(`(() => {
    const rect = document.querySelector('.word-slice-canvas').getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  })()`);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: resizeGestureRect.left + 18,
    y: resizeGestureRect.top + 92,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: resizeGestureRect.left + 48,
    y: resizeGestureRect.top + 92,
    button: "left",
    buttons: 1,
  }, sessionId);
  await waitFor(
    () => evaluate(`document.querySelector('.word-slice-canvas')?.dataset.runtimeGestureActive === 'true'`),
    "Corte a palavra starts a gesture before resize",
  );
  await setViewport(412, 915);
  await waitFor(
    () => evaluate(`(() => {
      const surface = document.querySelector('.word-slice-canvas');
      return surface?.dataset.runtimeGestureActive === 'false' &&
        surface?.dataset.runtimeWaveIndex === '0' &&
        surface?.dataset.runtimeActiveObjectCount === '3';
    })()`),
    "Corte a palavra cancels only the gesture on resize",
  );
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: resizeGestureRect.left + 48,
    y: resizeGestureRect.top + 92,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await setViewport(390, 844);

  const getWordSliceLane = async (challengeIndex, chooseCorrect) => evaluate(`(async () => {
    const { createWordSliceRound } = await import('/src/games/arcade/wordSlice/wordSliceRound.ts');
    const challenge = createWordSliceRound(2026).challenges[${challengeIndex}];
    const correctIndex = challenge.choices.findIndex((choice) => choice.id === challenge.correctChoiceId);
    const choiceIndex = ${chooseCorrect} ? correctIndex : (correctIndex + 1) % challenge.choices.length;
    const surface = document.querySelector('.word-slice-canvas');
    const rect = surface.getBoundingClientRect();
    const radius = Math.min(48, Math.max(34, surface.clientWidth * 0.09));
    const boardTop = 112 + radius;
    const boardBottom = surface.clientHeight - 70 - radius;
    const laneGap = Math.max(0, (boardBottom - boardTop) / 2);
    return {
      choiceId: challenge.choices[choiceIndex].id,
      x1: rect.left + 8,
      x2: rect.right - 8,
      y: rect.top + boardTop + laneGap * choiceIndex,
    };
  })()`);

  const neutralLane = await getWordSliceLane(0, false);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: neutralLane.x1,
    y: neutralLane.y,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: neutralLane.x1,
    y: neutralLane.y,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: neutralLane.x1, y: neutralLane.y, radiusX: 4, radiusY: 4, force: 1, id: 71 }],
  }, sessionId);
  await send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] }, sessionId);
  await delay(180);
  assert(
    await evaluate(`document.querySelector('.word-slice-canvas')?.dataset.runtimeWaveIndex === '0'`),
    "Corte a palavra tap or pointer cancel must not resolve a challenge",
  );

  const swipeWordSliceLane = async (lane, inputType) => {
    if (inputType === "touch") {
      await send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: lane.x1, y: lane.y, radiusX: 4, radiusY: 4, force: 1, id: 72 }],
      }, sessionId);
      for (const progress of [0.25, 0.5, 0.75, 1]) {
        await send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{
            x: lane.x1 + (lane.x2 - lane.x1) * progress,
            y: lane.y,
            radiusX: 4,
            radiusY: 4,
            force: 1,
            id: 72,
          }],
        }, sessionId);
        await delay(24);
      }
      await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }, sessionId);
      return;
    }
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: lane.x1,
      y: lane.y,
      button: "left",
      clickCount: 1,
      pointerType: inputType,
    }, sessionId);
    await send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: lane.x2,
      y: lane.y,
      button: "left",
      buttons: 1,
      pointerType: inputType,
    }, sessionId);
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: lane.x2,
      y: lane.y,
      button: "left",
      clickCount: 1,
      pointerType: inputType,
    }, sessionId);
  };

  for (const interaction of [
    { challengeIndex: 0, correct: true, inputType: "mouse" },
    { challengeIndex: 1, correct: false, inputType: "touch" },
    { challengeIndex: 2, correct: true, inputType: "pen" },
  ]) {
    const lane = await getWordSliceLane(interaction.challengeIndex, interaction.correct);
    await swipeWordSliceLane(lane, interaction.inputType);
    await waitFor(
      () => evaluate(`document.querySelector('.word-slice-canvas')?.dataset.runtimeLastSlicedChoiceId === '${lane.choiceId}'`),
      `Corte a palavra accepts ${interaction.inputType} slice ${interaction.challengeIndex + 1}`,
    );
    if (interaction.challengeIndex === 1) {
      assert(
        await evaluate(`document.querySelector('.word-slice-canvas')?.dataset.runtimeLastAnswer === 'incorrect'`),
        "Corte a palavra applies an incorrect-slice penalty",
      );
      const expectedCorrectLabel = await evaluate(`(async () => {
        const { createWordSliceRound } = await import('/src/games/arcade/wordSlice/wordSliceRound.ts');
        const challenge = createWordSliceRound(2026).challenges[1];
        return challenge.choices.find((choice) => choice.id === challenge.correctChoiceId).label;
      })()`);
      assert(
        await evaluate(`(() => {
          const status = document.querySelector('.word-slice-status')?.textContent ?? '';
          return status.includes('Menos 25 pontos') && status.includes('${expectedCorrectLabel}');
        })()`),
        "Corte a palavra exposes the correct answer in the React live region",
      );
      screenshots.push(await screenshot("word-slice-incorrect-390x844"));
    }
    await waitFor(
      () => evaluate(`document.querySelector('.word-slice-canvas')?.dataset.runtimeWaveIndex === '${interaction.challengeIndex + 1}'`),
      `Corte a palavra advances to wave ${interaction.challengeIndex + 2}`,
    );
    if (interaction.challengeIndex === 1) {
      await waitFor(
        () => evaluate(`document.querySelector('.word-slice-status')?.textContent.trim() === 'Próxima palavra.'`),
        "Corte a palavra clears stale feedback on the next wave",
      );
    }
  }

  await evaluate(`document.querySelector('.word-slice-canvas')?.focus()`);
  const pressWordSliceKey = async (key, code, virtualKeyCode) => {
    await send("Input.dispatchKeyEvent", {
      type: "rawKeyDown",
      key,
      code,
      windowsVirtualKeyCode: virtualKeyCode,
      nativeVirtualKeyCode: virtualKeyCode,
    }, sessionId);
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key,
      code,
      windowsVirtualKeyCode: virtualKeyCode,
      nativeVirtualKeyCode: virtualKeyCode,
    }, sessionId);
  };
  for (let challengeIndex = 3; challengeIndex < 8; challengeIndex += 1) {
    const keyboardTarget = await evaluate(`(async () => {
      const { createWordSliceRound } = await import('/src/games/arcade/wordSlice/wordSliceRound.ts');
      const challenge = createWordSliceRound(2026).challenges[${challengeIndex}];
      return {
        choiceId: challenge.correctChoiceId,
        index: challenge.choices.findIndex((choice) => choice.id === challenge.correctChoiceId),
      };
    })()`);
    for (let index = 0; index < keyboardTarget.index; index += 1) {
      await pressWordSliceKey("ArrowDown", "ArrowDown", 40);
      await delay(50);
    }
    await waitFor(
      () => evaluate(`document.querySelector('.word-slice-canvas')?.dataset.runtimeSelectedChoiceId === '${keyboardTarget.choiceId}'`),
      `Corte a palavra keyboard selects target ${challengeIndex + 1}`,
    );
    await pressWordSliceKey(" ", "Space", 32);
    if (challengeIndex < 7) {
      await waitFor(
        () => evaluate(`document.querySelector('.word-slice-canvas')?.dataset.runtimeWaveIndex === '${challengeIndex + 1}'`),
        `Corte a palavra keyboard advances to wave ${challengeIndex + 2}`,
      );
    }
  }
  await waitFor(
    () => evaluate(`Boolean(document.querySelector('.game-result-page'))`),
    "Corte a palavra Canvas result",
    12000,
  );
  const wordSliceCanvasResult = await evaluate(`(async () => {
    const { getGameSessions } = await import('/src/services/progress/localProgress.ts');
    const sessions = await getGameSessions();
    return sessions.find((item) => item.gameId === 'word_slice');
  })()`);
  assert(
    wordSliceCanvasResult?.correctCount === 7 &&
      wordSliceCanvasResult.totalChallenges === 8 &&
      wordSliceCanvasResult.xpEarned === 45 &&
      wordSliceCanvasResult.score === 1235,
    `Corte a palavra Canvas persistence failed: ${JSON.stringify(wordSliceCanvasResult)}`,
  );
  screenshots.push(await screenshot("word-slice-result-390x844"));
  await evaluate(`(async () => {
    const { resetAllLocalData } = await import('/src/services/progress/engagement.ts');
    await resetAllLocalData();
  })()`);

  await send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "prefers-reduced-motion", value: "reduce" }] },
    sessionId,
  );
  await navigate("/jogos/corte-a-palavra?seed=2026");
  await waitFor(
    () => evaluate(`(() => {
      const surface = document.querySelector('.word-slice-canvas');
      return surface?.dataset.runtimeReducedMotion === 'true' &&
        surface?.dataset.runtimeTweenCount === '0';
    })()`),
    "Corte a palavra respects reduced motion",
    20000,
  );
  screenshots.push(await screenshot("word-slice-reduced-motion-390x844"));
  await navigateSpa("/jogos");
  await waitFor(
    () => evaluate(`document.querySelectorAll('canvas').length === 0`),
    "Corte a palavra destroys its canvas on exit",
  );
  await send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] },
    sessionId,
  );

  // ---- Ninja 6A: auto-run, camera, parallax foundation, pooling and lifecycle ----
  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [360, 800]]) {
    await setViewport(width, height);
    await navigate("/jogos/ninja?seed=2026");
    await waitFor(
      () => evaluate(`document.querySelector('.ninja-foundation-canvas')?.dataset.arcadeReady === 'true'`),
      `Ninja foundation ready at ${width}x${height}`,
      20000,
    );
    await waitFor(
      () => evaluate(`(() => {
        const surface = document.querySelector('.ninja-foundation-canvas');
        return Number(surface?.dataset.runtimeRunnerDistance) > 80 &&
          Number(surface?.dataset.runtimeCameraX) > 0 &&
          Number(surface?.dataset.runtimePooledReuseCount) > 0 &&
          Boolean(surface?.dataset.runtimeSelectedChoiceId);
      })()`),
      `Ninja foundation advances and recycles at ${width}x${height}`,
      12000,
    );
    const ninjaLayout = await evaluate(`(() => {
      const surface = document.querySelector('.ninja-foundation-canvas');
      const pause = document.querySelector('.ninja-pause-button');
      const rect = surface?.getBoundingClientRect();
      const pauseRect = pause?.getBoundingClientRect();
      return {
        decisionStopped: surface?.dataset.runtimeAutoRunning,
        canvasCount: document.querySelectorAll('.ninja-foundation-canvas canvas').length,
        height: rect?.height ?? 0,
        pauseHeight: pauseRect?.height ?? 0,
        pauseWidth: pauseRect?.width ?? 0,
        poolSize: Number(surface?.dataset.runtimeTrackPoolSize),
        width: rect?.width ?? 0,
      };
    })()`);
    assert(
      ninjaLayout.decisionStopped === "false" &&
        ninjaLayout.canvasCount === 1 &&
        ninjaLayout.width > 0 &&
        ninjaLayout.height >= 500 &&
        ninjaLayout.pauseHeight >= 44 &&
        ninjaLayout.pauseWidth >= 44 &&
        ninjaLayout.poolSize >= 9,
      `Ninja foundation layout failed at ${width}x${height}: ${JSON.stringify(ninjaLayout)}`,
    );
    await assertNoOverflow(`/jogos/ninja ${width}x${height}`);
    screenshots.push(await screenshot(`ninja-foundation-${width}x${height}`));
  }

  await click(".ninja-pause-button");
  await waitFor(
    () => evaluate(`document.querySelector('.ninja-foundation-canvas')?.dataset.runtimePaused === 'true'`),
    "Ninja foundation pauses",
  );
  const pausedNinjaDistance = await evaluate(
    `Number(document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeRunnerDistance)`,
  );
  await delay(550);
  assert(
    await evaluate(
      `Number(document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeRunnerDistance) === ${pausedNinjaDistance}`,
    ),
    "Ninja runner advanced while paused",
  );
  screenshots.push(await screenshot("ninja-foundation-paused-360x800"));
  await click(".ninja-pause-button");
  await waitFor(
    () => evaluate(`document.querySelector('.ninja-foundation-canvas')?.dataset.runtimePaused === 'false'`),
    "Ninja foundation resumes",
  );
  await delay(350);
  assert(
    await evaluate(
      `Number(document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeRunnerDistance) === ${pausedNinjaDistance}`,
    ),
    "Ninja left the decision zone without an answer after resume",
  );
  const ninjaPoolBeforeResize = await evaluate(
    `Number(document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeTrackPoolSize)`,
  );
  const ninjaDistanceBeforeResize = await evaluate(
    `Number(document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeRunnerDistance)`,
  );
  await setViewport(768, 1024);
  await waitFor(
    () => evaluate(`document.querySelector('.ninja-foundation-canvas')?.getBoundingClientRect().width > 650`),
    "Ninja foundation resizes",
  );
  assert(
    await evaluate(
      `(() => {
        const surface = document.querySelector('.ninja-foundation-canvas');
        return Number(surface?.dataset.runtimeTrackPoolSize) === ${ninjaPoolBeforeResize} &&
          Number(surface?.dataset.runtimeRunnerDistance) >= ${ninjaDistanceBeforeResize};
      })()`,
    ),
    "Ninja resize replaced the fixed track pool or reset runner distance",
  );
  screenshots.push(await screenshot("ninja-foundation-resized-768x1024"));
  await navigateSpa("/jogos");
  await waitFor(
    () => evaluate(`document.querySelectorAll('canvas').length === 0`),
    "Ninja foundation destroys its canvas on exit",
  );

  await setViewport(390, 844);
  await navigate("/jogos/ninja?seed=2026");
  await waitFor(
    () => evaluate(`Boolean(document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeSelectedChoiceId)`),
    "Ninja first decision is ready",
    20000,
  );
  const ninjaRound = await evaluate(`(async () => {
    const { createNinjaFoundationRound } = await import('/src/games/arcade/ninja/ninjaRound.ts');
    return createNinjaFoundationRound(2026);
  })()`);
  const clickNinjaSign = async (index) => {
    const point = await evaluate(`(() => {
      const rect = document.querySelector('.ninja-foundation-canvas').getBoundingClientRect();
      const logicalGround = Math.min(rect.height - 76, Math.max(300, rect.height * 0.76));
      return {
        x: rect.left + rect.width * ((${index} + 0.5) / 3),
        y: rect.top + Math.max(145, logicalGround - 122),
      };
    })()`);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point }, sessionId);
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point }, sessionId);
  };
  const first = ninjaRound.challenges[0];
  const wrongIndex = first.choices.findIndex((choice) => choice.id !== first.correctChoiceId);
  await clickNinjaSign(wrongIndex);
  await waitFor(
    () => evaluate(`document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeLastAnswer === 'incorrect'`),
    "Ninja click resolves an incorrect sign",
  );
  await waitFor(
    () => hasText("Resposta incorreta."),
    "Ninja incorrect feedback is exposed outside Canvas",
  );
  screenshots.push(await screenshot("ninja-sign-incorrect-390x844"));
  await waitFor(
    () => evaluate(`document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeChallengeIndex === '1'`),
    "Ninja advances to second sign challenge",
  );
  await evaluate(`document.querySelector('.ninja-foundation-canvas')?.focus()`);
  const second = ninjaRound.challenges[1];
  const secondCorrectIndex = second.choices.findIndex((choice) => choice.id === second.correctChoiceId);
  for (let index = 0; index < secondCorrectIndex; index += 1) await pressKey("ArrowRight");
  await pressKey("Enter");
  await waitFor(
    () => evaluate(`document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeLastAnswer === 'correct'`),
    "Ninja keyboard jump resolves a correct sign",
  );
  await waitFor(
    () => evaluate(`document.querySelector('.ninja-foundation-canvas')?.dataset.runtimeChallengeIndex === '2'`),
    "Ninja advances to third sign challenge",
  );
  const third = ninjaRound.challenges[2];
  const thirdCorrectIndex = third.choices.findIndex((choice) => choice.id === third.correctChoiceId);
  await clickNinjaSign(thirdCorrectIndex);
  await waitFor(() => hasText("Progressão concluída!"), "Ninja completes the 6B progression", 12000);
  assert(
    await evaluate(`document.querySelectorAll('.ninja-foundation-canvas canvas').length === 1`),
    "Ninja progression remounted its Canvas",
  );
  screenshots.push(await screenshot("ninja-progression-complete-390x844"));
  await navigateSpa("/jogos");
  await waitFor(() => evaluate(`document.querySelectorAll('canvas').length === 0`), "Ninja 6B teardown");

  await send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "prefers-reduced-motion", value: "reduce" }] },
    sessionId,
  );
  await setViewport(390, 844);
  await navigate("/jogos/ninja?seed=2026");
  await waitFor(
    () => evaluate(`(() => {
      const surface = document.querySelector('.ninja-foundation-canvas');
      return surface?.dataset.arcadeReady === 'true' &&
        surface?.dataset.runtimeReducedMotion === 'true' &&
        surface?.dataset.runtimeAutoRunning === 'false' &&
        surface?.dataset.runtimeTweenCount === '0';
    })()`),
    "Ninja foundation respects reduced motion",
    20000,
  );
  const reducedNinjaState = await evaluate(`(() => {
    const surface = document.querySelector('.ninja-foundation-canvas');
    return {
      cameraX: Number(surface?.dataset.runtimeCameraX),
      distance: Number(surface?.dataset.runtimeRunnerDistance),
    };
  })()`);
  await delay(550);
  assert(
    await evaluate(`(() => {
      const surface = document.querySelector('.ninja-foundation-canvas');
      return Number(surface?.dataset.runtimeCameraX) === ${reducedNinjaState.cameraX} &&
        Number(surface?.dataset.runtimeRunnerDistance) === ${reducedNinjaState.distance};
    })()`),
    "Ninja reduced-motion scene continued moving",
  );
  screenshots.push(await screenshot("ninja-foundation-reduced-motion-390x844"));
  await navigateSpa("/jogos");
  await waitFor(
    () => evaluate(`document.querySelectorAll('canvas').length === 0`),
    "Ninja reduced-motion scene destroys its canvas on exit",
  );
  await send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] },
    sessionId,
  );

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
    ["/jogos/monte-a-frase", "Monte a frase"],
    ["/jogos/caca-ao-erro", "Caça ao erro"],
    ["/jogos/palavra-secreta", "Palavra secreta"],
    ["/jogos/conectando", "Conectando"],
    ["/jogos/par-perfeito", "Par perfeito"],
    ["/jogos/cada-coisa-no-seu-lugar", "Cada coisa no seu lugar"],
    ["/jogos/cruzando-palavras", "Cruzando palavras"],
    ["/jogos/ouvido-afiado", "Ouvido afiado"],
    ["/jogos/contra-o-relogio", "Contra o relógio"],
    ["/jogos/bubble-shooter", "Bubble Shooter"],
    ["/jogos/corte-a-palavra", "Corte a palavra"],
    ["/jogos/ninja", "Ninja"],
  ];
  for (const [path, text] of routeChecks) {
    await navigate(path);
    await waitFor(() => hasText(text), `route ${path}`);
    await assertNoOverflow(path);
  }

  await navigate("/jogos");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.quick-game-card .game-card-image').length === 9`),
    "nine approved game card images render",
  );
  await evaluate(`(async () => {
    for (const card of document.querySelectorAll('.quick-game-card')) {
      card.scrollIntoView({ block: 'center' });
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
  })()`);
  await waitFor(
    () =>
      evaluate(
        `[...document.querySelectorAll('.quick-game-card .game-card-image')]
          .every((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)`,
      ),
    "all game card images load",
  );
  const gameCardImageState = await evaluate(`(() => {
    const expectedTitles = [
      "Monte a frase",
      "Caça ao erro",
      "Contra o relógio",
      "Cada coisa no seu lugar",
      "Palavra secreta",
      "Conectando",
      "Cruzando palavras",
      "Par perfeito",
      "Ouvido afiado",
      "Bubble Shooter",
      "Corte a palavra",
    ];
    const cards = [...document.querySelectorAll('.quick-game-card')];
    const images = [...document.querySelectorAll('.quick-game-card .game-card-image')];
    return {
      cardCount: cards.length,
      imageCount: images.length,
      titles: cards.map((card) => card.querySelector('.game-card-copy strong')?.textContent.trim()),
      descriptions: cards.map((card) => card.querySelector('.game-card-copy > span:not(.game-card-title-row)')?.textContent.trim()),
      titleRows: cards.map((card) => {
        const row = card.querySelector('.game-card-title-row');
        const icon = row?.querySelector('.quick-game-icon');
        const title = row?.querySelector('strong');
        const iconRect = icon?.getBoundingClientRect();
        const titleRect = title?.getBoundingClientRect();
        return {
          hasRow: Boolean(row),
          hasIcon: Boolean(icon),
          hasTitle: Boolean(title),
          title: title?.textContent.trim(),
          iconCenterDelta: iconRect && titleRect
            ? Math.abs((iconRect.top + iconRect.height / 2) - (titleRect.top + titleRect.height / 2))
            : null,
        };
      }),
      imageContracts: images.map((img) => ({
        alt: img.getAttribute('alt'),
        ariaHidden: img.getAttribute('aria-hidden'),
        widthAttr: img.getAttribute('width'),
        heightAttr: img.getAttribute('height'),
        decoding: img.getAttribute('decoding'),
        loading: img.getAttribute('loading'),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        ratio: Number((img.naturalWidth / img.naturalHeight).toFixed(3)),
        src: img.currentSrc || img.src,
      })),
      patternCount: document.querySelectorAll('.game-card-pattern').length,
      arcadePreviewCount: document.querySelectorAll('.arcade-card-preview').length,
      wordSlicePreviewCount: document.querySelectorAll('.word-slice-card-preview').length,
      everyButton: cards.every((card) => card.tagName === 'BUTTON'),
      titleMatches: expectedTitles.every((title, index) => cards[index]?.innerText.includes(title)),
      sortingDescription: cards[3]?.innerText.includes("Arraste cada palavra até a imagem correspondente."),
    };
  })()`);
  assert(
    gameCardImageState.cardCount === 11 &&
      gameCardImageState.imageCount === 9 &&
      gameCardImageState.arcadePreviewCount === 1 &&
      gameCardImageState.wordSlicePreviewCount === 1 &&
      gameCardImageState.everyButton &&
      gameCardImageState.titleMatches &&
      gameCardImageState.sortingDescription &&
      gameCardImageState.titleRows.every(
        (row, index) =>
          row.hasRow &&
          row.hasIcon &&
          row.hasTitle &&
          row.title === gameCardImageState.titles[index] &&
          row.iconCenterDelta <= 12,
      ) &&
      gameCardImageState.patternCount === 0 &&
      gameCardImageState.imageContracts.every(
        (image, index) =>
          image.alt === "" &&
          image.ariaHidden === "true" &&
          image.widthAttr === "800" &&
          image.heightAttr === "450" &&
          image.decoding === "async" &&
          image.naturalWidth === 800 &&
          image.naturalHeight === 450 &&
          image.ratio === 1.778 &&
          image.src.includes("/src/assets/game-card-images/cards/") &&
          (index < 3 ? image.loading === "eager" : image.loading === "lazy"),
      ),
    `Game card image contract failed: ${JSON.stringify(gameCardImageState)}`,
  );
  assert(
    gameCardImageState.descriptions.every(Boolean),
    `Game card descriptions missing: ${JSON.stringify(gameCardImageState.descriptions)}`,
  );

  const gameGridExpectations = [
    [1440, 900, 3],
    [768, 1024, 2],
    [390, 844, 1],
  ];
  for (const [width, height, expectedColumns] of gameGridExpectations) {
    await setViewport(width, height);
    await navigate("/jogos");
    await waitFor(
      () => evaluate(`document.querySelectorAll('.quick-game-card').length === 11`),
      `games grid ${width}x${height}`,
    );
    await assertNoOverflow(`/jogos ${width}x${height}`);
    const layout = await evaluate(`(() => {
      const cards = [...document.querySelectorAll('.quick-game-card')];
      const firstTop = Math.round(cards[0].getBoundingClientRect().top);
      return {
        firstRow: cards.filter((card) => Math.abs(Math.round(card.getBoundingClientRect().top) - firstTop) <= 2).length,
        imageRatios: [...document.querySelectorAll('.game-card-image-wrap')].map((item) => Number((item.getBoundingClientRect().width / item.getBoundingClientRect().height).toFixed(3))),
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      };
    })()`);
    assert(
      layout.firstRow === expectedColumns &&
        layout.imageRatios.every((ratio) => Math.abs(ratio - 1.778) < 0.02) &&
        layout.documentWidth <= layout.viewportWidth + 1,
      `Games grid layout failed at ${width}x${height}: ${JSON.stringify(layout)}`,
    );
    screenshots.push(await screenshot(`games-refined-${width}x${height}`));
    if (width === 1440 || width === 390) {
      await evaluate(`document.querySelector('.quick-game-card:last-child')?.scrollIntoView({ block: 'center' })`);
      const arcadeCardState = await evaluate(`(() => {
        const cards = [...document.querySelectorAll('.quick-game-card')];
        const bubbleCard = cards.find((card) => card.innerText.includes('Bubble Shooter'));
        const wordSliceCard = cards.find((card) => card.innerText.includes('Corte a palavra'));
        const bubbleRect = bubbleCard?.getBoundingClientRect();
        const wordSliceRect = wordSliceCard?.getBoundingClientRect();
        return {
          bubblePreview: Boolean(bubbleCard?.querySelector('.arcade-card-preview')),
          bubbleTitle: bubbleCard?.querySelector('.game-card-copy strong')?.textContent.trim(),
          bubbleVisible: Boolean(bubbleRect && bubbleRect.top < innerHeight && bubbleRect.bottom > 0),
          wordSlicePreview: Boolean(wordSliceCard?.querySelector('.word-slice-card-preview')),
          wordSliceTitle: wordSliceCard?.querySelector('.game-card-copy strong')?.textContent.trim(),
          wordSliceVisible: Boolean(wordSliceRect && wordSliceRect.top < innerHeight && wordSliceRect.bottom > 0),
        };
      })()`);
      assert(
        arcadeCardState.bubblePreview &&
          arcadeCardState.bubbleTitle === "Bubble Shooter" &&
          arcadeCardState.bubbleVisible &&
          arcadeCardState.wordSlicePreview &&
          arcadeCardState.wordSliceTitle === "Corte a palavra" &&
          arcadeCardState.wordSliceVisible,
        `Arcade catalog cards failed at ${width}x${height}: ${JSON.stringify(arcadeCardState)}`,
      );
      screenshots.push(await screenshot(`games-arcade-cards-${width}x${height}`));
      await evaluate(`window.scrollTo(0, 0)`);
    }
  }

  await setViewport(1366, 768);
  await navigate("/jogos");
  await waitFor(
    () => evaluate(`Boolean(document.querySelector('.quick-game-card'))`),
    "game cards ready for keyboard focus",
  );
  await evaluate(`document.querySelector('.quick-game-card')?.focus()`);
  const focusedGameCard = await evaluate(`document.activeElement?.classList.contains('quick-game-card')`);
  assert(focusedGameCard, "Game card must be keyboard focusable");
  await evaluate(`document.querySelectorAll('.quick-game-card')[0]?.click()`);
  await waitFor(
    () => evaluate(`location.pathname === "/jogos/monte-a-frase"`),
    "Monte a frase card click route",
  );
  await navigate("/jogos");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.quick-game-card').length === 11`),
    "game cards ready for direct navigation",
  );
  await evaluate(`document.querySelectorAll('.quick-game-card')[3]?.click()`);
  await waitFor(
    () => evaluate(`location.pathname === "/jogos/cada-coisa-no-seu-lugar"`),
    "Cada coisa no seu lugar card click route",
  );

  await send(
    "Emulation.setEmulatedMedia",
    { features: [{ name: "prefers-reduced-motion", value: "reduce" }] },
    sessionId,
  );
  await navigate("/jogos");
  const reducedMotionCardImage = await evaluate(`(() => {
    const image = document.querySelector('.game-card-image');
    const card = document.querySelector('.quick-game-card');
    card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    const parseDuration = (value) => Math.max(
      ...value.split(',').map((item) => {
        const trimmed = item.trim();
        if (trimmed.endsWith('ms')) return parseFloat(trimmed) / 1000;
        if (trimmed.endsWith('s')) return parseFloat(trimmed);
        return Number(trimmed) || 0;
      }),
    );
    const isIdentity = (value) => value === 'none' || value === 'matrix(1, 0, 0, 1, 0, 0)';
    return {
      transitionDuration: getComputedStyle(image).transitionDuration,
      transitionSeconds: parseDuration(getComputedStyle(image).transitionDuration),
      transform: getComputedStyle(image).transform,
      cardTransform: getComputedStyle(card).transform,
      imageTransformIsStatic: isIdentity(getComputedStyle(image).transform),
      cardTransformIsStatic: isIdentity(getComputedStyle(card).transform),
    };
  })()`);
  assert(
    reducedMotionCardImage.transitionSeconds <= 0.001 &&
      reducedMotionCardImage.imageTransformIsStatic &&
      reducedMotionCardImage.cardTransformIsStatic,
    `Reduced motion should remove game-card zoom/elevation: ${JSON.stringify(reducedMotionCardImage)}`,
  );
  await send("Emulation.setEmulatedMedia", { features: [] }, sessionId);

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
  await delay(1100);
  assert(await hasText("Questão 1 de 10"), "Correct answer advanced before two seconds");
  await waitFor(() => hasText("Questão 2 de 10"), "two-second automatic advance", 5000);

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
  await waitFor(
    () =>
      evaluate(`(() => {
        const image = document.querySelector('.flashcard-visual');
        return image?.alt === 'Parte do corpo: Cabeça' && image.complete && image.naturalWidth > 0;
      })()`),
    "flashcard photo finishes loading",
    10000,
  );

  const flashcardPhoto = await evaluate(`(() => {
    const img = document.querySelector('.flashcard-visual');
    if (!img || img.tagName !== 'IMG') return null;
    return {
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      complete: img.complete,
    };
  })()`);
  assert(flashcardPhoto !== null, "Flashcard front should render an <img> via VisualAsset, not the SVG fallback");
  assert(
    flashcardPhoto.src.includes("/assets/") && flashcardPhoto.src.endsWith(".webp"),
    `Flashcard photo src should be a Vite-bundled .webp asset, got: ${flashcardPhoto.src}`,
  );
  assert(
    flashcardPhoto.complete && flashcardPhoto.naturalWidth > 0,
    "Flashcard photo should load successfully (naturalWidth > 0)",
  );
  assert(
    flashcardPhoto.alt === "Parte do corpo: Cabeça",
    `Flashcard photo alt text should be pedagogical, got: "${flashcardPhoto.alt}"`,
  );

  const fallbackAppeared = await evaluate(`(() => {
    const img = document.querySelector('.flashcard-visual');
    return new Promise((resolve) => {
      img.addEventListener('error', () => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const svgFallback = document.querySelector('.flashcard-face.flashcard-front svg.body-part-illustration');
          resolve(Boolean(svgFallback));
        }));
      }, { once: true });
      img.dispatchEvent(new Event('error'));
    });
  })()`);
  assert(fallbackAppeared, "Simulated image load error should fall back to the SVG BodyPartIllustration");

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

  await setViewport(1366, 768);

  // ---- Content inventory contracts (must match presentTobeAdapter/bodyVocabularyAdapter) ----
  const inventory = await evaluate(`(async () => {
    const { PRESENT_TOBE_QUESTIONS } = await import('/src/content/data/presentTobeQuestions.ts');
    const { getBodyEntries } = await import('/src/games/adapters/bodyVocabularyAdapter.ts');
    const { getSentenceBuilderQuestions, getErrorHuntQuestions, toSentenceBuilderChallenge, toErrorHuntChallenge } =
      await import('/src/games/adapters/presentTobeAdapter.ts');
    const sentenceEligible = getSentenceBuilderQuestions()
      .map((q) => toSentenceBuilderChallenge(q))
      .filter(Boolean).length;
    const errorHuntEligible = getErrorHuntQuestions()
      .map((q) => toErrorHuntChallenge(q))
      .filter(Boolean).length;
    const bodyEntries = getBodyEntries();
    return {
      total: PRESENT_TOBE_QUESTIONS.length,
      easy: PRESENT_TOBE_QUESTIONS.filter((q) => q.difficulty === 'easy').length,
      medium: PRESENT_TOBE_QUESTIONS.filter((q) => q.difficulty === 'medium').length,
      sentenceEligible,
      errorHuntEligible,
      bodyCount: bodyEntries.length,
      visualKeys: bodyEntries.filter((e) => e.visualKey).length,
    };
  })()`);
  assert(
    inventory.total === 130 &&
      inventory.easy === 50 &&
      inventory.medium === 80 &&
      inventory.sentenceEligible === 110 &&
      inventory.errorHuntEligible === 115 &&
      inventory.bodyCount === 24 &&
      inventory.visualKeys === 24,
    `Content inventory contract broken: ${JSON.stringify(inventory)}`,
  );

  const sortingContractInventory = await evaluate(`(async () => {
    const { BODY_GROUPS, getBodyEntries, getBodyGroupId, toSortingChallenge } =
      await import('/src/games/adapters/bodyVocabularyAdapter.ts');
    const { selectChallenges } = await import('/src/games/core/selectChallenges.ts');
    const { ROUND_SIZES } = await import('/src/games/core/roundConfig.ts');
    const build = () => BODY_GROUPS.map((group, index) =>
      selectChallenges(
        getBodyEntries().filter((entry) => getBodyGroupId(entry) === group.id),
        4,
        2026 + index * 211,
      ).map(toSortingChallenge)
    );
    const groupsA = build();
    const groupsB = build();
    const selectedA = groupsA.flat();
    const selectedB = groupsB.flat();
    return {
      label: ROUND_SIZES.sorting_station.label,
      total: selectedA.length,
      groupSizes: groupsA.map((group) => group.length),
      uniqueTerms: new Set(selectedA.map((item) => item.term)).size,
      uniqueTargets: new Set(selectedA.map((item) => item.targetId)).size,
      uniqueImages: new Set(selectedA.map((item) => item.visualKey)).size,
      deterministic: JSON.stringify(selectedA.map((item) => item.id)) === JSON.stringify(selectedB.map((item) => item.id)),
      noGroupId: selectedA.every((item) => !Object.prototype.hasOwnProperty.call(item, 'groupId')),
    };
  })()`);
  assert(
    sortingContractInventory.label === "12 itens em 3 grupos" &&
      sortingContractInventory.total === 12 &&
      JSON.stringify(sortingContractInventory.groupSizes) === JSON.stringify([4, 4, 4]) &&
      sortingContractInventory.uniqueTerms === 12 &&
      sortingContractInventory.uniqueTargets === 12 &&
      sortingContractInventory.uniqueImages === 12 &&
      sortingContractInventory.deterministic &&
      sortingContractInventory.noGroupId,
    `Sorting station contract inventory broken: ${JSON.stringify(sortingContractInventory)}`,
  );

  // ---- Reset engagement/game sessions before exercising each game ----
  await evaluate(`(async () => {
    const { resetAllLocalData } = await import('/src/services/progress/engagement.ts');
    await resetAllLocalData();
  })()`);

  // ---- Monte a frase: full round + accessible answer flow ----
  await navigate("/jogos/monte-a-frase");
  await waitFor(() => hasText("Desafio 1 de 10"), "sentence builder load");
  for (let round = 1; round <= 10; round += 1) {
    await waitFor(() => hasText(`Desafio ${round} de 10`), `sentence builder challenge ${round}`);
    const tokens = await evaluate(`(() => {
      const bank = [...document.querySelectorAll('.sentence-builder-bank .sentence-token')];
      return bank.map((button) => button.textContent);
    })()`);
    assert(tokens.length > 0, `Sentence builder bank empty at challenge ${round}`);
    for (let i = 0; i < tokens.length; i += 1) {
      await evaluate(`(() => {
        const bank = [...document.querySelectorAll('.sentence-builder-bank .sentence-token')];
        if (bank[0]) bank[0].click();
      })()`);
    }
    await clickText("Confirmar frase");
    try {
      await waitFor(
        async () => (await hasText("Correto!")) || (await hasText("Quase lá.")),
        `sentence builder feedback ${round}`,
      );
    } catch (error) {
      const debugBody = await evaluate("document.body.innerText.slice(0, 300)");
      throw new Error(`${error.message} | body at failure: ${JSON.stringify(debugBody)}`);
    }
    const isLast = round === 10;
    const advanceLabel = isLast ? "Ver resultado" : "Continuar";
    const advanceClicked = await evaluate(`(() => {
      const element = [...document.querySelectorAll("button")]
        .find((item) => item.textContent.trim().includes(${JSON.stringify(advanceLabel)}));
      if (!element) return false;
      element.click();
      return true;
    })()`);
    if (!advanceClicked) {
      const debugBody = await evaluate("document.body.innerText.slice(0, 300)");
      throw new Error(`Could not click "${advanceLabel}" at round ${round} | body: ${JSON.stringify(debugBody)}`);
    }
  }
  try {
    await waitFor(() => hasText("RODADA CONCLUÍDA"), "sentence builder result screen");
  } catch (error) {
    const debugBody = await evaluate("document.body.innerText.slice(0, 300)");
    throw new Error(`${error.message} | body at failure: ${JSON.stringify(debugBody)}`);
  }
  assert(await hasText("Monte a frase"), "Sentence builder result missing game title");

  // ---- Caça ao erro: exactly one target error, correction accepted ----
  await navigate("/jogos/caca-ao-erro");
  await waitFor(() => hasText("Desafio 1 de 10"), "error hunt load");
  const errorHuntFirst = await evaluate(`(() => {
    const tokens = [...document.querySelectorAll('.error-hunt-token')];
    return {
      selectableTokens: tokens.map((token) => token.textContent),
      punctuation: [...document.querySelectorAll('.error-hunt-punctuation')].map((token) => token.textContent),
      punctuationButtons: document.querySelectorAll('button.error-hunt-punctuation').length,
    };
  })()`);
  assert(
    errorHuntFirst.selectableTokens.length > 0 &&
      errorHuntFirst.punctuation.length > 0 &&
      errorHuntFirst.punctuationButtons === 0,
    `Error hunt words should be selectable while punctuation remains text: ${JSON.stringify(errorHuntFirst)}`,
  );
  await evaluate(`(() => {
    document.querySelectorAll('.error-hunt-token')[0].click();
  })()`);
  await waitFor(
    () => evaluate(`document.querySelectorAll('.error-hunt-token.correct').length === 1`),
    "error hunt exposes exactly one correct token after selection",
  );
  const wrongPicksAfterFirst = await evaluate(
    `document.querySelectorAll('.error-hunt-token.wrong').length`,
  );
  assert(wrongPicksAfterFirst <= 1, "Error hunt should mark at most the single wrong pick");
  await clickText("Continuar");
  await waitFor(() => hasText("Desafio 2 de 10"), "error hunt advances to challenge 2");
  await navigate("/jogos"); // abandon deliberately mid-round to test navigation guard absence for games

  // ---- Palavra secreta: five lives, letter tracking, physical + virtual keyboard ----
  await setViewport(360, 800);
  await navigate("/jogos/palavra-secreta");
  await waitFor(() => hasText("Palavra 1 de 5"), "secret word load");
  assert(await hasText("Erros: 0/5"), "Secret word does not start with 0 mistakes");
  const secretAnswerLetters = await evaluate(`(() => {
    return document.querySelectorAll('.secret-word-letter:not(.spacer)').length;
  })()`);
  assert(secretAnswerLetters > 0, "Secret word has no letter slots");
  const secretMobileGeometry = await evaluate(`(() => {
    const keys = [...document.querySelectorAll('.secret-word-key')];
    const bounds = keys.map((key) => key.getBoundingClientRect());
    return {
      minLeft: Math.min(...bounds.map((rect) => rect.left)),
      maxRight: Math.max(...bounds.map((rect) => rect.right)),
      minHeight: Math.min(...bounds.map((rect) => rect.height)),
      viewport: document.documentElement.clientWidth,
      label: document.querySelector('.secret-word-letters')?.getAttribute('aria-label'),
    };
  })()`);
  assert(
    secretMobileGeometry.minLeft >= 0 &&
      secretMobileGeometry.maxRight <= secretMobileGeometry.viewport + 1 &&
      secretMobileGeometry.minHeight >= 44 &&
      secretMobileGeometry.label?.includes("Letras tentadas: nenhuma"),
    `Secret word mobile keyboard or accessible pattern is invalid: ${JSON.stringify(secretMobileGeometry)}`,
  );
  screenshots.push(await screenshot("secret-word-mobile-360x800"));
  await evaluate(`document.querySelector('.secret-word-key')?.click()`);
  await waitFor(
    () =>
      evaluate(
        `!document.querySelector('.secret-word-letters')?.getAttribute('aria-label')?.includes('Letras tentadas: nenhuma')`,
      ),
    "Secret word accessible pattern updates after a guess",
  );

  // Guess the entire A-Z keyboard once to fully reveal which letters are correct
  // vs. wrong for this run's word, without assuming its content in advance.
  for (let code = 65; code <= 90; code += 1) {
    await evaluate(`document.querySelectorAll('.secret-word-key')[${code - 65}]?.click()`);
  }
  await delay(300);
  const fullAlphabetState = await evaluate(`({
    mistakes: document.querySelector('.secret-word-mistakes')?.textContent,
    solvedOrLost: document.body.innerText.includes('A palavra era:') || document.body.innerText.includes('Correto!'),
  })`);
  assert(
    /Erros: \d\/5/.test(fullAlphabetState.mistakes ?? ""),
    `Secret word mistake counter unreadable after full alphabet: ${JSON.stringify(fullAlphabetState)}`,
  );
  assert(
    fullAlphabetState.solvedOrLost,
    `Secret word should be resolved (won or lost) after guessing the full alphabet: ${JSON.stringify(fullAlphabetState)}`,
  );
  const mistakesAfterFullAlphabet = fullAlphabetState.mistakes;

  // Every already-guessed key must now be disabled: clicking any of them again
  // (virtual) or dispatching a physical keydown for an already-guessed letter
  // must not change the mistake counter, proving repeats are never double-counted.
  await evaluate(`document.querySelectorAll('.secret-word-key')[0]?.click()`); // A, already guessed
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))`); // B, already guessed
  await delay(150);
  const mistakesAfterRepeats = await evaluate(`document.querySelector('.secret-word-mistakes')?.textContent`);
  assert(
    mistakesAfterRepeats === mistakesAfterFullAlphabet,
    `Repeated letter guesses (virtual + physical keydown) must not change the mistake counter: before="${mistakesAfterFullAlphabet}" after="${mistakesAfterRepeats}"`,
  );
  const allKeysDisabled = await evaluate(
    `[...document.querySelectorAll('.secret-word-key')].every((key) => key.disabled)`,
  );
  assert(allKeysDisabled, "All secret word keys should be disabled once every letter has been guessed");

  // ---- Conectando: six words + six images with gesture lines ----
  await setViewport(1440, 900);
  await navigate("/jogos/conectando");
  await waitFor(() => hasText("0 de 6 pares conectados"), "matching pairs gesture board load");
  const matchingInitial = await evaluate(`(() => {
    const words = [...document.querySelectorAll('.matching-pairs-word')].map((button, index) => ({
      id: button.dataset.wordId,
      index,
      text: button.textContent.trim(),
    }));
    const targets = [...document.querySelectorAll('.matching-pairs-target')].map((button, index) => ({
      id: button.dataset.targetId,
      index,
      text: button.textContent.trim(),
    }));
    return {
      wordCount: words.length,
      targetCount: targets.length,
      uniqueWords: new Set(words.map((word) => word.id)).size,
      uniqueTargets: new Set(targets.map((target) => target.id)).size,
      oldOptions: document.querySelectorAll('.matching-pairs-option').length,
      sameRowMatches: words.filter((word, index) => targets[index]?.id === word.id).length,
      photoCount: document.querySelectorAll('.matching-pairs-target .visual-asset-photo').length,
      targetTextHidden: targets.every((target) => target.text === ""),
      words,
      targets,
    };
  })()`);
  assert(
    matchingInitial.wordCount === 6 &&
      matchingInitial.targetCount === 6 &&
      matchingInitial.uniqueWords === 6 &&
      matchingInitial.uniqueTargets === 6 &&
      matchingInitial.oldOptions === 0 &&
      matchingInitial.sameRowMatches === 0 &&
      matchingInitial.targetTextHidden,
    `Conectando board contract failed: ${JSON.stringify(matchingInitial)}`,
  );
  await waitFor(
    () =>
      evaluate(`([...document.querySelectorAll('.matching-pairs-target .visual-asset-photo')]
        .length === 6) && [...document.querySelectorAll('.matching-pairs-target .visual-asset-photo')]
        .every((img) => img.naturalWidth > 0)`),
    "Conectando photos finish loading",
  );
  const matchingDeterministic = await evaluate(`(async () => {
    const { getBodyEntries, toMatchingPairChallenge } = await import('/src/games/adapters/bodyVocabularyAdapter.ts');
    const { ROUND_SIZES } = await import('/src/games/core/roundConfig.ts');
    const { selectChallenges } = await import('/src/games/core/selectChallenges.ts');
    const { shuffleWithSeed } = await import('/src/games/core/shuffle.ts');
    const build = (seed) => selectChallenges(getBodyEntries(), ROUND_SIZES.matching_pairs.count, seed).map(toMatchingPairChallenge);
    const selectedA = build(2026);
    const selectedB = build(2026);
    const wordsA = shuffleWithSeed(selectedA, 2026 + 101).map((item) => item.id);
    const wordsB = shuffleWithSeed(selectedB, 2026 + 101).map((item) => item.id);
    const imagesA = shuffleWithSeed(selectedA, 2026 + 503).map((item) => item.id);
    const imagesB = shuffleWithSeed(selectedB, 2026 + 503).map((item) => item.id);
    return {
      selectedSame: selectedA.map((item) => item.id).join('|') === selectedB.map((item) => item.id).join('|'),
      wordsSame: wordsA.join('|') === wordsB.join('|'),
      imagesSame: imagesA.join('|') === imagesB.join('|'),
      independentColumns: wordsA.join('|') !== imagesA.join('|'),
    };
  })()`);
  assert(
    matchingDeterministic.selectedSame &&
      matchingDeterministic.wordsSame &&
      matchingDeterministic.imagesSame &&
      matchingDeterministic.independentColumns,
    `Conectando deterministic shuffle failed: ${JSON.stringify(matchingDeterministic)}`,
  );

  const matchingScreenshotInitial = await screenshot("matching-pairs-board-1440x900");
  screenshots.push(matchingScreenshotInitial);

  const dragMatchingPair = async (
    wordId,
    targetId,
    eventType = "pointerup",
    pointerType = "mouse",
    targetEdge = "center",
  ) => {
    const targetY = targetEdge === "top" ? "tr.top + 6" : "tr.top + tr.height / 2";
    const rects = await evaluate(`(() => {
      const word = document.querySelector('.matching-pairs-word[data-word-id="${wordId}"]');
      const target = document.querySelector('.matching-pairs-target[data-target-id="${targetId}"]');
      const initialWord = word.getBoundingClientRect();
      const initialTarget = target.getBoundingClientRect();
      const wordDocumentY = initialWord.top + scrollY + initialWord.height / 2;
      const targetDocumentY = initialTarget.top + scrollY + initialTarget.height / 2;
      window.scrollTo({ top: Math.max(0, (wordDocumentY + targetDocumentY) / 2 - innerHeight / 2) });
      const wr = word.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      return {
        from: { x: wr.left + wr.width / 2, y: wr.top + wr.height / 2 },
        to: { x: tr.left + tr.width / 2, y: ${targetY} },
      };
    })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rects.from.x, y: rects.from.y, pointerType }, sessionId);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: rects.from.x, y: rects.from.y, button: "left", clickCount: 1, pointerType }, sessionId);
    await delay(80);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rects.from.x + (rects.to.x - rects.from.x) * 0.45, y: rects.from.y + (rects.to.y - rects.from.y) * 0.45, pointerType }, sessionId);
    await delay(80);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rects.to.x, y: rects.to.y, pointerType }, sessionId);
    await delay(80);
    if (eventType === "pointercancel") {
      await evaluate(`(() => {
        document.dispatchEvent(new PointerEvent('pointercancel', {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'mouse',
          clientX: ${rects.to.x},
          clientY: ${rects.to.y},
        }));
      })()`);
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rects.to.x, y: rects.to.y, button: "left", clickCount: 1, pointerType }, sessionId);
      return;
    }
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rects.to.x, y: rects.to.y, button: "left", clickCount: 1, pointerType }, sessionId);
  };
  const cancelMatchingPairWithTouch = async (wordId, targetId) => {
    const rects = await evaluate(`(() => {
      const word = document.querySelector('.matching-pairs-word[data-word-id="${wordId}"]');
      const target = document.querySelector('.matching-pairs-target[data-target-id="${targetId}"]');
      word.scrollIntoView({ block: 'center', inline: 'center' });
      target.scrollIntoView({ block: 'center', inline: 'center' });
      const wr = word.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      return {
        from: { x: wr.left + wr.width / 2, y: wr.top + wr.height / 2 },
        to: { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 },
      };
    })()`);
    await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 }, sessionId);
    await delay(50);
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: rects.from.x, y: rects.from.y, id: 41, radiusX: 6, radiusY: 6 }],
    }, sessionId);
    await waitFor(
      () => evaluate(`document.querySelector('.matching-pairs-word[data-word-id="${wordId}"]')?.getAttribute('aria-pressed') === 'true'`),
      "Conectando touch pointerdown selects a word",
    );
    await delay(100);
    await send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: rects.to.x, y: rects.to.y, id: 41, radiusX: 6, radiusY: 6 }],
    }, sessionId);
    await send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    }, sessionId);
    await send("Emulation.setTouchEmulationEnabled", { enabled: false }, sessionId);
  };
  const tapMatchingPairWithTouch = async (wordId, targetId) => {
    const points = await evaluate(`(() => {
      const word = document.querySelector('.matching-pairs-word[data-word-id="${wordId}"]');
      const target = document.querySelector('.matching-pairs-target[data-target-id="${targetId}"]');
      const wr = word.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      return {
        word: { x: wr.left + wr.width / 2, y: wr.top + wr.height / 2 },
        target: { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 },
      };
    })()`);
    await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 }, sessionId);
    await delay(50);
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...points.word, id: 51, radiusX: 6, radiusY: 6 }],
    }, sessionId);
    await delay(80);
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }, sessionId);
    await waitFor(
      () =>
        evaluate(
          `document.querySelector('.matching-pairs-word[data-word-id="${wordId}"]')?.getAttribute('aria-pressed') === 'true'`,
        ),
      "Conectando touch tap selects a word",
    );
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...points.target, id: 52, radiusX: 6, radiusY: 6 }],
    }, sessionId);
    await delay(80);
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }, sessionId);
    await send("Emulation.setTouchEmulationEnabled", { enabled: false }, sessionId);
  };
  const clickMatchingPair = async (wordId, targetId) => {
    await evaluate(`document.querySelector('.matching-pairs-word[data-word-id="${wordId}"]')?.click()`);
    await evaluate(`document.querySelector('.matching-pairs-target[data-target-id="${targetId}"]')?.click()`);
  };
  const clickMatchingWordWithMouse = async (wordId) => {
    const point = await evaluate(`(() => {
      const word = document.querySelector('.matching-pairs-word[data-word-id="${wordId}"]');
      const rect = word.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point, pointerType: "mouse" }, sessionId);
    await send(
      "Input.dispatchMouseEvent",
      { type: "mousePressed", ...point, button: "left", clickCount: 1, pointerType: "mouse" },
      sessionId,
    );
    await send(
      "Input.dispatchMouseEvent",
      { type: "mouseReleased", ...point, button: "left", clickCount: 1, pointerType: "mouse" },
      sessionId,
    );
  };

  const touchPair = matchingInitial.words[0].id;
  await tapMatchingPairWithTouch(touchPair, touchPair);
  await waitFor(
    () => evaluate(`document.querySelectorAll('.matching-pairs-line.correct').length === 1`),
    "Conectando touch taps connect a pair",
  );

  await navigate("/jogos/conectando");
  await waitFor(() => hasText("0 de 6 pares conectados"), "matching pairs clean scoring board load");
  const scoringBoard = await evaluate(`({
    words: [...document.querySelectorAll('.matching-pairs-word')].map((button) => button.dataset.wordId),
    targets: [...document.querySelectorAll('.matching-pairs-target')].map((button) => button.dataset.targetId),
  })`);
  const pairs = scoringBoard.words;
  await clickMatchingWordWithMouse(pairs[0]);
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('.matching-pairs-word[data-word-id="${pairs[0]}"]')?.getAttribute('aria-pressed') === 'true'`,
      ),
    "Conectando physical mouse click selects a word",
  );
  await clickMatchingWordWithMouse(pairs[0]);
  await waitFor(
    () => evaluate(`document.querySelectorAll('.matching-pairs-word[aria-pressed="true"]').length === 0`),
    "Conectando second physical mouse click clears the selected word",
  );
  await cancelMatchingPairWithTouch(pairs[0], pairs[0]);
  await delay(100);
  assert(
    (await evaluate(`document.querySelectorAll('.matching-pairs-line.correct').length`)) === 0,
    "Conectando touch pointercancel should not persist a line",
  );
  assert(
    (await evaluate(`document.querySelectorAll('.matching-pairs-card .answer-feedback').length`)) === 0,
    "Conectando touch pointercancel should remain neutral",
  );
  assert(
    (await evaluate(`document.querySelectorAll('.matching-pairs-word[aria-pressed="true"]').length`)) === 0,
    "Conectando touch pointercancel should clear the selected word",
  );
  const wrongTarget = scoringBoard.targets.find((targetId) => targetId !== pairs[0]);
  await dragMatchingPair(pairs[0], wrongTarget);
  await waitFor(
    () =>
      evaluate(`document.querySelector('.matching-pairs-word[data-word-id="${pairs[0]}"]')?.dataset.firstAttempt === 'wrong'`),
    "Conectando records the first wrong attempt once",
  );
  const wrongCountAfterFirst = await evaluate(`document.querySelectorAll('.matching-pairs-line.correct').length`);
  assert(wrongCountAfterFirst === 0, "Conectando wrong attempt should retract instead of persisting a line");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.matching-pairs-line.wrong').length === 0`),
    "Conectando wrong line retracts before retry",
  );
  const wrongFeedbackState = await evaluate(`({
    wrongFeedback: document.querySelectorAll('.matching-pairs-card .answer-feedback.wrong').length,
    liveRegions: document.querySelectorAll('.matching-pairs-card [role="status"]').length,
  })`);
  assert(
    wrongFeedbackState.wrongFeedback === 1 && wrongFeedbackState.liveRegions === 1,
    `Conectando wrong feedback should remain explicit in one live region: ${JSON.stringify(wrongFeedbackState)}`,
  );
  await dragMatchingPair(pairs[0], pairs[0]);
  await delay(100);
  await waitFor(
    () => evaluate(`document.querySelectorAll('.matching-pairs-line.correct').length === 1`),
    "Conectando mouse retry keeps a correct line",
  );
  const firstAttemptAfterRetry = await evaluate(`document.querySelector('.matching-pairs-word[data-word-id="${pairs[0]}"]')?.dataset.firstAttempt`);
  assert(firstAttemptAfterRetry === "wrong", "Conectando retry must preserve the initial wrong outcome");
  screenshots.push(await screenshot("matching-pairs-after-line-1440x900"));

  await evaluate(`document.querySelector('.matching-pairs-word[data-word-id="${pairs[1]}"]').click()`);
  await waitFor(
    () => evaluate(`document.querySelector('.matching-pairs-word[aria-pressed="true"]')?.dataset.wordId === "${pairs[1]}"`),
    "Conectando click fallback selects a word",
  );
  assert(
    (await evaluate(`document.querySelectorAll('.matching-pairs-card .answer-feedback').length`)) === 0,
    "Conectando word selection should use neutral feedback",
  );
  await evaluate(`document.querySelector('.matching-pairs-target[data-target-id="${pairs[1]}"]').click()`);
  await waitFor(
    () => evaluate(`document.querySelectorAll('.matching-pairs-line.correct').length === 2`),
    "Conectando click fallback connects a pair",
  );

  await evaluate(`document.querySelector('.matching-pairs-word[data-word-id="${pairs[2]}"]').focus()`);
  await pressKey("Enter");
  await evaluate(`document.querySelector('.matching-pairs-target[data-target-id="${pairs[2]}"]').focus()`);
  await pressKey("Enter");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.matching-pairs-line.correct').length === 3`),
    "Conectando keyboard fallback connects a pair",
  );

  for (const id of pairs.slice(3)) {
    await clickMatchingPair(id, id);
  }
  await waitFor(() => hasText("6 de 6 pares conectados"), "Conectando completes all six pairs");
  const matchingOutcomes = await evaluate(`(() => {
    const words = [...document.querySelectorAll('.matching-pairs-word')].map((word) => word.dataset.firstAttempt);
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent.includes('Ver resultado'));
    return {
      connectedWords: document.querySelectorAll('.matching-pairs-word[data-connected="true"]').length,
      connectedTargets: document.querySelectorAll('.matching-pairs-target[data-connected="true"]').length,
      correctLines: document.querySelectorAll('.matching-pairs-line.correct').length,
      firstAttempts: words,
      resultEnabled: button ? !button.disabled : false,
    };
  })()`);
  assert(
    matchingOutcomes.connectedWords === 6 &&
      matchingOutcomes.connectedTargets === 6 &&
      matchingOutcomes.correctLines === 6 &&
      matchingOutcomes.firstAttempts.filter((item) => item === "wrong").length === 1 &&
      matchingOutcomes.firstAttempts.filter((item) => item === "correct").length === 5 &&
      matchingOutcomes.resultEnabled,
    `Conectando final board state failed: ${JSON.stringify(matchingOutcomes)}`,
  );
  await setViewport(390, 844);
  await assertNoOverflow("/jogos/conectando mobile completed board");
  screenshots.push(await screenshot("matching-pairs-mobile-390x844"));
  await setViewport(768, 1024);
  await delay(150);
  screenshots.push(await screenshot("matching-pairs-tablet-768x1024"));
  assert(
    (await evaluate(`document.querySelectorAll('.matching-pairs-line.correct').length`)) === 6,
    "Conectando lines should survive resize",
  );
  await setViewport(1366, 768);
  await clickText("Ver resultado");
  await waitFor(
    () => evaluate(`Boolean(document.querySelector('.game-result-page')) && document.body.innerText.includes('Conectando')`),
    "Conectando result screen",
  );
  const matchingResult = await evaluate(`(() => {
    const stats = [...document.querySelectorAll('.score-stats > div')].map((item) => ({
      label: item.querySelector('span')?.textContent.trim(),
      value: item.querySelector('strong')?.textContent.trim(),
    }));
    return Object.fromEntries(stats.map((item) => [item.label, item.value]));
  })()`);
  assert(
    matchingResult.Total === "6" && matchingResult.Acertos === "5",
    `Conectando must persist exactly one first outcome per word: ${JSON.stringify(matchingResult)}`,
  );
  await clickText("Jogar novamente");
  await waitFor(() => hasText("0 de 6 pares conectados"), "Conectando play again resets the board");
  const boundaryPair = await evaluate(
    `document.querySelectorAll('.matching-pairs-target')[1]?.dataset.targetId`,
  );
  assert(boundaryPair, "Conectando needs a non-first target for edge-drop coverage");
  await dragMatchingPair(boundaryPair, boundaryPair, "pointerup", "mouse", "top");
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('.matching-pairs-word[data-word-id="${boundaryPair}"]')?.dataset.connected === 'true'`,
      ),
    "Conectando correct drop near a target edge must not hit an adjacent target",
  );

  // ---- Par perfeito: card count, toggle-back on mismatch ----
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
  ]) {
    await setViewport(width, height);
    await navigate("/jogos/par-perfeito");
    await waitFor(() => hasText("de 6 pares encontrados"), `memory match load ${width}x${height}`);
    await assertNoOverflow(`/jogos/par-perfeito ${width}x${height}`);
    screenshots.push(await screenshot(`memory-match-board-${width}x${height}`));
  }
  await setViewport(1366, 768);
  await navigate("/jogos/par-perfeito");
  await waitFor(() => hasText("de 6 pares encontrados"), "memory match load");
  const memoryCardCount = await evaluate(`document.querySelectorAll('.memory-match-card').length`);
  assert(memoryCardCount === 12, `Memory match should render 12 cards, got ${memoryCardCount}`);
  const memoryCards = await evaluate(`[
    ...document.querySelectorAll('.memory-match-card')
  ].map((card) => ({
    cardId: card.dataset.cardId,
    kind: card.dataset.cardKind,
    pairId: card.dataset.pairId,
  }))`);
  const firstMemoryCard = memoryCards[0];
  const mismatchedMemoryCard = memoryCards.find(
    (card) => card.pairId !== firstMemoryCard.pairId,
  );
  await evaluate(`document.querySelector('.memory-match-card[data-card-id="${firstMemoryCard.cardId}"]')?.click()`);
  await waitFor(
    () =>
      evaluate(`(() => {
        const img = document.querySelector('.memory-match-card.is-flipped .visual-asset-photo');
        return !img || img.naturalWidth > 0;
      })()`),
    "Par perfeito flipped card photo finishes loading (or the flipped card is the word side)",
  );
  const memoryPhotoOnFlippedCard = await evaluate(`(() => {
    const img = document.querySelector('.memory-match-card.is-flipped .visual-asset-photo');
    return img ? { tag: img.tagName, naturalWidth: img.naturalWidth } : "no-image-card-flipped";
  })()`);
  assert(
    memoryPhotoOnFlippedCard === "no-image-card-flipped" ||
      (memoryPhotoOnFlippedCard.tag === "IMG" && memoryPhotoOnFlippedCard.naturalWidth > 0),
    `Par perfeito image card should render a loaded photographic asset when flipped, got: ${JSON.stringify(memoryPhotoOnFlippedCard)}`,
  );
  await evaluate(`document.querySelector('.memory-match-card[data-card-id="${mismatchedMemoryCard.cardId}"]')?.click()`);
  await waitFor(
    () =>
      evaluate(`[...document.querySelectorAll('button')].find((button) =>
        button.textContent.includes('Embaralhar novamente')
      )?.disabled === true`),
    "Par perfeito disables shuffle while checking two cards",
  );
  await waitFor(
    () => hasText("Essas cartas não formam um par."),
    "Par perfeito announces a mismatch",
  );
  const flippedAfterMismatchCheck = await evaluate(
    `document.querySelectorAll('.memory-match-card.is-flipped:not(.is-matched)').length`,
  );
  assert(flippedAfterMismatchCheck === 0, "Memory match should reset non-matching flipped cards");
  await clickText("Embaralhar novamente");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.memory-match-card.is-flipped').length === 0`),
    "Par perfeito clean shuffle",
  );
  const memoryPairs = await evaluate(`(() => {
    const pairs = {};
    for (const card of document.querySelectorAll('.memory-match-card')) {
      (pairs[card.dataset.pairId] ??= []).push(card.dataset.cardId);
    }
    return Object.values(pairs);
  })()`);
  for (let pairIndex = 0; pairIndex < memoryPairs.length; pairIndex += 1) {
    const [firstCardId, secondCardId] = memoryPairs[pairIndex];
    await evaluate(`document.querySelector('.memory-match-card[data-card-id="${firstCardId}"]')?.click()`);
    await evaluate(`document.querySelector('.memory-match-card[data-card-id="${secondCardId}"]')?.click()`);
    if (pairIndex === memoryPairs.length - 1) {
      await waitFor(
        () => evaluate(`Boolean(document.querySelector('.game-result-page'))`),
        "Par perfeito completes after matching pair 6",
      );
    } else {
      await waitFor(
        () => evaluate(`document.querySelectorAll('.memory-match-card.is-matched').length === ${(pairIndex + 1) * 2}`),
        `Par perfeito matches pair ${pairIndex + 1}`,
      );
    }
  }
  await waitFor(() => hasText("RODADA CONCLUÍDA"), "memory match result screen");
  const memoryResult = await evaluate(`(() => {
    const stats = [...document.querySelectorAll('.score-stats > div')].map((item) => ({
      label: item.querySelector('span')?.textContent.trim(),
      value: item.querySelector('strong')?.textContent.trim(),
    }));
    return Object.fromEntries(stats.map((item) => [item.label, item.value]));
  })()`);
  assert(
    memoryResult.Total === "6",
    `Par perfeito should persist exactly one first outcome per pair: ${JSON.stringify(memoryResult)}`,
  );

  // ---- Cada coisa no seu lugar: three reviewed groups of four word-to-image slots ----
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
  ]) {
    await setViewport(width, height);
    await navigate("/jogos/cada-coisa-no-seu-lugar");
    await waitFor(
      () => evaluate(`document.querySelectorAll('.sorting-target .visual-asset-photo').length === 4`),
      `sorting station visual load ${width}x${height}`,
    );
    await assertNoOverflow(`/jogos/cada-coisa-no-seu-lugar ${width}x${height}`);
    screenshots.push(await screenshot(`sorting-station-board-${width}x${height}`));
  }
  await setViewport(1366, 768);
  await navigate("/jogos/cada-coisa-no-seu-lugar");
  await waitFor(() => hasText("Grupo 1 de 3"), "sorting station load");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.sorting-target .visual-asset-photo').length === 4 &&
      [...document.querySelectorAll('.sorting-target .visual-asset-photo')].every((img) => img.naturalWidth > 0)`),
    "Cada coisa no seu lugar group photos finish loading",
  );
  const sortingInitial = await evaluate(`(() => {
    const words = [...document.querySelectorAll('.sorting-word-card')].map((item) => item.dataset.wordId);
    const checkButton = [...document.querySelectorAll('button')].find((button) =>
      button.textContent.includes('Conferir respostas')
    );
    return {
      wordCount: words.length,
      uniqueWords: new Set(words).size,
      targetCount: document.querySelectorAll('.sorting-target').length,
      slotCount: document.querySelectorAll('.sorting-slot').length,
      targetChoiceCount: document.querySelectorAll('button.sorting-target-choice').length,
      interactiveSlots: document.querySelectorAll('.sorting-slot[role], .sorting-slot[tabindex]').length,
      checkDisabled: checkButton?.disabled ?? null,
      hasOldGroups: document.querySelectorAll('.sorting-station-group').length,
    };
  })()`);
  assert(
    sortingInitial.wordCount === 4 &&
      sortingInitial.uniqueWords === 4 &&
      sortingInitial.targetCount === 4 &&
      sortingInitial.slotCount === 4 &&
      sortingInitial.targetChoiceCount === 4 &&
      sortingInitial.interactiveSlots === 0 &&
      sortingInitial.checkDisabled === true &&
      sortingInitial.hasOldGroups === 0,
    `Sorting station initial panel contract failed: ${JSON.stringify(sortingInitial)}`,
  );

  const dragWordToSlot = async (wordSelector, slotIndex, mode = "mouse") => {
    const rects = await evaluate(`(() => {
      const word = document.querySelector(${JSON.stringify(wordSelector)});
      const slot = document.querySelectorAll('.sorting-slot')[${slotIndex}];
      word.scrollIntoView({ block: 'center', inline: 'center' });
      slot.scrollIntoView({ block: 'center', inline: 'center' });
      const wr = word.getBoundingClientRect();
      const sr = slot.getBoundingClientRect();
      return {
        wordId: word.dataset.wordId,
        from: { x: wr.left + wr.width / 2, y: wr.top + wr.height / 2 },
        to: { x: sr.left + sr.width / 2, y: sr.top + sr.height / 2 },
      };
    })()`);
    if (mode === "touch") {
      await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 }, sessionId);
      await send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: rects.from.x, y: rects.from.y }],
      }, sessionId);
      await delay(80);
      for (const ratio of [0.25, 0.5, 0.75, 1]) {
        await send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{
            x: rects.from.x + (rects.to.x - rects.from.x) * ratio,
            y: rects.from.y + (rects.to.y - rects.from.y) * ratio,
          }],
        }, sessionId);
        await delay(60);
      }
      await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }, sessionId);
      await send("Emulation.setTouchEmulationEnabled", { enabled: false }, sessionId);
      const stillInBank = await evaluate(`Boolean(document.querySelector('.sorting-word-bank .sorting-word-card[data-word-id="${rects.wordId}"]'))`);
      assert(!stillInBank, `Physical touch drag did not place sorting word ${rects.wordId}`);
      return;
    }
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rects.from.x, y: rects.from.y }, sessionId);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: rects.from.x, y: rects.from.y, button: "left", clickCount: 1 }, sessionId);
    await delay(60);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rects.to.x, y: rects.to.y }, sessionId);
    await delay(60);
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rects.to.x, y: rects.to.y, button: "left", clickCount: 1 }, sessionId);
  };
  const dragWordOutside = async (wordSelector) => {
    const rect = await evaluate(`(() => {
      const word = document.querySelector(${JSON.stringify(wordSelector)});
      const r = word.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y }, sessionId);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x, y: rect.y, button: "left", clickCount: 1 }, sessionId);
    await delay(60);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 24, y: 24 }, sessionId);
    await delay(60);
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 24, y: 24, button: "left", clickCount: 1 }, sessionId);
  };

  await dragWordOutside(".sorting-word-card");
  await delay(100);
  assert(
    (await evaluate(`document.querySelectorAll('.sorting-word-bank .sorting-word-card').length`)) === 4,
    "Dropping a word outside a target should return it to the bank",
  );

  await evaluate(`(() => {
    const word = document.querySelector('.sorting-word-bank .sorting-word-card');
    const target = document.querySelector('.sorting-slot');
    const wr = word.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    word.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerId: 73,
      pointerType: 'pen',
      clientX: wr.left + wr.width / 2,
      clientY: wr.top + wr.height / 2,
    }));
    setTimeout(() => document.dispatchEvent(new PointerEvent('pointercancel', {
      bubbles: true,
      cancelable: true,
      pointerId: 73,
      pointerType: 'pen',
      clientX: tr.left + tr.width / 2,
      clientY: tr.top + tr.height / 2,
    })), 80);
  })()`);
  await delay(180);
  assert(
    (await evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length`)) === 0,
    "Sorting pointercancel over a target must not assign the word",
  );

  await evaluate(`(() => {
    const word = document.querySelector('.sorting-word-bank .sorting-word-card');
    const target = document.querySelector('.sorting-slot');
    const wr = word.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    word.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerId: 81,
      pointerType: 'touch',
      isPrimary: true,
      clientX: wr.left + wr.width / 2,
      clientY: wr.top + wr.height / 2,
    }));
    setTimeout(() => document.dispatchEvent(new PointerEvent('pointercancel', {
      bubbles: true,
      cancelable: true,
      pointerId: 81,
      pointerType: 'touch',
      isPrimary: true,
      clientX: tr.left + tr.width / 2,
      clientY: tr.top + tr.height / 2,
    })), 80);
  })()`);
  await delay(180);
  assert(
    (await evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length`)) === 0,
    "Sorting touchcancel over a target must not assign the word",
  );

  await dragWordToSlot(".sorting-word-bank .sorting-word-card:nth-child(1)", 0);
  await waitFor(
    () => evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length === 1`),
    "first sorting word dropped into a slot",
  );
  await dragWordToSlot(".sorting-word-bank .sorting-word-card:nth-child(1)", 1);
  await waitFor(
    () => evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length === 2`),
    "second sorting word dropped into a slot",
  );
  const firstPlacedWordId = await evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card')[0].dataset.wordId`);
  await dragWordToSlot(`.sorting-slot .sorting-word-card[data-word-id="${firstPlacedWordId}"]`, 1);
  await waitFor(
    () => evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length === 2`),
    "sorting slot swap leaves both words placed",
  );
  const swappedState = await evaluate(`(() => {
    return [...document.querySelectorAll('.sorting-slot')].slice(0, 2).map((slot) =>
      slot.querySelector('.sorting-word-card')?.dataset.wordId
    );
  })()`);
  assert(
    swappedState[0] && swappedState[1] && swappedState[0] !== swappedState[1],
    `Sorting station slot swap failed: ${JSON.stringify(swappedState)}`,
  );
  for (let slotIndex = 2; slotIndex < 4; slotIndex += 1) {
    await dragWordToSlot(".sorting-word-bank .sorting-word-card:nth-child(1)", slotIndex);
  }
  await waitFor(
    () => evaluate(`([...document.querySelectorAll('.sorting-slot')].every((slot) => slot.querySelector('.sorting-word-card'))) &&
      ![...document.querySelectorAll('button')].find((button) => button.textContent.includes('Conferir respostas')).disabled`),
    "sorting check button enabled after all slots are filled",
  );
  await clickText("Conferir respostas");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.sorting-target-feedback').length === 4`),
    "sorting station reveals per-target feedback after checking",
  );
  const panelOneFeedback = await evaluate(`(() => ({
    correct: document.querySelectorAll('.sorting-target.correct').length,
    wrong: document.querySelectorAll('.sorting-target.wrong').length,
    correctWordsShown: [...document.querySelectorAll('.sorting-target-feedback.wrong')].every((item) =>
      item.textContent.includes('Correta:')
    ),
    hasNextGroup: document.body.innerText.includes('Próximo grupo')
  }))()`);
  assert(
    panelOneFeedback.correct + panelOneFeedback.wrong === 4 &&
      panelOneFeedback.wrong >= 1 &&
      panelOneFeedback.correctWordsShown &&
      panelOneFeedback.hasNextGroup,
    `Sorting station group 1 feedback failed: ${JSON.stringify(panelOneFeedback)}`,
  );
  await clickText("Próximo grupo");
  await waitFor(() => hasText("Grupo 2 de 3"), "sorting station second group load");
  await dragWordToSlot(".sorting-word-bank .sorting-word-card:nth-child(1)", 0, "touch");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length === 1`),
    "touch drag places a sorting word",
  );
  await evaluate(`(() => {
    const word = document.querySelector('.sorting-word-bank .sorting-word-card');
    const slot = document.querySelectorAll('.sorting-slot')[1];
    word.focus();
  })()`);
  await pressKey("Enter");
  await waitFor(
    () =>
      evaluate(
        `document.querySelector('.sorting-word-bank .sorting-word-card')?.getAttribute('aria-pressed') === 'true'`,
      ),
    "sorting keyboard fallback selects a word",
  );
  await evaluate(`(() => {
    const target = document.querySelectorAll('.sorting-target-choice')[1];
    target.focus();
  })()`);
  await pressKey("Enter");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length === 2`),
    "keyboard fallback places a sorting word",
  );
  for (let slotIndex = 2; slotIndex < 4; slotIndex += 1) {
    const placedBefore = await evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length`);
    await click(".sorting-word-bank .sorting-word-card");
    await waitFor(
      () => evaluate(`document.querySelector('.sorting-word-bank .sorting-word-card')?.getAttribute('aria-pressed') === 'true'`),
      `sorting click fallback selects word for slot ${slotIndex}`,
    );
    await evaluate(`document.querySelectorAll('.sorting-target-choice')[${slotIndex}].click()`);
    await waitFor(
      () => evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length === ${placedBefore + 1}`),
      `sorting click fallback places word in slot ${slotIndex}`,
    );
  }
  await waitFor(
    () => evaluate(`![...document.querySelectorAll('button')].find((button) => button.textContent.includes('Conferir respostas')).disabled`),
    "sorting group 2 check button enabled",
  );
  await clickText("Conferir respostas");
  await waitFor(() => hasText("Próximo grupo"), "sorting group 2 checked");
  await clickText("Próximo grupo");
  await waitFor(() => hasText("Grupo 3 de 3"), "sorting station third group load");
  for (let slotIndex = 0; slotIndex < 4; slotIndex += 1) {
    const placedBefore = await evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length`);
    await click(".sorting-word-bank .sorting-word-card");
    await evaluate(`document.querySelectorAll('.sorting-target-choice')[${slotIndex}].click()`);
    await waitFor(
      () => evaluate(`document.querySelectorAll('.sorting-slot .sorting-word-card').length === ${placedBefore + 1}`),
      `sorting group 3 click fallback places word in slot ${slotIndex}`,
    );
  }
  await clickText("Conferir respostas");
  await waitFor(() => hasText("Ver resultado"), "sorting group 3 checked");
  await clickText("Ver resultado");
  await waitFor(() => hasText("RODADA CONCLUÍDA"), "sorting station result screen");
  const sortingResult = await evaluate(`(() => {
    const text = document.body.innerText;
    return {
      hasTitle: text.includes('Cada coisa no seu lugar'),
      hasPlayAgain: text.includes('Jogar novamente'),
    };
  })()`);
  assert(
    sortingResult.hasTitle && sortingResult.hasPlayAgain,
    `Sorting station result screen failed: ${JSON.stringify(sortingResult)}`,
  );
  await clickText("Jogar novamente");
  await waitFor(() => hasText("Grupo 1 de 3"), "sorting station restart");
  // ---- Cruzando palavras: valid hidden-letter grid, physical and virtual keyboard ----
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
  ]) {
    await setViewport(width, height);
    await navigate("/jogos/cruzando-palavras");
    await waitFor(
      () => evaluate(`document.querySelectorAll('.crossword-cell.filled input').length > 0`),
      `crossword load ${width}x${height}`,
    );
    await assertNoOverflow(`/jogos/cruzando-palavras ${width}x${height}`);
    screenshots.push(await screenshot(`crossword-board-${width}x${height}`));
  }
  await setViewport(1366, 768);
  await navigate("/jogos/cruzando-palavras");
  await waitFor(
    () => evaluate(`document.querySelectorAll('.crossword-cell.filled input').length > 0`),
    "crossword functional load",
  );
  const crosswordState = await evaluate(`(() => {
    const inputs = [...document.querySelectorAll('.crossword-cell.filled input')];
    const clues = document.querySelectorAll('.crossword-clue').length;
    return {
      cells: inputs.length,
      clues,
      revealedLetters: inputs.filter((input) => input.value).length,
      gridCells: document.querySelectorAll('[role="gridcell"]').length,
      virtualKeys: document.querySelectorAll('.crossword-keyboard button').length,
    };
  })()`);
  assert(
    crosswordState.clues >= 2 &&
      crosswordState.clues <= 8 &&
      crosswordState.cells > 0 &&
      crosswordState.revealedLetters === 0 &&
      crosswordState.gridCells === crosswordState.cells &&
      crosswordState.virtualKeys === 27,
    `Crossword interactive contract failed: ${JSON.stringify(crosswordState)}`,
  );
  const crosswordFocused = await evaluate(`(() => {
    const input = document.querySelector('.crossword-cell.filled input');
    input?.focus();
    return document.activeElement === input;
  })()`);
  assert(crosswordFocused, "Crossword first cell should accept keyboard focus");
  await send(
    "Input.dispatchKeyEvent",
    { type: "keyDown", key: "A", code: "KeyA", text: "A", unmodifiedText: "A" },
    sessionId,
  );
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "A", code: "KeyA" }, sessionId);
  await waitFor(
    () => evaluate(`document.querySelector('.crossword-cell.filled input')?.value === "A"`),
    "Crossword physical keyboard should enter a letter in the focused cell",
  );
  const crosswordClueCount = crosswordState.clues;
  for (let clueIndex = 0; clueIndex < crosswordClueCount; clueIndex += 1) {
    await evaluate(`document.querySelectorAll('.crossword-clue-select')[${clueIndex}]?.click()`);
    const missingLetters = await evaluate(`(() => {
      const clue = document.querySelectorAll('.crossword-clue')[${clueIndex}];
      const clueId = clue.id;
      return [...document.querySelectorAll('.crossword-cell.filled input')]
        .filter((input) => input.getAttribute('aria-describedby')?.split(' ').includes(clueId) && !input.value)
        .length;
    })()`);
    for (let letterIndex = 0; letterIndex < missingLetters; letterIndex += 1) {
      await evaluate(`document.querySelector('.crossword-keyboard button[aria-label="Letra X"]')?.click()`);
    }
    await waitFor(
      () => evaluate(`!document.querySelectorAll('.crossword-check-word')[${clueIndex}]?.disabled`),
      `crossword clue ${clueIndex + 1} becomes checkable`,
    );
    await evaluate(`document.querySelectorAll('.crossword-check-word')[${clueIndex}]?.click()`);
    await waitFor(
      () => evaluate(`Boolean(document.querySelectorAll('.crossword-clue')[${clueIndex}]?.querySelector('.crossword-result'))`),
      `crossword clue ${clueIndex + 1} records an outcome`,
    );
  }
  await clickText("Ver resultado");
  await waitFor(() => hasText("RODADA CONCLUÍDA"), "crossword result screen");

  // ---- Ouvido afiado: all three modes, sound-disabled fallback and mixed persistence ----
  await evaluate(`localStorage.setItem('ingles-em-jogo-sound-enabled', 'false')`);
  await navigate("/jogos/ouvido-afiado");
  await waitFor(() => hasText("Desafio 1 de 10"), "listening ear load");
  await waitFor(
    () =>
      evaluate(`document.querySelector('.listening-ear-play')?.disabled === true &&
        document.body.innerText.includes('O som está desativado')`),
    "listening ear exposes text fallback when sound is disabled",
  );
  await evaluate(`(() => {
    localStorage.setItem('ingles-em-jogo-sound-enabled', 'true');
    window.dispatchEvent(new CustomEvent('ingles-em-jogo-sound-change'));
  })()`);
  const listeningModesSeen = new Set();
  for (let round = 1; round <= 10; round += 1) {
    await waitFor(() => hasText(`Desafio ${round} de 10`), `listening ear challenge ${round}`);
    const modeMarkers = await evaluate(`(() => {
      return {
        hasImageOptions: Boolean(document.querySelector('.listening-image-options')),
        hasTypeInput: Boolean(document.querySelector('.listening-type-word')),
        hasSentenceBank: Boolean(document.querySelector('.sentence-builder-bank')),
      };
    })()`);
    if (modeMarkers.hasImageOptions) {
      listeningModesSeen.add("select-image");
      await waitFor(
        () => evaluate(`document.querySelector('.listening-image-option .visual-asset-photo')?.naturalWidth > 0`),
        "Ouvido afiado select-image photo finishes loading",
      );
      const listeningPhoto = await evaluate(`(() => {
        const img = document.querySelector('.listening-image-option .visual-asset-photo');
        return img ? { tag: img.tagName, naturalWidth: img.naturalWidth } : null;
      })()`);
      assert(
        listeningPhoto?.tag === "IMG" && listeningPhoto.naturalWidth > 0,
        `Ouvido afiado select-image mode should render a loaded photographic asset, got: ${JSON.stringify(listeningPhoto)}`,
      );
      await evaluate(`document.querySelectorAll('.listening-image-option')[0].click()`);
    } else if (modeMarkers.hasTypeInput) {
      listeningModesSeen.add("type-word");
      await evaluate(`(() => {
        const input = document.querySelector('.listening-type-word input');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'placeholder');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await clickText("Confirmar");
    } else if (modeMarkers.hasSentenceBank) {
      listeningModesSeen.add("assemble-sentence");
      const bankCount = await evaluate(`document.querySelectorAll('.sentence-builder-bank .sentence-token').length`);
      for (let i = 0; i < bankCount; i += 1) {
        await evaluate(`document.querySelectorAll('.sentence-builder-bank .sentence-token')[0]?.click()`);
      }
      await clickText("Confirmar frase");
    }
    await waitFor(
      () => evaluate(`Boolean(document.querySelector('.listening-ear-card .answer-feedback'))`),
      `listening ear feedback ${round}`,
    );
    const isLast = round === 10;
    await clickText(isLast ? "Ver resultado" : "Continuar");
  }
  const allowedListeningModes = new Set(["select-image", "type-word", "assemble-sentence"]);
  assert(
    listeningModesSeen.size === 3 &&
      [...listeningModesSeen].every((mode) => allowedListeningModes.has(mode)),
    `Listening ear should exercise all three confirmed modes, saw: ${[...listeningModesSeen]}`,
  );
  await waitFor(() => hasText("RODADA CONCLUÍDA"), "listening ear result screen");
  await waitFor(
    () =>
      evaluate(`(async () => {
        const { getGameSessions } = await import('/src/services/progress/localProgress.ts');
        const sessions = await getGameSessions();
        return sessions.some((session) =>
          session.gameId === 'listening_ear' &&
          session.contentDomains?.includes('grammar') &&
          session.contentDomains?.includes('vocabulary')
        );
      })()`),
    "listening ear persists both canonical content domains",
  );
  assert(
    (await evaluate(`document.querySelectorAll('[aria-label*="microfone"], [aria-label*="gravar"]').length`)) === 0,
    "Listening ear must not expose speech recognition or recording controls",
  );

  // ---- Contra o relógio: mixed mechanics, individual timers, timeout transition ----
  await navigate("/jogos/contra-o-relogio");
  await waitFor(() => hasText("Desafio 1 de 10"), "beat the clock load");
  const beatClockKindsSeen = new Set();
  let timeoutExercised = false;
  for (let round = 1; round <= 10; round += 1) {
    await waitFor(() => hasText(`Desafio ${round} de 10`), `beat the clock challenge ${round}`);
    const kindMarkers = await evaluate(`(() => {
      return {
        hasWordOptions: Boolean(document.querySelector('.beat-clock-card .answer-options')),
        hasTypingInput: Boolean(document.querySelector('.beat-clock-typing-input')),
        hasUnscramble: Boolean(document.querySelector('.beat-clock-card .sentence-builder-bank')),
        hasErrorHunt: Boolean(document.querySelector('.beat-clock-card .error-hunt-sentence')),
      };
    })()`);
    const timerText = await evaluate(`document.querySelector('.beat-clock-timer')?.getAttribute('aria-label') ?? ''`);
    const currentKind = kindMarkers.hasWordOptions
      ? "word_challenge"
      : kindMarkers.hasTypingInput
        ? "sentence_typing"
        : kindMarkers.hasUnscramble
          ? "sentence_builder"
          : "error_hunt";
    beatClockKindsSeen.add(currentKind);
    const expectedSeconds = {
      word_challenge: 10,
      sentence_typing: 20,
      sentence_builder: 10,
      error_hunt: 20,
    }[currentKind];
    const displayedSeconds = parseInt(timerText, 10);
    assert(
      displayedSeconds <= expectedSeconds && displayedSeconds >= expectedSeconds - 1,
      `Beat the clock ${currentKind} timer should start at ${expectedSeconds}s, got "${timerText}"`,
    );
    if (round === 1) {
      // Force-exercise the timeout path exactly once: let the first challenge's
      // timer run out without answering, proving the countdown really drives state.
      const initialSeconds = parseInt(timerText, 10);
      assert(!Number.isNaN(initialSeconds) && initialSeconds > 0, `Beat the clock timer label unreadable: "${timerText}"`);
      await waitFor(
        () => evaluate(`document.body.innerText.includes('Tempo esgotado!')`),
        "beat the clock timeout transition",
        Math.max(initialSeconds * 1000 + 3000, 12000),
      );
      timeoutExercised = true;
      await waitFor(
        () => hasText("Desafio 2 de 10"),
        "beat the clock timeout advances automatically after feedback",
        3000,
      );
      continue;
    }
    if (kindMarkers.hasWordOptions) {
      await evaluate(`document.querySelectorAll('.beat-clock-card .answer-options button')[0]?.click()`);
    } else if (kindMarkers.hasTypingInput) {
      await evaluate(`(() => {
        const input = document.querySelector('.beat-clock-typing-input');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'placeholder');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await clickText("Confirmar");
    } else if (kindMarkers.hasUnscramble) {
      const bankCount = await evaluate(`document.querySelectorAll('.beat-clock-card .sentence-builder-bank .sentence-token').length`);
      for (let i = 0; i < bankCount; i += 1) {
        await evaluate(`document.querySelectorAll('.beat-clock-card .sentence-builder-bank .sentence-token')[0]?.click()`);
      }
      await clickText("Confirmar frase");
    } else if (kindMarkers.hasErrorHunt) {
      await evaluate(`document.querySelectorAll('.beat-clock-card .error-hunt-token')[0]?.click()`);
    }
    await waitFor(
      () => evaluate(`Boolean(document.querySelector('.beat-clock-card .answer-feedback'))`),
      `beat the clock feedback ${round}`,
    );
    const isLast = round === 10;
    await clickText(isLast ? "Ver resultado" : "Próximo desafio");
  }
  assert(timeoutExercised, "Beat the clock timeout path was never exercised");
  assert(
    beatClockKindsSeen.size === 4,
    `Beat the clock should exercise all four challenge kinds, saw: ${[...beatClockKindsSeen]}`,
  );
  await waitFor(() => hasText("RODADA CONCLUÍDA"), "beat the clock result screen");
  assert(await hasText("Contra o relógio"), "Beat the clock result missing game title");
  await waitFor(
    () =>
      evaluate(`(async () => {
        const { getGameSessions } = await import('/src/services/progress/localProgress.ts');
        const sessions = await getGameSessions();
        return sessions.some((session) =>
          session.gameId === 'beat_the_clock' &&
          session.contentDomains?.includes('grammar') &&
          session.contentDomains?.includes('vocabulary')
        );
      })()`),
    "beat the clock persists both canonical content domains",
  );
  await clickText("Voltar à home");
  await waitFor(() => hasText("Jogue, aprenda e"), "return home after beat the clock result");

  // ---- Accessibility: interactive controls are real buttons with accessible names,
  // status is not color-only, and reduced-motion is respected across game routes. ----
  const accessibilityChecks = [];
  for (const [path, selector] of [
    ["/jogos/monte-a-frase", ".sentence-token"],
    ["/jogos/caca-ao-erro", ".error-hunt-token"],
    ["/jogos/palavra-secreta", ".secret-word-key"],
    ["/jogos/conectando", ".matching-pairs-word"],
    ["/jogos/par-perfeito", ".memory-match-card"],
    ["/jogos/cada-coisa-no-seu-lugar", ".sorting-word-card"],
    ["/jogos/cruzando-palavras", ".crossword-cell.filled input"],
    ["/jogos/ouvido-afiado", ".listening-ear-play"],
  ]) {
    await navigate(path);
    await waitFor(
      () => evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length > 0`),
      `accessibility check elements present at ${path}`,
    );
    const check = await evaluate(`(() => {
      const elements = [...document.querySelectorAll(${JSON.stringify(selector)})];
      const nativeInteractive = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]);
      const nonButtonInteractive = elements.filter((el) => !nativeInteractive.has(el.tagName) && !el.getAttribute("role"));
      const withoutAccessibleName = elements.filter((el) => {
        const label = el.getAttribute("aria-label") || el.textContent.trim() || el.getAttribute("aria-labelledby");
        return !label;
      });
      return {
        total: elements.length,
        nonButtonInteractive: nonButtonInteractive.length,
        withoutAccessibleName: withoutAccessibleName.length,
      };
    })()`);
    accessibilityChecks.push({ path, ...check });
  }
  for (const check of accessibilityChecks) {
    assert(check.total > 0, `Accessibility check found no interactive elements at ${check.path}`);
    assert(
      check.nonButtonInteractive === 0,
      `Accessibility: ${check.path} has interactive elements that are not <button> and have no role: ${JSON.stringify(check)}`,
    );
    assert(
      check.withoutAccessibleName === 0,
      `Accessibility: ${check.path} has interactive elements without an accessible name: ${JSON.stringify(check)}`,
    );
  }

  // Status must not be communicated by color alone: correct/wrong feedback carries an icon plus text.
  await navigate("/jogos/caca-ao-erro");
  await waitFor(() => hasText("Desafio 1 de 10"), "error hunt reload for feedback a11y check");
  await evaluate(`document.querySelectorAll('.error-hunt-token')[0]?.click()`);
  await waitFor(
    () => evaluate(`Boolean(document.querySelector('.answer-feedback svg'))`),
    "error hunt feedback renders a non-color icon",
  );
  const feedbackHasIconAndText = await evaluate(`(() => {
    const feedback = document.querySelector('.answer-feedback');
    const hasIcon = Boolean(feedback?.querySelector('svg'));
    const hasText = Boolean(feedback?.querySelector('strong')?.textContent.trim());
    return { hasIcon, hasText };
  })()`);
  assert(
    feedbackHasIconAndText.hasIcon && feedbackHasIconAndText.hasText,
    `Error hunt feedback must combine an icon and text, not rely on color alone: ${JSON.stringify(feedbackHasIconAndText)}`,
  );

  // Focus must be visible and move to a study/results actionable element after key transitions.
  await navigate("/jogos/palavra-secreta");
  await waitFor(() => hasText("Palavra 1 de 5"), "secret word reload for focus check");
  const focusableCount = await evaluate(
    `document.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), input').length`,
  );
  assert(focusableCount > 0, "Secret word screen has no focusable elements");

  // reduced-motion media query must not throw or break layout (already forced by the CI environment).
  await assertNoOverflow("/jogos/palavra-secreta (reduced motion)");

  // ---- Idempotent game XP: repeated persistence of the same session must not duplicate XP ----
  const gameXpIdempotency = await evaluate(`(async () => {
    const e = await import('/src/services/progress/engagement.ts');
    await e.resetAllLocalData();
    await e.recordGameRoundEngagement('idempotency-test', 'vocabulary', 45, 8);
    const first = await e.getEngagementSnapshot();
    await e.recordGameRoundEngagement('idempotency-test', 'vocabulary', 45, 8);
    const second = await e.getEngagementSnapshot();
    return {
      firstXp: first.state.totalXp,
      secondXp: second.state.totalXp,
      sameXp: first.state.totalXp === second.state.totalXp,
      challenges: second.state.dailyMission.gameValidChallengesResolved,
      vocabularyDone: second.state.dailyMission.gameVocabularyCompleted,
    };
  })()`);
  assert(
    gameXpIdempotency.firstXp === 45 &&
      gameXpIdempotency.sameXp &&
      gameXpIdempotency.challenges === 8 &&
      gameXpIdempotency.vocabularyDone,
    `Game XP idempotency failed: ${JSON.stringify(gameXpIdempotency)}`,
  );

  const gameRoundXpFormula = await evaluate(`(async () => {
    const { calculateRoundXp } = await import('/src/games/core/roundConfig.ts');
    return {
      allCorrect10: calculateRoundXp(10, 10),
      noneCorrect10: calculateRoundXp(0, 10),
      partialCorrect5of10: calculateRoundXp(5, 10),
      emptyRound: calculateRoundXp(0, 0),
    };
  })()`);
  assert(
    gameRoundXpFormula.allCorrect10 === 60 &&
      gameRoundXpFormula.noneCorrect10 === 10 &&
      gameRoundXpFormula.partialCorrect5of10 === 35 &&
      gameRoundXpFormula.emptyRound === 0,
    `Game XP formula broken: ${JSON.stringify(gameRoundXpFormula)}`,
  );

  // ---- Full daily mission via games only (10 challenges + grammar game + vocabulary game) ----
  const missionViaGames = await evaluate(`(async () => {
    const e = await import('/src/services/progress/engagement.ts');
    await e.resetAllLocalData();
    await e.recordGameRoundEngagement('mission-grammar', 'grammar', 60, 10);
    const afterGrammar = await e.getEngagementSnapshot();
    await e.recordGameRoundEngagement('mission-vocab', 'vocabulary', 30, 6);
    const afterVocab = await e.getEngagementSnapshot();
    return {
      completedAfterGrammarOnly: afterGrammar.state.dailyMission.completed,
      completedAfterBoth: afterVocab.state.dailyMission.completed,
      bonusGranted: afterVocab.state.dailyMission.bonusGranted,
      totalXp: afterVocab.state.dailyMission.completed ? afterVocab.state.totalXp : null,
    };
  })()`);
  assert(
    !missionViaGames.completedAfterGrammarOnly &&
      missionViaGames.completedAfterBoth &&
      missionViaGames.bonusGranted,
    `Daily mission via games failed: ${JSON.stringify(missionViaGames)}`,
  );

  // ---- IndexedDB v3 migration: gameSessions store created, prior stores preserved ----
  const dbMigrationV3 = await evaluate(`(async () => {
    const { saveGameSession, getGameSessions, getProgressSnapshot } = await import('/src/services/progress/localProgress.ts');
    await saveGameSession({
      sessionId: 'db-v3-test',
      gameId: 'memory_match',
      contentDomain: 'vocabulary',
      totalChallenges: 6,
      correctCount: 6,
      xpEarned: 60,
      score: 6,
      completedAt: new Date().toISOString(),
    });
    const sessions = await getGameSessions();
    const progress = await getProgressSnapshot();
    return {
      gameSessionsCount: sessions.length,
      hasTestSession: sessions.some((s) => s.sessionId === 'db-v3-test'),
      questionsPreserved: Array.isArray(progress.questions),
      sessionsPreserved: Array.isArray(progress.sessions),
    };
  })()`);
  assert(
    dbMigrationV3.gameSessionsCount >= 1 &&
      dbMigrationV3.hasTestSession &&
      dbMigrationV3.questionsPreserved &&
      dbMigrationV3.sessionsPreserved,
    `IndexedDB v3 gameSessions store failed: ${JSON.stringify(dbMigrationV3)}`,
  );

  const resetClearsGameSessions = await evaluate(`(async () => {
    const { resetAllLocalData } = await import('/src/services/progress/engagement.ts');
    const { getGameSessions } = await import('/src/services/progress/localProgress.ts');
    await resetAllLocalData();
    const sessions = await getGameSessions();
    return sessions.length;
  })()`);
  assert(
    resetClearsGameSessions === 0,
    `Reset should clear gameSessions store, found ${resetClearsGameSessions} remaining`,
  );

  // ---- Streak: a qualified game round (>=5 valid interactions) counts as an active day ----
  const gameStreakDay = await evaluate(`(async () => {
    const e = await import('/src/services/progress/engagement.ts');
    await e.resetAllLocalData();
    const day = new Date(2026, 6, 10, 12);
    await e.recordGameRoundEngagement('streak-game-1', 'vocabulary', 40, 6, day);
    const snapshot = await e.getEngagementSnapshot();
    return { activeDates: snapshot.state.activeDates.length, streak: snapshot.state.currentStreak };
  })()`);
  assert(
    gameStreakDay.activeDates === 1 && gameStreakDay.streak === 1,
    `Game round should register an active streak day: ${JSON.stringify(gameStreakDay)}`,
  );
  const gameStreakBelowThreshold = await evaluate(`(async () => {
    const e = await import('/src/services/progress/engagement.ts');
    await e.resetAllLocalData();
    await e.recordGameRoundEngagement('streak-game-2', 'vocabulary', 15, 3);
    const snapshot = await e.getEngagementSnapshot();
    return snapshot.state.activeDates.length;
  })()`);
  assert(
    gameStreakBelowThreshold === 0,
    `A game round under 5 valid interactions must not register a streak day: ${gameStreakBelowThreshold}`,
  );

  await evaluate(`(async () => {
    const { resetAllLocalData } = await import('/src/services/progress/engagement.ts');
    await resetAllLocalData();
  })()`);

  // ---- Unknown route redirect ----
  await send("Page.navigate", { url: `${BASE_URL}/rota-que-nao-existe-12345` }, sessionId);
  await waitFor(
    () => evaluate(`document.readyState === "complete" && location.pathname === "/"`),
    "unknown route redirects to /",
  );
  await waitFor(() => hasText("Jogue, aprenda e"), "unknown route redirects home");

  // ---- Direct refresh on a game route preserves the shell without global nav ----
  await navigate("/jogos/par-perfeito");
  await send("Page.reload", {}, sessionId);
  await waitFor(
    () =>
      evaluate(
        `document.readyState === "complete" && location.pathname === "/jogos/par-perfeito"`,
      ),
    "game route survives direct refresh",
  );
  await waitFor(() => hasText("Par perfeito"), "game route content after refresh");
  const noGlobalNavOnGameRoute = await evaluate(`(() => {
    const sidebar = document.querySelector('.app-sidebar');
    const bottom = document.querySelector('.bottom-navigation');
    return !sidebar && !bottom;
  })()`);
  assert(noGlobalNavOnGameRoute, "Game routes must render as a focused flow without the global shell");
  await assertNoOverflow("/jogos/par-perfeito (post-refresh)");

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
  await stopOwnedServer();
  process.exit(0);
}

main().catch(async (error) => {
  console.error(error.stack ?? error.message);
  browser.kill();
  await stopOwnedServer();
  process.exit(1);
});
