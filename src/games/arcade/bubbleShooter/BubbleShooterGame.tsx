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
  type GameRoundState,
} from "../../core/sessionEngine";
import { useGameCompletion } from "../../core/useGameCompletion";
import type { ArcadeAnswer, ArcadeSceneRuntimeState } from "../bridge/arcadeBridge";
import { createBubbleShooterAnswerGate } from "./bubbleShooterPedagogy";
import { PhaserArcadeSurface } from "../bridge/PhaserArcadeSurface";
import { BubbleShooterDomMode } from "./BubbleShooterDomMode";
import { createBubbleShooterRound } from "./bubbleShooterRound";
import { createBubbleShooterScene } from "./bubbleShooterScene";

type RenderMode = "canvas" | "dom";

export default function BubbleShooterGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const systemReducedMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => {
    const requestedSeed = Number(searchParams.get("seed"));
    return Number.isFinite(requestedSeed) && requestedSeed > 0
      ? Math.trunc(requestedSeed)
      : Date.now();
  });
  const round = useMemo(() => createBubbleShooterRound(seed), [seed]);
  const [mode, setMode] = useState<RenderMode>(
    () => searchParams.get("mode") === "dom" ? "dom" : "canvas",
  );
  /** Idle until the learner explicitly starts: no round ever begins on a timer. */
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [animationsEnabled, setAnimationPreference] = useState(areAnimationsEnabled);
  const [roundState, setRoundState] = useState<GameRoundState>(
    () => createRoundState("bubble_shooter"),
  );
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [liveMessage, setLiveMessage] = useState("Mire e atire na tradução correta.");
  const [result, setResult] = useState<GameRoundResult | null>(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  /** Guards so a run can only be finalised once, even if the scene re-reports. */
  const runEndedRef = useRef(false);
  const resultRef = useRef<GameRoundResult | null>(null);
  const reducedMotion = Boolean(systemReducedMotion) || !animationsEnabled;
  const { complete, completionError, resetSession, retryCompletion } =
    useGameCompletion("bubble_shooter", "vocabulary");
  const completeRef = useRef(complete);
  completeRef.current = complete;

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

  const handleAcceptedOutcome = useCallback((outcome: ChallengeOutcome) => {
    setRoundState((current) => recordOutcome(
      current,
      outcome.challengeId,
      outcome.correct,
      outcome.answeredAt,
    ));

    if (outcome.correct) {
      const nextCombo = comboRef.current + 1;
      const gain = 100 + Math.min(4, nextCombo - 1) * 25;
      comboRef.current = nextCombo;
      scoreRef.current += gain;
      setCombo(nextCombo);
      setScore(scoreRef.current);
      setLiveMessage(`Palavra coletada. Combo ${nextCombo}.`);
      playSound("correct");
    } else {
      comboRef.current = 0;
      setCombo(0);
      setLiveMessage("Palavra incorreta coletada.");
      playSound("wrong");
    }
  }, []);

  const answerGate = useMemo(
    () => createBubbleShooterAnswerGate(round, handleAcceptedOutcome),
    [handleAcceptedOutcome, round],
  );

  const submitAnswer = useCallback(
    (answer: ArcadeAnswer) => answerGate(answer),
    [answerGate],
  );

  useEffect(() => {
    if (
      result ||
      round.challenges.length === 0 ||
      roundState.outcomes.length !== round.challenges.length
    ) return;

    const timer = window.setTimeout(() => {
      const finalResult = finalizeRound(roundState, new Date().toISOString(), scoreRef.current);
      setResult(finalResult);
      setLiveMessage("Rodada concluída.");
      playSound("complete");
      void completeRef.current(finalResult);
    }, reducedMotion ? 300 : 950);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, result, round.challenges.length, roundState]);

  /**
   * The scene reports `runEnded` once when the run is over — including a defeat
   * with words still unanswered. The round is finalised from the outcomes that
   * actually happened: unreached challenges are never scored as mistakes.
   */
  const handleRuntimeState = useCallback((state: ArcadeSceneRuntimeState) => {
    if (!state.runEnded || runEndedRef.current) return;
    runEndedRef.current = true;

    setRoundState((current) => {
      if (resultRef.current) return current;
      const finalResult = finalizeRound(
        current,
        new Date().toISOString(),
        scoreRef.current,
      );
      resultRef.current = finalResult;
      setResult(finalResult);
      setLiveMessage("Rodada encerrada.");
      playSound("complete");
      void completeRef.current(finalResult);
      return current;
    });
  }, []);

  /**
   * Returns to the idle start screen and clears every per-run guard. It never
   * starts a round: the Phaser session is unmounted and the game waits for the
   * learner to act.
   */
  const returnToStart = useCallback(() => {
    resetSession();
    scoreRef.current = 0;
    comboRef.current = 0;
    runEndedRef.current = false;
    resultRef.current = null;
    setPaused(false);
    setRoundState(createRoundState("bubble_shooter"));
    setScore(0);
    setCombo(0);
    setLiveMessage("Estoure ou derrube a bolha com a palavra certa.");
    setResult(null);
    setStarted(false);
  }, [resetSession]);

  /**
   * Starts a round. Only ever called from an explicit click, tap or key press,
   * and guarded so a double activation cannot create two sessions.
   */
  const startRound = useCallback(() => {
    setStarted((current) => {
      if (current) return current;
      resetSession();
      scoreRef.current = 0;
      comboRef.current = 0;
      runEndedRef.current = false;
      resultRef.current = null;
      setSeed(Date.now());
      setPaused(false);
      setRoundState(createRoundState("bubble_shooter"));
      setScore(0);
      setCombo(0);
      setLiveMessage("Estoure ou derrube a bolha com a palavra certa.");
      setResult(null);
      return true;
    });
  }, [resetSession]);

  if (result) {
    return (
      <GameResultScreen
        completionError={completionError}
        gameTitle="Bubble Shooter"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={returnToStart}
        onRetryPersistence={retryCompletion}
        reduceMotion={reducedMotion}
        result={result}
      />
    );
  }

  const hasStarted = roundState.outcomes.length > 0;

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
      title="Bubble Shooter"
    >
      <div className="bubble-shooter-game">
        <GameProgressBar
          current={roundState.outcomes.length}
          total={round.challenges.length}
        />

        <div className="bubble-shooter-toolbar">
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
          <div className="bubble-shooter-score" aria-label={`${score} pontos, combo ${combo}`}>
            <span><strong>{score}</strong> pontos</span>
            <span>combo <strong>x{combo}</strong></span>
          </div>
          {mode === "canvas" && (
            <button
              aria-label={paused ? "Retomar jogo" : "Pausar jogo"}
              aria-pressed={paused}
              className="icon-button bubble-pause-button"
              onClick={() => setPaused((current) => !current)}
              title={paused ? "Retomar jogo" : "Pausar jogo"}
              type="button"
            >
              <AppIcon name={paused ? "play" : "pause"} size={18} />
            </button>
          )}
        </div>

        {mode === "canvas" && !started ? (
          /*
           * Idle start screen. No round is ever created by a timer: the Phaser
           * session only mounts once the learner activates this control with a
           * click, a tap, or Enter/Space while it is focused.
           */
          <div className="bubble-shooter-start" data-testid="bubble-shooter-start">
            <h2>Bubble Shooter</h2>
            <p>
              Estoure ou derrube a bolha com a palavra em inglês que corresponde
              à pista em português.
            </p>
            <button
              autoFocus
              className="primary-button"
              onClick={startRound}
              type="button"
            >
              Jogar
            </button>
          </div>
        ) : mode === "canvas" ? (
          <PhaserArcadeSurface
            ariaLabel="Bubble Shooter. Mire com o ponteiro ou com as setas e lance com toque, clique ou barra de espaço."
            className="bubble-shooter-canvas is-interactive"
            interactive
            onAnswer={submitAnswer}
            onRuntimeState={handleRuntimeState}
            paused={paused}
            reducedMotion={reducedMotion}
            round={round}
            sceneFactory={createBubbleShooterScene}
            soundEnabled={soundEnabled}
          />
        ) : (
          <BubbleShooterDomMode
            onAnswer={submitAnswer}
            reduceMotion={reducedMotion}
            round={round}
          />
        )}

        {mode === "canvas" && (
          <p aria-live="polite" className="bubble-shooter-status" role="status">
            {paused ? "Jogo pausado." : liveMessage}
          </p>
        )}
      </div>
    </GameShell>
  );
}
