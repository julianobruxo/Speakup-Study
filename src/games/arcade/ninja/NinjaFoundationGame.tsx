import { useCallback, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../../components/AppIcon";
import {
  SOUND_PREFERENCE_EVENT,
  isSoundEnabled,
  setSoundEnabled,
} from "../../../services/audio/sound";
import {
  ANIMATION_PREFERENCE_EVENT,
  areAnimationsEnabled,
} from "../../../services/preferences/animations";
import { GameShell } from "../../components/GameShell";
import type { PreparedArcadeRound } from "../bridge/arcadeBridge";
import { PhaserArcadeSurface } from "../bridge/PhaserArcadeSurface";
import { createNinjaFoundationScene } from "./ninjaFoundationScene";

const FOUNDATION_ROUND: PreparedArcadeRound = {
  id: "ninja-foundation-v1",
  gameId: "ninja",
  challenges: [],
};

export default function NinjaFoundationGame() {
  const navigate = useNavigate();
  const systemReducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [animationsEnabled, setAnimationPreference] = useState(areAnimationsEnabled);
  const round = useMemo(() => FOUNDATION_ROUND, []);
  const reducedMotion = Boolean(systemReducedMotion) || !animationsEnabled;
  const ignoreAnswer = useCallback(() => null, []);

  useEffect(() => {
    const syncSound = () => setSoundPreference(isSoundEnabled());
    const syncAnimations = () => setAnimationPreference(areAnimationsEnabled());
    window.addEventListener(SOUND_PREFERENCE_EVENT, syncSound);
    window.addEventListener(ANIMATION_PREFERENCE_EVENT, syncAnimations);
    return () => {
      window.removeEventListener(SOUND_PREFERENCE_EVENT, syncSound);
      window.removeEventListener(ANIMATION_PREFERENCE_EVENT, syncAnimations);
    };
  }, []);

  return (
    <GameShell
      action={(
        <button
          aria-label={soundEnabled ? "Desativar som" : "Ativar som"}
          aria-pressed={soundEnabled}
          className="icon-button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Desativar som" : "Ativar som"}
          type="button"
        >
          <AppIcon name={soundEnabled ? "volume" : "volume-off"} size={19} />
        </button>
      )}
      onBack={() => navigate("/jogos")}
      title="Ninja"
    >
      <div className="ninja-foundation-game">
        <div className="ninja-foundation-toolbar">
          <span>Treino</span>
          <button
            aria-label={paused ? "Retomar jogo" : "Pausar jogo"}
            aria-pressed={paused}
            className="icon-button ninja-pause-button"
            onClick={() => setPaused((current) => !current)}
            title={paused ? "Retomar jogo" : "Pausar jogo"}
            type="button"
          >
            <AppIcon name={paused ? "play" : "pause"} size={18} />
          </button>
        </div>

        <PhaserArcadeSurface
          ariaLabel="Cenário do jogo Ninja com personagem em corrida automática."
          className="ninja-foundation-canvas"
          onAnswer={ignoreAnswer}
          paused={paused}
          reducedMotion={reducedMotion}
          round={round}
          sceneFactory={createNinjaFoundationScene}
          soundEnabled={soundEnabled}
        />

        <p aria-live="polite" className="ninja-foundation-status" role="status">
          {paused
            ? "Jogo pausado."
            : reducedMotion
              ? "Cena estática com movimento reduzido."
              : "Corrida em andamento."}
        </p>
      </div>
    </GameShell>
  );
}
