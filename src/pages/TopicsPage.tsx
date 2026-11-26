import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PageHeader } from "../components/AppShell";
import "../styles/estudar.css";

const BADGE_TONES = ["orange", "green", "cyan", "purple"] as const;

const TOPICS = [
  "Verbo TO BE (presente)",
  "Verbo TO BE (passado)",
  "Simple Present",
  "Present Continuous",
  "Be Going To (futuro)",
  "Simple Past",
  "There Is / There Are",
  "In / On / At",
  "Action Verbs",
  "Routine Verbs",
];

export default function TopicsPage() {
  const navigate = useNavigate();

  return (
    <AppShell activeNav="study" className="standard-page">
      <div className="catalog-page">
        <PageHeader backTo="/estudar" title="Tópicos" />

        <section className="catalog-lead">
          <span className="catalog-lead__kicker">Trilha de estudo</span>
          <h2 className="catalog-lead__title">Escolha um tópico</h2>
          <p className="catalog-lead__desc">
            Selecione um tema para revisar a explicação ou ir direto para a
            prática.
          </p>
        </section>

        <div className="catalog-grid">
          {TOPICS.map((topic, idx) => {
            const tone = BADGE_TONES[idx % 4];
            return (
              <button
                className="catalog-card"
                key={topic}
                onClick={() =>
                  navigate(`/estudar/${encodeURIComponent(topic)}`)
                }
                type="button"
              >
                <span
                  className={`category-badge category-badge--sm category-badge--${tone}`}
                >
                  <span className="category-badge__order">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="catalog-card__body">
                  <strong className="catalog-card__title">{topic}</strong>
                </span>
                <span className="catalog-card__trailing">
                  <AppIcon name="chevron-right" size={18} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
