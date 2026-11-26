import { useEffect, useMemo, useRef, useState } from "react";
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

function deterministicShuffleTokens(
  words: readonly string[],
  seedKey: string,
): IndexedToken[] {
  const tokens: IndexedToken[] = words.map((word, idx) => ({ idx, word }));
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
  for (let i = tokens.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRand() * (i + 1));
    [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
  }
  const sameOrder = tokens.every((t, i) => t.word === words[i]);
  if (sameOrder && tokens.length > 1) {
    [tokens[0], tokens[tokens.length - 1]] = [tokens[tokens.length - 1], tokens[0]];
  }
  return tokens;
}

function resolveInitialMode(queryMode: string | null): BookGrammarMode | null {
  if (queryMode === "guided") return "fill_in_gaps";
  if (queryMode === "sprint") return "multiple_choice";
  return null;
}

export default function BookGrammarTopicPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get("mode");
  const topic = getIntroGrammarTopic(topicId);
  const [activeMode, setActiveMode] = useState<BookGrammarMode | null>(() =>
    resolveInitialMode(queryMode),
  );
  const [playingExample, setPlayingExample] = useState<string | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <AppShell activeNav="study" className="standard-page">
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

          {activeMode && (
            <GrammarActivityRunner
              isSprint={queryMode === "sprint" && activeMode === "multiple_choice"}
              key={`${topic.id}:${activeMode}:${queryMode ?? "default"}`}
              mode={activeMode}
              onBackToGrammar={() => navigate("/livro/intro/gramatica")}
              onBackToPractice={() => navigate("/estudar")}
              topic={topic}
            />
          )}
        </section>
      </div>
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
