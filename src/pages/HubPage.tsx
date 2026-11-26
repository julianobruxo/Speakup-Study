import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import { CategoryBadgeIcon, OpenBookBadgeIcon } from "../components/BookVisual";
import "../styles/estudar.css";

const OPTIONS = [
  {
    key: "estudar",
    label: "Estudar tópicos",
    desc: "Revise a explicação de gramática antes de praticar.",
    to: "/estudar",
    tone: "orange" as const,
    visual: <OpenBookBadgeIcon size={30} />,
  },
  {
    key: "praticar",
    label: "Praticar",
    desc: "Direto para os quizzes — sem precisar estudar antes.",
    to: "/praticar",
    tone: "green" as const,
    visual: <CategoryBadgeIcon size={34} variant="sport" />,
  },
  {
    key: "vocabulario",
    label: "Vocabulário",
    desc: "Flashcards com som, tradução e ilustração.",
    to: "/vocabulario",
    tone: "cyan" as const,
    visual: <CategoryBadgeIcon size={34} variant="food" />,
  },
];

export default function HubPage() {
  const navigate = useNavigate();

  return (
    <AppShell activeNav="study" className="standard-page">
      <div className="catalog-page">
        <section className="catalog-lead">
          <span className="catalog-lead__kicker">Speak UP Study</span>
          <h1 className="catalog-lead__title">O que vamos fazer hoje?</h1>
          <p className="catalog-lead__desc">
            Escolha por onde começar sua sessão de inglês.
          </p>
        </section>

        <div className="catalog-list">
          {OPTIONS.map((opt) => (
            <button
              className="catalog-card"
              key={opt.key}
              onClick={() => navigate(opt.to)}
              type="button"
            >
              <span
                className={`category-badge category-badge--${opt.tone}`}
              >
                {opt.visual}
              </span>
              <span className="catalog-card__body">
                <strong className="catalog-card__title">{opt.label}</strong>
                <span className="catalog-card__desc">{opt.desc}</span>
              </span>
              <span className="catalog-card__trailing">
                <AppIcon name="chevron-right" size={18} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
