const SOUND_KEY = "ingles-em-jogo-sound-enabled";
const LEGACY_SOUND_KEY = "speakup-sound-enabled";
export const SOUND_PREFERENCE_EVENT = "ingles-em-jogo-sound-change";

export type SoundKind = "select" | "correct" | "wrong" | "complete";

export function isSoundEnabled(): boolean {
  const current = localStorage.getItem(SOUND_KEY);
  if (current !== null) return current !== "false";
  const legacy = localStorage.getItem(LEGACY_SOUND_KEY);
  if (legacy !== null) {
    localStorage.setItem(SOUND_KEY, legacy);
    return legacy !== "false";
  }
  return true;
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent(SOUND_PREFERENCE_EVENT));
}

export function playSound(kind: SoundKind) {
  if (!isSoundEnabled()) return;
  const AudioContextClass =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const notes: Record<SoundKind, number[]> = {
    select: [420],
    correct: [520, 660],
    wrong: [240, 190],
    complete: [440, 554, 659],
  };

  notes[kind].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + index * 0.08;
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.14);
  });

  window.setTimeout(() => void context.close(), 600);
}
