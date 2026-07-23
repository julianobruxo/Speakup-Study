import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import {
  AppShell,
  PageHeader,
  PrimaryButton,
} from "../components/AppShell";
import Toast from "../components/Toast";
import { IRREGULAR_VERBS } from "../content/data/irregularVerbs";
import { getVocabularyEntriesByCategory } from "../content/data/vocabulary";
import { getVocabularyCategoryById } from "../content/taxonomy";
import type { VocabularyCategoryId } from "../shared/types/domain";

export default function VocabularyCategoryPage() {
  const navigate = useNavigate();
  const { categoryId = "" } = useParams();
  const [notice, setNotice] = useState("");
  const category = getVocabularyCategoryById(
    categoryId as VocabularyCategoryId,
  );

  if (!category) {
    return (
      <AppShell className="standard-page">
        <PageHeader backTo="/vocabulario" title="Vocabulário" />
        <section className="empty-state">
          <h2>Categoria não encontrada</h2>
          <PrimaryButton onClick={() => navigate("/vocabulario")}>
            Ver categorias
          </PrimaryButton>
        </section>
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

  return (
    <AppShell className="standard-page vocabulary-detail">
      <PageHeader backTo="/vocabulario" title={category.title} />
      <section className="page-lead compact">
        <span className="eyebrow">Prévia da categoria</span>
        <h2>Conheça algumas palavras</h2>
        <p>O banco já está organizado. A experiência de estudo ainda não foi liberada.</p>
      </section>
      <div className="word-preview-grid">
        {previews.map((entry) => (
          <div className="word-preview" key={entry.id}>
            <strong>{entry.term}</strong>
            <span>{entry.translation}</span>
          </div>
        ))}
      </div>
      <div className="locked-action">
        <AppIcon name="lock" />
        <div>
          <strong>Flashcards e prática</strong>
          <span>Em breve nesta categoria</span>
        </div>
      </div>
      <PrimaryButton
        icon={<AppIcon name="lock" size={19} />}
        onClick={showComingSoon}
        variant="secondary"
      >
        Praticar em breve
      </PrimaryButton>
      <Toast message={notice} />
    </AppShell>
  );
}
