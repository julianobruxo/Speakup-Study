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
import type { ContentDomain } from "../../core/catalog";
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
  type ArcadeAnswerReceipt,
  type ArcadeSceneRuntimeState,
} from "../bridge/arcadeBridge";
import { PhaserArcadeSurface } from "../bridge/PhaserArcadeSurface";
import { SoloRaceDomMode } from "./SoloRaceDomMode";
import {
  createSoloRaceProgress,
  getSoloRaceSpeedLabel,
  getSoloRaceSpeedMultiplier,
  settleSoloRaceProgress,
} from "./soloRaceModel";
import { createSoloRaceRound } from "./soloRaceRound";
import { createSoloRaceScene } from "./soloRaceScene";

type RenderMode = "canvas" | "dom";

export default function SoloRaceGame() {
  const [searchParams] = useSearchParams();
  const domain: ContentDomain = searchParams.get("content") === "body" ||
    searchParams.get("domain") === "vocabulary"
    ? "vocabulary"
    : "grammar";
  return <SoloRaceSession domain={domain} key={domain} />;
}

function SoloRaceSession({ domain }: { domain: ContentDomain }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const systemReducedMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => {
    const requestedSeed = Number(searchParams.get("seed"));
    return Number.isFinite(requestedSeed) && requestedSeed > 0
      ? Math.trunc(requestedSeed)
      : Date.now();
  });
  const round = useMemo(() => createSoloRaceRound(seed, domain), [domain, seed]);
  const [mode, setMode] = useState<RenderMode>(
    () => searchParams.get("mode") === "dom" ? "dom" : "canvas",
  );
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [animationsEnabled, setAnimationPreference] = useState(areAnimationsEnabled);
  const [roundState, setRoundState] = useState<GameRoundState>(
    () => createRoundState("solo_race"),
  );
  const [progress, setProgress] = useState(createSoloRaceProgress);
  const progressRef = useRef(progress);
  const [runtimeChallengeIndex, setRuntimeChallengeIndex] = useState(0);
  const runtimeChallengeIndexRef = useRef(0);
  const selectedChoiceIdRef = useRef("");
  const [liveMessage, setLiveMessage] = useState("Corrida pronta. Os portais aguardam sua escolha.");
  const [pendingResult, setPendingResult] = useState<GameRoundResult | null>(null);
  const [result, setResult] = useState<GameRoundResult | null>(null);
  const reducedMotion = Boolean(systemReducedMotion) || !animationsEnabled;
  const { complete, completionError, resetSession, retryCompletion } =
    useGameCompletion("solo_race", domain);
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
    const nextProgress = settleSoloRaceProgress(progressRef.current, outcome.correct);
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    const challenge = round.challenges.find(
      (candidate) => candidate.id === outcome.challengeId,
    );
    const correctLabel = challenge?.choices.find(
      (choice) => choice.id === challenge.correctChoiceId,
    )?.label;
    setLiveMessage(
      outcome.correct
        ? `Correto! Boost ativado. Combo ${nextProgress.combo}. ${nextProgress.score} pontos.`
        : `Resposta incorreta. O carro desacelerou. A resposta era ${correctLabel}. ${challenge?.feedback ?? ""}`,
    );
    playSound(outcome.correct ? "correct" : "wrong");
  }, [round.challenges]);

  const answerGate = useMemo(
    () => createArcadeRoundAnswerGate(round, handleAcceptedOutcome),
    [handleAcceptedOutcome, round],
  );
  const submitAnswer = useCallback((answer: ArcadeAnswer): ArcadeAnswerReceipt | null => {
    const outcome = answerGate(answer);
    if (!outcome) return null;
    return {
      ...outcome,
      combo: progressRef.current.combo,
      speedMultiplier: getSoloRaceSpeedMultiplier(progressRef.current),
    };
  }, [answerGate]);

  const handleRuntimeState = useCallback((state: ArcadeSceneRuntimeState) => {
    if (state.challengeIndex === undefined) return;
    if (state.challengeIndex !== runtimeChallengeIndexRef.current) {
      runtimeChallengeIndexRef.current = state.challengeIndex;
      selectedChoiceIdRef.current = "";
      setRuntimeChallengeIndex(state.challengeIndex);
      if (state.challengeIndex < round.challenges.length) {
        setLiveMessage("Próximo conjunto de portais.");
      }
    }
    if (!state.selectedChoiceId || state.selectedChoiceId === selectedChoiceIdRef.current) return;
    selectedChoiceIdRef.current = state.selectedChoiceId;
    const challenge = round.challenges[state.challengeIndex];
    const selected = challenge?.choices.find((choice) => choice.id === state.selectedChoiceId);
    if (selected && state.laneIndex !== undefined) {
      setLiveMessage(`Faixa ${state.laneIndex + 1} selecionada: ${selected.label}. Confirme com Enter ou Espaço.`);
    }
  }, [round.challenges]);

  useEffect(() => {
    if (
      pendingResult ||
      result ||
      roundState.outcomes.length !== round.challenges.length
    ) return;
    const finalResult = finalizeRound(
      roundState,
      new Date().toISOString(),
      progressRef.current.score,
    );
    setPendingResult(finalResult);
    setLiveMessage("Linha de chegada. Corrida concluída.");
    playSound("complete");
    void completeRef.current(finalResult);
  }, [pendingResult, result, round.challenges.length, roundState]);

  useEffect(() => {
    if (!pendingResult || result) return;
    const timer = window.setTimeout(
      () => setResult(pendingResult),
      reducedMotion ? 300 : 1_050,
    );
    return () => window.clearTimeout(timer);
  }, [pendingResult, reducedMotion, result]);

  function resetRound() {
    const nextProgress = createSoloRaceProgress();
    resetSession();
    setSeed(Date.now());
    setPaused(false);
    setRoundState(createRoundState("solo_race"));
    setProgress(nextProgress);
    progressRef.current = nextProgress;
    runtimeChallengeIndexRef.current = 0;
    selectedChoiceIdRef.current = "";
    setRuntimeChallengeIndex(0);
    setLiveMessage("Nova corrida pronta.");
    setPendingResult(null);
    setResult(null);
  }

  if (result) {
    return (
      <GameResultScreen
        completionError={completionError}
        gameTitle="Corrida individual"
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
  const currentChallenge = round.challenges[
    Math.min(runtimeChallengeIndex, round.challenges.length - 1)
  ];

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
      title="Corrida individual"
    >
      <div className="solo-race-game">
        <GameProgressBar current={roundState.outcomes.length} total={round.challenges.length} />
        <div className="solo-race-toolbar">
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
          <span className="solo-race-domain">
            {domain === "grammar" ? "Gramática" : "Vocabulário"}
          </span>
          <div className="solo-race-stats" aria-label={`${progress.score} pontos, combo ${progress.combo}, velocidade ${getSoloRaceSpeedLabel(progress)}`}>
            <span><strong>{progress.score}</strong> pts</span>
            <span>combo <strong>x{progress.combo}</strong></span>
            <span>{getSoloRaceSpeedLabel(progress)}</span>
          </div>
          {mode === "canvas" && (
            <button
              aria-label={paused ? "Retomar jogo" : "Pausar jogo"}
              aria-pressed={paused}
              className="icon-button solo-race-pause-button"
              onClick={() => setPaused((current) => !current)}
              title={paused ? "Retomar jogo" : "Pausar jogo"}
              type="button"
            >
              <AppIcon name={paused ? "play" : "pause"} size={18} />
            </button>
          )}
        </div>

        {mode === "canvas" && (
          <div className="solo-race-question">
            <span>Portal {Math.min(runtimeChallengeIndex + 1, round.challenges.length)} de {round.challenges.length}</span>
            <strong>{currentChallenge.prompt}</strong>
          </div>
        )}

        {mode === "canvas" ? (
          <PhaserArcadeSurface
            ariaLabel={`Corrida individual. ${currentChallenge.prompt} Portais: ${currentChallenge.choices.map((choice) => choice.label).join(", ")}. Toque ou deslize para uma faixa; use as setas e confirme com Enter ou Espaço.`}
            className="solo-race-canvas is-interactive"
            interactive
            onAnswer={submitAnswer}
            onRuntimeState={handleRuntimeState}
            paused={paused}
            reducedMotion={reducedMotion}
            round={round}
            sceneFactory={createSoloRaceScene}
            soundEnabled={soundEnabled}
          />
        ) : (
          <SoloRaceDomMode
            onAnswer={submitAnswer}
            progress={progress}
            reduceMotion={reducedMotion}
            round={round}
          />
        )}

        <p aria-live="polite" className="solo-race-status" role="status">
          {paused ? "Jogo pausado." : liveMessage}
        </p>
      </div>
    </GameShell>
  );
}
