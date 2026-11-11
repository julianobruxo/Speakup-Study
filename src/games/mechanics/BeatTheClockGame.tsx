import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { buildBeatTheClockChallenges } from "../adapters/beatTheClockAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { shuffleWithSeed } from "../core/shuffle";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import type { BeatTheClockChallenge } from "../core/challengeTypes";

const roundSize = ROUND_SIZES.beat_the_clock.count;
const SCORE_PER_SECOND_REMAINING = 2;

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function BeatTheClockGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(
    () => selectChallenges(buildBeatTheClockChallenges(seed), roundSize, seed),
    [seed],
  );
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [checked, setChecked] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("beat_the_clock"));
  const [finished, setFinished] = useState(false);
  const { complete, resetSession } = useGameCompletion("beat_the_clock", "grammar");
  const intervalRef = useRef<number | null>(null);

  const challenge: BeatTheClockChallenge | undefined = challenges[index];

  useEffect(() => {
    if (!challenge) return;
    setRemainingMs(challenge.timerMs);
    setChecked(false);
    setTimedOut(false);
    setTypedAnswer("");
    setSelectedOption(null);
    setSelectedTokenIndex(null);
    if (challenge.kind === "sentence_builder") {
      setBank(shuffleWithSeed(challenge.tokens, seed + index * 17));
      setPlaced([]);
    }
  }, [challenge, index, seed]);

  useEffect(() => {
    if (!challenge || checked) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setRemainingMs((current) => {
        if (current <= 100) {
          window.clearInterval(intervalRef.current!);
          setTimedOut(true);
          setChecked(true);
          return 0;
        }
        return current - 100;
      });
    }, 100);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [challenge, checked]);

  useEffect(() => {
    if (timedOut && challenge) {
      setRoundState((current) => recordOutcome(current, challenge.id, false));
    }
  }, [timedOut, challenge]);

  if (!challenge && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Contra o relógio">
        <p className="game-empty-state">Não há desafios suficientes para esta rodada no momento.</p>
      </GameShell>
    );
  }

  function registerResult(correct: boolean) {
    if (checked || !challenge) return;
    setChecked(true);
    setRoundState((current) => recordOutcome(current, challenge.id, correct));
    if (correct) {
      setScore((current) => current + Math.round(remainingMs / 1000) * SCORE_PER_SECOND_REMAINING + 10);
    }
  }

  function pickToken(token: string, fromBank: boolean) {
    if (checked || challenge?.kind !== "sentence_builder") return;
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

  function advance() {
    if (index === challenges.length - 1) {
      const result = finalizeRound(roundState, new Date().toISOString(), score);
      setFinished(true);
      void complete(result);
      return;
    }
    setIndex((current) => current + 1);
  }

  if (finished) {
    const result = finalizeRound(roundState, new Date().toISOString(), score);
    return (
      <GameResultScreen
        gameTitle="Contra o relógio"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setIndex(0);
          setScore(0);
          setRoundState(createRoundState("beat_the_clock"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  const timerPercentage = (remainingMs / challenge.timerMs) * 100;

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Contra o relógio">
      <section className="session-meta">
        <span>
          Desafio {index + 1} de {challenges.length} · Pontuação: {score}
        </span>
      </section>
      <GameProgressBar current={index + (checked ? 1 : 0)} total={challenges.length} />

      <div
        aria-label={`${Math.ceil(remainingMs / 1000)} segundos restantes`}
        className="beat-clock-timer"
        role="timer"
      >
        <i style={{ width: `${Math.max(0, timerPercentage)}%` }} />
      </div>

      <section className="question-card beat-clock-card">
        {challenge.kind === "word_challenge" && (
          <>
            <div className="question-prompt">
              <span className="question-label">Qual é a palavra?</span>
              <h1>{challenge.translation}</h1>
            </div>
            <div className="answer-options">
              {challenge.options.map((option) => {
                const isSelected = selectedOption === option;
                const isTarget = checked && option === challenge.correctOption;
                const isWrong = checked && isSelected && !isTarget;
                return (
                  <button
                    className={[isSelected ? "selected" : "", isTarget ? "correct" : "", isWrong ? "wrong" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={checked}
                    key={option}
                    onClick={() => {
                      setSelectedOption(option);
                      registerResult(option === challenge.correctOption);
                    }}
                    type="button"
                  >
                    <strong>{option}</strong>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {challenge.kind === "sentence_typing" && (
          <>
            <div className="question-prompt">
              <span className="question-label">Digite a frase completa</span>
              <h1>{challenge.prompt}</h1>
            </div>
            <input
              aria-label="Digite a frase completa"
              className="beat-clock-typing-input"
              disabled={checked}
              onChange={(event) => setTypedAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  registerResult(normalize(typedAnswer) === normalize(challenge.correctAnswer));
                }
              }}
              value={typedAnswer}
            />
            {!checked && (
              <PrimaryButton
                disabled={!typedAnswer.trim()}
                onClick={() => registerResult(normalize(typedAnswer) === normalize(challenge.correctAnswer))}
              >
                Confirmar
              </PrimaryButton>
            )}
          </>
        )}

        {challenge.kind === "sentence_builder" && (
          <>
            <div className="question-prompt">
              <span className="question-label">Desembaralhe a frase</span>
            </div>
            <div className="sentence-builder-slot">
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
            <div className="sentence-builder-bank">
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
            {!checked && (
              <PrimaryButton
                disabled={placed.length !== challenge.tokens.length}
                onClick={() => registerResult(placed.join(" ") === challenge.correctOrder.join(" "))}
              >
                Confirmar frase
              </PrimaryButton>
            )}
          </>
        )}

        {challenge.kind === "error_hunt" && (
          <>
            <div className="question-prompt">
              <span className="question-label">Toque na palavra errada</span>
            </div>
            <div className="error-hunt-sentence" role="group" aria-label="Frase com um erro">
              {challenge.displayTokens.map((token, tokenIndex) => {
                const isSelected = selectedTokenIndex === tokenIndex;
                const isTargetError = checked && tokenIndex === challenge.errorTokenIndex;
                const isWrong = checked && isSelected && !isTargetError;
                return (
                  <button
                    className={[
                      "error-hunt-token",
                      isSelected ? "selected" : "",
                      isTargetError ? "correct" : "",
                      isWrong ? "wrong" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={checked}
                    key={`${token}-${tokenIndex}`}
                    onClick={() => {
                      setSelectedTokenIndex(tokenIndex);
                      registerResult(tokenIndex === challenge.errorTokenIndex);
                    }}
                    type="button"
                  >
                    {token}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {checked && (
          <div className={`answer-feedback ${timedOut ? "wrong" : "correct"}`} role="status" aria-live="polite">
            <span className="feedback-icon">
              <AppIcon name={timedOut ? "close" : "check"} size={20} />
            </span>
            <div>
              <strong>{timedOut ? "Tempo esgotado!" : "Resposta registrada."}</strong>
              {timedOut && (
                <p>
                  Resposta correta:{" "}
                  {challenge.kind === "word_challenge" && challenge.correctOption}
                  {challenge.kind === "sentence_typing" && challenge.correctAnswer}
                  {challenge.kind === "sentence_builder" && challenge.correctOrder.join(" ")}
                  {challenge.kind === "error_hunt" && challenge.correctToken}
                </p>
              )}
            </div>
          </div>
        )}

        {checked && (
          <div className="session-action">
            <PrimaryButton icon={<AppIcon name="chevron-right" />} onClick={advance}>
              {index === challenges.length - 1 ? "Ver resultado" : "Próximo desafio"}
            </PrimaryButton>
          </div>
        )}
      </section>
    </GameShell>
  );
}

