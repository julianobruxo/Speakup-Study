import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import {
  AppCard,
  AppShell,
  LockedCard,
  PageHeader,
} from "../components/AppShell";
import { ACTIVE_VOCABULARY_CATEGORIES } from "../content/taxonomy";
import { getVocabularyEntriesByCategory } from "../content/data/vocabulary";
import { IRREGULAR_VERBS } from "../content/data/irregularVerbs";

export default function VocabularyPage() {
  const navigate = useNavigate();
  return (
    <AppShell className="standard-page">
      <PageHeader backTo="/praticar" title="Vocabulário" />
      <section className="page-lead compact">
        <span className="eyebrow">1 categoria disponível</span>
        <h2>Explore novas palavras</h2>
        <p>Comece por Partes do corpo. As outras categorias chegam em breve.</p>
      </section>
      <div className="vocabulary-list">
        {ACTIVE_VOCABULARY_CATEGORIES.map((category) => {
          const count =
            category.id === "irregular_verbs"
              ? IRREGULAR_VERBS.length
              : getVocabularyEntriesByCategory(category.id).length;
          if (category.id !== "body") {
            return (
              <LockedCard
                description={category.description}
                key={category.id}
                onClick={() => undefined}
                title={category.title}
              />
            );
          }
          return (
            <AppCard
              description={category.description}
              icon={<AppIcon name="grid" size={20} />}
              key={category.id}
              onClick={() => navigate(`/vocabulario/${category.id}`)}
              title="Partes do corpo"
              trailing={<span className="count-pill">{count} palavras</span>}
            />
          );
        })}
      </div>
    </AppShell>
  );
}
