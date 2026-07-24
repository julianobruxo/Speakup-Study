import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components/AppShell";
import { getBodyEntries } from "../adapters/bodyVocabularyAdapter";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";
import { GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import { generateCrossword, type PlacedWord } from "./crosswordGenerator";
import type { CrosswordEntryChallenge } from "../core/challengeTypes";

const roundSize = ROUND_SIZES.crossword.count;

function buildChallenges(seed: number): CrosswordEntryChallenge[] {
  const entries = getBodyEntries();
  const selected = selectChallenges(entries, roundSize, seed);
  return selected.map((entry) => ({
    kind: "crossword_entry",
    id: `crossword_entry:${entry.id}`,
    sourceEntryId: entry.id,
    answer: entry.term,
    clue: entry.translation,
  }));
}

export default function CrosswordGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const grid = useMemo(() => generateCrossword(buildChallenges(seed)), [seed]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("crossword"));
  const [finished, setFinished] = useState(false);
  const { complete, resetSession } = useGameCompletion("crossword", "vocabulary");

  if (grid.placements.length === 0) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Cruzando palavras">
        <p className="game-empty-state">Não foi possível montar um tabuleiro válido no momento.</p>
      </GameShell>
    );
  }

  const cellLetters = new Map<string, string>();
  for (const placement of grid.placements) {
    const word = placement.challenge.answer.toUpperCase();
    for (let i = 0; i < word.length; i += 1) {
      const r = placement.direction === "down" ? placement.row + i : placement.row;
      const c = placement.direction === "across" ? placement.col + i : placement.col;
      cellLetters.set(`${r},${c}`, word[i]);
    }
  }

  function checkWord(placement: PlacedWord) {
    if (checkedIds.has(placement.challenge.id)) return;
    const value = (answers[placement.challenge.id] ?? "").trim().toUpperCase();
    const correct = value === placement.challenge.answer.toUpperCase();
    setCheckedIds((current) => new Set(current).add(placement.challenge.id));
    setRoundState((current) => recordOutcome(current, placement.challenge.id, correct));
  }

  const allChecked = checkedIds.size === grid.placements.length;

  function finishRound() {
    const result = finalizeRound(roundState);
    setFinished(true);
    void complete(result);
  }

  if (finished) {
    const result = finalizeRound(roundState);
    return (
      <GameResultScreen
        gameTitle="Cruzando palavras"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setAnswers({});
          setCheckedIds(new Set());
          setRoundState(createRoundState("crossword"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Cruzando palavras">
      <section className="session-meta">
        <span>
          {checkedIds.size} de {grid.placements.length} palavras verificadas
        </span>
      </section>

      <div
        className="crossword-grid"
        role="grid"
        aria-label="Tabuleiro de palavras cruzadas"
        style={{
          gridTemplateColumns: `repeat(${grid.width}, 1fr)`,
          gridTemplateRows: `repeat(${grid.height}, 1fr)`,
        }}
      >
        {Array.from({ length: grid.height }).map((_, row) =>
          Array.from({ length: grid.width }).map((_, col) => {
            const letter = cellLetters.get(`${row},${col}`);
            return (
              <div
                className={`crossword-cell ${letter ? "filled" : "empty"}`}
                key={`${row}-${col}`}
              >
                {letter ?? ""}
              </div>
            );
          }),
        )}
      </div>

      <ol className="crossword-clue-list">
        {grid.placements.map((placement) => {
          const isChecked = checkedIds.has(placement.challenge.id);
          const isCorrect = isChecked && (answers[placement.challenge.id] ?? "").trim().toUpperCase() === placement.challenge.answer.toUpperCase();
          return (
            <li className="crossword-clue" key={placement.challenge.id}>
              <span className="crossword-clue-text">
                {placement.direction === "across" ? "Horizontal" : "Vertical"}: {placement.challenge.clue}
              </span>
              <div className="crossword-clue-input">
                <input
                  disabled={isChecked}
                  maxLength={placement.challenge.answer.length}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, [placement.challenge.id]: event.target.value }))
                  }
                  placeholder={`${placement.challenge.answer.length} letras`}
                  value={answers[placement.challenge.id] ?? ""}
                />
                <button disabled={isChecked} onClick={() => checkWord(placement)} type="button">
                  Verificar
                </button>
              </div>
              {isChecked && (
                <span className={isCorrect ? "crossword-result correct" : "crossword-result wrong"}>
                  {isCorrect ? "Correto!" : placement.challenge.answer}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {allChecked && (
        <div className="session-action">
          <PrimaryButton onClick={finishRound}>Ver resultado</PrimaryButton>
        </div>
      )}
    </GameShell>
  );
}
