import type { ArcadeAnswer, PreparedArcadeRound } from "./arcadeBridge";

interface ArcadeDomFallbackProps {
  answered: boolean;
  onAnswer: (answer: ArcadeAnswer) => void;
  round: PreparedArcadeRound;
}

export function ArcadeDomFallback({
  answered,
  onAnswer,
  round,
}: ArcadeDomFallbackProps) {
  const challenge = round.challenges[0];
  if (!challenge) {
    return <p className="game-empty-state">Não há conteúdo para a rodada simplificada.</p>;
  }

  return (
    <div
      aria-labelledby="arcade-dom-fallback-title"
      className="arcade-dom-fallback"
      role="group"
    >
      <h2 className="arcade-dom-title" id="arcade-dom-fallback-title">
        Modo simplificado
      </h2>
      <p>{challenge.prompt}</p>
      <div className="arcade-dom-choices">
        {challenge.choices.map((choice) => (
          <button
            disabled={answered}
            key={choice.id}
            onClick={() => onAnswer({
              challengeId: challenge.id,
              choiceId: choice.id,
              answeredAt: new Date().toISOString(),
            })}
            type="button"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
