import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import {
  getIntroGrammarTopic,
  type BookGrammarMode,
  type BookGrammarTopic,
} from "../content/books/intro";
import {
  cancelPronunciation,
  speakEnglish,
} from "../services/audio/pronunciation";
import {
  recordGrammarAnswerEngagement,
  recordGrammarSessionEngagement,
} from "../services/progress/engagement";
import { orderQuestionOptions } from "../services/sessions/selectPracticeQuestions";
import "../styles/activities.css";

interface IndexedToken {
  idx: number;
  word: string;
}

const MODE_META: {
  id: BookGrammarMode;
  label: string;
  desc: string;
  icon: "book" | "check" | "grid";
  badgeTone: "orange" | "green" | "cyan";
}[] = [
  {
    id: "fill_in_gaps",
    label: "Fill in the gaps",
    desc: "Complete as lacunas com a forma correta.",
    icon: "book",
    badgeTone: "orange",
  },
  {
    id: "multiple_choice",
    label: "Multiple choice",
    desc: "Escolha a alternativa correta em contexto.",
    icon: "check",
    badgeTone: "green",
  },
  {
    id: "word_scramble",
    label: "Desembaralhar palavras",
    desc: "Toque nas palavras na ordem certa para montar a frase.",
    icon: "grid",
    badgeTone: "cyan",
  },
];

const MODAL_FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function deterministicShuffleTokens(
  words: readonly string[],
  seedKey: string,
): IndexedToken[] {
  const base: IndexedToken[] = words.map((word, idx) => ({ idx, word }));
  if (words.length <= 1 || new Set(words).size <= 1) {
    return base;
  }

  let hash = 2166136261;
  for (let i = 0; i < seedKey.length; i += 1) {
    hash = Math.imul(hash ^ seedKey.charCodeAt(i), 16777619);
  }
  let state = hash >>> 0;
  const nextRand = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const countFixed = (arr: readonly IndexedToken[]) =>
    arr.filter((t, i) => t.word === words[i]).length;
  const isIdentical = (arr: readonly IndexedToken[]) =>
    arr.every((t, i) => t.word === words[i]);

  const shuffleOnce = (): IndexedToken[] => {
    const arr: IndexedToken[] = words.map((word, idx) => ({ idx, word }));
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(nextRand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  let best: IndexedToken[] | null = null;
  let bestFixed = Number.POSITIVE_INFINITY;

  const consider = (candidate: IndexedToken[]) => {
    if (isIdentical(candidate)) return false;
    const fixed = countFixed(candidate);
    if (best === null || fixed < bestFixed) {
      best = candidate;
      bestFixed = fixed;
    }
    return words.length < 4 || fixed <= 1;
  };

  for (let attempt = 0; attempt < 32; attempt += 1) {
    if (consider(shuffleOnce())) {
      break;
    }
  }

  if (best === null || (words.length >= 4 && bestFixed > 1)) {
    const reversedBase = [...base].reverse();
    for (let shift = 1; shift < words.length; shift += 1) {
      const rotated = [...base.slice(shift), ...base.slice(0, shift)];
      if (consider(rotated) && bestFixed === 0) break;
      const revRotated = [
        ...reversedBase.slice(shift),
        ...reversedBase.slice(0, shift),
      ];
      if (consider(revRotated) && bestFixed === 0) break;
    }
    if (best === null) {
      consider(reversedBase);
    }
  }

  return best ?? base;
}

function resolveInitialMode(queryMode: string | null): BookGrammarMode | null {
  if (queryMode === "guided") return "fill_in_gaps";
  if (queryMode === "sprint") return "multiple_choice";
  return null;
}

export default function BookGrammarTopicPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = searchParams.get("mode");
  const topic = getIntroGrammarTopic(topicId);
  const [activeMode, setActiveMode] = useState<BookGrammarMode | null>(() =>
    resolveInitialMode(queryMode),
  );
  const [playingExample, setPlayingExample] = useState<string | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalDialogRef = useRef<HTMLDivElement | null>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const isModalOpen = activeMode !== null;

  const handleCloseModal = useCallback(() => {
    setActiveMode(null);
    if (searchParams.has("mode")) {
      const next = new URLSearchParams(searchParams);
      next.delete("mode");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setActiveMode(resolveInitialMode(queryMode));
    setPlayingExample(null);
    if (playTimerRef.current !== null) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    cancelPronunciation();
    return () => {
      if (playTimerRef.current !== null) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
      cancelPronunciation();
    };
  }, [topicId, queryMode]);

  useEffect(() => cancelPronunciation, [activeMode]);

  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      !modalDialogRef.current?.contains(active)
    ) {
      triggerElementRef.current = active;
    }

    const dialog = modalDialogRef.current;
    const firstFocusable = dialog?.querySelector<HTMLElement>(
      MODAL_FOCUSABLE_SELECTOR,
    );
    (firstFocusable ?? dialog)?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      if (triggerElementRef.current?.isConnected) {
        triggerElementRef.current.focus();
      }
      triggerElementRef.current = null;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseModal();
        return;
      }
      if (event.key === "Tab" && modalDialogRef.current) {
        const focusables = Array.from(
          modalDialogRef.current.querySelectorAll<HTMLElement>(
            MODAL_FOCUSABLE_SELECTOR,
          ),
        );
        if (focusables.length === 0) {
          event.preventDefault();
          modalDialogRef.current.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement as HTMLElement | null;
        if (event.shiftKey) {
          if (
            !current ||
            current === first ||
            !modalDialogRef.current.contains(current)
          ) {
            event.preventDefault();
            last.focus();
          }
        } else if (
          !current ||
          current === last ||
          !modalDialogRef.current.contains(current)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, handleCloseModal]);

  function handlePlayExample(text: string) {
    speakEnglish(text);
    setPlayingExample(text);
    if (playTimerRef.current !== null) {
      clearTimeout(playTimerRef.current);
    }
    playTimerRef.current = setTimeout(() => {
      playTimerRef.current = null;
      setPlayingExample((current) => (current === text ? null : current));
    }, 1200);
  }

  if (!topic) {
    return (
      <AppShell activeNav="study" className="standard-page">
        <PageHeader backTo="/livro/intro/gramatica" title="Livro Intro · Gramática" />
        <div className="activity-page-container">
          <section className="empty-state">
            <h2 className="empty-state__title">Tópico não encontrado</h2>
            <p className="empty-state__body">
              Escolha outro tópico de gramática do Livro Intro.
            </p>
            <button
              className="btn-3d-primary"
              onClick={() => navigate("/livro/intro/gramatica")}
              type="button"
            >
              Voltar para Gramática
            </button>
          </section>
        </div>
      </AppShell>
    );
  }

  const activeModeLabel =
    queryMode === "sprint" && activeMode === "multiple_choice"
      ? "Sprint rápido"
      : MODE_META.find((m) => m.id === activeMode)?.label ?? "";

  return (
    <AppShell
      activeNav="study"
      className="standard-page"
      dialogOpen={activeMode !== null}
    >
      <PageHeader
        backTo="/livro/intro/gramatica"
        title={`${String(topic.order).padStart(2, "0")}. ${topic.title}`}
      />

      <div className="activity-page-container">
        <section className="activity-lead-card">
          <span className="pill-tag pill-tag--blue">Livro Intro · Gramática</span>
          <h2>{topic.title}</h2>
          <p>{topic.summary}</p>
        </section>

        <article className="grammar-section-card">
          <h3>Como usar na prática</h3>
          {topic.explanation.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <h4 className="grammar-examples-heading">Exemplos com pronúncia (en-US)</h4>
          <div className="grammar-examples-grid">
            {topic.examples.map((example) => (
              <button
                className={`grammar-example-card ${
                  playingExample === example.en ? "is-playing" : ""
                }`}
                key={example.en}
                onClick={() => handlePlayExample(example.en)}
                type="button"
              >
                <span className="grammar-example-audio" aria-hidden="true">
                  <AppIcon name="volume" size={18} />
                </span>
                <span className="grammar-example-copy">
                  <strong>{example.en}</strong>
                  <span>{example.pt}</span>
                </span>
              </button>
            ))}
          </div>
        </article>

        <section
          className="grammar-section-card"
          aria-label="Escolha o tipo de atividade"
        >
          <span className="pill-tag pill-tag--blue">Prática livre</span>
          <h3>Escolha uma atividade para praticar</h3>
          <p>
            Selecione o formato que preferir. Ao terminar, a atividade encerra
            sem etapas extras obrigatórias.
          </p>

          <div
            className="grammar-mode-grid"
            role="group"
            aria-label="Modos de prática"
          >
            {MODE_META.map((mode) => (
              <button
                aria-pressed={activeMode === mode.id}
                className={`grammar-mode-card ${activeMode === mode.id ? "active" : ""}`}
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                type="button"
              >
                <span
                  className={`category-badge category-badge--sm category-badge--${mode.badgeTone}`}
                  aria-hidden="true"
                  style={{ color: "#FFFFFF" }}
                >
                  <AppIcon name={mode.icon} size={20} />
                </span>
                <span className="grammar-mode-body">
                  <strong>{mode.label}</strong>
                  <span>{mode.desc}</span>
                </span>
                <span className="grammar-mode-cta">
                  {activeMode === mode.id ? "Ativo" : "Começar →"}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {activeMode && (
        <div className="grammar-modal-backdrop" role="presentation">
          <div
            aria-labelledby="grammar-modal-title"
            aria-modal="true"
            className="grammar-modal-dialog"
            ref={modalDialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="grammar-modal-head">
              <h2 id="grammar-modal-title">
                {topic.title} · {activeModeLabel}
              </h2>
              <button
                aria-label="Fechar atividade"
                className="grammar-modal-close"
                onClick={handleCloseModal}
                type="button"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>
            <div className="grammar-modal-body">
              <GrammarActivityRunner
                isSprint={queryMode === "sprint" && activeMode === "multiple_choice"}
                key={`${topic.id}:${activeMode}:${queryMode ?? "default"}`}
                mode={activeMode}
                onBackToGrammar={() => navigate("/livro/intro/gramatica")}
                onBackToPractice={() => navigate("/estudar")}
                topic={topic}
              />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function GrammarActivityRunner({
  topic,
  mode,
  isSprint = false,
  onBackToGrammar,
  onBackToPractice,
}: {
  topic: BookGrammarTopic;
  mode: BookGrammarMode;
  isSprint?: boolean;
  onBackToGrammar: () => void;
  onBackToPractice: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpFloat, setXpFloat] = useState<{ id: number; text: string } | null>(null);

  const [selectedGapOption, setSelectedGapOption] = useState<string | null>(null);
  const [selectedMcIndex, setSelectedMcIndex] = useState<number | null>(null);
  const [placedTokens, setPlacedTokens] = useState<IndexedToken[]>([]);

  const sessionIdRef = useRef(crypto.randomUUID());
  const engagementWriteRef = useRef<Promise<void>>(Promise.resolve());
  const completedRef = useRef(false);

  const mcItems = useMemo(() => {
    if (!isSprint) return topic.multiple_choice;
    const shuffled = [...topic.multiple_choice];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [isSprint, topic.multiple_choice]);

  const total =
    mode === "fill_in_gaps"
      ? topic.fill_in_gaps.length
      : mode === "multiple_choice"
        ? mcItems.length
        : topic.word_scramble.length;

  const gapItem = mode === "fill_in_gaps" ? topic.fill_in_gaps[index] : undefined;
  const mcItem = mode === "multiple_choice" ? mcItems[index] : undefined;
  const scrambleItem = mode === "word_scramble" ? topic.word_scramble[index] : undefined;

  const orderedGapOptions = useMemo(() => {
    if (!gapItem) return [];
    return orderQuestionOptions(
      gapItem.options,
      `${sessionIdRef.current}:${gapItem.id}`,
    );
  }, [gapItem]);

  const orderedMcOptions = useMemo(() => {
    if (!mcItem) return [];
    const orderedTexts = orderQuestionOptions(
      mcItem.options,
      `${sessionIdRef.current}:${mcItem.id}`,
    );
    return orderedTexts.map((text) => ({
      text,
      optIdx: mcItem.options.indexOf(text),
    }));
  }, [mcItem]);

  const scrambledBank = useMemo(() => {
    if (!scrambleItem) return [];
    return deterministicShuffleTokens(
      scrambleItem.tokens,
      `${sessionIdRef.current}:${scrambleItem.id}`,
    );
  }, [scrambleItem]);

  const placedIds = new Set(placedTokens.map((t) => t.idx));

  function canSubmit(): boolean {
    if (submitted) return false;
    if (mode === "fill_in_gaps") return selectedGapOption !== null;
    if (mode === "multiple_choice") return selectedMcIndex !== null;
    return scrambleItem !== undefined && placedTokens.length === scrambleItem.tokens.length;
  }

  function handleSubmit() {
    if (!canSubmit()) return;
    let right = false;
    let itemId = "";

    if (mode === "fill_in_gaps" && gapItem) {
      right = selectedGapOption === gapItem.answer;
      itemId = gapItem.id;
    } else if (mode === "multiple_choice" && mcItem) {
      right = selectedMcIndex === mcItem.correctIndex;
      itemId = mcItem.id;
    } else if (mode === "word_scramble" && scrambleItem) {
      right = placedTokens.map((t) => t.word).join(" ") === scrambleItem.target;
      itemId = scrambleItem.id;
    }

    const nextStreak = right ? streak + 1 : 0;
    setIsCorrect(right);
    setSubmitted(true);
    if (right) {
      setCorrectCount((prev) => prev + 1);
    }
    setXpFloat({ id: Date.now(), text: right ? "+10 XP" : "+2 XP" });
    setStreak(nextStreak);
    setBestStreak((prev) => Math.max(prev, nextStreak));

    const eventId = `book-intro:${sessionIdRef.current}:${itemId}`;
    engagementWriteRef.current = engagementWriteRef.current
      .then(() => recordGrammarAnswerEngagement(eventId, right))
      .then(() => undefined)
      .catch(() => undefined);
  }

  function handleNext() {
    if (index >= total - 1) {
      setFinished(true);
      if (!completedRef.current) {
        completedRef.current = true;
        const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        const finalBestStreak = bestStreak;
        const sid = sessionIdRef.current;
        void engagementWriteRef.current
          .then(() => recordGrammarSessionEngagement(sid, percentage, finalBestStreak))
          .catch(() => undefined);
      }
      return;
    }
    setIndex((prev) => prev + 1);
    setSubmitted(false);
    setIsCorrect(false);
    setXpFloat(null);
    setSelectedGapOption(null);
    setSelectedMcIndex(null);
    setPlacedTokens([]);
  }

  if (finished) {
    const modeLabel = isSprint
      ? "Sprint rápido"
      : MODE_META.find((m) => m.id === mode)?.label ?? mode;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="activity-completion" role="status">
        <span className="activity-completion__icon" aria-hidden="true">
          <AppIcon name="check" size={30} />
        </span>
        <span className="activity-completion__kicker">Atividade concluída</span>
        <h3>
          {topic.title} · {modeLabel}
        </h3>
        <p>
          Você acertou <strong>{correctCount}</strong> de <strong>{total}</strong>{" "}
          ({percentage}%).
        </p>
        <div className="activity-completion__actions">
          <button
            className="btn-3d-primary"
            onClick={onBackToGrammar}
            type="button"
          >
            Voltar para Gramática
          </button>
          <button
            className="btn-pill-outline"
            onClick={onBackToPractice}
            type="button"
          >
            Voltar para Estudar
          </button>
        </div>
      </div>
    );
  }

  const progress = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;
  const feedbackText =
    gapItem?.explanation ?? mcItem?.explanation ?? scrambleItem?.explanation ?? "";
  const correctDisplay =
    mode === "fill_in_gaps" && gapItem
      ? gapItem.sentence.replace("___", gapItem.answer)
      : mode === "multiple_choice" && mcItem
        ? mcItem.options[mcItem.correctIndex]
        : scrambleItem?.target ?? "";

  return (
    <div className="grammar-runner">
      <div className="grammar-runner__meta">
        <span>
          {isSprint
            ? "Sprint rápido"
            : MODE_META.find((m) => m.id === mode)?.label}
        </span>
        {streak >= 2 && (
          <span className="combo-pill" aria-live="polite">
            {streak} seguidas!
          </span>
        )}
        <span>
          {index + 1} de {total}
        </span>
      </div>

      {xpFloat && (
        <span className="fc-xp-float" key={xpFloat.id} aria-hidden="true">
          {xpFloat.text}
        </span>
      )}

      <div
        aria-label={`Progresso: ${index + 1} de ${total}`}
        aria-valuemax={total}
        aria-valuemin={1}
        aria-valuenow={index + 1}
        className="progress-track"
        role="progressbar"
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {mode === "fill_in_gaps" && gapItem && (
        <>
          <h4 className="grammar-question-prompt">{gapItem.sentence}</h4>
          <div className="grammar-options-list">
            {orderedGapOptions.map((option) => {
              const state = submitted
                ? option === gapItem.answer
                  ? "correct"
                  : option === selectedGapOption
                    ? "wrong"
                    : "dimmed"
                : selectedGapOption === option
                  ? "selected"
                  : "";
              return (
                <button
                  className={`quiz-option ${state}`}
                  disabled={submitted}
                  key={option}
                  onClick={() => setSelectedGapOption(option)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
        </>
      )}

      {mode === "multiple_choice" && mcItem && (
        <>
          <h4 className="grammar-question-prompt">{mcItem.prompt}</h4>
          <div className="grammar-options-list">
            {orderedMcOptions.map(({ text: option, optIdx }) => {
              const state = submitted
                ? optIdx === mcItem.correctIndex
                  ? "correct"
                  : optIdx === selectedMcIndex
                    ? "wrong"
                    : "dimmed"
                : selectedMcIndex === optIdx
                  ? "selected"
                  : "";
              return (
                <button
                  className={`quiz-option ${state}`}
                  disabled={submitted}
                  key={option}
                  onClick={() => setSelectedMcIndex(optIdx)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
        </>
      )}

      {mode === "word_scramble" && scrambleItem && (
        <>
          <p className="grammar-scramble-cue">
            <strong>Dica (PT-BR):</strong> {scrambleItem.ptCue}
          </p>

          <div aria-label="Frase montada" className="grammar-scramble-tray">
            {placedTokens.length === 0 ? (
              <small className="grammar-scramble-placeholder">
                Toque nas palavras abaixo na ordem correta...
              </small>
            ) : (
              placedTokens.map((token) => (
                <button
                  className="grammar-scramble-chip is-placed"
                  disabled={submitted}
                  key={`placed-${token.idx}`}
                  onClick={() =>
                    setPlacedTokens((prev) =>
                      prev.filter((item) => item.idx !== token.idx),
                    )
                  }
                  type="button"
                >
                  {token.word}
                </button>
              ))
            )}
          </div>

          <div aria-label="Banco de palavras" className="grammar-scramble-bank">
            {scrambledBank.map((token) => {
              const used = placedIds.has(token.idx);
              return (
                <button
                  className={`grammar-scramble-chip${used ? " is-used" : ""}`}
                  disabled={submitted || used}
                  key={`bank-${token.idx}`}
                  onClick={() => setPlacedTokens((prev) => [...prev, token])}
                  type="button"
                >
                  {token.word}
                </button>
              );
            })}
          </div>

          {!submitted && placedTokens.length > 0 && (
            <button
              className="grammar-clear-link"
              onClick={() => setPlacedTokens([])}
              type="button"
            >
              Limpar ordem
            </button>
          )}
        </>
      )}

      {submitted && (
        <div
          aria-live="polite"
          className={`status-banner ${
            isCorrect ? "status-banner--success" : "status-banner--error"
          }`}
        >
          <AppIcon name={isCorrect ? "check" : "close"} size={18} />
          <div>
            <strong>
              {isCorrect ? "Correto!" : `Resposta: ${correctDisplay}`}
            </strong>{" "}
            <span>{feedbackText}</span>
          </div>
        </div>
      )}

      <div className="grammar-runner__actions">
        <button
          className="btn-3d-primary btn-3d-primary--sm"
          disabled={!submitted && !canSubmit()}
          onClick={submitted ? handleNext : handleSubmit}
          type="button"
        >
          {submitted
            ? index === total - 1
              ? "Concluir atividade"
              : "Próxima questão"
            : "Conferir resposta"}
        </button>
      </div>
    </div>
  );
}
