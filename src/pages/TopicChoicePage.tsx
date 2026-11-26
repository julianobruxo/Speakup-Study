import { useNavigate, useParams } from "react-router-dom";
import { AppShell, PageHeader } from "../components/AppShell";
import { OpenBookBadgeIcon } from "../components/BookVisual";
import "../styles/estudar.css";

export default function TopicChoicePage() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const decodedTopic = decodeURIComponent(topic ?? "");

  return (
    <AppShell activeNav="study" className="standard-page">
      <div className="catalog-page">
        <PageHeader backTo="/estudar" title={decodedTopic || "Tópico"} />

        <section className="topic-choice-card">
          <div className="category-badge category-badge--cyan">
            <OpenBookBadgeIcon size={32} />
          </div>
          <h2 className="catalog-lead__title">{decodedTopic}</h2>
          <p className="catalog-lead__desc">
            Quer estudar a explicação desse tópico antes de praticar?
          </p>
          <div className="topic-choice-card__actions">
            <button
              className="btn-3d-primary"
              onClick={() => navigate(`/estudar/${topic}/conteudo`)}
              type="button"
            >
              Estudar tópico primeiro
            </button>
            <button
              className="btn-pill-outline"
              onClick={() => navigate(`/praticar/${topic}`)}
              type="button"
            >
              Apenas praticar
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
