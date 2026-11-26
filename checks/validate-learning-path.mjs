import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const element = {
  addEventListener() {},
  classList: { add() {}, remove() {}, toggle() {} },
  focus() {},
  innerHTML: "",
  textContent: "",
  value: "",
};
const context = vm.createContext({
  Audio: class {},
  CustomEvent: class {},
  ResizeObserver: class { observe() {} },
  URLSearchParams,
  clearTimeout,
  console,
  document: {
    addEventListener() {},
    documentElement: { classList: { add() {} } },
    querySelector() { return element; },
  },
  localStorage: { getItem() { return null; }, setItem() {} },
  location: { origin: "http://localhost", search: "" },
  parent: { postMessage() {} },
  queueMicrotask,
  setTimeout,
  window: {
    addEventListener() {},
    dispatchEvent() {},
    scrollTo() {},
    setTimeout,
  },
});

for (const path of ["public/past/verbs.js", "public/past/content.js", "public/past/app.js"]) {
  vm.runInContext(read(path), context, { filename: path });
}

const timeQuiz = vm.runInContext("TIME_QUIZ", context);
assert(timeQuiz.length === 10, "Expected 10 time-expression questions");
for (const question of timeQuiz) {
  assert(
    question.answers.every((answer) => answer.trim().includes(" ")),
    `Time-expression answers must be complete terms, not fragments: ${question.id}`,
  );
}

const verbs = vm.runInContext("VERBS", context);
const audioFiles = new Set(readdirSync(new URL("../public/audio/", import.meta.url)));
for (const verb of verbs) {
  for (const form of ["base", "past", "part"]) {
    assert(
      audioFiles.has(`verb-${verb.base}-${form}.mp3`),
      `Missing prerecorded TTS audio for ${verb.base} (${form})`,
    );
  }
}

const sentenceCases = [
  ["He lied to me yesterday.", "good"],
  ["I was paid yesterday.", "good"],
  ["She was taught English at school.", "good"],
  ["I slept.", "good"],
  ["I did my homework yesterday.", "good"],
  ["I went to home yesterday.", "bad"],
  ["She gave I a book yesterday.", "bad"],
  ["She wrote letter yesterday.", "bad"],
  ["I went to school with she yesterday.", "bad"],
  ["I went to the yesterday.", "bad"],
  ["I was goed yesterday.", "bad"],
  ["I was writed yesterday.", "bad"],
  ["I was slept yesterday.", "bad"],
  ["I wasn't slept yesterday.", "bad", "I didn't sleep yesterday."],
  ["I was not slept yesterday.", "bad", "I didn't sleep yesterday."],
];
for (const [sentence, expected, expectedCorrection] of sentenceCases) {
  context.sentence = sentence;
  const result = vm.runInContext("analyzeSentence(sentence)", context);
  assert(
    result.status === expected,
    `${sentence} expected ${expected}, received ${result.status}: ${result.messages.join(" | ")}`,
  );
  if (expectedCorrection) {
    assert(
      result.correction === expectedCorrection,
      `${sentence} expected correction ${expectedCorrection}, received ${result.correction}`,
    );
  }
}

const appSource = read("src/App.tsx");
assert(!/^\s*<Route path="\/jogos/m.test(appSource), "Game routes must remain disabled");
const shellSource = read("src/components/AppShell.tsx");
assert(!/^\s*\{ id: "games"/m.test(shellSource), "Games must not appear in global navigation");

const courseSource = ts.transpileModule(
  read("src/content/data/grammarCourses.ts"),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText
  .replace(/export\s*\{[^}]+\};?/g, "")
  .replace(/\bexport\s+/g, "");
const courseContext = vm.createContext({});
vm.runInContext(courseSource, courseContext, {
  filename: "src/content/data/grammarCourses.ts",
});
const courses = vm.runInContext("GRAMMAR_COURSES", courseContext);
const requiredCourses = [
  "simple_present",
  "present_continuous",
  "be_going_to",
  "there_tobe",
];
const seenQuestionIds = new Set();
for (const courseId of requiredCourses) {
  const course = courses[courseId];
  assert(course, `Missing grammar course: ${courseId}`);
  assert(course.studySections.length >= 4, `${courseId} needs at least four explanation sections`);
  assert(course.questions.length >= 20, `${courseId} needs at least 20 questions`);
  assert(
    course.questions.filter((question) => question.kind === "input").length >= 3,
    `${courseId} needs written-production questions`,
  );
  assert(course.levels.length === 5, `${courseId} needs exactly five progressive levels`);
  for (const level of [1, 2, 3, 4, 5]) {
    assert(
      course.questions.filter((question) => question.level === level).length >= 4,
      `${courseId} level ${level} needs at least four questions`,
    );
  }
  assert(
    course.cambridgeUrl.startsWith("https://dictionary.cambridge.org/"),
    `${courseId} must link to Cambridge`,
  );
  for (const question of course.questions) {
    assert(!seenQuestionIds.has(question.id), `Duplicate grammar question id: ${question.id}`);
    seenQuestionIds.add(question.id);
    if (question.kind === "input") {
      assert(question.acceptedAnswers?.length, `${question.id} needs accepted written answers`);
      assert(question.acceptedAnswers.includes(question.answer), `${question.id} must accept its model answer`);
    } else {
      assert(new Set(question.options).size === 3, `${question.id} needs three distinct options`);
      assert(question.options.includes(question.answer), `${question.id} answer is not an option`);
    }
    assert(question.feedback.correct, `${question.id} needs correct-answer feedback`);
    assert(question.feedback.incorrect, `${question.id} needs error feedback`);
  }
}

const questionById = (id) => Object.values(courses)
  .flatMap((course) => course.questions)
  .find((question) => question.id === id);
const acceptedVariants = {
  "sp-5-4": "She lives in Brazil but this month she is staying in Canada",
  "pc-3-1": "She's not working today",
  "pc-5-4": "He usually drives but today he is taking the bus",
  "gt-4-2": "What's he going to cook?",
  "gt-5-3": "She's going to be a doctor",
  "tb-3-1": "There's not a bank on this street",
  "tb-5-1": "There's one sofa, but there are two chairs",
};
for (const [id, variant] of Object.entries(acceptedVariants)) {
  assert(
    questionById(id)?.acceptedAnswers?.includes(variant),
    `${id} must accept the valid variant: ${variant}`,
  );
}
assert(
  !questionById("tb-2-1")?.options.includes("some"),
  "tb-2-1 must not use the semantically ambiguous 'some orange' distractor",
);

const grammarPageSource = read("src/pages/GrammarTopicsPage.tsx");
assert(
  grammarPageSource.includes("GRAMMAR_COURSE_IDS"),
  "Grammar catalog must expose the completed courses",
);
const practiceLandingSource = read("src/pages/PracticeLandingPage.tsx");
assert(
  practiceLandingSource.includes("availabilityStatus === \"available\""),
  "Library must derive visibility from real availability",
);
assert(
  !practiceLandingSource.includes("ACTIVE_VOCABULARY_CATEGORIES.map"),
  "Library must not render every unfinished vocabulary category",
);
assert(
  appSource.includes('path="/gramatica/:topicId"'),
  "Completed grammar courses need a reachable route",
);
assert(
  appSource.includes("<LegacyTopicRedirect />"),
  "Legacy topic routes must preserve the requested topic",
);
const progressPageSource = read("src/pages/ProgressPage.tsx");
assert(
  !/XP dos jogos/i.test(progressPageSource),
  "Disabled games must not be mentioned in the progress UI",
);
assert(
  progressPageSource.includes("GRAMMAR_COURSE_PROGRESS_EVENT"),
  "New grammar course progress must be visible on the progress page",
);
const grammarCoursePageSource = read("src/pages/GrammarCoursePage.tsx");
assert(
  grammarCoursePageSource.includes("engagementWriteRef.current.then(async ()"),
  "Course completion must wait for queued answer engagement writes",
);
assert(
  grammarCoursePageSource.includes("engagementWriteRef.current = engagementWriteRef.current"),
  "Answer engagement writes must remain ordered within a course session",
);
const engagementSource = read("src/services/progress/engagement.ts");
assert(
  engagementSource.includes("mutationQueue = operation.then("),
  "All engagement mutations must be serialized across views and attempts",
);
assert(
  engagementSource.includes("summarizeGrammarCourseProgress().uniqueQuestions"),
  "Explorer progress must aggregate legacy and new grammar questions centrally",
);
assert(
  engagementSource.includes("achievement.progress = Math.max("),
  "Achievement progress must remain monotonic",
);

console.log(JSON.stringify({
  timeExpressionQuestions: timeQuiz.length,
  prerecordedVerbAudioFiles: verbs.length * 3,
  sentenceLabCases: sentenceCases.length,
  grammarCourses: requiredCourses.length,
  grammarCourseQuestions: requiredCourses.reduce(
    (total, courseId) => total + courses[courseId].questions.length,
    0,
  ),
  gamesExposed: false,
}, null, 2));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
