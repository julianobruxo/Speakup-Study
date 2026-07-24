import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { getErrorHuntQuestions, toErrorHuntChallenge } from "../adapters/presentTobeAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import type { ErrorHuntChallenge } from "../core/challengeTypes";

const roundSize = ROUND_SIZES.error_hunt.count;

function buildChallenges(seed: number): ErrorHuntChallenge[] {
  const questions = getErrorHuntQuestions();
  const selected = selectChallenges(questions, roundSize, seed);
  return selected
    .map((question) => toErrorHuntChallenge(question))
    .filter((challenge): challenge is ErrorHuntChallenge => challenge !== null);
}

export default function ErrorHuntGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(() => buildChallenges(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("error_hunt"));
  const [finished, setFinished] = useState(false);
  const { complete, resetSession } = useGameCompletion("error_hunt", "grammar");

  const challenge = challenges[index];

  useEffect(() => {
    setSelectedTokenIndex(null);
    setChecked(false);
  }, [challenge]);

  if (!challenge && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Caça ao erro">
        <p className="game-empty-state">
          Não há frases suficientes disponíveis para esta rodada no momento.
        </p>
      </GameShell>
    );
  }

  const isCorrect = checked && selectedTokenIndex === challenge?.errorTokenIndex;

  function selectToken(tokenIndex: number) {
    if (checked || !challenge) return;
    setSelectedTokenIndex(tokenIndex);
    setChecked(true);
    const correct = tokenIndex === challenge.errorTokenIndex;
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
        gameTitle="Caça ao erro"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setIndex(0);
          setRoundState(createRoundState("error_hunt"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Caça ao erro">
      <section className="session-meta">
        <span>
          Desafio {index + 1} de {challenges.length}
        </span>
      </section>
      <GameProgressBar current={index + (checked ? 1 : 0)} total={challenges.length} />

      <section className="question-card error-hunt-card">
        <div className="question-prompt">
          <span className="question-label">Toque na palavra errada</span>
        </div>

        <div className="error-hunt-sentence" role="group" aria-label="Frase com um erro">
          {challenge.displayTokens.map((token, tokenIndex) => {
            const isSelected = selectedTokenIndex === tokenIndex;
            const isTargetError = checked && tokenIndex === challenge.errorTokenIndex;
            const isWrongPick = checked && isSelected && !isTargetError;
            return (
              <button
                className={[
                  "error-hunt-token",
                  isSelected ? "selected" : "",
                  isTargetError ? "correct" : "",
                  isWrongPick ? "wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={checked}
                key={`${token}-${tokenIndex}`}
                onClick={() => selectToken(tokenIndex)}
                type="button"
              >
                {token}
              </button>
            );
          })}
        </div>

        {checked && (
          <div className={`answer-feedback ${isCorrect ? "correct" : "wrong"}`} role="status" aria-live="polite">
            <span className="feedback-icon">
              <AppIcon name={isCorrect ? "check" : "close"} size={20} />
            </span>
            <div>
              <strong>{isCorrect ? "Correto!" : "Quase lá."}</strong>
              <p>
                A palavra certa é <b>{challenge.correctToken}</b>.
              </p>
            </div>
          </div>
        )}

        <div className="session-action">
          <PrimaryButton
            disabled={!checked}
            icon={<AppIcon name="chevron-right" />}
            onClick={advance}
          >
            {index === challenges.length - 1 ? "Ver resultado" : "Continuar"}
          </PrimaryButton>
        </div>
      </section>
    </GameShell>
  );
}
