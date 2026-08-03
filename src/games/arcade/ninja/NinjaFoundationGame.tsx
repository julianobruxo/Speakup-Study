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
  type ArcadeAnswerReceipt,
  type ArcadeSceneRuntimeState,
  type PreparedArcadeRound,
} from "../bridge/arcadeBridge";
import { PhaserArcadeSurface } from "../bridge/PhaserArcadeSurface";
import { createNinjaFoundationScene } from "./ninjaFoundationScene";
import {
  createNinjaProgress,
  recoverNinjaProgress,
  settleNinjaProgress,
} from "./ninjaProgressModel";
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
  const outcomesRef = useRef<ChallengeOutcome[]>([]);
  const [progress, setProgress] = useState(createNinjaProgress);
  const progressRef = useRef(progress);
  const [runStartIndex, setRunStartIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const recoveryFocusPendingRef = useRef(false);
  const gameRootRef = useRef<HTMLDivElement | null>(null);
  const [displayChallengeIndex, setDisplayChallengeIndex] = useState(0);
  const displayChallengeIndexRef = useRef(0);
  const selectedChoiceIdRef = useRef("");
  const [liveMessage, setLiveMessage] = useState("Prepare-se para a primeira placa.");
  const round = useMemo(() => createNinjaFoundationRound(seed), [seed]);
  const sceneRound = useMemo<PreparedArcadeRound>(() => ({
    ...round,
    id: `${round.id}:attempt:${attempt}`,
    challenges: round.challenges.slice(runStartIndex),
  }), [attempt, round, runStartIndex]);
  const reducedMotion = Boolean(systemReducedMotion) || !animationsEnabled;
  const answerGate = useMemo(
    () => createArcadeRoundAnswerGate(sceneRound, () => undefined),
    [sceneRound],
  );
  const submitAnswer = useCallback((answer: ArcadeAnswer): ArcadeAnswerReceipt | null => {
    const outcome = answerGate(answer);
    if (!outcome) return null;
    const nextOutcomes = [...outcomesRef.current, outcome];
    outcomesRef.current = nextOutcomes;
    setOutcomes(nextOutcomes);
    const nextProgress = settleNinjaProgress(
      progressRef.current,
      outcome.correct,
      nextOutcomes.length === round.challenges.length,
    );
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    const challenge = round.challenges.find((candidate) => candidate.id === outcome.challengeId);
    const correctLabel = challenge?.choices.find(
      (choice) => choice.id === challenge.correctChoiceId,
    )?.label;
    setLiveMessage(
      outcome.correct
        ? "Correto!"
        : `Resposta incorreta. A resposta era ${correctLabel}. ${challenge?.feedback ?? ""} ${nextProgress.gameOver ? "Você ficou sem vidas. Recupere para continuar." : `${nextProgress.lives} ${nextProgress.lives === 1 ? "vida restante" : "vidas restantes"}.`}`,
    );
    return {
      ...outcome,
      remainingLives: nextProgress.lives,
      runEnded: nextProgress.gameOver,
    };
  }, [answerGate, round]);
  const handleRuntimeState = useCallback((state: ArcadeSceneRuntimeState) => {
    if (state.runEnded !== undefined) setRecoveryReady(state.runEnded);
    if (
      recoveryFocusPendingRef.current &&
      state.runEnded === false &&
      state.challengeIndex === 0 &&
      state.selectedChoiceId
    ) {
      recoveryFocusPendingRef.current = false;
      queueMicrotask(() => gameRootRef.current?.querySelector<HTMLElement>(
        ".ninja-foundation-canvas",
      )?.focus());
    }
    const nextIndex = state.challengeIndex === undefined
      ? undefined
      : runStartIndex + state.challengeIndex;
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
  }, [round.challenges, runStartIndex]);

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
    const nextProgress = createNinjaProgress();
    setSeed(Date.now());
    setOutcomes([]);
    outcomesRef.current = [];
    setProgress(nextProgress);
    progressRef.current = nextProgress;
    setRunStartIndex(0);
    setAttempt(0);
    setRecoveryReady(false);
    recoveryFocusPendingRef.current = false;
    displayChallengeIndexRef.current = 0;
    selectedChoiceIdRef.current = "";
    setDisplayChallengeIndex(0);
    setPaused(false);
    setLiveMessage("Nova progressão pronta.");
  }

  function recoverProgression() {
    const nextProgress = recoverNinjaProgress(progressRef.current);
    const nextIndex = outcomesRef.current.length;
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    setRunStartIndex(nextIndex);
    setAttempt((current) => current + 1);
    setRecoveryReady(false);
    recoveryFocusPendingRef.current = true;
    displayChallengeIndexRef.current = nextIndex;
    selectedChoiceIdRef.current = "";
    setDisplayChallengeIndex(nextIndex);
    setPaused(false);
    setLiveMessage("Vidas recuperadas. Continue pela próxima placa.");
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
      <div className="ninja-foundation-game" ref={gameRootRef}>
        <div className="ninja-foundation-toolbar">
          <div className="ninja-progress-stats" aria-label="Progresso da partida">
            <span>{Math.min(outcomes.length, round.challenges.length)}/{round.challenges.length} placas</span>
            <span className="ninja-lives">{progress.lives} vidas</span>
            <span>{progress.score} pontos</span>
            <span>Combo {progress.combo}</span>
          </div>
          {completed && (
            <button className="secondary-button" onClick={restartProgression} type="button">
              Recomeçar
            </button>
          )}
          <button
            aria-label={paused ? "Retomar jogo" : "Pausar jogo"}
            aria-pressed={paused}
            className="icon-button ninja-pause-button"
            disabled={completed || recoveryReady}
            onClick={() => setPaused((current) => !current)}
            title={paused ? "Retomar jogo" : "Pausar jogo"}
            type="button"
          >
            <AppIcon name={paused ? "play" : "pause"} size={18} />
          </button>
        </div>

        <div className="ninja-question" tabIndex={-1}>
          <span>{completed ? "Treino concluído" : recoveryReady ? "Recuperação" : `Placa ${displayChallengeIndex + 1}`}</span>
          <strong>{completed ? "Progressão concluída!" : recoveryReady ? "Você ainda pode concluir esta fase." : currentChallenge.prompt}</strong>
        </div>

        <PhaserArcadeSurface
          ariaLabel={`Jogo Ninja. ${completed ? "Progressão concluída." : recoveryReady ? "Partida interrompida para recuperar vidas." : currentChallenge?.prompt} Opções: ${completed || recoveryReady ? "nenhuma" : currentChallenge?.choices.map((choice) => choice.label).join(", ")}. Use as setas e salte com Enter ou Espaço.`}
          className="ninja-foundation-canvas is-interactive"
          interactive
          onAnswer={submitAnswer}
          onRuntimeState={handleRuntimeState}
          paused={paused}
          reducedMotion={reducedMotion}
          round={sceneRound}
          sceneFactory={createNinjaFoundationScene}
          soundEnabled={soundEnabled}
        />

        {recoveryReady && (
          <div className="ninja-recovery" role="group" aria-label="Recuperação da partida">
            <div>
              <strong>Sem vidas por agora</strong>
              <span>Seu score e as placas concluídas foram preservados.</span>
            </div>
            <button className="primary-button" onClick={recoverProgression} type="button">
              Recuperar e continuar
            </button>
          </div>
        )}

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
