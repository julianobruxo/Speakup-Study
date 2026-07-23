import { useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { AppShell, PrimaryButton } from "../components/AppShell";
import { useProgressSummary } from "../services/progress/useProgressSummary";

export default function ProgressPage() {
  const navigate = useNavigate();
  const { summary, loading, error } = useProgressSummary();

  if (loading) {
    return (
      <AppShell activeNav="progress" className="standard-page progress-page">
        <header className="main-page-heading">
          <span className="eyebrow">Progresso</span>
          <h1>Seu ritmo, suas conquistas</h1>
        </header>
        <section className="progress-loading" aria-live="polite">
          <AppIcon name="refresh" size={24} />
          <strong>Carregando seu progresso...</strong>
        </section>
      </AppShell>
    );
  }

  if (error || !summary) {
    return (
      <AppShell activeNav="progress" className="standard-page progress-page">
        <header className="main-page-heading">
          <span className="eyebrow">Progresso</span>
          <h1>Seu ritmo, suas conquistas</h1>
        </header>
        <section className="empty-state">
          <span className="empty-state-icon"><AppIcon name="chart" size={34} /></span>
          <h2>Não foi possível ler o progresso local</h2>
          <p>Você ainda pode praticar normalmente neste dispositivo.</p>
          <PrimaryButton onClick={() => navigate("/gramatica/present_tobe")}>
            Ir para a prática
          </PrimaryButton>
        </section>
      </AppShell>
    );
  }

  if (!summary.totalAnswers) {
    return (
      <AppShell activeNav="progress" className="standard-page progress-page">
        <header className="main-page-heading">
          <span className="eyebrow">Progresso</span>
          <h1>Seu ritmo, suas conquistas</h1>
        </header>
        <section className="empty-state">
          <span className="empty-state-icon"><AppIcon name="chart" size={34} /></span>
          <span className="eyebrow">Ainda sem histórico</span>
          <h2>Seu progresso começa na prática</h2>
          <p>
            Suas respostas e sessões concluídas ficarão salvas somente neste
            dispositivo.
          </p>
          <PrimaryButton
            icon={<AppIcon name="book" />}
            onClick={() => navigate("/gramatica/present_tobe")}
          >
            Começar uma sessão
          </PrimaryButton>
        </section>
      </AppShell>
    );
  }

  const reviewDifficulty =
    summary.mediumReviewCount > summary.easyReviewCount ? "medium" : "easy";

  return (
    <AppShell activeNav="progress" className="standard-page progress-page">
      <header className="main-page-heading">
        <span className="eyebrow">Progresso</span>
        <h1>Seu ritmo, suas conquistas</h1>
        <p>Seu progresso está salvo neste dispositivo.</p>
      </header>

      <section className="progress-overview" aria-label="Resumo do progresso">
        <div className="progress-main-stat">
          <span>Questões praticadas</span>
          <strong>{summary.uniqueQuestions}<small>/130</small></strong>
        </div>
        <div><strong>{summary.accuracy}%</strong><span>Precisão geral</span></div>
        <div><strong>{summary.completedSessions}</strong><span>Sessões concluídas</span></div>
        <div><strong>{summary.bestStreak}</strong><span>Melhor sequência</span></div>
      </section>

      <section className="progress-details" aria-label="Recordes e atividade">
        <span><strong>{summary.bestResult ?? "—"}{summary.bestResult !== null ? "%" : ""}</strong>Melhor resultado</span>
        <span><strong>{summary.reviewCount}</strong>Para revisar</span>
        <span><strong>{formatActivityDate(summary.lastActivity)}</strong>Última atividade</span>
      </section>

      <section className="difficulty-progress-section">
        <div className="section-heading">
          <div><span>Cobertura</span><h2>Progresso por dificuldade</h2></div>
        </div>
        <DifficultyProgress label="Fácil" practiced={summary.easyPracticed} total={50} />
        <DifficultyProgress label="Médio" practiced={summary.mediumPracticed} total={80} />
      </section>

      <section className="review-progress-section">
        <span className="review-progress-icon"><AppIcon name="refresh" size={24} /></span>
        <div>
          <span className="eyebrow">Revisão</span>
          <h2>
            {summary.reviewCount
              ? `${summary.reviewCount} questões para revisar`
              : "Nenhuma questão pendente"}
          </h2>
          <p>
            {summary.reviewCount
              ? "São questões cujo resultado mais recente foi incorreto."
              : "Suas respostas mais recentes estão corretas."}
          </p>
        </div>
        {summary.reviewCount > 0 && (
          <PrimaryButton
            icon={<AppIcon name="refresh" size={18} />}
            onClick={() =>
              navigate(
                `/gramatica/present_tobe?difficulty=${reviewDifficulty}&count=10`,
              )
            }
          >
            Praticar revisão
          </PrimaryButton>
        )}
      </section>
    </AppShell>
  );
}

function formatActivityDate(value: string | null): string {
  if (!value) return "—";
  const activity = new Date(value);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfActivity = new Date(
    activity.getFullYear(),
    activity.getMonth(),
    activity.getDate(),
  );
  const dayDifference = Math.round(
    (startOfToday.getTime() - startOfActivity.getTime()) / 86_400_000,
  );

  if (dayDifference === 0) return "Hoje";
  if (dayDifference === 1) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
  }).format(activity);
}

function DifficultyProgress({
  label,
  practiced,
  total,
}: {
  label: string;
  practiced: number;
  total: number;
}) {
  const percentage = Math.round((practiced / total) * 100);
  return (
    <div className="difficulty-progress">
      <div><strong>{label}</strong><span>{practiced} de {total}</span></div>
      <div
        aria-label={`${label}: ${practiced} de ${total} questões`}
        aria-valuemax={total}
        aria-valuemin={0}
        aria-valuenow={practiced}
        role="progressbar"
      >
        <i style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
