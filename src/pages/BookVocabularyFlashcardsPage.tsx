import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader, PrimaryButton } from "../components/AppShell";
import { BookVisual } from "../components/BookVisual";
import { getIntroVocabularySet } from "../content/books/intro";
import {
  cancelPronunciation,
  isPronunciationAvailable,
  speakEnglish,
} from "../services/audio/pronunciation";
import { recordFlashcardReveal } from "../services/progress/engagement";

export default function BookVocabularyFlashcardsPage() {
  const navigate = useNavigate();
  const { setId } = useParams();
  const vocabSet = getIntroVocabularySet(setId);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const speechAvailable = isPronunciationAvailable();

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    cancelPronunciation();
    return cancelPronunciation;
  }, [setId]);

  useEffect(() => cancelPronunciation, [index]);

  if (!vocabSet) {
    return (
      <AppShell activeNav="study" className="standard-page">
        <PageHeader backTo="/livro/intro/vocabulario" title="Flashcards" />
        <section className="empty-state">
          <h2>Conjunto não encontrado</h2>
          <PrimaryButton onClick={() => navigate("/livro/intro/vocabulario")}>
            Voltar ao vocabulário
          </PrimaryButton>
        </section>
      </AppShell>
    );
  }

  const items = vocabSet.items;
  const current = items[index];
  const progress = Math.round(((index + 1) / items.length) * 100);

  function toggleFlip() {
    if (!current) return;
    if (!flipped) {
      void recordFlashcardReveal(current.id);
    }
    setFlipped((prev) => !prev);
  }

  function goPrevious() {
    if (index === 0) return;
    cancelPronunciation();
    setFlipped(false);
    setIndex((prev) => prev - 1);
  }

  function goNext() {
    cancelPronunciation();
    if (index >= items.length - 1) {
      setFlipped(false);
      setCompleted(true);
      return;
    }
    setFlipped(false);
    setIndex((prev) => prev + 1);
  }

  function restart() {
    cancelPronunciation();
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
  }

  if (completed) {
    return (
      <AppShell className="vocabulary-session-page" hideNavigation>
        <PageHeader
          onBack={() => navigate("/livro/intro/vocabulario")}
          title={vocabSet.title}
        />
        <main className="flashcard-completion">
          <span className="completion-icon" aria-hidden="true">
            <AppIcon name="check" size={28} />
          </span>
          <span className="eyebrow">Flashcards concluídos</span>
          <h2>Você revisou {vocabSet.title}</h2>
          <p className="completion-count">{items.length} palavras estudadas</p>
          <div className="completion-actions">
            <PrimaryButton
              icon={<AppIcon name="grid" size={18} />}
              onClick={() =>
                navigate(`/livro/intro/vocabulario/${vocabSet.id}/memoria`)
              }
            >
              Jogar Memória
            </PrimaryButton>
            <PrimaryButton
              icon={<AppIcon name="refresh" size={18} />}
              onClick={restart}
              variant="secondary"
            >
              Rever flashcards
            </PrimaryButton>
            <PrimaryButton
              icon={<AppIcon name="book" size={18} />}
              onClick={() => navigate("/livro/intro/vocabulario")}
              variant="quiet"
            >
              Outros conjuntos
            </PrimaryButton>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell className="vocabulary-session-page" hideNavigation>
      <PageHeader
        onBack={() => navigate("/livro/intro/vocabulario")}
        title={vocabSet.title}
      />

      <main className="flashcard-session">
        <div className="flashcard-progress-copy">
          <strong>
            {index + 1} de {items.length}
          </strong>
          <span>{progress}%</span>
        </div>
        <div
          aria-label={`Progresso: ${index + 1} de ${items.length}`}
          aria-valuemax={items.length}
          aria-valuemin={1}
          aria-valuenow={index + 1}
          className="flashcard-progress"
          role="progressbar"
        >
          <i style={{ width: `${progress}%` }} />
        </div>

        <section
          aria-label={
            flipped
              ? `Verso: ${current.pt}. Toque para voltar à frente.`
              : `Frente: ${current.en}. Toque para ver a tradução em português.`
          }
          className="section-card"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("button")) return;
            toggleFlip();
          }}
          onKeyDown={(event) => {
            if ((event.target as HTMLElement).closest("button")) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleFlip();
            }
          }}
          role="button"
          style={{
            cursor: "pointer",
            textAlign: "center",
            padding: "28px 20px",
            minHeight: 290,
            display: "grid",
            placeItems: "center",
            gap: 14,
          }}
          tabIndex={0}
        >
          {!flipped ? (
            <>
              <span className="eyebrow">Frente · English (en-US)</span>
              <BookVisual item={current} size={112} />
              <h2 style={{ margin: 0, fontSize: "1.75rem" }}>{current.en}</h2>
              <button
                className="listen-again-button"
                disabled={!speechAvailable}
                onClick={(event) => {
                  event.stopPropagation();
                  speakEnglish(current.en);
                }}
                type="button"
              >
                <AppIcon name="volume" size={18} />
                <span>Ouvir em inglês</span>
              </button>
              <small>Toque no cartão para ver em português</small>
            </>
          ) : (
            <>
              <span className="eyebrow">Verso · Português (PT-BR)</span>
              <h2 style={{ margin: 0, fontSize: "1.75rem" }}>{current.pt}</h2>
              <p style={{ margin: 0, opacity: 0.75 }}>{current.en}</p>
              <button
                className="listen-again-button"
                disabled={!speechAvailable}
                onClick={(event) => {
                  event.stopPropagation();
                  speakEnglish(current.en);
                }}
                type="button"
              >
                <AppIcon name="volume" size={18} />
                <span>Ouvir pronúncia (en-US)</span>
              </button>
              <small>Toque no cartão para voltar à frente</small>
            </>
          )}
        </section>

        <div className="flashcard-navigation">
          <PrimaryButton
            disabled={index === 0}
            onClick={goPrevious}
            variant="secondary"
          >
            Anterior
          </PrimaryButton>
          <PrimaryButton onClick={goNext}>
            {index === items.length - 1 ? "Concluir" : "Próximo"}
          </PrimaryButton>
        </div>
      </main>
    </AppShell>
  );
}
