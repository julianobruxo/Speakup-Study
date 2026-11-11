import { isSoundEnabled } from "./sound";
import audioManifest from "./audioManifest.json";

let activeAudio: HTMLAudioElement | null = null;
const manifest: Record<string, string> = audioManifest;
const normalize = (text: string) => text.toLowerCase().trim().replace(/[’‘]/g, "'").replace(/\s+/g, " ");

export function isPronunciationAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.Audio === "function";
}

export function cancelPronunciation() {
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.removeAttribute("src");
  activeAudio = null;
}

export function speakEnglish(term: string): boolean {
  const filename = manifest[normalize(term)];
  if (!filename || !isSoundEnabled() || !isPronunciationAvailable()) return false;
  cancelPronunciation();
  const audio = new Audio(`/audio/${filename}`);
  activeAudio = audio;
  const clear = () => { if (activeAudio === audio) activeAudio = null; };
  audio.onplaying = () => window.dispatchEvent(new CustomEvent("study-audio-start"));
  audio.onended = clear;
  audio.onerror = () => {
    clear();
    window.dispatchEvent(new CustomEvent("study-audio-error", { detail: "Não foi possível carregar o áudio. Confira a conexão e toque em ouvir novamente." }));
  };
  void audio.play().catch(() => {
    clear();
    window.dispatchEvent(new CustomEvent("study-audio-error", { detail: "Toque no botão de áudio para iniciar a reprodução." }));
  });
  return true;
}
