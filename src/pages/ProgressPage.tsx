import { AppShell } from "../components/AppShell";
import { getWeekKey, type AchievementId } from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import { useProgressSummary } from "../services/progress/useProgressSummary";

const ACHIEVEMENTS: {
  id: AchievementId;
  icon: string;
  title: string;
  description: string;
  target: number;
}[] = [
  { id: "first-step", icon: "🚀", title: "Primeiro passo", description: "Conclua sua primeira sessão", target: 1 },
  { id: "sharp-aim", icon: "🎯", title: "Mira certeira", description: "Alcance pelo menos 80% de precisão", target: 80 },
  { id: "full-week", icon: "🔥", title: "Uma semana inteira", description: "Alcance uma sequência de 7 dias", target: 7 },
  { id: "explorer", icon: "📚", title: "Explorador", description: "Pratique 50 questões únicas", target: 50 },
  { id: "visual-vocabulary", icon: "◫", title: "Vocabulário visual", description: "Conclua os 24 flashcards", target: 24 },
  { id: "no-stumble", icon: "⚡", title: "Sem tropeçar", description: "Acerte 10 respostas consecutivas", target: 10 },
];

export default function ProgressPage() {
  const { summary, loading: progressLoading } = useProgressSummary();
  const { snapshot, loading: engagementLoading } = useEngagement();
  const loading = progressLoading || engagementLoading;
  const weekKey = getWeekKey();
  const monday = new Date(`${weekKey}T12:00:00`);
  const today = dateKey(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    const key = dateKey(date);
    return {
      key,
      label: key === today ? "Hoje" : ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][index],
      xp: snapshot?.state.weeklyActivity[key] ?? 0,
    };
  });
  const maxXp = Math.max(1, ...days.map((day) => day.xp));

  return (
    <AppShell activeNav="progress" className="standard-page progress-page">
      <div className="metric-grid" aria-label="Resumo do progresso">
        <Metric label="Questões praticadas" value={loading ? "—" : `${summary?.uniqueQuestions ?? 0}/130`} />
        <Metric label="Precisão geral" value={loading ? "—" : summary?.accuracy === null ? "—" : `${summary?.accuracy ?? 0}%`} />
        <Metric label="Melhor sequência" value={loading ? "—" : String(summary?.bestStreak ?? 0)} />
        <Metric label="Sessões concluídas" value={loading ? "—" : String(summary?.completedSessions ?? 0)} />
      </div>

      <div className="progress-layout">
        <section className="chart-card">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Atividade semanal</div>
              <h2>{days.some((day) => day.xp) ? "Você está criando consistência" : "Sua semana começa na primeira prática"}</h2>
            </div>
            <span className="league-badge">Meta: 5 dias</span>
          </div>
          <div className="chart-bars">
            {days.map((day) => (
              <div className="chart-bar-wrap" key={day.key}>
                <div
                  aria-label={`${day.label}: ${day.xp} XP`}
                  className={`chart-bar ${day.key === today ? "today" : ""} ${day.xp ? "" : "empty"}`}
                  style={{ height: day.xp ? `${Math.max(12, Math.round((day.xp / maxXp) * 100))}%` : "4%" }}
                />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {days.map((day) => <span key={day.key}>{day.label}</span>)}
          </div>
        </section>

        <section className="section-card achievements-card">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Conquistas</div>
              <h2>Seus marcos</h2>
            </div>
          </div>
          <div className="achievement-list">
            {ACHIEVEMENTS.map((achievement) => {
              const state = snapshot?.state.achievements[achievement.id];
              return (
                <article
                  className={`achievement ${state?.unlocked ? "unlocked" : "locked"}`}
                  key={achievement.id}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div>
                    <strong>{achievement.title}</strong>
                    <span>{achievement.description}</span>
                  </div>
                  <b>
                    {state?.unlocked
                      ? "Concluído"
                      : `${Math.min(state?.progress ?? 0, achievement.target)}/${achievement.target}`}
                  </b>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Dados locais reais</small>
    </article>
  );
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
