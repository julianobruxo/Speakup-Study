import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { getBodyEntries, toSecretWordChallenge } from "../adapters/bodyVocabularyAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import type { SecretWordChallenge } from "../core/challengeTypes";

const roundSize = ROUND_SIZES.secret_word.count;
const MAX_MISTAKES = 5;
const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

function buildChallenges(seed: number): SecretWordChallenge[] {
  const entries = getBodyEntries();
  const selected = selectChallenges(entries, roundSize, seed);
  return selected.map((entry) => toSecretWordChallenge(entry));
}

function normalizedLetters(answer: string): string[] {
  return answer.toUpperCase().split("");
}

export default function SecretWordGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(() => buildChallenges(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wordFinished, setWordFinished] = useState(false);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("secret_word"));
  const [finished, setFinished] = useState(false);
  const { complete, resetSession } = useGameCompletion("secret_word", "vocabulary");

  const challenge = challenges[index];
  const letters = challenge ? normalizedLetters(challenge.answer) : [];
  const solved = letters.length > 0 && letters.every((letter) => letter === " " || letter === "-" || guessed.has(letter));

  useEffect(() => {
    setGuessed(new Set());
    setMistakes(0);
    setWordFinished(false);
  }, [challenge]);

  useEffect(() => {
    if (!challenge || wordFinished) return;
    if (solved) {
      setWordFinished(true);
      setRoundState((current) => recordOutcome(current, challenge.id, true));
    } else if (mistakes >= MAX_MISTAKES) {
      setWordFinished(true);
      setRoundState((current) => recordOutcome(current, challenge.id, false));
    }
  }, [challenge, mistakes, solved, wordFinished]);

  function guessLetter(letter: string) {
    if (!challenge || wordFinished || guessed.has(letter)) return;
    setGuessed((current) => new Set(current).add(letter));
    if (!letters.includes(letter)) {
      setMistakes((current) => current + 1);
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const letter = event.key.toUpperCase();
      if (letter.length === 1 && letter >= "A" && letter <= "Z") {
        guessLetter(letter);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge, wordFinished, guessed]);

  if (!challenge && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Palavra secreta">
        <p className="game-empty-state">Não há palavras suficientes para esta rodada no momento.</p>
      </GameShell>
    );
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
        gameTitle="Palavra secreta"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setIndex(0);
          setRoundState(createRoundState("secret_word"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Palavra secreta">
      <section className="session-meta">
        <span>
          Palavra {index + 1} de {challenges.length}
        </span>
      </section>
      <GameProgressBar current={index + (wordFinished ? 1 : 0)} total={challenges.length} />

      <section className="question-card secret-word-card">
        <div className="question-prompt">
          <span className="question-label">Pista</span>
          <h1>{challenge.clue}</h1>
        </div>

        <div className="secret-word-letters" aria-label="Palavra a descobrir">
          {letters.map((letter, letterIndex) => {
            const isSpacer = letter === " " || letter === "-";
            const revealed = isSpacer || guessed.has(letter) || wordFinished;
            return (
              <span
                className={`secret-word-letter ${isSpacer ? "spacer" : ""}`}
                key={letterIndex}
              >
                {revealed ? letter : ""}
              </span>
            );
          })}
        </div>

        <div className="secret-word-mistakes" aria-live="polite">
          Erros: {mistakes}/{MAX_MISTAKES}
        </div>

        {!wordFinished ? (
          <div className="secret-word-keyboard" role="group" aria-label="Teclado virtual">
            {KEYBOARD_ROWS.map((row) => (
              <div className="secret-word-row" key={row}>
                {row.split("").map((letter) => (
                  <button
                    className="secret-word-key"
                    disabled={guessed.has(letter)}
                    key={letter}
                    onClick={() => guessLetter(letter)}
                    type="button"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className={`answer-feedback ${solved ? "correct" : "wrong"}`} role="status" aria-live="polite">
            <span className="feedback-icon">
              <AppIcon name={solved ? "check" : "close"} size={20} />
            </span>
            <div>
              <strong>{solved ? "Correto!" : "A palavra era:"}</strong>
              {!solved && <p>{challenge.answer}</p>}
            </div>
          </div>
        )}

        <div className="session-action">
          <PrimaryButton disabled={!wordFinished} icon={<AppIcon name="chevron-right" />} onClick={advance}>
            {index === challenges.length - 1 ? "Ver resultado" : "Continuar"}
          </PrimaryButton>
        </div>
      </section>
    </GameShell>
  );
}
