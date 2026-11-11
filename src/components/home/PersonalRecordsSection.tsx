import AppIcon from "../AppIcon";
import type { ProgressSummary } from "../../services/progress/progress";

interface PersonalRecordsSectionProps {
  summary: ProgressSummary | null;
}

export default function PersonalRecordsSection({
  summary,
}: PersonalRecordsSectionProps) {
  const hasCompletedSession = Boolean(summary?.completedSessions);

  return (
    <section className="home-records-section">
      <div className="section-heading">
        <div>
          <span>Histórico local</span>
          <h2>Seus recordes</h2>
        </div>
      </div>
      {hasCompletedSession && summary ? (
        <div className="home-records-grid">
          <Record
            icon="sparkles"
            label="Melhor sequência"
            value={String(summary.bestStreak)}
          />
          <Record
            icon="trophy"
            label="Melhor resultado"
            value={`${summary.bestResult}%`}
          />
          <Record
            icon="check"
            label="Sessões concluídas"
            value={String(summary.completedSessions)}
          />
          <Record
            icon="book"
            label="Questões praticadas"
            value={`${summary.uniqueQuestions}/130`}
          />
        </div>
      ) : (
        <p className="home-records-empty">
          Seus recordes aparecerão depois da primeira rodada.
        </p>
      )}
    </section>
  );
}

function Record({
  icon,
  label,
  value,
}: {
  icon: "book" | "check" | "sparkles" | "trophy";
  label: string;
  value: string;
}) {
  return (
    <article className="home-record">
      <AppIcon name={icon} size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

