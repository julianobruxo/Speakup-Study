import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { playSound } from "../../services/audio/sound";
import {
  BODY_GROUPS,
  getBodyEntries,
  getBodyGroupId,
  toSortingChallenge,
} from "../adapters/bodyVocabularyAdapter";
import { VisualAsset } from "../assets/visualResolver";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import type { SortingChallenge } from "../core/challengeTypes";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { useGameCompletion } from "../core/useGameCompletion";

const roundSize = ROUND_SIZES.sorting_station.count;
const groupSize = roundSize / BODY_GROUPS.length;

type Assignments = Record<string, string>;

interface DragState {
  wordId: string;
  pointerId: number;
  x: number;
  y: number;
  originTargetId: string | null;
  hoverTargetId: string | null;
}

interface SortingPanel {
  id: string;
  label: string;
  challenges: SortingChallenge[];
}

function buildPanels(seed: number): SortingPanel[] {
  const entries = getBodyEntries();
  return BODY_GROUPS.map((group, index) => ({
    ...group,
    challenges: selectChallenges(
      entries.filter((entry) => getBodyGroupId(entry) === group.id),
      groupSize,
      seed + index * 211,
    ).map((entry) => toSortingChallenge(entry)),
  }));
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
  const panels = useMemo(() => buildPanels(seed), [seed]);
  const [panelIndex, setPanelIndex] = useState(0);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [checked, setChecked] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("sorting_station"));
  const [finished, setFinished] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<DragState | null>(null);
  const targetRefs = useRef(new Map<string, HTMLElement>());
  const suppressClickRef = useRef<string | null>(null);
  const { complete, completionError, resetSession, retryCompletion } = useGameCompletion("sorting_station", "vocabulary");

  const panelConfig = panels[panelIndex];
  const panel = useMemo(() => panelConfig?.challenges ?? [], [panelConfig]);
  const panelRef = useRef(panel);
  const checkedRef = useRef(checked);
  panelRef.current = panel;
  checkedRef.current = checked;
  const totalPanels = panels.filter((item) => item.challenges.length > 0).length;
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
    (wordId: string): SortingChallenge | undefined =>
      panelRef.current.find((challenge) => challenge.targetId === wordId),
    [],
  );

  const targetById = useCallback(
    (targetId: string): SortingChallenge | undefined =>
      panelRef.current.find((challenge) => challenge.targetId === targetId),
    [],
  );

  const assignWordToTarget = useCallback(
    (wordId: string, targetId: string) => {
      if (checkedRef.current) return;
      const word = wordById(wordId);
      const target = targetById(targetId);
      if (!word || !target) return;
      setAssignments((current) => placeWord(current, wordId, targetId));
      setSelectedWordId(null);
      setLiveMessage(`${word.term} posicionada em ${target.translation}.`);
      playSound("select");
    },
    [targetById, wordById],
  );

  useEffect(() => {
    function handlePointerMove(event: globalThis.PointerEvent) {
      const activeDrag = draggingRef.current;
      if (!activeDrag) return;
      if (event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      const hoverTargetId = getTargetAtPoint(event.clientX, event.clientY);
      if (event.clientY < 70) window.scrollBy({ top: -18, behavior: "auto" });
      if (event.clientY > window.innerHeight - 70) window.scrollBy({ top: 18, behavior: "auto" });
      const nextDrag = {
        ...activeDrag,
        x: event.clientX,
        y: event.clientY,
        hoverTargetId,
      };
      draggingRef.current = nextDrag;
      setDragging(nextDrag);
    }
    function handlePointerUp(event: globalThis.PointerEvent) {
      const activeDrag = draggingRef.current;
      if (!activeDrag) return;
      if (event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      draggingRef.current = null;
      setDragging(null);
      suppressClickRef.current = activeDrag.wordId;
      const dropTargetId = getTargetAtPoint(event.clientX, event.clientY);
      if (dropTargetId) {
        assignWordToTarget(activeDrag.wordId, dropTargetId);
      } else {
        const word = wordById(activeDrag.wordId);
        if (word) setLiveMessage(`${word.term} voltou para a origem.`);
      }
    }
    function handlePointerCancel(event: globalThis.PointerEvent) {
      const activeDrag = draggingRef.current;
      if (!activeDrag) return;
      if (event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      draggingRef.current = null;
      setDragging(null);
      suppressClickRef.current = activeDrag.wordId;
      const word = wordById(activeDrag.wordId);
      if (word) setLiveMessage(`${word.term} voltou para a origem.`);
    }
    document.addEventListener("pointermove", handlePointerMove, { passive: false });
    document.addEventListener("pointerup", handlePointerUp, { passive: false });
    document.addEventListener("pointercancel", handlePointerCancel, { passive: false });
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [assignWordToTarget, getTargetAtPoint, wordById]);

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
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic and already-cancelled pointers may not support capture.
    }
    event.preventDefault();
    const nextDrag = {
      wordId,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originTargetId: findAssignedTarget(assignments, wordId),
      hoverTargetId: getTargetAtPoint(event.clientX, event.clientY),
    };
    draggingRef.current = nextDrag;
    setDragging(nextDrag);
    setSelectedWordId(wordId);
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
    setLiveMessage(`Grupo conferido. ${correctCount} de ${panel.length} associações corretas.`);
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
    draggingRef.current = null;
    setDragging(null);
    setLiveMessage(`Grupo ${panelIndex + 2} de ${totalPanels}.`);
  }

  if (finished) {
    const result = finalizeRound(roundState);
    return (
      <GameResultScreen
        completionError={completionError}
        gameTitle="Cada coisa no seu lugar"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onRetryPersistence={retryCompletion}
        onPlayAgain={() => {
          resetSession();
          setSeed(Date.now());
          setPanelIndex(0);
          setAssignments({});
          setChecked(false);
          setSelectedWordId(null);
          draggingRef.current = null;
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
  const panelCorrectCount = panel.filter(
    (target) => assignments[target.targetId] === target.targetId,
  ).length;

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Cada coisa no seu lugar">
      <section className="session-meta">
        <span>
          Grupo {panelIndex + 1} de {totalPanels} · {panelConfig?.label}
        </span>
        <span>{ROUND_SIZES.sorting_station.label}</span>
      </section>
      <GameProgressBar current={completedPanels * groupSize} total={roundSize} />

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
                        key={word.targetId}
                        onPointerDown={startDrag}
                        onSelect={selectWord}
                        suppressClickRef={suppressClickRef}
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
                  <button
                    aria-label={`Slot da imagem ${target.translation}${assignedWord ? `, preenchido com ${assignedWord.term}` : ""}`}
                    className="sorting-target-choice"
                    disabled={checked}
                    onClick={() => handleTargetActivate(target.targetId)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleTargetActivate(target.targetId);
                      }
                    }}
                    type="button"
                  >
                    <VisualAsset label={target.translation} visualKey={target.visualKey} />
                  </button>
                  <div
                    className="sorting-slot"
                    ref={(node) => setTargetRef(target.targetId, node)}
                  >
                    {assignedWord ? (
                      <WordCard
                        dragging={dragging}
                        onPointerDown={startDrag}
                        onSelect={selectWord}
                        suppressClickRef={suppressClickRef}
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
          <div
            className={`answer-feedback sorting-panel-feedback ${
              panelCorrectCount === panel.length ? "correct" : "wrong"
            }`}
            role="status"
            aria-live="polite"
          >
            <span className="feedback-icon">
              <AppIcon name={panelCorrectCount === panel.length ? "check" : "close"} size={20} />
            </span>
            <div>
              <strong>Grupo conferido</strong>
              <p>
                {panelCorrectCount} de {panel.length}{" "}
                associações corretas.
              </p>
            </div>
          </div>
        )}

        <div className="session-action">
          {checked ? (
            <PrimaryButton icon={<AppIcon name="chevron-right" />} onClick={advancePanel}>
              {panelIndex >= totalPanels - 1 ? "Ver resultado" : "Próximo grupo"}
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
  onSelect,
  selected,
  suppressClickRef,
  word,
}: {
  dragging: DragState | null;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>, wordId: string) => void;
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
      onPointerDown={(event) => onPointerDown(event, word.targetId)}
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
