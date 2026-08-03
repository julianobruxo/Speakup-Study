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
import {
  createArcadeRoundAnswerGate,
  type ArcadeAnswer,
} from "../bridge/arcadeBridge";
import { PhaserArcadeSurface } from "../bridge/PhaserArcadeSurface";
import { WordSliceDomMode } from "./WordSliceDomMode";
import { createWordSliceRound } from "./wordSliceRound";
import { createWordSliceScene } from "./wordSliceScene";

type RenderMode = "canvas" | "dom";

export default function WordSliceGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const systemReducedMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => {
    const requestedSeed = Number(searchParams.get("seed"));
    return Number.isFinite(requestedSeed) && requestedSeed > 0
      ? Math.trunc(requestedSeed)
      : Date.now();
  });
  const round = useMemo(() => createWordSliceRound(seed), [seed]);
  const [mode, setMode] = useState<RenderMode>(
    () => searchParams.get("mode") === "dom" ? "dom" : "canvas",
  );
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [animationsEnabled, setAnimationPreference] = useState(areAnimationsEnabled);
  const [roundState, setRoundState] = useState<GameRoundState>(
    () => createRoundState("word_slice"),
  );
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [liveMessage, setLiveMessage] = useState("Rodada pronta.");
  const [result, setResult] = useState<GameRoundResult | null>(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const reducedMotion = Boolean(systemReducedMotion) || !animationsEnabled;
  const { complete, completionError, resetSession, retryCompletion } =
    useGameCompletion("word_slice", "vocabulary");
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
      const gain = 120 + Math.min(4, nextCombo - 1) * 30;
      comboRef.current = nextCombo;
      scoreRef.current += gain;
      setCombo(nextCombo);
      setScore(scoreRef.current);
      setLiveMessage(`Corte correto. Combo ${nextCombo}.`);
      playSound("correct");
    } else {
      const challenge = round.challenges.find(
        (candidate) => candidate.id === outcome.challengeId,
      );
      const correctLabel = challenge?.choices.find(
        (choice) => choice.id === challenge.correctChoiceId,
      )?.label;
      comboRef.current = 0;
      scoreRef.current = Math.max(0, scoreRef.current - 25);
      setCombo(0);
      setScore(scoreRef.current);
      setLiveMessage(`Corte incorreto. Menos 25 pontos. A resposta era ${correctLabel}.`);
      playSound("wrong");
    }
  }, [round]);

  const answerGate = useMemo(
    () => createArcadeRoundAnswerGate(round, handleAcceptedOutcome),
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
    }, reducedMotion ? 300 : 850);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, result, round.challenges.length, roundState]);

  useEffect(() => {
    if (
      roundState.outcomes.length === 0 ||
      roundState.outcomes.length >= round.challenges.length
    ) return;
    const timer = window.setTimeout(
      () => setLiveMessage("Próxima palavra."),
      reducedMotion ? 300 : 820,
    );
    return () => window.clearTimeout(timer);
  }, [reducedMotion, round.challenges.length, roundState.outcomes.length]);

  function resetRound() {
    resetSession();
    scoreRef.current = 0;
    comboRef.current = 0;
    setSeed(Date.now());
    setPaused(false);
    setRoundState(createRoundState("word_slice"));
    setScore(0);
    setCombo(0);
    setLiveMessage("Nova rodada pronta.");
    setResult(null);
  }

  if (result) {
    return (
      <GameResultScreen
        completionError={completionError}
        gameTitle="Corte a palavra"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={resetRound}
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
      title="Corte a palavra"
    >
      <div className="word-slice-game">
        <GameProgressBar current={roundState.outcomes.length} total={round.challenges.length} />
        <div className="word-slice-toolbar">
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
          <div className="word-slice-score" aria-label={`${score} pontos, combo ${combo}`}>
            <span><strong>{score}</strong> pontos</span>
            <span>combo <strong>x{combo}</strong></span>
          </div>
          {mode === "canvas" && (
            <button
              aria-label={paused ? "Retomar jogo" : "Pausar jogo"}
              aria-pressed={paused}
              className="icon-button word-slice-pause-button"
              onClick={() => setPaused((current) => !current)}
              title={paused ? "Retomar jogo" : "Pausar jogo"}
              type="button"
            >
              <AppIcon name={paused ? "play" : "pause"} size={18} />
            </button>
          )}
        </div>

        {mode === "canvas" ? (
          <PhaserArcadeSurface
            ariaLabel="Corte a palavra. Arraste sobre a palavra correta ou use as setas e a barra de espaço."
            className="word-slice-canvas is-interactive"
            interactive
            onAnswer={submitAnswer}
            paused={paused}
            reducedMotion={reducedMotion}
            round={round}
            sceneFactory={createWordSliceScene}
            soundEnabled={soundEnabled}
          />
        ) : (
          <WordSliceDomMode onAnswer={submitAnswer} reduceMotion={reducedMotion} round={round} />
        )}

        {mode === "canvas" && (
          <p aria-live="polite" className="word-slice-status" role="status">
            {paused ? "Jogo pausado." : liveMessage}
          </p>
        )}
      </div>
    </GameShell>
  );
}
