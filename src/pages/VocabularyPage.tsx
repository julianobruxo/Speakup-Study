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

const categoryDescriptions: Record<string, string> = {
  body: "Partes do corpo e cuidados pessoais",
  clothes: "Roupas e acessórios do dia a dia",
  furniture: "Móveis e objetos da casa",
  animals: "Animais comuns e natureza",
  jobs: "Profissões e locais de trabalho",
  places: "Lugares da cidade",
  action_verbs: "Ações simples e frequentes",
  routine_verbs: "Expressões da rotina diária",
  irregular_verbs: "Base, passado e particípio",
};

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
                description={categoryDescriptions[category.id]}
                key={category.id}
                onClick={() => undefined}
                title={category.title}
              />
            );
          }
          return (
            <AppCard
              description={categoryDescriptions[category.id]}
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
