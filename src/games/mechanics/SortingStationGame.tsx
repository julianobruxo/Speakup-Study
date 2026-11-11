import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent,
  type TouchEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { playSound } from "../../services/audio/sound";
import { getBodyEntries, toSortingChallenge } from "../adapters/bodyVocabularyAdapter";
import { VisualAsset } from "../assets/visualResolver";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import type { SortingChallenge } from "../core/challengeTypes";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";

const roundSize = ROUND_SIZES.sorting_station.count;
const panelSize = 6;

type Assignments = Record<string, string>;

interface DragState {
  wordId: string;
  pointerId: number;
  x: number;
  y: number;
  originTargetId: string | null;
  hoverTargetId: string | null;
}

function buildChallenges(seed: number): SortingChallenge[] {
  const entries = getBodyEntries();
  return selectChallenges(entries, roundSize, seed).map((entry) => toSortingChallenge(entry));
}

function chunkPanels(challenges: SortingChallenge[]): SortingChallenge[][] {
  return [challenges.slice(0, panelSize), challenges.slice(panelSize, panelSize * 2)];
}

function findAssignedTarget(assignments: Assignments, wordId: string): string | null {
  return Object.entries(assignments).find(([, assignedWordId]) => assignedWordId === wordId)?.[0] ?? null;
}

function placeWord(assignments: Assignments, wordId: string, targetId: string): Assignments {
  const next = { ...assignments };
  const originTargetId = findAssignedTarget(next, wordId);
  const displacedWordId = next[targetId];

  if (originTargetId) {
    delete next[originTargetId];
  }

  if (displacedWordId && originTargetId && originTargetId !== targetId) {
    next[originTargetId] = displacedWordId;
  }

  next[targetId] = wordId;
  return next;
}

export default function SortingStationGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(() => buildChallenges(seed), [seed]);
  const panels = useMemo(() => chunkPanels(challenges), [challenges]);
  const [panelIndex, setPanelIndex] = useState(0);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [checked, setChecked] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("sorting_station"));
  const [finished, setFinished] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const targetRefs = useRef(new Map<string, HTMLElement>());
  const suppressClickRef = useRef<string | null>(null);
  const { complete, resetSession } = useGameCompletion("sorting_station", "vocabulary");

  const panel = useMemo(() => panels[panelIndex] ?? [], [panelIndex, panels]);
  const totalPanels = panels.filter((items) => items.length > 0).length;
  const completedPanels = panelIndex + (checked ? 1 : 0);
  const allSlotsFilled = panel.length > 0 && panel.every((challenge) => assignments[challenge.targetId]);

  const getTargetAtPoint = useCallback((x: number, y: number): string | null => {
    for (const [targetId, element] of targetRefs.current) {
      const rect = element.getBoundingClientRect();
      const expanded = 18;
      if (
        x >= rect.left - expanded &&
        x <= rect.right + expanded &&
        y >= rect.top - expanded &&
        y <= rect.bottom + expanded
      ) {
        return targetId;
      }
    }
    return null;
  }, []);

  const wordById = useCallback(
    (wordId: string): SortingChallenge | undefined => panel.find((challenge) => challenge.targetId === wordId),
    [panel],
  );

  const targetById = useCallback(
    (targetId: string): SortingChallenge | undefined => panel.find((challenge) => challenge.targetId === targetId),
    [panel],
  );

  const assignWordToTarget = useCallback(
    (wordId: string, targetId: string) => {
      if (checked) return;
      const word = wordById(wordId);
      const target = targetById(targetId);
      if (!word || !target) return;
      setAssignments((current) => placeWord(current, wordId, targetId));
      setSelectedWordId(null);
      setLiveMessage(`${word.term} posicionada em ${target.translation}.`);
      playSound("select");
    },
    [checked, targetById, wordById],
  );

  useEffect(() => {
    if (!dragging) return;
    const activeDrag: DragState = dragging;
    if (activeDrag.pointerId >= 0) {
      function handlePointerMove(event: globalThis.PointerEvent) {
        if (event.pointerId !== activeDrag.pointerId) return;
        event.preventDefault();
        const hoverTargetId = getTargetAtPoint(event.clientX, event.clientY);
        if (event.clientY < 70) window.scrollBy({ top: -18, behavior: "auto" });
        if (event.clientY > window.innerHeight - 70) window.scrollBy({ top: 18, behavior: "auto" });
        setDragging((current) =>
          current
            ? {
                ...current,
                x: event.clientX,
                y: event.clientY,
                hoverTargetId,
              }
            : null,
        );
      }
      function handlePointerUp(event: globalThis.PointerEvent) {
        if (event.pointerId !== activeDrag.pointerId) return;
        event.preventDefault();
        setDragging((current) => {
          if (!current) return null;
          const dropTargetId = getTargetAtPoint(event.clientX, event.clientY);
          if (dropTargetId) {
            assignWordToTarget(current.wordId, dropTargetId);
          } else {
            const word = wordById(current.wordId);
            if (word) setLiveMessage(`${word.term} voltou para a origem.`);
          }
          suppressClickRef.current = current.wordId;
          return null;
        });
      }
      document.addEventListener("pointermove", handlePointerMove, { passive: false });
      document.addEventListener("pointerup", handlePointerUp, { passive: false });
      document.addEventListener("pointercancel", handlePointerUp, { passive: false });
      return () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointercancel", handlePointerUp);
      };
    }
    if (activeDrag.pointerId === -2) {
      function handleTouchMove(event: globalThis.TouchEvent) {
        const touch = event.changedTouches[0];
        if (!touch) return;
        event.preventDefault();
        const hoverTargetId = getTargetAtPoint(touch.clientX, touch.clientY);
        if (touch.clientY < 70) window.scrollBy({ top: -18, behavior: "auto" });
        if (touch.clientY > window.innerHeight - 70) window.scrollBy({ top: 18, behavior: "auto" });
        setDragging((current) =>
          current
            ? {
                ...current,
                x: touch.clientX,
                y: touch.clientY,
                hoverTargetId,
              }
            : null,
        );
      }
      function handleTouchEnd(event: globalThis.TouchEvent) {
        const touch = event.changedTouches[0];
        const clientX = touch?.clientX ?? activeDrag.x;
        const clientY = touch?.clientY ?? activeDrag.y;
        event.preventDefault();
        setDragging((current) => {
          if (!current) return null;
          const dropTargetId = getTargetAtPoint(clientX, clientY);
          if (dropTargetId) {
            assignWordToTarget(current.wordId, dropTargetId);
          } else {
            const word = wordById(current.wordId);
            if (word) setLiveMessage(`${word.term} voltou para a origem.`);
          }
          suppressClickRef.current = current.wordId;
          return null;
        });
      }
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd, { passive: false });
      document.addEventListener("touchcancel", handleTouchEnd, { passive: false });
      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("touchcancel", handleTouchEnd);
      };
    }
    function handleMouseMove(event: globalThis.MouseEvent) {
      event.preventDefault();
      const hoverTargetId = getTargetAtPoint(event.clientX, event.clientY);
      if (event.clientY < 70) window.scrollBy({ top: -18, behavior: "auto" });
      if (event.clientY > window.innerHeight - 70) window.scrollBy({ top: 18, behavior: "auto" });
      setDragging((current) =>
        current
          ? {
              ...current,
              x: event.clientX,
              y: event.clientY,
              hoverTargetId,
            }
          : null,
      );
    }
    function handleMouseUp(event: globalThis.MouseEvent) {
      event.preventDefault();
      setDragging((current) => {
        if (!current) return null;
        const dropTargetId = getTargetAtPoint(event.clientX, event.clientY);
        if (dropTargetId) {
          assignWordToTarget(current.wordId, dropTargetId);
        } else {
          const word = wordById(current.wordId);
          if (word) setLiveMessage(`${word.term} voltou para a origem.`);
        }
        suppressClickRef.current = current.wordId;
        return null;
      });
    }
    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp, { passive: false });
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, assignWordToTarget, getTargetAtPoint, wordById]);

  if (panel.length === 0 && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Cada coisa no seu lugar">
        <p className="game-empty-state">Não há itens suficientes para esta rodada no momento.</p>
      </GameShell>
    );
  }

  function setTargetRef(targetId: string, node: HTMLElement | null) {
    if (node) {
      targetRefs.current.set(targetId, node);
    } else {
      targetRefs.current.delete(targetId);
    }
  }

  function selectWord(wordId: string) {
    if (checked) return;
    const word = wordById(wordId);
    setSelectedWordId((current) => (current === wordId ? null : wordId));
    if (word) setLiveMessage(`${word.term} selecionada. Escolha uma imagem.`);
  }

  function handleTargetActivate(targetId: string) {
    if (checked) return;
    const assignedWordId = assignments[targetId];
    if (selectedWordId) {
      assignWordToTarget(selectedWordId, targetId);
      return;
    }
    if (assignedWordId) {
      selectWord(assignedWordId);
    }
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, wordId: string) {
    if (checked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    setDragging({
      wordId,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originTargetId: findAssignedTarget(assignments, wordId),
      hoverTargetId: getTargetAtPoint(event.clientX, event.clientY),
    });
    setSelectedWordId(wordId);
  }

  function startMouseDrag(event: MouseEvent<HTMLButtonElement>, wordId: string) {
    if (checked) return;
    event.preventDefault();
    setDragging({
      wordId,
      pointerId: -1,
      x: event.clientX,
      y: event.clientY,
      originTargetId: findAssignedTarget(assignments, wordId),
      hoverTargetId: getTargetAtPoint(event.clientX, event.clientY),
    });
    setSelectedWordId(wordId);
  }

  function startTouchDrag(event: TouchEvent<HTMLButtonElement>, wordId: string) {
    if (checked) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    setDragging({
      wordId,
      pointerId: -2,
      x: touch.clientX,
      y: touch.clientY,
      originTargetId: findAssignedTarget(assignments, wordId),
      hoverTargetId: getTargetAtPoint(touch.clientX, touch.clientY),
    });
    setSelectedWordId(wordId);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!dragging || dragging.pointerId !== event.pointerId) return;
    event.preventDefault();
    const hoverTargetId = getTargetAtPoint(event.clientX, event.clientY);
    if (event.clientY < 70) window.scrollBy({ top: -18, behavior: "auto" });
    if (event.clientY > window.innerHeight - 70) window.scrollBy({ top: 18, behavior: "auto" });
    setDragging((current) =>
      current
        ? {
            ...current,
            x: event.clientX,
            y: event.clientY,
            hoverTargetId,
          }
        : null,
    );
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!dragging || dragging.pointerId !== event.pointerId) return;
    event.preventDefault();
    const dropTargetId = getTargetAtPoint(event.clientX, event.clientY);
    if (dropTargetId) {
      assignWordToTarget(dragging.wordId, dropTargetId);
    } else {
      const word = wordById(dragging.wordId);
      if (word) setLiveMessage(`${word.term} voltou para a origem.`);
    }
    suppressClickRef.current = dragging.wordId;
    setDragging(null);
  }

  function checkPanel() {
    if (!allSlotsFilled || checked) return;
    let nextState = roundState;
    for (const target of panel) {
      nextState = recordOutcome(nextState, target.id, assignments[target.targetId] === target.targetId);
    }
    setRoundState(nextState);
    setChecked(true);
    const correctCount = panel.filter((target) => assignments[target.targetId] === target.targetId).length;
    playSound(correctCount === panel.length ? "correct" : "wrong");
    setLiveMessage(`Painel conferido. ${correctCount} de ${panel.length} associações corretas.`);
  }

  function advancePanel() {
    if (panelIndex >= totalPanels - 1) {
      const result = finalizeRound(roundState);
      setFinished(true);
      void complete(result);
      return;
    }
    setPanelIndex((current) => current + 1);
    setAssignments({});
    setChecked(false);
    setSelectedWordId(null);
    setDragging(null);
    setLiveMessage(`Painel ${panelIndex + 2} de ${totalPanels}.`);
  }

  if (finished) {
    const result = finalizeRound(roundState);
    return (
      <GameResultScreen
        gameTitle="Cada coisa no seu lugar"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setPanelIndex(0);
          setAssignments({});
          setChecked(false);
          setSelectedWordId(null);
          setDragging(null);
          setRoundState(createRoundState("sorting_station"));
          setFinished(false);
        }}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  const assignedWordIds = new Set(Object.values(assignments));
  const bankWords = panel.filter((challenge) => !assignedWordIds.has(challenge.targetId));

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Cada coisa no seu lugar">
      <section className="session-meta">
        <span>
          Painel {panelIndex + 1} de {totalPanels}
        </span>
        <span>{ROUND_SIZES.sorting_station.label}</span>
      </section>
      <GameProgressBar current={completedPanels * panelSize} total={roundSize} />

      <section className="question-card sorting-station-card" ref={boardRef}>
        <div className="sorting-station-instructions">
          <span className="question-label">Associe palavra e imagem</span>
          <h1>Arraste cada palavra até a imagem correspondente.</h1>
        </div>

        <div className="sorting-station-board">
          <div className="sorting-word-bank" aria-label="Banco de palavras">
            <span className="sorting-panel-label">Palavras</span>
            <div className="sorting-word-list">
              {bankWords.map((word) => (
                <WordCard
                        dragging={dragging}
                        onMouseDown={startMouseDrag}
                        key={word.targetId}
                        onPointerDown={startDrag}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onSelect={selectWord}
                        suppressClickRef={suppressClickRef}
                        onTouchStart={startTouchDrag}
                        selected={selectedWordId === word.targetId}
                        word={word}
                      />
              ))}
            </div>
          </div>

          <div className="sorting-target-grid" aria-label="Imagens com espaços vazios">
            {panel.map((target) => {
              const assignedWordId = assignments[target.targetId];
              const assignedWord = assignedWordId ? wordById(assignedWordId) : undefined;
              const isCorrect = checked && assignedWordId === target.targetId;
              const isWrong = checked && Boolean(assignedWordId) && assignedWordId !== target.targetId;
              const isHover = dragging?.hoverTargetId === target.targetId;
              return (
                <article
                  className={[
                    "sorting-target",
                    isHover ? "drop-hover" : "",
                    isCorrect ? "correct" : "",
                    isWrong ? "wrong" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={target.targetId}
                >
                  <VisualAsset label={target.translation} visualKey={target.visualKey} />
                  <div
                    aria-label={`Slot da imagem ${target.translation}${assignedWord ? `, preenchido com ${assignedWord.term}` : ""}`}
                    aria-disabled={checked && isCorrect}
                    className="sorting-slot"
                    onClick={() => handleTargetActivate(target.targetId)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleTargetActivate(target.targetId);
                      }
                    }}
                    ref={(node) => setTargetRef(target.targetId, node)}
                    role="button"
                    tabIndex={checked && isCorrect ? -1 : 0}
                  >
                    {assignedWord ? (
                      <WordCard
                        dragging={dragging}
                        onMouseDown={startMouseDrag}
                        onPointerDown={startDrag}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onSelect={selectWord}
                        suppressClickRef={suppressClickRef}
                        onTouchStart={startTouchDrag}
                        selected={selectedWordId === assignedWord.targetId}
                        word={assignedWord}
                      />
                    ) : (
                      <span className="slot-placeholder">Solte aqui</span>
                    )}
                  </div>
                  {checked && (
                    <div className={`sorting-target-feedback ${isCorrect ? "correct" : "wrong"}`}>
                      <AppIcon name={isCorrect ? "check" : "close"} size={16} />
                      <span>
                        {isCorrect
                          ? "Correto"
                          : `Correta: ${target.term}`}
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <p className="sorting-live-message" aria-live="polite">
          {liveMessage}
        </p>

        {checked && (
          <div className="answer-feedback sorting-panel-feedback" role="status" aria-live="polite">
            <span className="feedback-icon">
              <AppIcon name="check" size={20} />
            </span>
            <div>
              <strong>Painel conferido</strong>
              <p>
                {panel.filter((target) => assignments[target.targetId] === target.targetId).length} de {panel.length}{" "}
                associações corretas.
              </p>
            </div>
          </div>
        )}

        <div className="session-action">
          {checked ? (
            <PrimaryButton icon={<AppIcon name="chevron-right" />} onClick={advancePanel}>
              {panelIndex >= totalPanels - 1 ? "Ver resultado" : "Próximo painel"}
            </PrimaryButton>
          ) : (
            <PrimaryButton disabled={!allSlotsFilled} icon={<AppIcon name="check" />} onClick={checkPanel}>
              Conferir respostas
            </PrimaryButton>
          )}
        </div>
      </section>
    </GameShell>
  );
}

function WordCard({
  dragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onTouchStart,
  onMouseDown,
  onSelect,
  selected,
  suppressClickRef,
  word,
}: {
  dragging: DragState | null;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>, wordId: string) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  onTouchStart: (event: TouchEvent<HTMLButtonElement>, wordId: string) => void;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>, wordId: string) => void;
  onSelect: (wordId: string) => void;
  selected: boolean;
  suppressClickRef: MutableRefObject<string | null>;
  word: SortingChallenge;
}) {
  const isDragging = dragging?.wordId === word.targetId;
  return (
    <button
      aria-pressed={selected}
      className={["sorting-word-card", selected ? "selected" : "", isDragging ? "dragging" : ""]
        .filter(Boolean)
        .join(" ")}
      data-word-id={word.targetId}
      onClick={(event) => {
        event.stopPropagation();
        if (suppressClickRef.current === word.targetId) {
          suppressClickRef.current = null;
          return;
        }
        onSelect(word.targetId);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(word.targetId);
        }
      }}
      onPointerCancel={onPointerUp}
      onPointerDown={(event) => onPointerDown(event, word.targetId)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onTouchStart={(event) => onTouchStart(event, word.targetId)}
      onMouseDown={(event) => onMouseDown(event, word.targetId)}
      style={
        isDragging
          ? {
              left: dragging.x,
              top: dragging.y,
            }
          : undefined
      }
      type="button"
    >
      {word.term}
    </button>
  );
}

