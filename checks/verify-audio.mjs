import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// 1. Verify React pronunciation service uses en-US speechSynthesis safely
const pronSource = readFileSync("src/services/audio/pronunciation.ts", "utf8");
assert(pronSource.includes("speechSynthesis"), "pronunciation.ts must use browser speechSynthesis");
assert(pronSource.includes('"en-US"'), "pronunciation.ts must target en-US");
assert(pronSource.includes("voiceschanged"), "pronunciation.ts must listen for voiceschanged");
assert(pronSource.includes("speechSynthesis.cancel()"), "pronunciation.ts must cancel prior utterances");
assert(pronSource.includes("activeRequestId"), "pronunciation.ts must guard against stale callbacks");

// Transpile and test pronunciation.ts behavior in an isolated VM
const transpiled = ts.transpileModule(pronSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const spokenUtterances = [];
const dispatchedEvents = [];
let cancelCount = 0;

class FakeUtterance {
  constructor(text) {
    this.text = text;
    this.lang = "";
    this.rate = 1;
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
}

const fakeWindow = {
  SpeechSynthesisUtterance: FakeUtterance,
  speechSynthesis: {
    getVoices: () => [
      { name: "British Voice", lang: "en-GB" },
      { name: "Google US English", lang: "en-US" },
    ],
    addEventListener() {},
    cancel() {
      cancelCount += 1;
    },
    speak(utterance) {
      spokenUtterances.push(utterance);
      utterance.onstart?.();
    },
  },
  dispatchEvent(event) {
    dispatchedEvents.push(event);
  },
};

const moduleObj = { exports: {} };
const pronCtx = vm.createContext({
  module: moduleObj,
  exports: moduleObj.exports,
  window: fakeWindow,
  CustomEvent: class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  },
  require: (id) => {
    if (id === "./sound") return { isSoundEnabled: () => true };
    throw new Error(`Unexpected import: ${id}`);
  },
});
vm.runInContext(transpiled, pronCtx, { filename: "src/services/audio/pronunciation.ts" });
const pron = moduleObj.exports;

assert.equal(pron.isPronunciationAvailable(), true);
assert.equal(pron.resolveSpokenText("read", "base"), "reed");
assert.equal(pron.resolveSpokenText("read", "past"), "red");
assert.equal(pron.resolveSpokenText("read", "part"), "red");
assert.equal(pron.resolveSpokenText("lead", "base"), "leed");
assert.equal(pron.resolveSpokenText("was/were"), "was or were");

assert.equal(pron.speakEnglish("Head"), true);
assert.equal(spokenUtterances.length, 1);
assert.equal(spokenUtterances[0].lang, "en-US");
assert.equal(spokenUtterances[0].voice?.name, "Google US English");

// Stale error callback from superseded utterance must be ignored
const firstUtterance = spokenUtterances[0];
assert.equal(pron.speakEnglish("Shoulder"), true);
assert(cancelCount >= 2, "Second speakEnglish must cancel the previous utterance");
const errorEventsBefore = dispatchedEvents.filter((e) => e.type === "study-audio-error").length;
firstUtterance.onerror?.({ error: "synthesis-failed" });
const errorEventsAfter = dispatchedEvents.filter((e) => e.type === "study-audio-error").length;
assert.equal(errorEventsAfter, errorEventsBefore, "Stale utterance errors must be ignored");

// 2. Verify Simple Past studio (public/past/app.js) speechSynthesis + homographs + MP3 fallback
const pastAppSource = readFileSync("public/past/app.js", "utf8");
assert(pastAppSource.includes("speechSynthesis"), "public/past/app.js must use speechSynthesis");
assert(pastAppSource.includes("'en-US'"), "public/past/app.js must target en-US");

const pastSpoken = [];
const pastEl = {
  addEventListener() {},
  classList: { add() {}, remove() {}, toggle() {} },
  focus() {},
  innerHTML: "",
  textContent: "",
  value: "",
};
const pastCtx = vm.createContext({
  Audio: class {},
  CustomEvent: class {},
  ResizeObserver: class { observe() {} },
  SpeechSynthesisUtterance: FakeUtterance,
  speechSynthesis: {
    getVoices: () => [{ name: "Google US English", lang: "en-US" }],
    addEventListener() {},
    cancel() {},
    speak(u) {
      pastSpoken.push({ text: u.text, lang: u.lang });
      u.onend?.();
    },
  },
  URLSearchParams,
  clearTimeout,
  console,
  document: {
    addEventListener() {},
    documentElement: { classList: { add() {} } },
    querySelector() { return pastEl; },
  },
  localStorage: { getItem() { return null; }, setItem() {} },
  location: { origin: "http://localhost", search: "" },
  parent: { postMessage() {} },
  queueMicrotask,
  setTimeout,
  window: { addEventListener() {}, dispatchEvent() {}, scrollTo() {}, setTimeout },
});
for (const p of ["public/past/verbs.js", "public/past/content.js", "public/past/app.js"]) {
  vm.runInContext(readFileSync(p, "utf8"), pastCtx, { filename: p });
}

const verbs = vm.runInContext("VERBS", pastCtx);
assert.equal(verbs.length, 104, "Expected 104 Simple Past verbs");
assert.equal(
  vm.runInContext("spokenVerbForm({base:'read',past:'read',part:'read'},'base')", pastCtx),
  "reed",
);
assert.equal(
  vm.runInContext("spokenVerbForm({base:'read',past:'read',part:'read'},'past')", pastCtx),
  "red",
);
assert.equal(
  vm.runInContext("spokenVerbForm({base:'read',past:'read',part:'read'},'part')", pastCtx),
  "red",
);
assert.equal(
  vm.runInContext("spokenVerbForm({base:'lead',past:'led',part:'led'},'base')", pastCtx),
  "leed",
);

// Verify fallback verb MP3s remain intact on disk
for (const v of verbs) {
  for (const type of ["base", "past", "part"]) {
    const p = `public/audio/verb-${v.base}-${type}.mp3`;
    assert(existsSync(p), p);
    assert(statSync(p).size > 1000, p);
  }
}

console.log(
  JSON.stringify(
    {
      speechEngine: "en-US speechSynthesis",
      staleCallbackGuarded: true,
      homographsVerified: ["read:base->reed", "read:past/part->red", "lead:base->leed"],
      fallbackVerbMp3Files: verbs.length * 3,
    },
    null,
    2,
  ),
);
