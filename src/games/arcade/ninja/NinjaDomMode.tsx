import { useEffect, useRef, useState } from "react";
import type { ArcadeAnswer, ArcadeAnswerReceipt, PreparedArcadeRound } from "../bridge/arcadeBridge";
import type { NinjaProgress } from "./ninjaProgressModel";
import { NINJA_TIMING_MS } from "./ninjaRound";

interface NinjaDomModeProps {
  onAnswer: (answer: ArcadeAnswer) => ArcadeAnswerReceipt | null;
  onProgress: (localChallengeIndex: number) => void;
  onRecoveryReady: () => void;
  progress: NinjaProgress;
  round: PreparedArcadeRound;
}

export function NinjaDomMode({
  onAnswer,
  onProgress,
  onRecoveryReady,
  progress,
  round,
}: NinjaDomModeProps) {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [feedback, setFeedback] = useState<ArcadeAnswerReceipt | null>(null);
  const promptRef = useRef<HTMLHeadingElement | null>(null);
  const challenge = round.challenges[challengeIndex];

  useEffect(() => {
    setChallengeIndex(0);
    setFeedback(null);
    onProgress(0);
  }, [onProgress, round.id]);

  useEffect(() => {
    if (challengeIndex > 0 || round.precedingStageId) promptRef.current?.focus();
  }, [challengeIndex, round.precedingStageId]);

  useEffect(() => {
    if (!feedback) return;
    const delay = feedback.correct
      ? NINJA_TIMING_MS.correctFeedback
      : NINJA_TIMING_MS.incorrectFeedback;
    const timer = window.setTimeout(() => {
      if (feedback.runEnded) {
        onRecoveryReady();
        return;
      }
      const nextIndex = challengeIndex + 1;
      setChallengeIndex(nextIndex);
      setFeedback(null);
      onProgress(nextIndex);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [challengeIndex, feedback, onProgress, onRecoveryReady]);

  if (!challenge) {
    return <p className="game-empty-state">Progressão concluída.</p>;
  }

  const correctLabel = challenge.choices.find(
    (choice) => choice.id === challenge.correctChoiceId,
  )?.label;

  function choose(choiceId: string) {
    const outcome = onAnswer({
      answeredAt: new Date().toISOString(),
      challengeId: challenge.id,
      choiceId,
    });
    if (outcome) setFeedback(outcome);
  }

  return (
    <section
      aria-labelledby="ninja-dom-title"
      className="ninja-dom"
      data-challenge-index={challengeIndex}
    >
      <div className="ninja-dom-heading">
        <span>{challengeIndex + 1} de {round.challenges.length}</span>
        <h2 id="ninja-dom-title">Modo simplificado</h2>
      </div>
      {challenge.stage && (
        <span className="ninja-dom-stage" id="ninja-dom-stage">
          Fase {challenge.stage.index + 1}/{challenge.stage.total} · {challenge.stage.label}
        </span>
      )}
      <h3
        aria-describedby={challenge.stage ? "ninja-dom-stage" : undefined}
        className="ninja-dom-prompt"
        ref={promptRef}
        tabIndex={-1}
      >
        {challenge.prompt}
      </h3>
      <div className="ninja-dom-choices">
        {challenge.choices.map((choice, index) => (
          <button
            data-choice-id={choice.id}
            disabled={Boolean(feedback)}
            key={choice.id}
            onClick={() => choose(choice.id)}
            type="button"
          >
            <span aria-hidden="true">{index + 1}</span>
            <strong>{choice.label}</strong>
          </button>
        ))}
      </div>
      <div
        className={`ninja-dom-feedback ${feedback ? feedback.correct ? "is-correct" : "is-incorrect" : ""}`}
      >
        {feedback?.correct && `Correto! Combo ${progress.combo}. ${progress.score} pontos.`}
        {feedback && !feedback.correct && (
          <>Resposta incorreta. A resposta era {correctLabel}. {challenge.feedback} {progress.lives} {progress.lives === 1 ? "vida restante" : "vidas restantes"}.</>
        )}
      </div>
    </section>
  );
}
