import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../components/AppIcon";
import { PrimaryButton } from "../../components/AppShell";
import { playSound } from "../../services/audio/sound";
import { getBodyEntries, toMatchingPairChallenge } from "../adapters/bodyVocabularyAdapter";
import { VisualAsset } from "../assets/visualResolver";
import { GameProgressBar, GameShell } from "../components/GameShell";
import { GameResultScreen } from "../components/GameResultScreen";
import type { MatchingPairChallenge } from "../core/challengeTypes";
import { ROUND_SIZES } from "../core/roundConfig";
import { selectChallenges } from "../core/selectChallenges";
import { createRoundState, finalizeRound, recordOutcome, type GameRoundState } from "../core/sessionEngine";
import { shuffleWithSeed } from "../core/shuffle";
import { useGameCompletion } from "../core/useGameCompletion";

const roundSize = ROUND_SIZES.matching_pairs.count;

interface BoardPoint {
  x: number;
  y: number;
}

interface DragState {
  wordId: string;
  pointerId: number;
  wasSelected: boolean;
  from: BoardPoint;
  to: BoardPoint;
  hoverTargetId: string | null;
}

function buildChallenges(seed: number): MatchingPairChallenge[] {
  const entries = getBodyEntries();
  const selected = selectChallenges(entries, roundSize, seed);
  return selected.map((entry) => toMatchingPairChallenge(entry));
}

function arrangeTargets(words: MatchingPairChallenge[], seed: number): MatchingPairChallenge[] {
  let images = shuffleWithSeed(words, seed + 503);
  for (let attempt = 0; attempt < images.length; attempt += 1) {
    if (images.every((image, index) => image.id !== words[index]?.id)) return images;
    images = [...images.slice(1), images[0]];
  }
  return images;
}

function pathBetween(from: BoardPoint, to: BoardPoint): string {
  const bend = Math.max(40, Math.abs(to.x - from.x) * 0.36);
  return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
}

export default function MatchingPairsGame() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [seed, setSeed] = useState(() => Date.now());
  const challenges = useMemo(() => buildChallenges(seed), [seed]);
  const wordColumn = useMemo(() => shuffleWithSeed(challenges, seed + 101), [challenges, seed]);
  const imageColumn = useMemo(() => arrangeTargets(wordColumn, seed), [wordColumn, seed]);
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [firstAttempts, setFirstAttempts] = useState<Record<string, boolean>>({});
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [wrongAttempt, setWrongAttempt] = useState<{ wordId: string; targetId: string } | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [linesVersion, setLinesVersion] = useState(0);
  const [liveMessage, setLiveMessage] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"correct" | "wrong" | null>(null);
  const [roundState, setRoundState] = useState<GameRoundState>(() => createRoundState("matching_pairs"));
  const [finished, setFinished] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<DragState | null>(null);
  const firstAttemptsRef = useRef<Record<string, boolean>>({});
  const pointerSelectionRef = useRef<{
    startedAt: number;
    wordId: string;
  } | null>(null);
  const wrongTimerRef = useRef<number | null>(null);
  const wordRefs = useRef(new Map<string, HTMLButtonElement>());
  const targetRefs = useRef(new Map<string, HTMLButtonElement>());
  const { complete, completionError, resetSession, retryCompletion } = useGameCompletion("matching_pairs", "vocabulary");

  const completedCount = Object.keys(connections).length;
  const roundComplete = challenges.length > 0 && completedCount === challenges.length;

  const getBoardRect = useCallback(() => boardRef.current?.getBoundingClientRect() ?? null, []);

  const getWordPoint = useCallback(
    (wordId: string): BoardPoint | null => {
      const boardRect = getBoardRect();
      const word = wordRefs.current.get(wordId);
      if (!boardRect || !word) return null;
      const rect = word.getBoundingClientRect();
      return { x: rect.right - boardRect.left, y: rect.top - boardRect.top + rect.height / 2 };
    },
    [getBoardRect],
  );

  const getTargetPoint = useCallback(
    (targetId: string): BoardPoint | null => {
      const boardRect = getBoardRect();
      const target = targetRefs.current.get(targetId);
      if (!boardRect || !target) return null;
      const rect = target.getBoundingClientRect();
      return { x: rect.left - boardRect.left, y: rect.top - boardRect.top + rect.height / 2 };
    },
    [getBoardRect],
  );

  const pointFromClient = useCallback(
    (clientX: number, clientY: number): BoardPoint => {
      const boardRect = getBoardRect();
      if (!boardRect) return { x: clientX, y: clientY };
      return { x: clientX - boardRect.left, y: clientY - boardRect.top };
    },
    [getBoardRect],
  );

  const getTargetAtPoint = useCallback((clientX: number, clientY: number): string | null => {
    for (const [targetId, element] of targetRefs.current) {
      const rect = element.getBoundingClientRect();
      const expanded = 3;
      if (
        clientX >= rect.left - expanded &&
        clientX <= rect.right + expanded &&
        clientY >= rect.top - expanded &&
        clientY <= rect.bottom + expanded
      ) {
        return targetId;
      }
    }
    return null;
  }, []);

  const setWordRef = useCallback((wordId: string, node: HTMLButtonElement | null) => {
    if (node) wordRefs.current.set(wordId, node);
    else wordRefs.current.delete(wordId);
  }, []);

  const setTargetRef = useCallback((targetId: string, node: HTMLButtonElement | null) => {
    if (node) targetRefs.current.set(targetId, node);
    else targetRefs.current.delete(targetId);
  }, []);

  const challengeById = useCallback(
    (challengeId: string) => challenges.find((challenge) => challenge.id === challengeId),
    [challenges],
  );

  const clearWrongTimer = useCallback(() => {
    if (wrongTimerRef.current === null) return;
    window.clearTimeout(wrongTimerRef.current);
    wrongTimerRef.current = null;
  }, []);

  const tryConnection = useCallback(
    (wordId: string, targetId: string) => {
      if (connections[wordId]) return;
      const word = challengeById(wordId);
      const target = challengeById(targetId);
      if (!word || !target) return;
      const correct = wordId === targetId;

      if (firstAttemptsRef.current[wordId] === undefined) {
        firstAttemptsRef.current[wordId] = correct;
        setFirstAttempts((current) => ({ ...current, [wordId]: correct }));
        setRoundState((round) => recordOutcome(round, word.id, correct));
      }

      setSelectedWordId(null);
      if (correct) {
        clearWrongTimer();
        setConnections((current) => ({ ...current, [wordId]: targetId }));
        setWrongAttempt(null);
        setFeedbackTone("correct");
        setLiveMessage(`${word.term} conectada corretamente a ${target.translation}.`);
        playSound("correct");
        return;
      }

      clearWrongTimer();
      setWrongAttempt({ wordId, targetId });
      setFeedbackTone("wrong");
      setLiveMessage(`${word.term} não combina com ${target.translation}. Tente outra imagem.`);
      playSound("wrong");
      wrongTimerRef.current = window.setTimeout(() => {
        setWrongAttempt(null);
        wrongTimerRef.current = null;
      }, reduceMotion ? 300 : 720);
    },
    [challengeById, clearWrongTimer, connections, reduceMotion],
  );

  useEffect(() => () => clearWrongTimer(), [clearWrongTimer]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const observer = new ResizeObserver(() => setLinesVersion((current) => current + 1));
    observer.observe(board);
    for (const node of wordRefs.current.values()) observer.observe(node);
    for (const node of targetRefs.current.values()) observer.observe(node);
    window.addEventListener("resize", observerCallback);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", observerCallback);
    };

    function observerCallback() {
      setLinesVersion((current) => current + 1);
    }
  }, [wordColumn, imageColumn, completedCount]);

  useEffect(() => {
    function handlePointerMove(event: globalThis.PointerEvent) {
      const activeDrag = draggingRef.current;
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      const hoverTargetId = getTargetAtPoint(event.clientX, event.clientY);
      const nextDrag = {
        ...activeDrag,
        hoverTargetId,
        to: pointFromClient(event.clientX, event.clientY),
      };
      draggingRef.current = nextDrag;
      setDragging(nextDrag);
    }

    function handlePointerUp(event: globalThis.PointerEvent) {
      const activeDrag = draggingRef.current;
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      const dropTargetId = getTargetAtPoint(event.clientX, event.clientY) ?? activeDrag.hoverTargetId;
      draggingRef.current = null;
      setDragging(null);
      if (dropTargetId) {
        tryConnection(activeDrag.wordId, dropTargetId);
        return;
      }
      const word = challengeById(activeDrag.wordId);
      if (word) {
        setFeedbackTone(null);
        if (activeDrag.wasSelected) {
          setSelectedWordId(null);
          setLiveMessage(`${word.term} não está mais selecionada.`);
        } else {
          setSelectedWordId(activeDrag.wordId);
          setLiveMessage(`${word.term} selecionada. Escolha a imagem correspondente.`);
        }
      }
    }

    function handlePointerCancel(event: globalThis.PointerEvent) {
      const activeDrag = draggingRef.current;
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      const word = challengeById(activeDrag.wordId);
      if (word) {
        setFeedbackTone(null);
        setLiveMessage(`${word.term} voltou para a coluna de palavras.`);
      }
      setSelectedWordId(null);
      draggingRef.current = null;
      setDragging(null);
    }

    document.addEventListener("pointermove", handlePointerMove, { passive: false });
    document.addEventListener("pointerup", handlePointerUp, { passive: false });
    document.addEventListener("pointercancel", handlePointerCancel, { passive: false });
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [challengeById, getTargetAtPoint, pointFromClient, tryConnection]);

  if (challenges.length === 0 && !finished) {
    return (
      <GameShell onBack={() => navigate("/jogos")} title="Conectando">
        <p className="game-empty-state">Não há pares suficientes para esta rodada no momento.</p>
      </GameShell>
    );
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, wordId: string) {
    if (connections[wordId] || roundComplete) return;
    const from = getWordPoint(wordId);
    if (!from) return;
    clearWrongTimer();
    setWrongAttempt(null);
    setFeedbackTone(null);
    setLiveMessage("");
    pointerSelectionRef.current = {
      startedAt: performance.now(),
      wordId,
    };
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best effort in synthetic smoke events.
    }
    setSelectedWordId(wordId);
    const nextDrag = {
      wordId,
      pointerId: event.pointerId,
      wasSelected: selectedWordId === wordId,
      from,
      to: pointFromClient(event.clientX, event.clientY),
      hoverTargetId: getTargetAtPoint(event.clientX, event.clientY),
    };
    draggingRef.current = nextDrag;
    setDragging(nextDrag);
  }

  function selectWord(wordId: string) {
    if (connections[wordId] || roundComplete) return;
    const word = challengeById(wordId);
    const willSelect = selectedWordId !== wordId;
    clearWrongTimer();
    setWrongAttempt(null);
    setFeedbackTone(null);
    setSelectedWordId(willSelect ? wordId : null);
    if (word) {
      setLiveMessage(
        willSelect
          ? `${word.term} selecionada. Escolha a imagem correspondente.`
          : `${word.term} não está mais selecionada.`,
      );
    }
  }

  function selectWordFromClick(wordId: string, clickDetail: number) {
    const pointerSelection = pointerSelectionRef.current;
    pointerSelectionRef.current = null;
    if (
      pointerSelection?.wordId === wordId &&
      clickDetail > 0 &&
      performance.now() - pointerSelection.startedAt < 500
    ) {
      return;
    }
    selectWord(wordId);
  }

  function selectTarget(targetId: string) {
    if (!selectedWordId || roundComplete) return;
    tryConnection(selectedWordId, targetId);
  }

  function finishRound() {
    if (!roundComplete) return;
    const result = finalizeRound(roundState);
    setFinished(true);
    void complete(result);
  }

  function resetRound() {
    clearWrongTimer();
    resetSession();
    setSeed(Date.now());
    setConnections({});
    setFirstAttempts({});
    firstAttemptsRef.current = {};
    setSelectedWordId(null);
    setWrongAttempt(null);
    draggingRef.current = null;
    setDragging(null);
    setLiveMessage("");
    setFeedbackTone(null);
    setRoundState(createRoundState("matching_pairs"));
    setFinished(false);
  }

  if (finished) {
    const result = finalizeRound(roundState);
    return (
      <GameResultScreen
        completionError={completionError}
        gameTitle="Conectando"
        onChangeGame={() => navigate("/jogos")}
        onHome={() => navigate("/")}
        onRetryPersistence={retryCompletion}
        onPlayAgain={resetRound}
        reduceMotion={Boolean(reduceMotion)}
        result={result}
      />
    );
  }

  const persistentLines = Object.entries(connections)
    .map(([wordId, targetId]) => {
      const from = getWordPoint(wordId);
      const to = getTargetPoint(targetId);
      return from && to ? { from, id: wordId, to } : null;
    })
    .filter(Boolean) as { from: BoardPoint; id: string; to: BoardPoint }[];
  const wrongLine =
    wrongAttempt &&
    (() => {
      const from = getWordPoint(wrongAttempt.wordId);
      const to = getTargetPoint(wrongAttempt.targetId);
      return from && to ? { from, to } : null;
    })();
  void linesVersion;

  return (
    <GameShell onBack={() => navigate("/jogos")} title="Conectando">
      <section className="session-meta">
        <span>
          {completedCount} de {challenges.length} pares conectados
        </span>
        <span>{ROUND_SIZES.matching_pairs.label}</span>
      </section>
      <GameProgressBar current={completedCount} total={challenges.length} />

      <section className="question-card matching-pairs-card game-board-card">
        <div className="matching-pairs-instructions">
          <span className="question-label">Ligue palavra e imagem</span>
          <h1>Conecte os seis pares no mesmo tabuleiro.</h1>
          <p id="matching-pairs-help">
            Arraste uma palavra até a imagem ou selecione uma palavra e depois uma imagem.
          </p>
        </div>

        <div className="matching-pairs-board" ref={boardRef}>
          <svg className="matching-pairs-lines" aria-hidden="true">
            {persistentLines.map((line) => (
              <path className="matching-pairs-line correct" d={pathBetween(line.from, line.to)} key={line.id} />
            ))}
            {wrongLine && (
              <path className="matching-pairs-line wrong" d={pathBetween(wrongLine.from, wrongLine.to)} />
            )}
            {dragging && (
              <path className="matching-pairs-line active" d={pathBetween(dragging.from, dragging.to)} />
            )}
          </svg>

          <div className="matching-pairs-column matching-pairs-words" aria-label="Palavras em inglês">
            <span className="matching-pairs-column-label">Palavras</span>
            {wordColumn.map((word) => {
              const connected = Boolean(connections[word.id]);
              const selected = selectedWordId === word.id;
              const firstAttemptCorrect = firstAttempts[word.id];
              const firstAttemptWrong = firstAttemptCorrect === false && !connected;
              return (
                <button
                  aria-describedby="matching-pairs-help"
                  aria-label={`${word.term}${connected ? ", par concluído" : ""}`}
                  aria-pressed={selected}
                  className={[
                    "matching-pairs-word",
                    selected ? "selected" : "",
                    connected ? "connected" : "",
                    firstAttemptWrong ? "needs-retry" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-connected={connected ? "true" : "false"}
                  data-first-attempt={firstAttemptCorrect === undefined ? "pending" : firstAttemptCorrect ? "correct" : "wrong"}
                  data-word-id={word.id}
                  disabled={connected}
                  key={word.id}
                  onClick={(event) => selectWordFromClick(word.id, event.detail)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectWord(word.id);
                    }
                  }}
                  onPointerDown={(event) => startDrag(event, word.id)}
                  ref={(node) => setWordRef(word.id, node)}
                  type="button"
                >
                  <span>{word.term}</span>
                  {connected && <AppIcon name="check" size={18} />}
                  {firstAttemptWrong && !connected && <AppIcon name="refresh" size={17} />}
                </button>
              );
            })}
          </div>

          <div className="matching-pairs-column matching-pairs-images" aria-label="Imagens">
            <span className="matching-pairs-column-label">Imagens</span>
            {imageColumn.map((target) => {
              const connectedWordId = Object.entries(connections).find(([, targetId]) => targetId === target.id)?.[0];
              const connected = Boolean(connectedWordId);
              const hover = dragging?.hoverTargetId === target.id;
              const wrong = wrongAttempt?.targetId === target.id;
              return (
                <button
                  aria-describedby="matching-pairs-help"
                  aria-label={`Imagem correspondente a ${target.translation}${connected ? ", par concluído" : ""}`}
                  className={[
                    "matching-pairs-target",
                    hover ? "drop-hover" : "",
                    connected ? "connected" : "",
                    wrong ? "wrong" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-connected={connected ? "true" : "false"}
                  data-target-id={target.id}
                  disabled={connected}
                  key={target.id}
                  onClick={() => selectTarget(target.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectTarget(target.id);
                    }
                  }}
                  ref={(node) => setTargetRef(target.id, node)}
                  type="button"
                >
                  <VisualAsset label={target.translation} visualKey={target.visualKey} />
                  <span className="matching-pairs-target-indicator" aria-hidden="true">
                    {connected && <AppIcon name="check" size={15} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div aria-atomic="true" aria-live="polite" className="matching-pairs-feedback-region" role="status">
          {feedbackTone && liveMessage ? (
            <div className={`answer-feedback ${feedbackTone}`}>
              <span className="feedback-icon">
                <AppIcon name={feedbackTone === "wrong" ? "close" : "check"} size={20} />
              </span>
              <div>
                <strong>
                  {feedbackTone === "wrong" ? "Tente novamente." : roundComplete ? "Todos conectados." : "Boa."}
                </strong>
                <p>{liveMessage}</p>
              </div>
            </div>
          ) : (
            <span className="sr-only">{liveMessage}</span>
          )}
        </div>

        <div className="session-action">
          <PrimaryButton disabled={!roundComplete} icon={<AppIcon name="chevron-right" />} onClick={finishRound}>
            Ver resultado
          </PrimaryButton>
        </div>
      </section>
    </GameShell>
  );
}
