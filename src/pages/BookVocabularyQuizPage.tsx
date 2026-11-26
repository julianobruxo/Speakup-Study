import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import { BookVisual } from "../components/BookVisual";
import {
  getIntroVocabularySet,
  type BookVocabularyItem,
} from "../content/books/intro";
import {
  recordGrammarAnswerEngagement,
  recordGrammarSessionEngagement,
} from "../services/progress/engagement";
import "../styles/activities.css";

const MAX_QUESTIONS = 8;

interface QuizQuestion {
  item: BookVocabularyItem;
  options: string[];
}

function shuffleArray<T>(list: readonly T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuizQuestions(items: readonly BookVocabularyItem[]): QuizQuestion[] {
  const selected = shuffleArray(items).slice(0, Math.min(MAX_QUESTIONS, items.length));
  return selected.map((item) => {
    const distractors = shuffleArray(
      items
        .filter((candidate) => candidate.id !== item.id && candidate.pt !== item.pt)
        .map((candidate) => candidate.pt),
    )
      .filter((pt, idx, arr) => arr.indexOf(pt) === idx)
      .slice(0, 3);
    const options = shuffleArray([item.pt, ...distractors]);
    return { item, options };
  });
}

export default function BookVocabularyQuizPage() {
  const navigate = useNavigate();
  const { setId } = useParams();
  const vocabSet = getIntroVocabularySet(setId);

  const [roundSeed, setRoundSeed] = useState(0);
  const questions = useMemo(
    () => (vocabSet ? buildQuizQuestions(vocabSet.items) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vocabSet, roundSeed],
  );

  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpFloat, setXpFloat] = useState<{ key: number; label: string } | null>(null);

  const sessionIdRef = useRef(crypto.randomUUID());
  const engagementQueueRef = useRef<Promise<void>>(Promise.resolve());
  const completedRef = useRef(false);

  const current = questions[index];
  const answered = selectedOption !== null;
  const isCorrect = answered && current !== undefined && selectedOption === current.item.pt;

  useEffect(() => {
    setIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
    setXpFloat(null);
    sessionIdRef.current = crypto.randomUUID();
    completedRef.current = false;
  }, [setId, roundSeed]);

  if (!vocabSet || questions.length === 0) {
    return (
      <AppShell className="quiz-session-page" hideNavigation>
        <div className="quiz-body">
          <section className="empty-state">
            <h2 className="empty-state__title">Conjunto não encontrado</h2>
            <p className="empty-state__body">
              Volte para o catálogo de vocabulário e selecione outro conjunto.
            </p>
            <button
              className="btn-3d-primary"
              onClick={() => navigate("/livro/intro/vocabulario")}
              type="button"
            >
              Voltar para Vocabulário
            </button>
          </section>
        </div>
      </AppShell>
    );
  }

  const total = questions.length;
  const progressPercent = finished
    ? 100
    : Math.round(((index + (answered ? 1 : 0)) / total) * 100);

  function handleSelect(option: string) {
    if (answered || !current) return;
    const right = option === current.item.pt;
    const nextStreak = right ? streak + 1 : 0;

    setSelectedOption(option);
    if (right) {
      setCorrectCount((prev) => prev + 1);
    }
    setStreak(nextStreak);
    setBestStreak((prev) => Math.max(prev, nextStreak));
    setXpFloat({ key: Date.now(), label: right ? "+10 XP" : "+2 XP" });

    const eventId = `book-vocab-quiz:${sessionIdRef.current}:${current.item.id}`;
    engagementQueueRef.current = engagementQueueRef.current
      .then(() => recordGrammarAnswerEngagement(eventId, right))
      .then(() => undefined)
      .catch(() => undefined);
  }

  function handleNext() {
    if (index >= total - 1) {
      setFinished(true);
      if (!completedRef.current) {
        completedRef.current = true;
        const percentage = Math.round((correctCount / total) * 100);
        const sid = sessionIdRef.current;
        const finalBestStreak = bestStreak;
        void engagementQueueRef.current
          .then(() => recordGrammarSessionEngagement(sid, percentage, finalBestStreak))
          .catch(() => undefined);
      }
      return;
    }
    setIndex((prev) => prev + 1);
    setSelectedOption(null);
  }

  function handleRestart() {
    setRoundSeed((prev) => prev + 1);
  }

  return (
    <AppShell className="quiz-session-page" hideNavigation>
      <header className="fc-topbar">
        <button
          aria-label="Voltar para Vocabulário"
          className="icon-btn-minimal"
          onClick={() => navigate("/livro/intro/vocabulario")}
          type="button"
        >
          <AppIcon name="close" size={20} strokeWidth={1.8} />
        </button>

        <div
          aria-label="Progresso do quiz"
          aria-valuemax={total}
          aria-valuemin={1}
          aria-valuenow={Math.min(index + 1, total)}
          className="fc-topbar__progress"
          role="progressbar"
        >
          <span
            className="fc-topbar__fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="fc-counter-pill">
          {finished ? `${total}/${total}` : `${index + 1}/${total}`}
        </span>
      </header>

      <div className="quiz-body">
        {finished ? (
          <section className="activity-completion" role="status">
            <span className="activity-completion__icon" aria-hidden="true">
              <AppIcon name="trophy" size={30} />
            </span>
            <span className="activity-completion__kicker">Quiz concluído</span>
            <h2>{vocabSet.title}</h2>
            <p>
              Você acertou <strong>{correctCount}</strong> de <strong>{total}</strong>{" "}
              ({Math.round((correctCount / total) * 100)}%).
            </p>
            {bestStreak >= 2 && (
              <span className="combo-pill">
                Melhor sequência: {bestStreak} seguidas!
              </span>
            )}
            <div className="activity-completion__actions">
              <button
                className="btn-3d-primary"
                onClick={handleRestart}
                type="button"
              >
                <AppIcon name="refresh" size={18} />
                <span>Jogar novamente</span>
              </button>
              <button
                className="btn-pill-outline"
                onClick={() =>
                  navigate(`/livro/intro/vocabulario/${vocabSet.id}/flashcards`)
                }
                type="button"
              >
                Flashcards
              </button>
              <button
                className="btn-pill-outline"
                onClick={() =>
                  navigate(`/livro/intro/vocabulario/${vocabSet.id}/memoria`)
                }
                type="button"
              >
                Jogo da Memória
              </button>
              <button
                className="btn-soft"
                onClick={() => navigate("/livro/intro/vocabulario")}
                type="button"
              >
                Voltar ao vocabulário
              </button>
            </div>
          </section>
        ) : (
          current && (
            <section className="quiz-card">
              <div className="quiz-card__top">
                <span className="pill-tag pill-tag--blue">Quiz Rápido</span>
                {streak >= 2 && (
                  <span className="combo-pill" aria-live="polite">
                    {streak} seguidas!
                  </span>
                )}
              </div>

              {xpFloat && answered && (
                <span className="fc-xp-float" key={xpFloat.key} aria-live="polite">
                  {xpFloat.label}
                </span>
              )}

              <div className="quiz-visual-wrap">
                <BookVisual item={current.item} size={104} />
                <h2 className="fc-word">{current.item.en}</h2>
                <span className="fc-pos">Escolha a tradução em português</span>
              </div>

              <div className="quiz-options" role="group" aria-label="Opções de resposta">
                {current.options.map((option) => {
                  const isOptionCorrect = answered && option === current.item.pt;
                  const isOptionWrong =
                    answered && option === selectedOption && option !== current.item.pt;
                  const stateClass = isOptionCorrect
                    ? "correct"
                    : isOptionWrong
                      ? "wrong"
                      : answered
                        ? "dimmed"
                        : "";
                  return (
                    <button
                      className={`quiz-option ${stateClass}`}
                      disabled={answered}
                      key={option}
                      onClick={() => handleSelect(option)}
                      type="button"
                    >
                      <span>{option}</span>
                      {isOptionCorrect && <AppIcon name="check" size={18} />}
                      {isOptionWrong && <AppIcon name="close" size={18} />}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="quiz-footer">
                  <div
                    aria-live="polite"
                    className={`status-banner ${
                      isCorrect ? "status-banner--success" : "status-banner--error"
                    }`}
                  >
                    <AppIcon name={isCorrect ? "check" : "close"} size={18} />
                    <span>
                      {isCorrect
                        ? `Correto! ${current.item.en} = ${current.item.pt}.`
                        : `Resposta correta: ${current.item.pt}.`}
                    </span>
                  </div>
                  <button
                    className="btn-3d-primary"
                    onClick={handleNext}
                    type="button"
                  >
                    {index === total - 1 ? "Concluir quiz" : "Próxima"}
                  </button>
                </div>
              )}
            </section>
          )
        )}
      </div>
    </AppShell>
  );
}
