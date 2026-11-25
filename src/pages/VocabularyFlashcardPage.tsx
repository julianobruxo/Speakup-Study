import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader, PrimaryButton } from "../components/AppShell";
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

const BODY_PARTS = getVocabularyEntriesByCategory("body");
const SWIPE_THRESHOLD = 70;

export default function VocabularyFlashcardPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [soundEnabled, setSoundPreference] = useState(isSoundEnabled);
  const [speechAvailable] = useState(isPronunciationAvailable);
  const [announcement, setAnnouncement] = useState("");
  const draggedRef = useRef(false);
  const completionIdRef = useRef(crypto.randomUUID());
  const revealedRunRef = useRef(new Set<string>());
  const [completionXp, setCompletionXp] = useState(false);
  const entry = BODY_PARTS[currentIndex];

  const goToCard = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= BODY_PARTS.length) return;
      cancelPronunciation();
      setFlipped(false);
      setCurrentIndex(nextIndex);
      setAnnouncement(
        `Flashcard ${nextIndex + 1} de ${BODY_PARTS.length}: ${
          BODY_PARTS[nextIndex].translation
        }.`,
      );
    },
    [],
  );

  const finish = useCallback(() => {
    cancelPronunciation();
    setFlipped(false);
    setCompleted(true);
    const validCompletion = revealedRunRef.current.size === BODY_PARTS.length;
    setCompletionXp(validCompletion);
    void recordFlashcardCompletion(
      completionIdRef.current,
      revealedRunRef.current.size,
    );
    setAnnouncement("Sessão de flashcards concluída.");
  }, []);

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
    };
  }, []);

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

  function revealCard() {
    if (flipped) {
      cancelPronunciation();
      setFlipped(false);
      setAnnouncement(`${entry.translation}. Frente do flashcard.`);
      return;
    }

    setFlipped(true);
    revealedRunRef.current.add(entry.id);
    void recordFlashcardReveal(entry.id);
    const spoken = speakEnglish(entry.term);
    if (spoken) {
      setAnnouncement(`${entry.term}. Pronúncia reproduzida.`);
    } else if (!speechAvailable) {
      setAnnouncement(
        `${entry.term}. Não foi possível reproduzir a pronúncia neste dispositivo.`,
      );
    } else {
      setAnnouncement(`${entry.term}. O som está desativado.`);
    }
  }

  function repeatPronunciation() {
    const spoken = speakEnglish(entry.term);
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
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    completionIdRef.current = crypto.randomUUID();
    revealedRunRef.current = new Set();
    setCompletionXp(false);
    setAnnouncement("Revisão iniciada. Flashcard 1 de 24.");
  }

  if (completed) {
    return (
      <AppShell className="vocabulary-session-page" hideNavigation>
        <PageHeader
          onBack={() => navigate("/vocabulario/body")}
          title="Partes do corpo"
        />
        <main className="flashcard-completion">
          <span className="completion-icon" aria-hidden="true">
            <AppIcon name="check" size={28} />
          </span>
          <span className="eyebrow">Sessão concluída</span>
          <h2>Você concluiu Partes do corpo</h2>
          <p className="completion-count">24 palavras estudadas</p>
          <p className="completion-xp">
            {completionXp
              ? "+25 XP de conclusão"
              : "Revele os 24 cards para ganhar o bônus de conclusão."}
          </p>
          <p>Agora revise as palavras sem olhar a tradução e tente usá-las em frases curtas.</p>
          <div className="completion-actions">
            <PrimaryButton
              icon={<AppIcon name="grid" size={19} />}
              onClick={() => navigate("/vocabulario")}
            >
              Estudar outro tema
            </PrimaryButton>
            <PrimaryButton
              icon={<AppIcon name="refresh" size={19} />}
              onClick={restart}
              variant="secondary"
            >
              Rever os flashcards
            </PrimaryButton>
            <PrimaryButton
              icon={<AppIcon name="home" size={19} />}
              onClick={() => navigate("/")}
              variant="quiet"
            >
              Voltar ao início
            </PrimaryButton>
          </div>
        </main>
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </AppShell>
    );
  }

  const progress = ((currentIndex + 1) / BODY_PARTS.length) * 100;

  return (
    <AppShell className="vocabulary-session-page" hideNavigation>
      <PageHeader
        action={
          <button
            aria-label={soundEnabled ? "Desativar som" : "Ativar som"}
            aria-pressed={soundEnabled}
            className="icon-button"
            onClick={toggleSound}
            title={soundEnabled ? "Desativar som" : "Ativar som"}
          >
            <AppIcon name={soundEnabled ? "volume" : "volume-off"} />
          </button>
        }
        onBack={() => navigate("/vocabulario/body")}
        title="Partes do corpo"
      />

      <main className="flashcard-session">
        <div className="flashcard-progress-copy">
          <strong>
            {currentIndex + 1} de {BODY_PARTS.length}
          </strong>
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          aria-label={`Progresso: ${currentIndex + 1} de ${BODY_PARTS.length}`}
          aria-valuemax={BODY_PARTS.length}
          aria-valuemin={1}
          aria-valuenow={currentIndex + 1}
          className="flashcard-progress"
          role="progressbar"
        >
          <i style={{ width: `${progress}%` }} />
        </div>

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="flashcard-drag-area"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          key={entry.id}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        >
          <motion.div
            animate={{ rotateY: reduceMotion ? 0 : flipped ? 180 : 0 }}
            aria-label={`${entry.translation}. Toque para revelar o inglês.`}
            aria-pressed={flipped}
            className={`vocabulary-flashcard ${flipped ? "is-flipped" : ""} ${
              reduceMotion ? "reduce-motion" : ""
            }`}
            onClick={(event) => {
              if (
                draggedRef.current ||
                (event.target as HTMLElement).closest("button")
              ) {
                return;
              }
              revealCard();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                revealCard();
              }
            }}
            role="button"
            tabIndex={0}
            initial={false}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          >
            <section
              aria-hidden={flipped}
              className="flashcard-face flashcard-front"
            >
              <VisualAsset
                className="flashcard-visual"
                label={entry.translation}
                visualKey={entry.visualKey ?? entry.id}
              />
              <div className="flashcard-word">
                <h2>{entry.translation}</h2>
                <span>Toque para revelar</span>
              </div>
            </section>
            <section
              aria-hidden={!flipped}
              className="flashcard-face flashcard-back"
            >
              <span className="eyebrow">Em inglês</span>
              <h2>{entry.term}</h2>
              <button
                className="listen-again-button"
                disabled={!soundEnabled || !speechAvailable}
                onClick={(event) => {
                  event.stopPropagation();
                  repeatPronunciation();
                }}
                type="button"
              >
                <AppIcon name="volume" size={20} />
                <span>Ouvir novamente</span>
              </button>
              {!speechAvailable && (
                <p className="speech-fallback">
                  Pronúncia indisponível neste navegador.
                </p>
              )}
              {speechAvailable && !soundEnabled && (
                <p className="speech-fallback">Ative o som para ouvir.</p>
              )}
            </section>
          </motion.div>
        </motion.div>

        <p className="swipe-hint">Deslize para navegar entre os cartões.</p>
        <div className="flashcard-navigation">
          <PrimaryButton
            disabled={currentIndex === 0}
            onClick={goPrevious}
            variant="secondary"
          >
            Anterior
          </PrimaryButton>
          <PrimaryButton onClick={goNext}>
            {currentIndex === BODY_PARTS.length - 1 ? "Concluir" : "Próximo"}
          </PrimaryButton>
        </div>
      </main>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </AppShell>
  );
}

