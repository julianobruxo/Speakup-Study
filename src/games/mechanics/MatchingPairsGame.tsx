import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { getBodyEntries, toMatchingPairChallenge } from "../adapters/bodyVocabularyAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import { VisualAsset } from "../assets/visualResolver";
import type { MatchingPairChallenge } from "../core/challengeTypes";

const roundSize = ROUND_SIZES.matching_pairs.count;

function buildChallenges(seed: number): MatchingPairChallenge[] {
  const entries = getBodyEntries();
  const selected = selectChallenges(entries, roundSize, seed);
  return selected.map((entry) => toMatchingPairChallenge(entry));
}

export default function MatchingPairsGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(() => buildChallenges(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<MatchingPairChallenge[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("matching_pairs"));
  const [finished, setFinished] = useState(false);
  const { complete, resetSession } = useGameCompletion("matching_pairs", "vocabulary");

  const challenge = challenges[index];

  useEffect(() => {
    if (!challenge) return;
    const distractors = challenges
      .filter((entry) => entry.id !== challenge.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const shuffled = [challenge, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(shuffled);
    setSelectedTerm(null);
    setChecked(false);
  }, [challenge, challenges]);

  if (!challenge && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Conectando">
        <p className="game-empty-state">Não há pares suficientes para esta rodada no momento.</p>
      </GameShell>
    );
  }

  function selectOption(term: string) {
    if (checked || !challenge) return;
    setSelectedTerm(term);
    setChecked(true);
    const correct = term === challenge.term;
    setRoundState((current) => recordOutcome(current, challenge.id, correct));
  }

  function advance() {
    if (index === challenges.length - 1) {
      const result = finalizeRound(roundState);
      setFinished(true);
      void complete(result);
      return;
    }
    setIndex((current) => current + 1);
  }

  if (finished) {
    const result = finalizeRound(roundState);
    return (
      <GameResultScreen
        gameTitle="Conectando"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setIndex(0);
          setRoundState(createRoundState("matching_pairs"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Conectando">
      <section className="session-meta">
        <span>
          Par {index + 1} de {challenges.length}
        </span>
      </section>
      <GameProgressBar current={index + (checked ? 1 : 0)} total={challenges.length} />

      <section className="question-card matching-pairs-card">
        <div className="matching-pairs-image">
          <VisualAsset label={challenge.translation} visualKey={challenge.visualKey} />
        </div>

        <div className="matching-pairs-options" role="group" aria-label="Escolha a palavra correta">
          {options.map((option) => {
            const isSelected = selectedTerm === option.term;
            const isTarget = checked && option.term === challenge.term;
            const isWrong = checked && isSelected && !isTarget;
            return (
              <button
                className={[
                  "matching-pairs-option",
                  isSelected ? "selected" : "",
                  isTarget ? "correct" : "",
                  isWrong ? "wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={checked}
                key={option.id}
                onClick={() => selectOption(option.term)}
                type="button"
              >
                {option.term}
              </button>
            );
          })}
        </div>

        {checked && (
          <div
            className={`answer-feedback ${selectedTerm === challenge.term ? "correct" : "wrong"}`}
            role="status"
            aria-live="polite"
          >
            <span className="feedback-icon">
              <AppIcon name={selectedTerm === challenge.term ? "check" : "close"} size={20} />
            </span>
            <div>
              <strong>{selectedTerm === challenge.term ? "Correto!" : "Quase lá."}</strong>
              <p>
                {challenge.translation} = <b>{challenge.term}</b>
              </p>
            </div>
          </div>
        )}

        <div className="session-action">
          <PrimaryButton disabled={!checked} icon={<AppIcon name="chevron-right" />} onClick={advance}>
            {index === challenges.length - 1 ? "Ver resultado" : "Continuar"}
          </PrimaryButton>
        </div>
      </section>
    </GameShell>
  );
}

