import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { GameShell } from "../../components/GameShell";
import type { ChallengeOutcome } from "../../core/sessionEngine";
import {
  createArcadeRoundAnswerGate,
  type ArcadeAnswer,
  type ArcadeSceneRuntimeState,
} from "../bridge/arcadeBridge";
import { PhaserArcadeSurface } from "../bridge/PhaserArcadeSurface";
import { createNinjaFoundationScene } from "./ninjaFoundationScene";
import { createNinjaFoundationRound } from "./ninjaRound";

export default function NinjaFoundationGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const systemReducedMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => {
    const requestedSeed = Number(searchParams.get("seed"));
    return Number.isFinite(requestedSeed) && requestedSeed > 0
      ? Math.trunc(requestedSeed)
      : Date.now();
  });
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [animationsEnabled, setAnimationPreference] = useState(areAnimationsEnabled);
  const [outcomes, setOutcomes] = useState<ChallengeOutcome[]>([]);
  const [displayChallengeIndex, setDisplayChallengeIndex] = useState(0);
  const displayChallengeIndexRef = useRef(0);
  const selectedChoiceIdRef = useRef("");
  const [liveMessage, setLiveMessage] = useState("Prepare-se para a primeira placa.");
  const round = useMemo(() => createNinjaFoundationRound(seed), [seed]);
  const reducedMotion = Boolean(systemReducedMotion) || !animationsEnabled;
  const handleAcceptedOutcome = useCallback((outcome: ChallengeOutcome) => {
    setOutcomes((current) => [...current, outcome]);
    const challenge = round.challenges.find((candidate) => candidate.id === outcome.challengeId);
    const correctLabel = challenge?.choices.find(
      (choice) => choice.id === challenge.correctChoiceId,
    )?.label;
    setLiveMessage(
      outcome.correct
        ? "Correto!"
        : `Resposta incorreta. A resposta era ${correctLabel}. ${challenge?.feedback ?? ""}`,
    );
  }, [round]);
  const answerGate = useMemo(
    () => createArcadeRoundAnswerGate(round, handleAcceptedOutcome),
    [handleAcceptedOutcome, round],
  );
  const submitAnswer = useCallback(
    (answer: ArcadeAnswer) => answerGate(answer),
    [answerGate],
  );
  const handleRuntimeState = useCallback((state: ArcadeSceneRuntimeState) => {
    const nextIndex = state.challengeIndex;
    if (nextIndex !== undefined && nextIndex !== displayChallengeIndexRef.current) {
      displayChallengeIndexRef.current = nextIndex;
      selectedChoiceIdRef.current = "";
      setDisplayChallengeIndex(nextIndex);
      setLiveMessage(
        nextIndex >= round.challenges.length
          ? "Progressão concluída."
          : "Escolha a próxima placa.",
      );
    }
    if (!state.selectedChoiceId || state.selectedChoiceId === selectedChoiceIdRef.current) return;
    selectedChoiceIdRef.current = state.selectedChoiceId;
    const challenge = round.challenges[nextIndex ?? displayChallengeIndexRef.current];
    const selected = challenge?.choices.find((choice) => choice.id === state.selectedChoiceId);
    if (selected) setLiveMessage(`Placa selecionada: ${selected.label}.`);
  }, [round.challenges]);

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

  const completed = outcomes.length === round.challenges.length &&
    displayChallengeIndex >= round.challenges.length;
  const currentChallenge = round.challenges[
    Math.min(displayChallengeIndex, round.challenges.length - 1)
  ];

  function restartProgression() {
    setSeed(Date.now());
    setOutcomes([]);
    displayChallengeIndexRef.current = 0;
    selectedChoiceIdRef.current = "";
    setDisplayChallengeIndex(0);
    setPaused(false);
    setLiveMessage("Nova progressão pronta.");
  }

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
          <span aria-label={`${outcomes.length} respostas registradas`}>
            {displayChallengeIndex}/{round.challenges.length} placas
          </span>
          {completed && (
            <button className="secondary-button" onClick={restartProgression} type="button">
              Recomeçar
            </button>
          )}
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

        <div className="ninja-question" tabIndex={-1}>
          <span>{completed ? "Treino concluído" : `Placa ${displayChallengeIndex + 1}`}</span>
          <strong>{completed ? "Progressão concluída!" : currentChallenge.prompt}</strong>
        </div>

        <PhaserArcadeSurface
          ariaLabel={`Jogo Ninja. ${completed ? "Progressão concluída." : currentChallenge?.prompt} Opções: ${completed ? "nenhuma" : currentChallenge?.choices.map((choice) => choice.label).join(", ")}. Use as setas e salte com Enter ou Espaço.`}
          className="ninja-foundation-canvas is-interactive"
          interactive
          onAnswer={submitAnswer}
          onRuntimeState={handleRuntimeState}
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
              ? completed ? "Progressão concluída." : liveMessage
              : completed ? "Progressão concluída." : liveMessage}
        </p>
      </div>
    </GameShell>
  );
}
