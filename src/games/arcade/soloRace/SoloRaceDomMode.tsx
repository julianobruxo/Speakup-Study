import { useEffect, useRef, useState } from "react";
import type { ArcadeAnswer, ArcadeAnswerReceipt, PreparedArcadeRound } from "../bridge/arcadeBridge";
import {
  getSoloRaceSpeedLabel,
  type SoloRaceProgress,
} from "./soloRaceModel";

const LANE_LABELS = ["Faixa esquerda", "Faixa central", "Faixa direita"];

interface SoloRaceDomModeProps {
  onAnswer: (answer: ArcadeAnswer) => ArcadeAnswerReceipt | null;
  progress: SoloRaceProgress;
  reduceMotion: boolean;
  round: PreparedArcadeRound;
}

export function SoloRaceDomMode({
  onAnswer,
  progress,
  reduceMotion,
  round,
}: SoloRaceDomModeProps) {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [feedback, setFeedback] = useState<ArcadeAnswerReceipt | null>(null);
  const promptRef = useRef<HTMLHeadingElement | null>(null);
  const challenge = round.challenges[challengeIndex];

  useEffect(() => {
    setChallengeIndex(0);
    setFeedback(null);
  }, [round.id]);

  useEffect(() => {
    if (!feedback || challengeIndex >= round.challenges.length - 1) return;
    const delay = reduceMotion ? 260 : feedback.correct ? 850 : 1_800;
    const timer = window.setTimeout(() => {
      setChallengeIndex((current) => current + 1);
      setFeedback(null);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [challengeIndex, feedback, reduceMotion, round.challenges.length]);

  useEffect(() => {
    if (challengeIndex > 0) promptRef.current?.focus();
  }, [challengeIndex]);

  if (!challenge) {
    return <p className="game-empty-state">Corrida concluída.</p>;
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
      aria-labelledby="solo-race-dom-title"
      className="solo-race-dom"
      data-challenge-index={challengeIndex}
    >
      <div className="solo-race-dom-heading">
        <span>{challengeIndex + 1} de {round.challenges.length}</span>
        <h2 id="solo-race-dom-title">Pista simplificada</h2>
        <span>{getSoloRaceSpeedLabel(progress)}</span>
      </div>
      <h3 className="solo-race-dom-prompt" ref={promptRef} tabIndex={-1}>
        {challenge.prompt}
      </h3>
      <div aria-label="Portais de resposta" className="solo-race-dom-lanes">
        {challenge.choices.map((choice, index) => (
          <button
            data-choice-id={choice.id}
            disabled={Boolean(feedback)}
            key={choice.id}
            onClick={() => choose(choice.id)}
            type="button"
          >
            <span aria-hidden="true">{LANE_LABELS[index]}</span>
            <strong>{choice.label}</strong>
          </button>
        ))}
      </div>
      <div className={`solo-race-dom-feedback ${feedback ? feedback.correct ? "is-correct" : "is-incorrect" : ""}`}>
        {feedback?.correct && `Boost! Combo ${progress.combo}.`}
        {feedback && !feedback.correct && (
          <>Você desacelerou. A resposta era {correctLabel}. {challenge.feedback}</>
        )}
      </div>
    </section>
  );
}
