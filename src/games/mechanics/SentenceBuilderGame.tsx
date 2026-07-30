import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { getSentenceBuilderQuestions, toSentenceBuilderChallenge } from "../adapters/presentTobeAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { shuffleWithSeed } from "../core/shuffle";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import type { SentenceBuilderChallenge } from "../core/challengeTypes";

const roundSize = ROUND_SIZES.sentence_builder.count;

function buildChallenges(seed: number): SentenceBuilderChallenge[] {
  const questions = getSentenceBuilderQuestions();
  const selected = selectChallenges(questions, roundSize, seed);
  return selected
    .map((question) => toSentenceBuilderChallenge(question))
    .filter((challenge): challenge is SentenceBuilderChallenge => challenge !== null);
}

export default function SentenceBuilderGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(() => buildChallenges(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [bank, setBank] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("sentence_builder"));
  const [finished, setFinished] = useState(false);
  const { complete, completionError, resetSession, retryCompletion } = useGameCompletion("sentence_builder", "grammar");

  const challenge = challenges[index];

  useEffect(() => {
    if (!challenge) return;
    setBank(shuffleWithSeed(challenge.tokens, seed + index * 31));
    setPlaced([]);
    setChecked(false);
    setIsCorrect(false);
  }, [challenge, index, seed]);

  if (!challenge && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Monte a frase">
        <p className="game-empty-state">
          Não há frases suficientes disponíveis para esta rodada no momento.
        </p>
      </GameShell>
    );
  }

  function pickToken(token: string, fromBank: boolean) {
    if (checked) return;
    if (fromBank) {
      const position = bank.indexOf(token);
      if (position === -1) return;
      setBank((current) => current.filter((_, i) => i !== position));
      setPlaced((current) => [...current, token]);
    } else {
      const position = placed.indexOf(token);
      if (position === -1) return;
      setPlaced((current) => current.filter((_, i) => i !== position));
      setBank((current) => [...current, token]);
    }
  }

  function checkAnswer() {
    if (checked || !challenge) return;
    const correct = placed.join(" ") === challenge.correctOrder.join(" ");
    setChecked(true);
    setIsCorrect(correct);
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
        completionError={completionError}
        gameTitle="Monte a frase"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onRetryPersistence={retryCompletion}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setIndex(0);
          setRoundState(createRoundState("sentence_builder"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Monte a frase">
      <section className="session-meta">
        <span>
          Desafio {index + 1} de {challenges.length}
        </span>
      </section>
      <GameProgressBar current={index + (checked ? 1 : 0)} total={challenges.length} />

      <section className="question-card sentence-builder-card">
        <div className="question-prompt">
          <span className="question-label">Organize a frase</span>
        </div>

        <div
          aria-label="Frase montada"
          className={`sentence-builder-slot ${checked ? (isCorrect ? "correct" : "wrong") : ""}`}
        >
          {placed.length === 0 && <span className="sentence-builder-hint">Toque nas palavras abaixo</span>}
          {placed.map((token, position) => (
            <button
              className="sentence-token placed"
              disabled={checked}
              key={`${token}-${position}`}
              onClick={() => pickToken(token, false)}
              type="button"
            >
              {token}
            </button>
          ))}
        </div>

        <div aria-label="Banco de palavras" className="sentence-builder-bank">
          {bank.map((token, position) => (
            <button
              className="sentence-token"
              disabled={checked}
              key={`${token}-${position}`}
              onClick={() => pickToken(token, true)}
              type="button"
            >
              {token}
            </button>
          ))}
        </div>

        {checked && (
          <div className={`answer-feedback ${isCorrect ? "correct" : "wrong"}`} role="status" aria-live="polite">
            <span className="feedback-icon">
              <AppIcon name={isCorrect ? "check" : "close"} size={20} />
            </span>
            <div>
              <strong>{isCorrect ? "Correto!" : "Quase lá."}</strong>
              {!isCorrect && (
                <p>Resposta correta: {challenge.correctOrder.join(" ")}</p>
              )}
            </div>
          </div>
        )}

        <div className="session-action">
          {!checked ? (
            <PrimaryButton disabled={placed.length !== challenge.tokens.length} onClick={checkAnswer}>
              Confirmar frase
            </PrimaryButton>
          ) : (
            <PrimaryButton icon={<AppIcon name="chevron-right" />} onClick={advance}>
              {index === challenges.length - 1 ? "Ver resultado" : "Continuar"}
            </PrimaryButton>
          )}
        </div>
      </section>
    </GameShell>
  );
}
