import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components/AppShell";
import { getBodyEntries, toMemoryMatchChallenge } from "../adapters/bodyVocabularyAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { shuffleWithSeed } from "../core/shuffle";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import { VisualAsset } from "../assets/visualResolver";
import type { MemoryMatchChallenge } from "../core/challengeTypes";

const roundSize = ROUND_SIZES.memory_match.count;

type Card = {
  cardId: string;
  pairId: string;
  kind: "word" | "image";
  challenge: MemoryMatchChallenge;
};

function buildCards(seed: number): Card[] {
  const entries = getBodyEntries();
  const selected = selectChallenges(entries, roundSize, seed).map((entry) => toMemoryMatchChallenge(entry));
  const cards: Card[] = selected.flatMap((challenge) => [
    { cardId: `${challenge.id}:word`, pairId: challenge.id, kind: "word", challenge },
    { cardId: `${challenge.id}:image`, pairId: challenge.id, kind: "image", challenge },
  ]);
  return shuffleWithSeed(cards, seed + 7);
}

export default function MemoryMatchGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const cards = useMemo(() => buildCards(seed), [seed]);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("memory_match"));
  const [finished, setFinished] = useState(false);
  const { complete, completionError, resetSession, retryCompletion } = useGameCompletion("memory_match", "vocabulary");

  const totalPairs = cards.length / 2;
  const allMatched = matchedPairIds.size === totalPairs && totalPairs > 0;

  useEffect(() => {
    if (allMatched && !finished) {
      const result = finalizeRound(roundState);
      setFinished(true);
      void complete(result);
    }
  }, [allMatched, complete, finished, roundState]);

  function flipCard(card: Card) {
    if (isChecking || flipped.includes(card.cardId) || matchedPairIds.has(card.pairId)) return;
    if (flipped.length === 2) return;

    const nextFlipped = [...flipped, card.cardId];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsChecking(true);
      const [firstId, secondId] = nextFlipped;
      const first = cards.find((item) => item.cardId === firstId)!;
      const second = cards.find((item) => item.cardId === secondId)!;
      const isMatch = first.pairId === second.pairId && first.kind !== second.kind;

      window.setTimeout(() => {
        if (isMatch) {
          setMatchedPairIds((current) => new Set(current).add(first.pairId));
          setRoundState((current) => recordOutcome(current, first.pairId, true));
        } else {
          setRoundState((current) => recordOutcome(current, `${firstId}:${secondId}`, false));
        }
        setFlipped([]);
        setIsChecking(false);
      }, 700);
    }
  }

  if (finished) {
    const result = finalizeRound(roundState);
    return (
      <GameResultScreen
        completionError={completionError}
        gameTitle="Par perfeito"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onRetryPersistence={retryCompletion}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setMatchedPairIds(new Set());
          setFlipped([]);
          setRoundState(createRoundState("memory_match"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Par perfeito">
      <section className="session-meta">
        <span>
          {matchedPairIds.size} de {totalPairs} pares encontrados
        </span>
      </section>

      <div className="memory-match-board">
        <div className="memory-match-grid" role="grid" aria-label="Cartas do jogo da memória">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.cardId) || matchedPairIds.has(card.pairId);
          const isMatched = matchedPairIds.has(card.pairId);
          return (
            <button
              aria-label={
                isFlipped
                  ? card.kind === "word"
                    ? card.challenge.term
                    : card.challenge.translation
                  : "Carta virada para baixo"
              }
              aria-pressed={isFlipped}
              className={`memory-match-card ${isFlipped ? "is-flipped" : ""} ${isMatched ? "is-matched" : ""}`}
              disabled={isMatched}
              key={card.cardId}
              onClick={() => flipCard(card)}
              type="button"
            >
              {isFlipped ? (
                card.kind === "word" ? (
                  <span className="memory-match-word">{card.challenge.term}</span>
                ) : (
                  <VisualAsset label={card.challenge.translation} visualKey={card.challenge.visualKey} />
                )
              ) : (
                <span className="memory-match-back" aria-hidden="true" />
              )}
            </button>
          );
        })}
        </div>
      </div>

      <div className="session-action">
        <PrimaryButton
          onClick={() => {
            setSeed(Date.now());
            setMatchedPairIds(new Set());
            setFlipped([]);
            setRoundState(createRoundState("memory_match"));
          }}
          variant="secondary"
        >
          Embaralhar novamente
        </PrimaryButton>
      </div>
    </GameShell>
  );
}
