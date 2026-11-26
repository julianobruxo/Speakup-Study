import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import Toast from "../components/Toast";
import { IRREGULAR_VERBS } from "../content/data/irregularVerbs";
import { getVocabularyEntriesByCategory } from "../content/data/vocabulary";
import { getVocabularyCategoryById } from "../content/taxonomy";
import type { VocabularyCategoryId } from "../shared/types/domain";
import "../styles/estudar.css";

export default function VocabularyCategoryPage() {
  const navigate = useNavigate();
  const { categoryId = "" } = useParams();
  const [notice, setNotice] = useState("");
  const category = getVocabularyCategoryById(
    categoryId as VocabularyCategoryId,
  );

  if (!category) {
    return (
      <AppShell activeNav="study" className="standard-page">
        <div className="catalog-page">
          <PageHeader backTo="/vocabulario" title="Vocabulário" />
          <section className="empty-state">
            <h2 className="empty-state__title">Categoria não encontrada</h2>
            <p className="empty-state__body">
              Escolha uma das categorias disponíveis para continuar estudando.
            </p>
            <button
              className="btn-3d-primary btn-3d-primary--sm"
              onClick={() => navigate("/vocabulario")}
              type="button"
            >
              Ver categorias
            </button>
          </section>
        </div>
      </AppShell>
    );
  }

  const regularEntries = getVocabularyEntriesByCategory(category.id);
  const previews =
    category.id === "irregular_verbs"
      ? IRREGULAR_VERBS.slice(0, 6).map((entry) => ({
          id: entry.id,
          term: entry.baseForm,
          translation: `${entry.simplePast} · ${entry.translation}`,
        }))
      : regularEntries.slice(0, 6);

  function showComingSoon() {
    setNotice("A prática de vocabulário estará disponível em breve.");
    window.setTimeout(() => setNotice(""), 2200);
  }

  if (category.id === "body") {
    return (
      <AppShell activeNav="study" className="standard-page">
        <div className="catalog-page">
          <PageHeader backTo="/vocabulario" title="Partes do corpo" />

          <section className="catalog-lead">
            <span className="catalog-lead__kicker">
              {regularEntries.length} flashcards
            </span>
            <h2 className="catalog-lead__title">
              Aprenda com imagem e pronúncia
            </h2>
            <p className="catalog-lead__desc">
              Pratique {regularEntries.length} palavras com ilustrações
              destacadas e pronúncia em inglês americano.
            </p>
          </section>

          <div className="word-preview-grid" aria-label="Prévia do conteúdo">
            {regularEntries.slice(0, 6).map((entry) => (
              <div className="word-preview-card" key={entry.id}>
                <strong>{entry.translation}</strong>
                <span>{entry.term}</span>
              </div>
            ))}
          </div>

          <div className="catalog-actions">
            <button
              className="btn-3d-primary"
              onClick={() => navigate("/vocabulario/body/flashcards")}
              type="button"
            >
              <AppIcon name="book" size={18} />
              <span>Estudar com flashcards</span>
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="study" className="standard-page">
      <div className="catalog-page">
        <PageHeader backTo="/vocabulario" title={category.title} />

        <section className="catalog-lead">
          <span className="catalog-lead__kicker">Prévia da categoria</span>
          <h2 className="catalog-lead__title">Conheça algumas palavras</h2>
          <p className="catalog-lead__desc">
            O banco já está organizado. A experiência de estudo completa será
            liberada em breve.
          </p>
        </section>

        <div className="word-preview-grid">
          {previews.map((entry) => (
            <div className="word-preview-card" key={entry.id}>
              <strong>{entry.term}</strong>
              <span>{entry.translation}</span>
            </div>
          ))}
        </div>

        <div className="status-banner status-banner--info">
          <AppIcon name="lock" size={18} />
          <span>Flashcards e prática em breve nesta categoria.</span>
        </div>

        <div className="catalog-actions">
          <button
            className="btn-pill-outline"
            onClick={showComingSoon}
            type="button"
          >
            <AppIcon name="lock" size={16} />
            <span>Praticar em breve</span>
          </button>
        </div>
      </div>

      <Toast message={notice} />
    </AppShell>
  );
}
