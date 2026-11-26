import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import { CategoryBadgeIcon, OpenBookBadgeIcon } from "../components/BookVisual";
import { ACTIVE_VOCABULARY_CATEGORIES } from "../content/taxonomy";
import { getVocabularyEntriesByCategory } from "../content/data/vocabulary";
import "../styles/estudar.css";

export default function VocabularyPage() {
  const navigate = useNavigate();

  return (
    <AppShell activeNav="study" className="standard-page">
      <div className="catalog-page">
        <PageHeader backTo="/estudar" title="Vocabulário" />

        <section className="catalog-lead">
          <span className="catalog-lead__kicker">2 áreas disponíveis</span>
          <h2 className="catalog-lead__title">Explore novas palavras</h2>
          <p className="catalog-lead__desc">
            Estude partes do corpo com ilustrações ou os 14 conjuntos do Livro
            Intro com áudio.
          </p>
        </section>

        <div className="catalog-list">
          {ACTIVE_VOCABULARY_CATEGORIES.filter(
            (category) => category.id === "body",
          ).map((category) => {
            const count = getVocabularyEntriesByCategory(category.id).length;
            return (
              <button
                className="catalog-card"
                key={category.id}
                onClick={() => navigate(`/vocabulario/${category.id}`)}
                type="button"
              >
                <span className="category-badge category-badge--orange">
                  <CategoryBadgeIcon size={34} variant="health" />
                </span>
                <span className="catalog-card__body">
                  <strong className="catalog-card__title">
                    Partes do corpo
                  </strong>
                  <span className="catalog-card__desc">
                    {category.description}
                  </span>
                </span>
                <span className="catalog-card__trailing">
                  <span className="pill-tag pill-tag--blue">
                    {count} palavras
                  </span>
                  <AppIcon name="chevron-right" size={18} />
                </span>
              </button>
            );
          })}

          <button
            className="catalog-card"
            onClick={() => navigate("/livro/intro/vocabulario")}
            type="button"
          >
            <span className="category-badge category-badge--cyan">
              <OpenBookBadgeIcon size={32} />
            </span>
            <span className="catalog-card__body">
              <strong className="catalog-card__title">
                Livro Intro · Vocabulário
              </strong>
              <span className="catalog-card__desc">
                14 conjuntos com flashcards em áudio (en-US), Jogo da Memória e
                Quiz Rápido.
              </span>
            </span>
            <span className="catalog-card__trailing">
              <span className="pill-tag pill-tag--blue">14 conjuntos</span>
              <AppIcon name="chevron-right" size={18} />
            </span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
