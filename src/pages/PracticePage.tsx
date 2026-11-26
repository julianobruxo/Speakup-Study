import { useNavigate, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import "../styles/activities.css";

// TODO: implementar o catálogo planejado de jogos sem migrar mecânicas
// promocionais antigas. Gate de 75%/roleta NÃO entra mais.
export default function PracticePage() {
  const navigate = useNavigate();
  const { topic } = useParams();

  return (
    <AppShell activeNav="study" className="standard-page">
      <div className="activity-page-container" style={{ maxWidth: 520, marginTop: 40 }}>
        <section className="empty-state">
          <span className="activity-completion__icon" aria-hidden="true">
            <AppIcon name="sparkles" size={28} />
          </span>
          <h2 className="empty-state__title">
            Prática {topic ? `— ${decodeURIComponent(topic)}` : ""}
          </h2>
          <p className="empty-state__body">
            Esta rota de prática está pronta para receber novos modos interativos.
          </p>
          <button
            className="btn-3d-primary btn-3d-primary--sm"
            onClick={() => navigate("/estudar")}
            type="button"
          >
            Ir para Estudar
          </button>
        </section>
      </div>
    </AppShell>
  );
}
