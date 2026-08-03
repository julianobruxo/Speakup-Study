import { useEffect, useRef, useState } from "react";
import type { ChallengeOutcome } from "../../core/sessionEngine";
import type { ArcadeAnswer, PreparedArcadeRound } from "../bridge/arcadeBridge";

interface WordSliceDomModeProps {
  onAnswer: (answer: ArcadeAnswer) => ChallengeOutcome | null;
  reduceMotion: boolean;
  round: PreparedArcadeRound;
}

export function WordSliceDomMode({
  onAnswer,
  reduceMotion,
  round,
}: WordSliceDomModeProps) {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const promptRef = useRef<HTMLHeadingElement | null>(null);
  const challenge = round.challenges[challengeIndex];

  useEffect(() => {
    setChallengeIndex(0);
    setFeedback(null);
  }, [round.id]);

  useEffect(() => {
    if (!feedback || challengeIndex >= round.challenges.length - 1) return;
    const timer = window.setTimeout(() => {
      setChallengeIndex((current) => current + 1);
      setFeedback(null);
    }, reduceMotion ? 220 : 650);
    return () => window.clearTimeout(timer);
  }, [challengeIndex, feedback, reduceMotion, round.challenges.length]);

  useEffect(() => {
    if (challengeIndex > 0) promptRef.current?.focus();
  }, [challengeIndex]);

  if (!challenge) {
    return <p className="game-empty-state">Não há conteúdo para esta rodada.</p>;
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
    if (outcome) setFeedback(outcome.correct ? "correct" : "incorrect");
  }

  return (
    <section
      aria-labelledby="word-slice-dom-title"
      className="word-slice-dom"
      data-challenge-index={challengeIndex}
    >
      <div className="word-slice-dom-heading">
        <span>{challengeIndex + 1} de {round.challenges.length}</span>
        <h2 id="word-slice-dom-title">Modo simplificado</h2>
      </div>
      <h3 className="word-slice-dom-prompt" ref={promptRef} tabIndex={-1}>
        {challenge.prompt}
      </h3>
      <div className="word-slice-dom-choices">
        {challenge.choices.map((choice) => (
          <button
            data-choice-id={choice.id}
            disabled={Boolean(feedback)}
            key={choice.id}
            onClick={() => choose(choice.id)}
            type="button"
          >
            <span aria-hidden="true" className="word-slice-dom-mark" />
            <strong>{choice.label}</strong>
          </button>
        ))}
      </div>
      <div
        aria-live="polite"
        className={`word-slice-dom-feedback ${feedback ? `is-${feedback}` : ""}`}
        role="status"
      >
        {feedback === "correct" && `Corte certeiro! ${correctLabel}.`}
        {feedback === "incorrect" && `Quase. A resposta era ${correctLabel}.`}
      </div>
    </section>
  );
}
