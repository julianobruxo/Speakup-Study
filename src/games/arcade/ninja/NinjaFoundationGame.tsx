import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppIcon from "../../../components/AppIcon";
import {
  SOUND_PREFERENCE_EVENT,
  isSoundEnabled,
  playSound,
  setSoundEnabled,
} from "../../../services/audio/sound";
import {
  ANIMATION_PREFERENCE_EVENT,
  areAnimationsEnabled,
} from "../../../services/preferences/animations";
import { GameResultScreen } from "../../components/GameResultScreen";
import { GameProgressBar, GameShell } from "../../components/GameShell";
import {
  createRoundState,
  finalizeRound,
  recordOutcome,
  type ChallengeOutcome,
  type GameRoundResult,
} from "../../core/sessionEngine";
import { useGameCompletion } from "../../core/useGameCompletion";
import {
  createArcadeRoundAnswerGate,
  type ArcadeAnswer,
  type ArcadeAnswerReceipt,
  type ArcadeSceneRuntimeState,
  type PreparedArcadeRound,
} from "../bridge/arcadeBridge";
import { PhaserArcadeSurface } from "../bridge/PhaserArcadeSurface";
import { NinjaDomMode } from "./NinjaDomMode";
import { createNinjaFoundationScene } from "./ninjaFoundationScene";
import {
  createNinjaProgress,
  recoverNinjaProgress,
  settleNinjaProgress,
} from "./ninjaProgressModel";
import { createNinjaFoundationRound } from "./ninjaRound";

type RenderMode = "canvas" | "dom";

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
  const [mode, setMode] = useState<RenderMode>(
    () => searchParams.get("mode") === "dom" ? "dom" : "canvas",
  );
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [animationsEnabled, setAnimationPreference] = useState(areAnimationsEnabled);
  const [outcomes, setOutcomes] = useState<ChallengeOutcome[]>([]);
  const outcomesRef = useRef<ChallengeOutcome[]>([]);
  const roundStateRef = useRef(createRoundState("ninja"));
  const [progress, setProgress] = useState(createNinjaProgress);
  const progressRef = useRef(progress);
  const [runStartIndex, setRunStartIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const recoveryFocusPendingRef = useRef(false);
  const recoveryButtonRef = useRef<HTMLButtonElement | null>(null);
  const announcedStageIdRef = useRef("");
  const gameRootRef = useRef<HTMLDivElement | null>(null);
  const [displayChallengeIndex, setDisplayChallengeIndex] = useState(0);
  const displayChallengeIndexRef = useRef(0);
  const selectedChoiceIdRef = useRef("");
  const [liveMessage, setLiveMessage] = useState("Prepare-se para a primeira placa.");
  const [pendingResult, setPendingResult] = useState<GameRoundResult | null>(null);
  const [result, setResult] = useState<GameRoundResult | null>(null);
  const round = useMemo(() => createNinjaFoundationRound(seed), [seed]);
  const sceneRound = useMemo<PreparedArcadeRound>(() => ({
    ...round,
    id: `${round.id}:attempt:${attempt}`,
    challenges: round.challenges.slice(runStartIndex),
    precedingStageId: round.challenges[runStartIndex - 1]?.stage?.id,
  }), [attempt, round, runStartIndex]);
  const reducedMotion = Boolean(systemReducedMotion) || !animationsEnabled;
  const { complete, completionError, resetSession, retryCompletion } =
    useGameCompletion("ninja", "grammar");
  const completeRef = useRef(complete);
  completeRef.current = complete;
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
    roundStateRef.current = recordOutcome(
      roundStateRef.current,
      outcome.challengeId,
      outcome.correct,
      outcome.answeredAt,
    );
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
        ? `Correto! Combo ${nextProgress.combo}. ${nextProgress.score} pontos.`
        : `Resposta incorreta. A resposta era ${correctLabel}. ${challenge?.feedback ?? ""} ${nextProgress.gameOver ? "Você ficou sem vidas. Recupere para continuar." : `${nextProgress.lives} ${nextProgress.lives === 1 ? "vida restante" : "vidas restantes"}.`}`,
    );
    playSound(outcome.correct ? "correct" : "wrong");
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
    const challenge = round.challenges[nextIndex ?? displayChallengeIndexRef.current];
    if (challenge?.stage && challenge.stage.id !== announcedStageIdRef.current) {
      announcedStageIdRef.current = challenge.stage.id;
      selectedChoiceIdRef.current = state.selectedChoiceId ?? "";
      setLiveMessage(
        `Fase ${challenge.stage.index + 1} de ${challenge.stage.total}: ${challenge.stage.label}.`,
      );
      return;
    }
    if (!state.selectedChoiceId || state.selectedChoiceId === selectedChoiceIdRef.current) return;
    selectedChoiceIdRef.current = state.selectedChoiceId;
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
    resetSession();
    setSeed(Date.now());
    setOutcomes([]);
    outcomesRef.current = [];
    roundStateRef.current = createRoundState("ninja");
    setProgress(nextProgress);
    progressRef.current = nextProgress;
    setRunStartIndex(0);
    setAttempt(0);
    setRecoveryReady(false);
    recoveryFocusPendingRef.current = false;
    announcedStageIdRef.current = "";
    displayChallengeIndexRef.current = 0;
    selectedChoiceIdRef.current = "";
    setDisplayChallengeIndex(0);
    setPaused(false);
    setLiveMessage("Nova progressão pronta.");
    setPendingResult(null);
    setResult(null);
  }

  function recoverProgression() {
    const nextProgress = recoverNinjaProgress(progressRef.current);
    const nextIndex = outcomesRef.current.length;
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    setRunStartIndex(nextIndex);
    setAttempt((current) => current + 1);
    setRecoveryReady(false);
    recoveryFocusPendingRef.current = mode === "canvas";
    announcedStageIdRef.current = round.challenges[nextIndex - 1]?.stage?.id ?? "";
    displayChallengeIndexRef.current = nextIndex;
    selectedChoiceIdRef.current = "";
    setDisplayChallengeIndex(nextIndex);
    setPaused(false);
    setLiveMessage("Vidas recuperadas. Continue pela próxima placa.");
  }

  const handleDomProgress = useCallback((localChallengeIndex: number) => {
    const nextIndex = runStartIndex + localChallengeIndex;
    displayChallengeIndexRef.current = nextIndex;
    setDisplayChallengeIndex(nextIndex);
  }, [runStartIndex]);
  const handleRecoveryReady = useCallback(() => {
    setRecoveryReady(true);
    setLiveMessage("Sem vidas por agora. Recuperar e continuar está disponível.");
  }, []);

  useEffect(() => {
    if (!recoveryReady || mode !== "dom") return;
    recoveryButtonRef.current?.focus();
  }, [mode, recoveryReady]);

  useEffect(() => {
    if (!completed || pendingResult || result) return;
    const finalResult = finalizeRound(
      roundStateRef.current,
      new Date().toISOString(),
      progressRef.current.score,
    );
    setPendingResult(finalResult);
    setLiveMessage("Rodada concluída.");
    playSound("complete");
    void completeRef.current(finalResult);
  }, [completed, pendingResult, result]);

  useEffect(() => {
    if (!pendingResult || result) return;
    const timer = window.setTimeout(() => {
      setResult(pendingResult);
    }, reducedMotion ? 300 : 850);
    return () => window.clearTimeout(timer);
  }, [pendingResult, reducedMotion, result]);

  if (result) {
    return (
      <GameResultScreen
        completionError={completionError}
        gameTitle="Ninja"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={restartProgression}
        onRetryPersistence={retryCompletion}
        reduceMotion={reducedMotion}
        result={result}
      />
    );
  }

  const hasStarted = outcomes.length > 0;

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
        <GameProgressBar current={outcomes.length} total={round.challenges.length} />
        <div className="ninja-foundation-toolbar">
          <div aria-label="Modo de jogo" className="arcade-mode-switch">
            <button
              aria-pressed={mode === "canvas"}
              disabled={hasStarted}
              onClick={() => setMode("canvas")}
              type="button"
            >
              Arcade
            </button>
            <button
              aria-pressed={mode === "dom"}
              disabled={hasStarted}
              onClick={() => {
                setMode("dom");
                setPaused(false);
              }}
              type="button"
            >
              Simplificado
            </button>
          </div>
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
          {mode === "canvas" && <button
            aria-label={paused ? "Retomar jogo" : "Pausar jogo"}
            aria-pressed={paused}
            className="icon-button ninja-pause-button"
            disabled={completed || recoveryReady}
            onClick={() => setPaused((current) => !current)}
            title={paused ? "Retomar jogo" : "Pausar jogo"}
            type="button"
          >
            <AppIcon name={paused ? "play" : "pause"} size={18} />
          </button>}
        </div>

        {mode === "canvas" && <div className="ninja-question" tabIndex={-1}>
          <span>{completed
            ? "Treino concluído"
            : recoveryReady
              ? "Recuperação"
              : currentChallenge.stage
                ? `Fase ${currentChallenge.stage.index + 1}/${currentChallenge.stage.total} · ${currentChallenge.stage.label}`
                : `Placa ${displayChallengeIndex + 1}`}</span>
          <strong>{completed ? "Progressão concluída!" : recoveryReady ? "Você ainda pode concluir esta fase." : currentChallenge.prompt}</strong>
        </div>}

        {mode === "canvas" ? <PhaserArcadeSurface
          ariaLabel={`Jogo Ninja. ${currentChallenge?.stage ? `Fase ${currentChallenge.stage.index + 1} de ${currentChallenge.stage.total}, ${currentChallenge.stage.label}. ` : ""}${completed ? "Progressão concluída." : recoveryReady ? "Partida interrompida para recuperar vidas." : currentChallenge?.prompt} Opções: ${completed || recoveryReady ? "nenhuma" : currentChallenge?.choices.map((choice) => choice.label).join(", ")}. Use as setas e salte com Enter ou Espaço.`}
          className="ninja-foundation-canvas is-interactive"
          interactive
          onAnswer={submitAnswer}
          onRuntimeState={handleRuntimeState}
          paused={paused}
          reducedMotion={reducedMotion}
          round={sceneRound}
          sceneFactory={createNinjaFoundationScene}
          soundEnabled={soundEnabled}
        /> : (
          <NinjaDomMode
            onAnswer={submitAnswer}
            onProgress={handleDomProgress}
            onRecoveryReady={handleRecoveryReady}
            progress={progress}
            round={sceneRound}
          />
        )}

        {recoveryReady && (
          <div className="ninja-recovery" role="group" aria-label="Recuperação da partida">
            <div>
              <strong>Sem vidas por agora</strong>
              <span>Seu score e as placas concluídas foram preservados.</span>
            </div>
            <button
              className="primary-button"
              onClick={recoverProgression}
              ref={recoveryButtonRef}
              type="button"
            >
              Recuperar e continuar
            </button>
          </div>
        )}

        <p aria-live="polite" className="ninja-foundation-status" role="status">
          {paused
            ? "Jogo pausado."
            : completed ? "Progressão concluída." : liveMessage}
        </p>
      </div>
    </GameShell>
  );
}
