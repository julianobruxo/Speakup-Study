import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import {
  ACTIVE_GRAMMAR_TOPICS,
  ACTIVE_VOCABULARY_CATEGORIES,
} from "../content/taxonomy";
import { useProgressSummary } from "../services/progress/useProgressSummary";

type StudyFilter = "all" | "grammar" | "vocabulary" | "review";

const FILTERS: { id: StudyFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "grammar", label: "Gramática" },
  { id: "vocabulary", label: "Vocabulário" },
  { id: "review", label: "Revisão" },
];

export default function PracticeLandingPage() {
  const navigate = useNavigate();
  const { summary } = useProgressSummary();
  const [filter, setFilter] = useState<StudyFilter>("all");
  const practiced = summary?.uniqueQuestions ?? 0;
  const reviewCount = summary?.reviewCount ?? 0;

  const cards =
    filter === "review"
      ? reviewCount
        ? [
            {
              id: "review",
              title: "Revisão de erros",
              description: `${reviewCount} questões cuja resposta mais recente foi incorreta.`,
              available: true,
              action: () =>
                navigate(
                  `/gramatica/present_tobe?difficulty=${
                    (summary?.mediumReviewCount ?? 0) > (summary?.easyReviewCount ?? 0)
                      ? "medium"
                      : "easy"
                  }&count=10`,
                ),
              tag: `${reviewCount} questões`,
            },
          ]
        : []
      : [
          ...(filter === "all" || filter === "grammar"
            ? ACTIVE_GRAMMAR_TOPICS.map((topic) => ({
                id: topic.id,
                title: topic.title,
                description:
                  topic.id === "present_tobe" && practiced
                    ? `${practiced} de 130 questões praticadas.`
                    : topic.description,
                available: topic.id === "present_tobe" || topic.id === "simple_past",
                action: () => navigate(topic.id === "simple_past" ? "/passado/home" : "/gramatica/present_tobe"),
                tag: topic.id === "present_tobe" || topic.id === "simple_past" ? "Disponível" : "Em breve",
              }))
            : []),
          ...(filter === "all" || filter === "vocabulary"
            ? ACTIVE_VOCABULARY_CATEGORIES.map((category) => ({
                id: category.id,
                title: category.id === "body" ? "Partes do corpo" : category.title,
                description: category.description,
                available: category.id === "body" || category.id === "irregular_verbs",
                action: () => navigate(category.id === "irregular_verbs" ? "/passado/flash" : "/vocabulario/body"),
                tag: category.id === "body" ? "24 cards" : category.id === "irregular_verbs" ? "104 verbos + áudio" : "Em breve",
              }))
            : []),
        ];

  return (
    <AppShell activeNav="study" className="standard-page study-library-page">
      <div className="learn-layout">
        <section className="learn-hero">
          <div className="section-eyebrow">Biblioteca de aprendizagem</div>
          <h1>Escolha o que quer dominar hoje.</h1>
          <p>
            Conteúdos organizados por habilidade, com uma trilha clara entre estudar,
            praticar e revisar.
          </p>
          <div className="filter-row" role="group" aria-label="Filtrar conteúdo">
            {FILTERS.map((option) => (
              <button
                aria-pressed={filter === option.id}
                className={`filter-chip ${filter === option.id ? "active" : ""}`}
                key={option.id}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {filter === "review" && !cards.length ? (
            <div className="library-empty">
              <span><AppIcon name="check" size={26} /></span>
              <h2>Nenhuma questão para revisar.</h2>
              <p>Seus erros mais recentes aparecerão aqui.</p>
            </div>
          ) : (
            <div className="topic-grid">
              {cards.map((card) => (
                <button
                  aria-disabled={!card.available}
                  className={`topic-card ${card.available ? "available" : ""}`}
                  key={card.id}
                  onClick={card.available ? card.action : undefined}
                >
                  <span className="tag">{card.tag}</span>
                  <strong>{card.title}</strong>
                  <p>{card.description}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="route-card">
          <div className="section-eyebrow">Rota recomendada</div>
          <h2>Fundamentos do inglês</h2>
          <p>Uma sequência curta para consolidar o básico antes de avançar.</p>
          <div className="route-progress">
            <span style={{ width: `${Math.min(100, Math.round((practiced / 20) * 100))}%` }} />
          </div>
          <div className="route-list">
            <RouteStep done={practiced >= 5} index={1} label="Present TO BE · afirmações" />
            <RouteStep done={practiced >= 10} index={2} label="Present TO BE · negativas" />
            <RouteStep done={practiced >= 15} index={3} label="Perguntas e respostas curtas" />
            <RouteStep done={false} index={4} label="Partes do corpo" />
            <RouteStep done={false} index={5} label="Revisão mista" />
          </div>
          <button className="secondary-button" onClick={() => navigate("/gramatica/present_tobe")}>
            Continuar rota
          </button>
        </aside>
      </div>
    </AppShell>
  );
}

function RouteStep({
  done,
  index,
  label,
}: {
  done: boolean;
  index: number;
  label: string;
}) {
  return (
    <div className={`route-step ${done ? "done" : ""}`}>
      <i>{done ? "✓" : index}</i>
      <span>{label}</span>
    </div>
  );
}

