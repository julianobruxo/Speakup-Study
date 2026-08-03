const ANIMATIONS_KEY = "ingles-em-jogo-animations";
export const ANIMATION_PREFERENCE_EVENT = "ingles-em-jogo-animation-change";

export function areAnimationsEnabled(): boolean {
  return localStorage.getItem(ANIMATIONS_KEY) !== "false";
}

export function setAnimationsEnabled(enabled: boolean) {
  localStorage.setItem(ANIMATIONS_KEY, String(enabled));
  document.documentElement.dataset.animations = enabled ? "on" : "off";
  window.dispatchEvent(new CustomEvent(ANIMATION_PREFERENCE_EVENT));
}
