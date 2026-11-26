import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import { BookVisual } from "../components/BookVisual";
import {
  getIntroVocabularySet,
  type BookSvgVariant,
  type BookVocabularyItem,
} from "../content/books/intro";
import {
  cancelPronunciation,
  isPronunciationAvailable,
  speakEnglish,
} from "../services/audio/pronunciation";
import { recordFlashcardReveal } from "../services/progress/engagement";
import "../styles/activities.css";

const POS_BY_VARIANT: Record<BookSvgVariant, string> = {
  greeting: "Expressão",
  school: "Substantivo",
  globe: "Substantivo",
  clothing: "Substantivo",
  transport: "Substantivo",
  home: "Substantivo",
  briefcase: "Profissão",
  food: "Substantivo",
  sport: "Esporte",
  calendar: "Tempo",
  health: "Saúde",
  place: "Lugar",
  weekend: "Atividade",
  subject: "Disciplina",
};

function getPartOfSpeech(item: BookVocabularyItem): string {
  return POS_BY_VARIANT[item.svgVariant] ?? "Substantivo";
}

function HeartMasteryBadge({ count }: { count: number }) {
  return (
    <span
      className="fc-heart-badge"
      title={`${count} palavras reveladas nesta sessão`}
      aria-label={`${count} palavras reveladas`}
    >
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 23.2c-.4 0-.8-.14-1.12-.4C8.4 19.1 4 15.4 4 10.6 4 7.45 6.48 5 9.6 5c1.78 0 3.45.84 4.4 2.18C14.95 5.84 16.62 5 18.4 5 21.52 5 24 7.45 24 10.6c0 4.8-4.4 8.5-8.88 12.2-.32.26-.72.4-1.12.4Z"
          fill="#FF6E54"
        />
        <path
          d="M8.5 8.2c-1.1.3-2 1.25-2.1 2.4"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="21.5" cy="20.5" r="4.5" fill="#F78F1C" stroke="#F6F7FC" strokeWidth="1.4" />
        <circle cx="21.5" cy="20.5" r="1.9" fill="#FFE45E" />
      </svg>
    </span>
  );
}

function SpeakerFilledIcon() {
  return (
    <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M11.2 5.4c.5-.4 1.3-.05 1.3.6v12c0 .65-.8 1-1.3.6L7.1 15H4.5C3.67 15 3 14.33 3 13.5v-3C3 9.67 3.67 9 4.5 9h2.6l4.1-3.6Z"
        fill="currentColor"
      />
      <path
        d="M15.8 8.8a4.5 4.5 0 0 1 0 6.4M18.3 6.3a8 8 0 0 1 0 11.4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CoffeeCupIllustration() {
  return (
    <svg aria-hidden="true" width="128" height="128" viewBox="0 0 128 128" fill="none">
      {/* Steam lines */}
      <path
        d="M52 34c-3-5 3-9 0-15M64 31c-3-5 3-9 0-15M76 34c-3-5 3-9 0-15"
        stroke="#9CA5B0"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Saucer */}
      <ellipse cx="64" cy="96" rx="40" ry="12" fill="#C3E8D6" stroke="#2D3A42" strokeWidth="2.5" />
      <ellipse cx="64" cy="94" rx="26" ry="6" fill="#9FD7C2" opacity="0.55" />
      {/* Handle */}
      <path
        d="M90 56h7c6 0 10 4.5 10 10.5S103 77 97 77h-9"
        stroke="#2D3A42"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M91 61h5c3.2 0 5.5 2.4 5.5 5.5S99.2 72 96 72h-6"
        stroke="#2D3A42"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cup body */}
      <path
        d="M36 52h56v14c0 16.5-12.5 29-28 29S36 82.5 36 66V52Z"
        fill="#D3EBDB"
        stroke="#2D3A42"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Right cel-shading shadow */}
      <path
        d="M78 53h12.5v13c0 14.5-9.5 26-22.5 27.5 6.8-4.5 10-14 10-27.5V53Z"
        fill="#84BFCF"
        opacity="0.65"
      />
      {/* Left highlight */}
      <path
        d="M44 62v6c0 7 3.5 13 8.5 16.5"
        stroke="#FFFFFF"
        strokeOpacity="0.6"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Rim & Coffee */}
      <ellipse cx="64" cy="52" rx="28" ry="8.5" fill="#EAF6EF" stroke="#2D3A42" strokeWidth="2.5" />
      <ellipse cx="64" cy="53" rx="22" ry="5.5" fill="#A26E47" stroke="#2D3A42" strokeWidth="2" />
    </svg>
  );
}

export default function BookVocabularyFlashcardsPage() {
  const navigate = useNavigate();
  const { setId } = useParams();
  const vocabSet = getIntroVocabularySet(setId);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [xpFloat, setXpFloat] = useState<{ id: number; text: string } | null>(null);
  const revealedIdsRef = useRef<Set<string>>(new Set());
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechAvailable = isPronunciationAvailable();

  const clearSpeakTimer = useCallback(() => {
    if (speakTimerRef.current !== null) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    setRevealedCount(0);
    setXpFloat(null);
    revealedIdsRef.current = new Set();
    cancelPronunciation();
    clearSpeakTimer();
    return () => {
      cancelPronunciation();
      clearSpeakTimer();
    };
  }, [setId, clearSpeakTimer]);

  useEffect(() => {
    cancelPronunciation();
    clearSpeakTimer();
  }, [index, clearSpeakTimer]);

  const items = vocabSet?.items ?? [];
  const current = items[index];
  const progress = items.length > 0 ? Math.round(((index + 1) / items.length) * 100) : 0;

  const toggleFlip = useCallback(() => {
    if (!current) return;
    if (!flipped) {
      void recordFlashcardReveal(current.id);
      if (!revealedIdsRef.current.has(current.id)) {
        revealedIdsRef.current.add(current.id);
        setRevealedCount(revealedIdsRef.current.size);
        setXpFloat({ id: Date.now(), text: "+3 XP" });
      }
    }
    setFlipped((prev) => !prev);
  }, [current, flipped]);

  const goPrevious = useCallback(() => {
    if (index === 0) return;
    cancelPronunciation();
    setFlipped(false);
    setXpFloat(null);
    setIndex((prev) => prev - 1);
  }, [index]);

  const goNext = useCallback(() => {
    cancelPronunciation();
    if (index >= items.length - 1) {
      setFlipped(false);
      setXpFloat(null);
      setCompleted(true);
      return;
    }
    setFlipped(false);
    setXpFloat(null);
    setIndex((prev) => prev + 1);
  }, [index, items.length]);

  const handleSpeak = useCallback(() => {
    if (!current || !speechAvailable) return;
    speakEnglish(current.en);
    setIsSpeaking(true);
    if (speakTimerRef.current !== null) {
      clearTimeout(speakTimerRef.current);
    }
    speakTimerRef.current = setTimeout(() => {
      speakTimerRef.current = null;
      setIsSpeaking(false);
    }, 1100);
  }, [current, speechAvailable]);

  useEffect(() => {
    if (!vocabSet || completed) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (
        event.key === " " &&
        document.activeElement?.tagName !== "BUTTON" &&
        document.activeElement?.getAttribute("role") !== "button"
      ) {
        event.preventDefault();
        toggleFlip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [vocabSet, completed, goPrevious, goNext, toggleFlip]);

  if (!vocabSet) {
    return (
      <AppShell activeNav="study" className="standard-page">
        <PageHeader backTo="/livro/intro/vocabulario" title="Flashcards" />
        <div className="activity-page-container">
          <section className="empty-state">
            <h2 className="empty-state__title">Conjunto não encontrado</h2>
            <p className="empty-state__body">
              Escolha outro conjunto de vocabulário do Livro Intro para praticar.
            </p>
            <button
              className="btn-3d-primary"
              onClick={() => navigate("/livro/intro/vocabulario")}
              type="button"
            >
              Voltar ao vocabulário
            </button>
          </section>
        </div>
      </AppShell>
    );
  }

  function restart() {
    cancelPronunciation();
    clearSpeakTimer();
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    setRevealedCount(0);
    setXpFloat(null);
    revealedIdsRef.current = new Set();
  }

  if (completed) {
    return (
      <AppShell className="vocabulary-session-page" hideNavigation>
        <div className="fc-page">
          <header className="fc-topbar">
            <button
              aria-label="Fechar flashcards"
              className="icon-btn-minimal"
              onClick={() => navigate("/livro/intro/vocabulario")}
              type="button"
            >
              <AppIcon name="close" size={20} strokeWidth={1.8} />
            </button>
            <div
              aria-label={`Progresso: ${items.length} de ${items.length}`}
              aria-valuemax={items.length}
              aria-valuemin={1}
              aria-valuenow={items.length}
              className="fc-topbar__progress"
              role="progressbar"
            >
              <span className="fc-topbar__fill" style={{ width: "100%" }} />
            </div>
            <HeartMasteryBadge count={revealedCount} />
          </header>

          <section className="activity-completion" role="status">
            <span className="activity-completion__icon" aria-hidden="true">
              <AppIcon name="check" size={30} />
            </span>
            <span className="activity-completion__kicker">Flashcards concluídos</span>
            <h2>Você revisou {vocabSet.title}</h2>
            <p>{items.length} palavras estudadas nesta rodada.</p>
            <div className="activity-completion__actions">
              <button
                className="btn-3d-primary"
                onClick={() =>
                  navigate(`/livro/intro/vocabulario/${vocabSet.id}/memoria`)
                }
                type="button"
              >
                <AppIcon name="grid" size={18} />
                <span>Jogar Memória</span>
              </button>
              <button
                className="btn-pill-outline"
                onClick={restart}
                type="button"
              >
                <AppIcon name="refresh" size={18} />
                <span>Rever flashcards</span>
              </button>
              <button
                className="btn-soft"
                onClick={() => navigate("/livro/intro/vocabulario")}
                type="button"
              >
                <AppIcon name="book" size={18} />
                <span>Outros conjuntos</span>
              </button>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell className="vocabulary-session-page" hideNavigation>
      <div className="fc-page">
        <header className="fc-topbar">
          <button
            aria-label="Fechar flashcards"
            className="icon-btn-minimal"
            onClick={() => navigate("/livro/intro/vocabulario")}
            type="button"
          >
            <AppIcon name="close" size={20} strokeWidth={1.8} />
          </button>
          <div
            aria-label={`Progresso: ${index + 1} de ${items.length}`}
            aria-valuemax={items.length}
            aria-valuemin={1}
            aria-valuenow={index + 1}
            className="fc-topbar__progress"
            role="progressbar"
          >
            <span className="fc-topbar__fill" style={{ width: `${progress}%` }} />
          </div>
          <HeartMasteryBadge count={revealedCount} />
        </header>

        <div className="fc-main">
          <div className="fc-stage">
            <div
              aria-hidden="true"
              className={`fc-peek fc-peek--prev${index === 0 ? " is-empty" : ""}`}
            />

            <section
              aria-label={
                flipped
                  ? `${current.en} significa ${current.pt}. Toque para ocultar tradução.`
                  : `${current.en}. Toque para revelar a tradução em português.`
              }
              className={`fc-card${flipped ? " is-flipped" : ""}`}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("button")) return;
                toggleFlip();
              }}
              onKeyDown={(event) => {
                if ((event.target as HTMLElement).closest("button")) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleFlip();
                }
              }}
              role="button"
              tabIndex={0}
            >
              {xpFloat && (
                <span className="fc-xp-float" key={xpFloat.id} aria-hidden="true">
                  {xpFloat.text}
                </span>
              )}

              <div className="fc-visual">
                {current.en.trim().toLowerCase() === "coffee" ? (
                  <CoffeeCupIllustration />
                ) : (
                  <BookVisual item={current} size={126} />
                )}
              </div>

              <h2 className="fc-word">{current.en}</h2>
              <span className="fc-pos">{getPartOfSpeech(current)}</span>

              <button
                aria-label={`Ouvir pronúncia de ${current.en}`}
                className={`btn-audio-circle fc-audio-btn${isSpeaking ? " is-playing" : ""}`}
                disabled={!speechAvailable}
                onClick={(event) => {
                  event.stopPropagation();
                  handleSpeak();
                }}
                type="button"
              >
                <SpeakerFilledIcon />
              </button>
            </section>

            <div
              aria-hidden="true"
              className={`fc-peek fc-peek--next${index >= items.length - 1 ? " is-empty" : ""}`}
            />
          </div>

          <div className="fc-translation-slot" aria-live="polite">
            {flipped ? (
              <span className="fc-translation-text">{current.pt}</span>
            ) : (
              <span className="fc-translation-hint">
                Toque em Virar para revelar
              </span>
            )}
          </div>

          <div className="fc-actions">
            <button
              className="btn-pill-outline fc-nav-btn"
              disabled={index === 0}
              onClick={goPrevious}
              type="button"
            >
              <span aria-hidden="true">&lsaquo;</span>
              <span>Anterior</span>
            </button>

            <button
              className="btn-3d-primary fc-flip-btn"
              onClick={toggleFlip}
              type="button"
            >
              Virar
            </button>

            <button
              className="btn-pill-outline fc-nav-btn"
              onClick={goNext}
              type="button"
            >
              <span>{index === items.length - 1 ? "Concluir" : "Próximo"}</span>
              {index < items.length - 1 && <span aria-hidden="true">&rsaquo;</span>}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
