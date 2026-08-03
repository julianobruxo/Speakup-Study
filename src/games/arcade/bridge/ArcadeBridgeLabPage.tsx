import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { getBodyEntries } from "../../adapters/bodyVocabularyAdapter";
import { GameShell } from "../../components/GameShell";
import type { ChallengeOutcome } from "../../core/sessionEngine";
import {
  createArcadeAnswerGate,
  type PreparedArcadeRound,
} from "./arcadeBridge";
import { ArcadeDomFallback } from "./ArcadeDomFallback";
import { PhaserArcadeSurface } from "./PhaserArcadeSurface";

function createTechnicalRound(): PreparedArcadeRound {
  const entries = getBodyEntries().slice(0, 3);
  const correctEntry = entries[1];
  if (!correctEntry) {
    return { id: "bridge-technical-empty", gameId: "bridge_technical", challenges: [] };
  }
  return {
    id: "bridge-technical-body-v1",
    gameId: "bridge_technical",
    challenges: [{
      id: `bridge:${correctEntry.id}`,
      prompt: `Qual palavra significa "${correctEntry.translation}"?`,
      choices: entries.map((entry) => ({ id: entry.id, label: entry.term })),
      correctChoiceId: correctEntry.id,
    }],
  };
}

export default function ArcadeBridgeLabPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const systemReducedMotion = useReducedMotion();
  const round = useMemo(createTechnicalRound, []);
  const [outcome, setOutcome] = useState<ChallengeOutcome | null>(null);
  const [mode, setMode] = useState<"canvas" | "dom">(
    () => searchParams.get("mode") === "dom" ? "dom" : "canvas",
  );
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [animationsEnabled, setAnimationPreference] = useState(areAnimationsEnabled);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const reducedMotion =
    Boolean(systemReducedMotion) || !animationsEnabled || forceReducedMotion;

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

  function toggleSound() {
    setSoundEnabled(!soundEnabled);
  }

  const acceptFirstAnswer = useMemo(
    () => createArcadeAnswerGate(round, setOutcome),
    [round],
  );

  return (
    <GameShell
      action={(
        <button
          aria-label={soundEnabled ? "Desativar som" : "Ativar som"}
          aria-pressed={soundEnabled}
          className="icon-button"
          onClick={toggleSound}
          title={soundEnabled ? "Desativar som" : "Ativar som"}
          type="button"
        >
          <AppIcon name={soundEnabled ? "volume" : "volume-off"} size={19} />
        </button>
      )}
      onBack={() => navigate("/jogos")}
      title="Laboratório arcade"
    >
      <section className="arcade-bridge-lab">
        <div className="arcade-bridge-toolbar" aria-label="Controles da cena técnica">
          <div className="arcade-mode-switch" aria-label="Modo de renderização">
            <button
              aria-pressed={mode === "canvas"}
              onClick={() => setMode("canvas")}
              type="button"
            >
              Canvas
            </button>
            <button
              aria-pressed={mode === "dom"}
              onClick={() => setMode("dom")}
              type="button"
            >
              Simplificado
            </button>
          </div>
          <button
            aria-pressed={paused}
            className="secondary-button"
            disabled={mode === "dom"}
            onClick={() => setPaused((current) => !current)}
            type="button"
          >
            {paused ? "Retomar" : "Pausar"}
          </button>
          <button
            aria-pressed={reducedMotion}
            className="secondary-button"
            disabled={mode === "dom"}
            onClick={() => setForceReducedMotion((current) => !current)}
            type="button"
          >
            Movimento reduzido
          </button>
        </div>

        {mode === "canvas" ? (
          <PhaserArcadeSurface
            onAnswer={acceptFirstAnswer}
            paused={paused}
            reducedMotion={reducedMotion}
            round={round}
            soundEnabled={soundEnabled}
          />
        ) : (
          <ArcadeDomFallback
            answered={Boolean(outcome)}
            onAnswer={acceptFirstAnswer}
            round={round}
          />
        )}

        <div aria-live="polite" className="arcade-bridge-status" role="status">
          {outcome
            ? outcome.correct
              ? "Outcome recebido pelo React: correto."
              : "Outcome recebido pelo React: incorreto."
            : "Cena pronta para devolver uma escolha ao React."}
        </div>
      </section>
    </GameShell>
  );
}
