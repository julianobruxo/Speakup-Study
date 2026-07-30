import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
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
const KEYBOARD_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface InteractiveCell {
  key: string;
  row: number;
  col: number;
  placementIds: string[];
}

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

function getPlacementCellKeys(placement: PlacedWord): string[] {
  return placement.challenge.answer.split("").map((_, index) => {
    const row = placement.direction === "down" ? placement.row + index : placement.row;
    const col = placement.direction === "across" ? placement.col + index : placement.col;
    return `${row},${col}`;
  });
}

function buildCells(placements: PlacedWord[]): Map<string, InteractiveCell> {
  const cells = new Map<string, InteractiveCell>();
  for (const placement of placements) {
    for (const key of getPlacementCellKeys(placement)) {
      const [row, col] = key.split(",").map(Number);
      const cell = cells.get(key) ?? {
        key,
        row,
        col,
        placementIds: [],
      };
      cell.placementIds.push(placement.challenge.id);
      cells.set(key, cell);
    }
  }
  return cells;
}

export default function CrosswordGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const grid = useMemo(() => generateCrossword(buildChallenges(seed)), [seed]);
  const cells = useMemo(() => buildCells(grid.placements), [grid.placements]);
  const [letters, setLetters] = useState<Record<string, string>>({});
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [activePlacementId, setActivePlacementId] = useState<string | null>(
    grid.placements[0]?.challenge.id ?? null,
  );
  const [activeCellKey, setActiveCellKey] = useState<string | null>(
    grid.placements[0] ? getPlacementCellKeys(grid.placements[0])[0] : null,
  );
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("crossword"));
  const [finished, setFinished] = useState(false);
  const cellRefs = useRef(new Map<string, HTMLInputElement>());
  const { complete, completionError, resetSession, retryCompletion } = useGameCompletion("crossword", "vocabulary");

  useEffect(() => {
    const firstPlacement = grid.placements[0];
    if (!firstPlacement) return;
    setActivePlacementId(firstPlacement.challenge.id);
    setActiveCellKey(getPlacementCellKeys(firstPlacement)[0]);
  }, [grid]);

  if (grid.placements.length === 0) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Cruzando palavras">
        <p className="game-empty-state">Não foi possível montar um tabuleiro válido no momento.</p>
      </GameShell>
    );
  }

  function setCellRef(key: string, node: HTMLInputElement | null) {
    if (node) cellRefs.current.set(key, node);
    else cellRefs.current.delete(key);
  }

  function focusCell(key: string) {
    setActiveCellKey(key);
    window.requestAnimationFrame(() => cellRefs.current.get(key)?.focus());
  }

  function activatePlacement(placement: PlacedWord, preferredKey?: string) {
    const keys = getPlacementCellKeys(placement);
    const nextKey = preferredKey ?? keys.find((key) => !letters[key]) ?? keys[0];
    setActivePlacementId(placement.challenge.id);
    focusCell(nextKey);
  }

  function getActivePlacement(): PlacedWord {
    return (
      grid.placements.find((placement) => placement.challenge.id === activePlacementId) ??
      grid.placements[0]
    );
  }

  function writeLetter(
    letter: string,
    placement = getActivePlacement(),
    preferredCellKey = activeCellKey,
  ) {
    const keys = getPlacementCellKeys(placement);
    const currentIndex = Math.max(0, keys.indexOf(preferredCellKey ?? ""));
    const currentKey = keys[currentIndex];
    const normalized = letter.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    if (!normalized) return;
    setLetters((current) => ({ ...current, [currentKey]: normalized }));
    const nextKey = keys.slice(currentIndex + 1).find((key) => !letters[key]);
    if (nextKey) focusCell(nextKey);
  }

  function eraseLetter() {
    const placement = getActivePlacement();
    const keys = getPlacementCellKeys(placement);
    const currentIndex = Math.max(0, keys.indexOf(activeCellKey ?? ""));
    const currentKey = keys[currentIndex];
    if (letters[currentKey]) {
      setLetters((current) => ({ ...current, [currentKey]: "" }));
      return;
    }
    const previousKey = keys[Math.max(0, currentIndex - 1)];
    setLetters((current) => ({ ...current, [previousKey]: "" }));
    focusCell(previousKey);
  }

  function readPlacement(placement: PlacedWord): string {
    return getPlacementCellKeys(placement)
      .map((key) => letters[key] ?? "")
      .join("");
  }

  function checkWord(placement: PlacedWord) {
    if (checkedIds.has(placement.challenge.id)) return;
    const correct = readPlacement(placement) === placement.challenge.answer.toUpperCase();
    setCheckedIds((current) => new Set(current).add(placement.challenge.id));
    setResults((current) => ({ ...current, [placement.challenge.id]: correct }));
    setRoundState((current) => recordOutcome(current, placement.challenge.id, correct));
  }

  function handleCellFocus(cell: InteractiveCell) {
    const activeStillOwnsCell = cell.placementIds.includes(activePlacementId ?? "");
    const placementId = activeStillOwnsCell ? activePlacementId : cell.placementIds[0];
    setActivePlacementId(placementId);
    setActiveCellKey(cell.key);
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLInputElement>, cell: InteractiveCell) {
    const placement =
      grid.placements.find((item) => item.challenge.id === activePlacementId) ??
      grid.placements.find((item) => cell.placementIds.includes(item.challenge.id))!;
    const keys = getPlacementCellKeys(placement);
    const index = keys.indexOf(cell.key);
    if (event.key === "Backspace") {
      event.preventDefault();
      eraseLetter();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusCell(keys[Math.max(0, index - 1)]);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusCell(keys[Math.min(keys.length - 1, index + 1)]);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (keys.every((key) => letters[key])) checkWord(placement);
    }
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
        completionError={completionError}
        gameTitle="Cruzando palavras"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onRetryPersistence={retryCompletion}
        onPlayAgain={() => {
          resetSession();
          const nextSeed = Date.now();
          setSeed(nextSeed);
          setLetters({});
          setCheckedIds(new Set());
          setResults({});
          setActivePlacementId(null);
          setActiveCellKey(null);
          setRoundState(createRoundState("crossword"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  const activePlacement = getActivePlacement();

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Cruzando palavras">
      <section className="session-meta">
        <span>
          {checkedIds.size} de {grid.placements.length} palavras verificadas
        </span>
        <span>{ROUND_SIZES.crossword.label}</span>
      </section>

      <section className="question-card crossword-game-card">
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
              const key = `${row},${col}`;
              const cell = cells.get(key);
              const active = cell?.placementIds.includes(activePlacement.challenge.id);
              return cell ? (
                <div
                  className={`crossword-cell filled ${active ? "active" : ""}`}
                  key={key}
                  role="gridcell"
                >
                  <input
                    aria-describedby={cell.placementIds
                      .map((id) => `crossword-clue-${id}`)
                      .join(" ")}
                    aria-label={`Linha ${row + 1}, coluna ${col + 1}`}
                    autoCapitalize="characters"
                    autoComplete="off"
                    inputMode="text"
                    maxLength={1}
                    onChange={(event) => {
                      const placement =
                        grid.placements.find(
                          (item) => item.challenge.id === activePlacementId,
                        ) ??
                        grid.placements.find((item) =>
                          cell.placementIds.includes(item.challenge.id),
                        )!;
                      handleCellFocus(cell);
                      writeLetter(event.target.value, placement, cell.key);
                    }}
                    onFocus={() => handleCellFocus(cell)}
                    onKeyDown={(event) => handleCellKeyDown(event, cell)}
                    ref={(node) => setCellRef(key, node)}
                    spellCheck={false}
                    value={letters[key] ?? ""}
                  />
                </div>
              ) : (
                <div aria-hidden="true" className="crossword-cell empty" key={key} />
              );
            }),
          )}
        </div>

        <div className="crossword-keyboard" role="group" aria-label="Teclado virtual">
          {KEYBOARD_LETTERS.split("").map((letter) => (
            <button
              aria-label={`Letra ${letter}`}
              key={letter}
              onClick={() => writeLetter(letter)}
              type="button"
            >
              {letter}
            </button>
          ))}
          <button className="crossword-delete-key" onClick={eraseLetter} type="button">
            Apagar
          </button>
        </div>

        <ol className="crossword-clue-list">
          {grid.placements.map((placement, clueIndex) => {
            const isChecked = checkedIds.has(placement.challenge.id);
            const isCorrect = results[placement.challenge.id] === true;
            const cellKeys = getPlacementCellKeys(placement);
            const complete = cellKeys.every((key) => letters[key]);
            return (
              <li
                className={`crossword-clue ${
                  activePlacementId === placement.challenge.id ? "active" : ""
                }`}
                id={`crossword-clue-${placement.challenge.id}`}
                key={placement.challenge.id}
              >
                <button
                  className="crossword-clue-select"
                  onClick={() => activatePlacement(placement)}
                  type="button"
                >
                  <span>{clueIndex + 1}</span>
                  <span className="crossword-clue-text">
                    {placement.direction === "across" ? "Horizontal" : "Vertical"} ·{" "}
                    {placement.challenge.clue}
                  </span>
                </button>
                <button
                  className="crossword-check-word"
                  disabled={isChecked || !complete}
                  onClick={() => checkWord(placement)}
                  type="button"
                >
                  Verificar
                </button>
                {isChecked && (
                  <span
                    className={`crossword-result ${isCorrect ? "correct" : "wrong"}`}
                    role="status"
                  >
                    <AppIcon name={isCorrect ? "check" : "close"} size={15} />
                    {isCorrect ? "Correto!" : `Resposta: ${placement.challenge.answer}`}
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
      </section>
    </GameShell>
  );
}
