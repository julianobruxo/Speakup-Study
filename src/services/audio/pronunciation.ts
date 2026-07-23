import { isSoundEnabled } from "./sound";

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function isPronunciationAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.speechSynthesis?.speak === "function" &&
    typeof window.SpeechSynthesisUtterance === "function"
  );
}

export function cancelPronunciation() {
  if (!activeUtterance || !isPronunciationAvailable()) return;
  window.speechSynthesis.cancel();
  activeUtterance = null;
}

export function speakEnglish(term: string): boolean {
  if (!isSoundEnabled() || !isPronunciationAvailable()) return false;

  cancelPronunciation();
  const utterance = new SpeechSynthesisUtterance(term);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  utterance.onend = () => {
    if (activeUtterance === utterance) activeUtterance = null;
  };
  utterance.onerror = utterance.onend;
  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}
