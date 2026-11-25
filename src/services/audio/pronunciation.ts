import { isSoundEnabled } from "./sound";

let activeRequestId = 0;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListenerBound = false;

export type VerbAudioForm = "base" | "past" | "part";

function ensureVoicesListener() {
  if (
    voicesListenerBound ||
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }
  voicesListenerBound = true;
  const refresh = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      cachedVoices = [];
    }
  };
  refresh();
  window.speechSynthesis.addEventListener?.("voiceschanged", refresh);
}

export function pickUsEnglishVoice(
  voices: readonly SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const usVoices = voices.filter((v) =>
    v.lang.toLowerCase().replace("_", "-").startsWith("en-us"),
  );
  const preferred = usVoices.find((v) =>
    /google us english|samantha|aria|jenny|guy|natural/i.test(v.name),
  );
  if (preferred) return preferred;
  if (usVoices.length) return usVoices[0];
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ?? null
  );
}

export function resolveSpokenText(
  text: string,
  form?: VerbAudioForm,
): string {
  const cleaned = text.trim().replace(/[’‘]/g, "'").replace(/\s+/g, " ");
  const lower = cleaned.toLowerCase();
  if (lower === "read" && form) {
    return form === "base" ? "reed" : "red";
  }
  if (lower === "lead" && form === "base") {
    return "leed";
  }
  return cleaned.replaceAll("/", " or ");
}

export function isPronunciationAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function"
  );
}

export function cancelPronunciation() {
  activeRequestId += 1;
  activeUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore browser speechSynthesis cancellation errors.
    }
  }
}

export function speakEnglish(
  term: string,
  options?: { rate?: number; form?: VerbAudioForm },
): boolean {
  if (!isSoundEnabled()) return false;
  if (!isPronunciationAvailable()) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("study-audio-error", {
          detail: "Seu navegador não oferece suporte à pronúncia em voz alta.",
        }),
      );
    }
    return false;
  }

  const spoken = resolveSpokenText(term, options?.form);
  if (!spoken) return false;

  ensureVoicesListener();
  cancelPronunciation();

  const requestId = activeRequestId;
  const utterance = new window.SpeechSynthesisUtterance(spoken);
  utterance.lang = "en-US";
  utterance.rate = options?.rate ?? 0.95;

  const voices =
    cachedVoices.length > 0
      ? cachedVoices
      : (() => {
          try {
            return window.speechSynthesis.getVoices();
          } catch {
            return [];
          }
        })();
  const voice = pickUsEnglishVoice(voices);
  if (voice) utterance.voice = voice;

  activeUtterance = utterance;

  const clearIfCurrent = () => {
    if (activeRequestId === requestId && activeUtterance === utterance) {
      activeUtterance = null;
    }
  };

  utterance.onstart = () => {
    if (activeRequestId !== requestId) return;
    window.dispatchEvent(new CustomEvent("study-audio-start"));
  };

  utterance.onend = () => {
    clearIfCurrent();
  };

  utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
    clearIfCurrent();
    if (activeRequestId !== requestId) return;
    const code = event?.error;
    if (code === "canceled" || code === "interrupted") return;
    window.dispatchEvent(
      new CustomEvent("study-audio-error", {
        detail:
          "Não foi possível reproduzir a pronúncia. Toque novamente para tentar.",
      }),
    );
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    clearIfCurrent();
    window.dispatchEvent(
      new CustomEvent("study-audio-error", {
        detail: "Toque no botão de áudio para iniciar a reprodução.",
      }),
    );
    return false;
  }
}
