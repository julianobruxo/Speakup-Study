import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppCard, AppShell, LockedCard } from "../components/AppShell";
import { getVocabularyEntriesByCategory } from "../content/data/vocabulary";
import { IRREGULAR_VERBS } from "../content/data/irregularVerbs";
import {
  ACTIVE_GRAMMAR_TOPICS,
  ACTIVE_VOCABULARY_CATEGORIES,
} from "../content/taxonomy";
import { useProgressSummary } from "../services/progress/useProgressSummary";

type StudyFilter = "all" | "grammar" | "vocabulary";

const FILTERS: { id: StudyFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "grammar", label: "Gramática" },
  { id: "vocabulary", label: "Vocabulário" },
];

export default function PracticeLandingPage() {
  const navigate = useNavigate();
  const { summary } = useProgressSummary();
  const [filter, setFilter] = useState<StudyFilter>("all");
  const practiced = summary?.uniqueQuestions ?? 0;

  const showGrammar = filter === "all" || filter === "grammar";
  const showVocabulary = filter === "all" || filter === "vocabulary";

  return (
    <AppShell activeNav="study" className="standard-page">
      <header className="main-page-heading">
        <span className="eyebrow">Estudar</span>
        <h1>Biblioteca de aprendizagem</h1>
      </header>
      <section className="page-lead">
        <h2>O que você quer explorar?</h2>
        <p>Filtre por tipo de conteúdo e entre direto no tópico ou categoria.</p>
      </section>

      <div className="study-filter-row" role="group" aria-label="Filtrar conteúdo">
        {FILTERS.map((option) => (
          <button
            aria-pressed={filter === option.id}
            className={`study-filter-chip ${filter === option.id ? "active" : ""}`}
            key={option.id}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showGrammar && (
        <section className="study-section-group">
          <div className="section-heading">
            <div>
              <span>{ACTIVE_GRAMMAR_TOPICS.length} tópicos</span>
              <h2>Gramática</h2>
            </div>
          </div>
          <div className="topic-list">
            {ACTIVE_GRAMMAR_TOPICS.map((topic) =>
              topic.id === "present_tobe" ? (
                <AppCard
                  className="available-topic"
                  description={
                    practiced
                      ? `${practiced} de 130 questões praticadas`
                      : topic.description
                  }
                  eyebrow="Disponível agora"
                  icon={<span className="topic-number">01</span>}
                  key={topic.id}
                  onClick={() => navigate("/gramatica/present_tobe")}
                  title={topic.title}
                  trailing={<span className="count-pill">130 questões</span>}
                />
              ) : (
                <LockedCard
                  description={topic.description}
                  key={topic.id}
                  onClick={() => undefined}
                  title={topic.title}
                />
              ),
            )}
          </div>
        </section>
      )}

      {showVocabulary && (
        <section className="study-section-group">
          <div className="section-heading">
            <div>
              <span>{ACTIVE_VOCABULARY_CATEGORIES.length} categorias</span>
              <h2>Vocabulário</h2>
            </div>
          </div>
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
        </section>
      )}
    </AppShell>
  );
}
