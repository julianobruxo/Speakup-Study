import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader, PrimaryButton } from "../components/AppShell";
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

interface IndexedToken {
  idx: number;
  word: string;
}

const MODE_META: { id: BookGrammarMode; label: string; desc: string }[] = [
  {
    id: "fill_in_gaps",
    label: "Fill in the gaps",
    desc: "Complete as lacunas com a forma correta.",
  },
  {
    id: "multiple_choice",
    label: "Multiple choice",
    desc: "Escolha a alternativa correta em contexto.",
  },
  {
    id: "word_scramble",
    label: "Desembaralhar palavras",
    desc: "Toque nas palavras na ordem certa para montar a frase.",
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
  // Ensure scrambled order differs from target order when possible
  const sameOrder = tokens.every((t, i) => t.word === words[i]);
  if (sameOrder && tokens.length > 1) {
    [tokens[0], tokens[tokens.length - 1]] = [tokens[tokens.length - 1], tokens[0]];
  }
  return tokens;
}

export default function BookGrammarTopicPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const topic = getIntroGrammarTopic(topicId);
  const [activeMode, setActiveMode] = useState<BookGrammarMode | null>(null);

  useEffect(() => {
    setActiveMode(null);
    cancelPronunciation();
    return cancelPronunciation;
  }, [topicId]);

  useEffect(() => cancelPronunciation, [activeMode]);

  if (!topic) {
    return (
      <AppShell activeNav="study" className="standard-page">
        <PageHeader backTo="/livro/intro/gramatica" title="Livro Intro · Gramática" />
        <section className="empty-state">
          <h2>Tópico não encontrado</h2>
          <PrimaryButton onClick={() => navigate("/livro/intro/gramatica")}>
            Voltar para Gramática
          </PrimaryButton>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="study" className="standard-page">
      <PageHeader
        backTo="/livro/intro/gramatica"
        title={`${String(topic.order).padStart(2, "0")}. ${topic.title}`}
      />

      <section className="page-lead compact">
        <span className="eyebrow">Livro Intro · Gramática</span>
        <h2>{topic.title}</h2>
        <p>{topic.summary}</p>
      </section>

      <article className="section-card" style={{ marginBottom: 18 }}>
        <h3>Como usar na prática</h3>
        {topic.explanation.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <h4 style={{ marginTop: 18 }}>Exemplos com pronúncia (en-US)</h4>
        <div className="study-examples">
          {topic.examples.map((example) => (
            <button
              className="word-preview"
              key={example.en}
              onClick={() => speakEnglish(example.en)}
              type="button"
            >
              <strong>
                {example.en} <AppIcon name="volume" size={14} />
              </strong>
              <span>{example.pt}</span>
            </button>
          ))}
        </div>
      </article>

      <section className="section-card" aria-label="Escolha o tipo de atividade">
        <span className="eyebrow">Prática livre</span>
        <h3 style={{ marginTop: 4 }}>Escolha uma atividade para praticar</h3>
        <p style={{ marginTop: 4 }}>
          Selecione o formato que preferir. Ao terminar, a atividade encerra
          sem etapas extras obrigatórias.
        </p>

        <div className="filter-row" role="group" aria-label="Modos de prática">
          {MODE_META.map((mode) => (
            <button
              aria-pressed={activeMode === mode.id}
              className={`filter-chip ${activeMode === mode.id ? "active" : ""}`}
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              type="button"
            >
              {mode.label}
            </button>
          ))}
        </div>

        {activeMode && (
          <GrammarActivityRunner
            key={`${topic.id}:${activeMode}`}
            mode={activeMode}
            onBackToGrammar={() => navigate("/livro/intro/gramatica")}
            onBackToPractice={() => navigate("/praticar")}
            topic={topic}
          />
        )}
      </section>
    </AppShell>
  );
}

function GrammarActivityRunner({
  topic,
  mode,
  onBackToGrammar,
  onBackToPractice,
}: {
  topic: BookGrammarTopic;
  mode: BookGrammarMode;
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

  // Mode-specific answer state
  const [selectedGapOption, setSelectedGapOption] = useState<string | null>(null);
  const [selectedMcIndex, setSelectedMcIndex] = useState<number | null>(null);
  const [placedTokens, setPlacedTokens] = useState<IndexedToken[]>([]);

  const sessionIdRef = useRef(crypto.randomUUID());
  const engagementWriteRef = useRef<Promise<void>>(Promise.resolve());
  const completedRef = useRef(false);

  const total =
    mode === "fill_in_gaps"
      ? topic.fill_in_gaps.length
      : mode === "multiple_choice"
        ? topic.multiple_choice.length
        : topic.word_scramble.length;

  const gapItem = mode === "fill_in_gaps" ? topic.fill_in_gaps[index] : undefined;
  const mcItem = mode === "multiple_choice" ? topic.multiple_choice[index] : undefined;
  const scrambleItem = mode === "word_scramble" ? topic.word_scramble[index] : undefined;

  const scrambledBank = useMemo(() => {
    if (!scrambleItem) return [];
    return deterministicShuffleTokens(
      scrambleItem.tokens,
      `${sessionIdRef.current}:${scrambleItem.id}`,
    );
  }, [scrambleItem]);

  useEffect(() => cancelPronunciation, [index]);

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
    let audioText = "";

    if (mode === "fill_in_gaps" && gapItem) {
      right = selectedGapOption === gapItem.answer;
      itemId = gapItem.id;
      audioText = gapItem.sentence.replace("___", gapItem.answer);
    } else if (mode === "multiple_choice" && mcItem) {
      right = selectedMcIndex === mcItem.correctIndex;
      itemId = mcItem.id;
      audioText = mcItem.options[mcItem.correctIndex] ?? "";
    } else if (mode === "word_scramble" && scrambleItem) {
      right = placedTokens.map((t) => t.word).join(" ") === scrambleItem.target;
      itemId = scrambleItem.id;
      audioText = scrambleItem.target;
    }

    const nextStreak = right ? streak + 1 : 0;
    setIsCorrect(right);
    setSubmitted(true);
    if (right) setCorrectCount((prev) => prev + 1);
    setStreak(nextStreak);
    setBestStreak((prev) => Math.max(prev, nextStreak));

    if (audioText && /^[A-Za-z]/.test(audioText)) {
      speakEnglish(audioText);
    }

    const eventId = `book-intro:${sessionIdRef.current}:${itemId}`;
    engagementWriteRef.current = engagementWriteRef.current
      .then(() => recordGrammarAnswerEngagement(eventId, right))
      .then(() => undefined)
      .catch(() => undefined);
  }

  function handleNext() {
    cancelPronunciation();
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
    setSelectedGapOption(null);
    setSelectedMcIndex(null);
    setPlacedTokens([]);
  }

  if (finished) {
    const modeLabel = MODE_META.find((m) => m.id === mode)?.label ?? mode;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div
        className="section-card"
        role="status"
        style={{ marginTop: 16, textAlign: "center" }}
      >
        <span className="eyebrow">Atividade concluída</span>
        <h3 style={{ marginTop: 6 }}>
          {topic.title} · {modeLabel}
        </h3>
        <p>
          Você acertou <strong>{correctCount}</strong> de <strong>{total}</strong>{" "}
          ({percentage}%).
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            marginTop: 14,
          }}
        >
          <PrimaryButton onClick={onBackToGrammar}>
            Voltar para Gramática
          </PrimaryButton>
          <PrimaryButton onClick={onBackToPractice} variant="secondary">
            Ir para Biblioteca
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const feedbackText =
    gapItem?.explanation ?? mcItem?.explanation ?? scrambleItem?.explanation ?? "";
  const correctDisplay =
    mode === "fill_in_gaps" && gapItem
      ? gapItem.sentence.replace("___", gapItem.answer)
      : mode === "multiple_choice" && mcItem
        ? mcItem.options[mcItem.correctIndex]
        : scrambleItem?.target ?? "";

  return (
    <div style={{ marginTop: 16 }}>
      <div className="question-meta">
        <span>{MODE_META.find((m) => m.id === mode)?.label}</span>
        <span>
          {index + 1} de {total}
        </span>
      </div>

      {mode === "fill_in_gaps" && gapItem && (
        <div style={{ marginTop: 12 }}>
          <h4 style={{ fontSize: "1.15rem" }}>{gapItem.sentence}</h4>
          <div className="course-options" style={{ marginTop: 12 }}>
            {gapItem.options.map((option) => {
              const state = submitted
                ? option === gapItem.answer
                  ? "correct"
                  : option === selectedGapOption
                    ? "wrong"
                    : ""
                : selectedGapOption === option
                  ? "selected"
                  : "";
              return (
                <button
                  className={state}
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
        </div>
      )}

      {mode === "multiple_choice" && mcItem && (
        <div style={{ marginTop: 12 }}>
          <h4 style={{ fontSize: "1.15rem" }}>{mcItem.prompt}</h4>
          <div className="course-options" style={{ marginTop: 12 }}>
            {mcItem.options.map((option, optIdx) => {
              const state = submitted
                ? optIdx === mcItem.correctIndex
                  ? "correct"
                  : optIdx === selectedMcIndex
                    ? "wrong"
                    : ""
                : selectedMcIndex === optIdx
                  ? "selected"
                  : "";
              return (
                <button
                  className={state}
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
        </div>
      )}

      {mode === "word_scramble" && scrambleItem && (
        <div style={{ marginTop: 12 }}>
          <p style={{ marginBottom: 8 }}>
            <strong>Dica (PT-BR):</strong> {scrambleItem.ptCue}
          </p>

          <div
            aria-label="Frase montada"
            style={{
              minHeight: 54,
              padding: 10,
              borderRadius: 12,
              border: "1px dashed rgba(148, 163, 184, 0.5)",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            {placedTokens.length === 0 ? (
              <small style={{ opacity: 0.7 }}>
                Toque nas palavras abaixo na ordem correta...
              </small>
            ) : (
              placedTokens.map((token) => (
                <button
                  className="filter-chip active"
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

          <div
            aria-label="Banco de palavras"
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}
          >
            {scrambledBank.map((token) => {
              const used = placedIds.has(token.idx);
              return (
                <button
                  className="filter-chip"
                  disabled={submitted || used}
                  key={`bank-${token.idx}`}
                  onClick={() => setPlacedTokens((prev) => [...prev, token])}
                  style={{ opacity: used ? 0.35 : 1 }}
                  type="button"
                >
                  {token.word}
                </button>
              );
            })}
          </div>

          {!submitted && placedTokens.length > 0 && (
            <button
              className="text-button"
              onClick={() => setPlacedTokens([])}
              type="button"
            >
              Limpar ordem
            </button>
          )}
        </div>
      )}

      {submitted && (
        <div
          aria-live="polite"
          className={`course-feedback ${isCorrect ? "correct" : "wrong"}`}
          style={{ marginTop: 14 }}
        >
          <strong>{isCorrect ? "Correto!" : `Resposta: ${correctDisplay}`}</strong>
          <span>{feedbackText}</span>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <PrimaryButton
          disabled={!submitted && !canSubmit()}
          onClick={submitted ? handleNext : handleSubmit}
        >
          {submitted
            ? index === total - 1
              ? "Concluir atividade"
              : "Próxima questão"
            : "Conferir resposta"}
        </PrimaryButton>
      </div>
    </div>
  );
}
