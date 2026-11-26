import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import { getVocabularyEntriesByCategory } from "../content/data/vocabulary";
import { VisualAsset } from "../content/assets/visualResolver";
import {
  cancelPronunciation,
  isPronunciationAvailable,
  speakEnglish,
} from "../services/audio/pronunciation";
import {
  isSoundEnabled,
  setSoundEnabled,
  SOUND_PREFERENCE_EVENT,
} from "../services/audio/sound";
import {
  recordFlashcardCompletion,
  recordFlashcardReveal,
} from "../services/progress/engagement";
import "../styles/activities.css";

const BODY_PARTS = getVocabularyEntriesByCategory("body");
const SWIPE_THRESHOLD = 70;

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

export default function VocabularyFlashcardPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [speechAvailable] = useState(isPronunciationAvailable);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const draggedRef = useRef(false);
  const completionIdRef = useRef(crypto.randomUUID());
  const revealedRunRef = useRef(new Set<string>());
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [completionXp, setCompletionXp] = useState(false);
  const entry = BODY_PARTS[currentIndex];

  const clearSpeakTimer = useCallback(() => {
    if (speakTimerRef.current !== null) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const goToCard = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= BODY_PARTS.length) return;
      cancelPronunciation();
      clearSpeakTimer();
      setFlipped(false);
      setCurrentIndex(nextIndex);
      setAnnouncement(
        `Flashcard ${nextIndex + 1} de ${BODY_PARTS.length}: ${
          BODY_PARTS[nextIndex].term
        }.`,
      );
    },
    [clearSpeakTimer],
  );

  const finish = useCallback(() => {
    cancelPronunciation();
    clearSpeakTimer();
    setFlipped(false);
    setCompleted(true);
    const validCompletion = revealedRunRef.current.size === BODY_PARTS.length;
    setCompletionXp(validCompletion);
    void recordFlashcardCompletion(
      completionIdRef.current,
      revealedRunRef.current.size,
    );
    setAnnouncement("Sessão de flashcards concluída.");
  }, [clearSpeakTimer]);

  const goNext = useCallback(() => {
    if (currentIndex === BODY_PARTS.length - 1) {
      finish();
    } else {
      goToCard(currentIndex + 1);
    }
  }, [currentIndex, finish, goToCard]);

  const goPrevious = useCallback(() => {
    goToCard(currentIndex - 1);
  }, [currentIndex, goToCard]);

  useEffect(() => {
    const syncSound = () => {
      const enabled = isSoundEnabled();
      setSoundPreference(enabled);
      if (!enabled) cancelPronunciation();
    };
    window.addEventListener(SOUND_PREFERENCE_EVENT, syncSound);
    return () => {
      window.removeEventListener(SOUND_PREFERENCE_EVENT, syncSound);
      cancelPronunciation();
      clearSpeakTimer();
    };
  }, [clearSpeakTimer]);

  useEffect(() => {
    if (completed) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completed, goNext, goPrevious]);

  function triggerSpeak(term: string) {
    const spoken = speakEnglish(term);
    if (spoken) {
      setIsSpeaking(true);
      if (speakTimerRef.current !== null) clearTimeout(speakTimerRef.current);
      speakTimerRef.current = setTimeout(() => {
        speakTimerRef.current = null;
        setIsSpeaking(false);
      }, 1100);
    }
    return spoken;
  }

  function revealCard() {
    if (flipped) {
      cancelPronunciation();
      clearSpeakTimer();
      setFlipped(false);
      setAnnouncement(`${entry.term}. Tradução oculta.`);
      return;
    }

    setFlipped(true);
    revealedRunRef.current.add(entry.id);
    setRevealedCount(revealedRunRef.current.size);
    void recordFlashcardReveal(entry.id);
    const spoken = triggerSpeak(entry.term);
    if (spoken) {
      setAnnouncement(`${entry.term}: ${entry.translation}. Pronúncia reproduzida.`);
    } else if (!speechAvailable) {
      setAnnouncement(
        `${entry.term}: ${entry.translation}. Não foi possível reproduzir a pronúncia neste dispositivo.`,
      );
    } else {
      setAnnouncement(`${entry.term}: ${entry.translation}. O som está desativado.`);
    }
  }

  function repeatPronunciation() {
    const spoken = triggerSpeak(entry.term);
    if (spoken) {
      setAnnouncement(`${entry.term}. Pronúncia repetida.`);
    }
  }

  function toggleSound() {
    const nextValue = !soundEnabled;
    setSoundEnabled(nextValue);
    setAnnouncement(nextValue ? "Som ativado." : "Som desativado.");
  }

  function handleDrag(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) > 8) draggedRef.current = true;
  }

  function handleDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const shouldNavigate =
      Math.abs(info.offset.x) >= SWIPE_THRESHOLD ||
      Math.abs(info.velocity.x) >= 500;
    if (shouldNavigate) {
      if (info.offset.x < 0) goNext();
      if (info.offset.x > 0) goPrevious();
    }
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  }

  function restart() {
    cancelPronunciation();
    clearSpeakTimer();
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setRevealedCount(0);
    completionIdRef.current = crypto.randomUUID();
    revealedRunRef.current = new Set();
    setCompletionXp(false);
    setAnnouncement("Revisão iniciada. Flashcard 1 de 24.");
  }

  if (completed) {
    return (
      <AppShell className="vocabulary-session-page" hideNavigation>
        <div className="fc-page">
          <header className="fc-topbar">
            <button
              aria-label="Voltar"
              className="icon-btn-minimal"
              onClick={() => navigate("/vocabulario/body")}
              type="button"
            >
              <AppIcon name="close" size={20} strokeWidth={1.8} />
            </button>
            <div
              aria-label="Progresso: 100%"
              aria-valuemax={BODY_PARTS.length}
              aria-valuemin={1}
              aria-valuenow={BODY_PARTS.length}
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
            <span className="activity-completion__kicker">Sessão concluída</span>
            <h2>Você concluiu Partes do corpo</h2>
            <p>
              24 palavras estudadas ·{" "}
              {completionXp
                ? "+25 XP de conclusão"
                : "Revele os 24 cards para ganhar o bônus de conclusão."}
            </p>
            <div className="activity-completion__actions">
              <button
                className="btn-3d-primary"
                onClick={() => navigate("/vocabulario")}
                type="button"
              >
                <AppIcon name="grid" size={18} />
                <span>Estudar outro tema</span>
              </button>
              <button
                className="btn-pill-outline"
                onClick={restart}
                type="button"
              >
                <AppIcon name="refresh" size={18} />
                <span>Rever os flashcards</span>
              </button>
              <button
                className="btn-soft"
                onClick={() => navigate("/")}
                type="button"
              >
                <AppIcon name="home" size={18} />
                <span>Voltar ao início</span>
              </button>
            </div>
          </section>
        </div>
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </AppShell>
    );
  }

  const progress = Math.round(((currentIndex + 1) / BODY_PARTS.length) * 100);

  return (
    <AppShell className="vocabulary-session-page" hideNavigation>
      <div className="fc-page">
        <header className="fc-topbar">
          <button
            aria-label="Voltar para Partes do corpo"
            className="icon-btn-minimal"
            onClick={() => navigate("/vocabulario/body")}
            type="button"
          >
            <AppIcon name="close" size={20} strokeWidth={1.8} />
          </button>

          <div
            aria-label={`Progresso: ${currentIndex + 1} de ${BODY_PARTS.length}`}
            aria-valuemax={BODY_PARTS.length}
            aria-valuemin={1}
            aria-valuenow={currentIndex + 1}
            className="fc-topbar__progress"
            role="progressbar"
          >
            <span className="fc-topbar__fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="fc-topbar__right">
            <button
              aria-label={soundEnabled ? "Desativar som" : "Ativar som"}
              aria-pressed={soundEnabled}
              className="icon-btn-minimal"
              onClick={toggleSound}
              title={soundEnabled ? "Desativar som" : "Ativar som"}
              type="button"
            >
              <AppIcon
                name={soundEnabled ? "volume" : "volume-off"}
                size={19}
                strokeWidth={1.8}
              />
            </button>
            <HeartMasteryBadge count={revealedCount} />
          </div>
        </header>

        <div className="fc-main">
          <div className="fc-stage">
            <div
              aria-hidden="true"
              className={`fc-peek fc-peek--prev${currentIndex === 0 ? " is-empty" : ""}`}
            />

            <motion.section
              animate={{ opacity: 1, x: 0 }}
              aria-label={
                flipped
                  ? `${entry.term} significa ${entry.translation}. Toque para ocultar.`
                  : `${entry.term}. Toque para revelar a tradução.`
              }
              aria-pressed={flipped}
              className={`fc-card${flipped ? " is-flipped" : ""}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              initial={reduceMotion ? false : { opacity: 0, x: 20 }}
              key={entry.id}
              onClick={(event) => {
                if (
                  draggedRef.current ||
                  (event.target as HTMLElement).closest("button")
                ) {
                  return;
                }
                revealCard();
              }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onKeyDown={(event) => {
                if ((event.target as HTMLElement).closest("button")) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  revealCard();
                }
              }}
              role="button"
              tabIndex={0}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
            >
              <div className="fc-visual">
                <VisualAsset
                  className="flashcard-visual"
                  label={entry.translation}
                  visualKey={entry.visualKey ?? entry.id}
                />
              </div>
              <h2 className="fc-word">{entry.term}</h2>
              <span className="fc-pos">Substantivo</span>

              <button
                aria-label={`Ouvir pronúncia de ${entry.term}`}
                className={`btn-audio-circle fc-audio-btn${isSpeaking ? " is-playing" : ""}`}
                disabled={!soundEnabled || !speechAvailable}
                onClick={(event) => {
                  event.stopPropagation();
                  repeatPronunciation();
                }}
                type="button"
              >
                <SpeakerFilledIcon />
              </button>
            </motion.section>

            <div
              aria-hidden="true"
              className={`fc-peek fc-peek--next${
                currentIndex >= BODY_PARTS.length - 1 ? " is-empty" : ""
              }`}
            />
          </div>

          <div className="fc-translation-slot" aria-live="polite">
            {flipped ? (
              <span className="fc-translation-text">{entry.translation}</span>
            ) : (
              <span className="fc-translation-hint">
                Toque em Virar para revelar
              </span>
            )}
          </div>

          <div className="fc-actions">
            <button
              className="btn-pill-outline fc-nav-btn"
              disabled={currentIndex === 0}
              onClick={goPrevious}
              type="button"
            >
              <span aria-hidden="true">&lsaquo;</span>
              <span>Anterior</span>
            </button>

            <button
              className="btn-3d-primary fc-flip-btn"
              onClick={revealCard}
              type="button"
            >
              Virar
            </button>

            <button
              className="btn-pill-outline fc-nav-btn"
              onClick={goNext}
              type="button"
            >
              <span>
                {currentIndex === BODY_PARTS.length - 1 ? "Concluir" : "Próximo"}
              </span>
              {currentIndex < BODY_PARTS.length - 1 && (
                <span aria-hidden="true">&rsaquo;</span>
              )}
            </button>
          </div>
        </div>
      </div>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </AppShell>
  );
}
