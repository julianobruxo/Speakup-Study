import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import {
  AppCard,
  AppShell,
  PageHeader,
} from "../components/AppShell";
import { ACTIVE_VOCABULARY_CATEGORIES } from "../content/taxonomy";
import { getVocabularyEntriesByCategory } from "../content/data/vocabulary";
import { IRREGULAR_VERBS } from "../content/data/irregularVerbs";

export default function VocabularyPage() {
  const navigate = useNavigate();
  return (
    <AppShell activeNav="study" className="standard-page">
      <PageHeader backTo="/praticar" title="Vocabulário" />
      <section className="page-lead compact">
        <span className="eyebrow">2 áreas disponíveis</span>
        <h2>Explore novas palavras</h2>
        <p>Estude partes do corpo com imagens ou verbos irregulares com áudio.</p>
      </section>
      <div className="vocabulary-list">
        {ACTIVE_VOCABULARY_CATEGORIES
          .filter((category) => category.id === "body" || category.id === "irregular_verbs")
          .map((category) => {
          const count =
            category.id === "irregular_verbs"
              ? IRREGULAR_VERBS.length
              : getVocabularyEntriesByCategory(category.id).length;
          if (category.id === "irregular_verbs") return <AppCard key={category.id} description="Base, Simple Past e particípio com áudio em inglês." icon={<AppIcon name="volume" />} onClick={() => navigate("/passado/flash")} title="Verbos irregulares" trailing={<span className="count-pill">104 verbos</span>} />;
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
        <AppCard
          description="10 conjuntos de vocabulário (229 termos), 50 verbos de ação, alfabeto e números com áudio."
          icon={<AppIcon name="sparkles" size={20} />}
          onClick={() => navigate("/escola/vocabulario")}
          title="Acervo da escola"
          trailing={<span className="count-pill">229 termos</span>}
        />
      </div>
    </AppShell>
  );
}

