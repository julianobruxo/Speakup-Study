import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "../components/AppShell";
import { getWeekKey, type AchievementId } from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import { useProgressSummary } from "../services/progress/useProgressSummary";
import {
  GRAMMAR_COURSE_PROGRESS_EVENT,
  readGrammarCourseProgress,
  summarizeGrammarCourseProgress,
} from "../services/progress/grammarCourseProgress";
import "../styles/dashboard.css";

interface AchievementMeta {
  id: AchievementId;
  badgeClass: string;
  title: string;
  description: string;
  target: number;
}

const ACHIEVEMENTS: AchievementMeta[] = [
  {
    id: "first-step",
    badgeClass: "category-badge--orange",
    title: "Primeiro passo",
    description: "Conclua sua primeira sessão",
    target: 1,
  },
  {
    id: "sharp-aim",
    badgeClass: "category-badge--green",
    title: "Mira certeira",
    description: "Alcance pelo menos 80% de precisão",
    target: 80,
  },
  {
    id: "full-week",
    badgeClass: "category-badge--amber",
    title: "Uma semana inteira",
    description: "Alcance uma sequência de 7 dias",
    target: 7,
  },
  {
    id: "explorer",
    badgeClass: "category-badge--cyan",
    title: "Explorador",
    description: "Pratique 50 questões únicas",
    target: 50,
  },
  {
    id: "visual-vocabulary",
    badgeClass: "category-badge--purple",
    title: "Vocabulário visual",
    description: "Conclua os 24 flashcards",
    target: 24,
  },
  {
    id: "no-stumble",
    badgeClass: "category-badge--sky",
    title: "Sem tropeçar",
    description: "Acerte 10 respostas consecutivas",
    target: 10,
  },
];

function AchievementIcon({
  id,
  unlocked,
}: {
  id: AchievementId;
  unlocked: boolean;
}) {
  const stroke = unlocked ? "#2D3A42" : "#8F939C";
  const fill = unlocked ? "#FFFFFF" : "#F1F3F9";

  switch (id) {
    case "first-step":
      return (
        <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
          <path
            d="M12 4L14.6 9.2L20.3 10L16.1 14L17.1 19.7L12 17L6.9 19.7L7.9 14L3.7 10L9.4 9.2L12 4Z"
            fill={fill}
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "sharp-aim":
      return (
        <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
          <circle cx="12" cy="12" fill={fill} r="8" stroke={stroke} strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth="1.8" />
          <circle cx="12" cy="12" fill={stroke} r="1.4" />
        </svg>
      );
    case "full-week":
      return (
        <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
          <path
            d="M12.5 3.5C14.8 6.3 17.5 8.7 17.5 13C17.5 16.4 15 19.5 12 19.5C9 19.5 6.5 16.8 6.5 13.4C6.5 11.1 7.6 9.2 9.1 7.8C9.2 9.6 10.1 10.7 11.2 11.2C10.9 8.7 11.3 6.1 12.5 3.5Z"
            fill={fill}
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "explorer":
      return (
        <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
          <path
            d="M4.5 6.5C4.5 5.7 5.2 5 6 5H11.5V19H6C5.2 19 4.5 18.3 4.5 17.5V6.5Z"
            fill={fill}
            stroke={stroke}
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M19.5 6.5C19.5 5.7 18.8 5 18 5H12.5V19H18C18.8 19 19.5 18.3 19.5 17.5V6.5Z"
            fill={fill}
            stroke={stroke}
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "visual-vocabulary":
      return (
        <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
          <rect
            fill={fill}
            height="12"
            rx="2.5"
            stroke={stroke}
            strokeWidth="1.8"
            width="12"
            x="8"
            y="4.5"
          />
          <rect
            fill={fill}
            height="12"
            rx="2.5"
            stroke={stroke}
            strokeWidth="1.8"
            width="12"
            x="4"
            y="7.5"
          />
        </svg>
      );
    case "no-stumble":
      return (
        <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
          <path
            d="M13 3.5L6.5 13H12L11 20.5L17.5 11H12L13 3.5Z"
            fill={fill}
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
  }
}

function MetricIcon({ kind }: { kind: "questions" | "accuracy" | "streak" | "sessions" }) {
  switch (kind) {
    case "questions":
      return (
        <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
          <rect fill="#FFFFFF" height="15" rx="3" stroke="#2D3A42" strokeWidth="1.8" width="15" x="4.5" y="4.5" />
          <path d="M8.5 10H15.5M8.5 14H13" stroke="#5C92F4" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "accuracy":
      return (
        <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
          <circle cx="12" cy="12" fill="#FFFFFF" r="8" stroke="#2D3A42" strokeWidth="1.8" />
          <path d="M8.5 12.2L10.8 14.5L15.5 9.8" stroke="#2D3A42" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
        </svg>
      );
    case "streak":
      return (
        <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
          <path d="M13 4L7 13H12L11 20L17 11H12L13 4Z" fill="#FFFFFF" stroke="#2D3A42" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "sessions":
      return (
        <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
          <path d="M7 5H17V10C17 12.8 14.8 15 12 15C9.2 15 7 12.8 7 10V5Z" fill="#FFFFFF" stroke="#2D3A42" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M9 19H15M12 15V19" stroke="#2D3A42" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
  }
}

export default function ProgressPage() {
  const [courseProgress, setCourseProgress] = useState(() =>
    summarizeGrammarCourseProgress(readGrammarCourseProgress()),
  );

  useEffect(() => {
    const update = () =>
      setCourseProgress(
        summarizeGrammarCourseProgress(readGrammarCourseProgress()),
      );
    window.addEventListener(GRAMMAR_COURSE_PROGRESS_EVENT, update);
    return () =>
      window.removeEventListener(GRAMMAR_COURSE_PROGRESS_EVENT, update);
  }, []);

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
      label:
        key === today
          ? "Hoje"
          : ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][index],
      xp: snapshot?.state.weeklyActivity[key] ?? 0,
    };
  });

  const maxXp = Math.max(1, ...days.map((day) => day.xp));
  const unlockedCount = ACHIEVEMENTS.filter(
    (item) => snapshot?.state.achievements[item.id]?.unlocked,
  ).length;

  return (
    <AppShell activeNav="progress" className="dash-page dash-progress">
      <section
        aria-label="Resumo do progresso em Present TO BE"
        className="surface-card dash-section"
      >
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">Resumo do progresso</h2>
            <p className="dash-section-subtitle">Present TO BE</p>
          </div>
          <span className="pill-tag pill-tag--blue tabular-nums">
            {loading ? "—" : `${summary?.uniqueQuestions ?? 0}/130 questões`}
          </span>
        </div>

        <div aria-label="Indicadores de Present TO BE" className="dash-metric-grid">
          <Metric
            badgeClass="category-badge--orange"
            icon={<MetricIcon kind="questions" />}
            label="Questões praticadas"
            value={loading ? "—" : `${summary?.uniqueQuestions ?? 0}/130`}
          />
          <Metric
            badgeClass="category-badge--green"
            icon={<MetricIcon kind="accuracy" />}
            label="Precisão geral"
            value={
              loading
                ? "—"
                : summary?.accuracy === null
                  ? "—"
                  : `${summary?.accuracy ?? 0}%`
            }
          />
          <Metric
            badgeClass="category-badge--cyan"
            icon={<MetricIcon kind="streak" />}
            label="Melhor sequência"
            value={loading ? "—" : String(summary?.bestStreak ?? 0)}
          />
          <Metric
            badgeClass="category-badge--purple"
            icon={<MetricIcon kind="sessions" />}
            label="Sessões concluídas"
            value={loading ? "—" : String(summary?.completedSessions ?? 0)}
          />
        </div>
      </section>

      <section className="surface-card dash-section">
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">Prática de gramática</h2>
            <p className="dash-section-subtitle">
              Simple Present, Present Continuous, Be Going To e There Is / There
              Are
            </p>
          </div>
          <span className="pill-tag tabular-nums">
            {courseProgress.completedLevels}/20 níveis
          </span>
        </div>

        <div className="dash-metric-grid">
          <Metric
            badgeClass="category-badge--orange"
            icon={<MetricIcon kind="questions" />}
            label="Questões respondidas"
            value={String(courseProgress.answerCount)}
          />
          <Metric
            badgeClass="category-badge--green"
            icon={<MetricIcon kind="accuracy" />}
            label="Precisão"
            value={
              courseProgress.accuracy === null
                ? "—"
                : `${courseProgress.accuracy}%`
            }
          />
          <Metric
            badgeClass="category-badge--cyan"
            icon={<MetricIcon kind="streak" />}
            label="Níveis concluídos"
            value={`${courseProgress.completedLevels}/20`}
          />
          <Metric
            badgeClass="category-badge--purple"
            icon={<MetricIcon kind="sessions" />}
            label="Revisões finais"
            value={String(courseProgress.reviewAttempts)}
          />
        </div>
        <p className="dash-progress-note">
          Seu progresso nos cursos de gramática fica salvo automaticamente neste
          dispositivo.
        </p>
      </section>

      <div className="dash-progress-grid">
        <section className="surface-card dash-section">
          <div className="dash-section-head">
            <div>
              <h2 className="dash-section-title">Atividade semanal</h2>
              <p className="dash-section-subtitle">
                {days.some((day) => day.xp)
                  ? "Você está criando consistência"
                  : "Sua semana começa na primeira prática"}
              </p>
            </div>
            <span className="pill-tag pill-tag--blue">Meta: 5 dias</span>
          </div>

          <div className="dash-chart-bars" role="list" aria-label="XP ganho por dia da semana">
            {days.map((day) => {
              const isToday = day.key === today;
              const heightPct = day.xp
                ? Math.max(14, Math.round((day.xp / maxXp) * 100))
                : 0;
              return (
                <div className="dash-bar-col" key={day.key} role="listitem">
                  <span
                    className={`dash-bar-xp tabular-nums ${
                      isToday ? "dash-bar-xp--today" : ""
                    }`}
                  >
                    {day.xp > 0 ? `${day.xp}` : ""}
                  </span>
                  <div className="dash-bar-track">
                    <div
                      aria-label={`${day.label}: ${day.xp} XP`}
                      className={`dash-bar-fill ${
                        isToday ? "dash-bar-fill--today" : ""
                      } ${day.xp ? "" : "dash-bar-fill--empty"}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`dash-bar-label ${
                      isToday ? "dash-bar-label--today" : ""
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="surface-card dash-section">
          <div className="dash-section-head">
            <div>
              <h2 className="dash-section-title">Conquistas</h2>
              <p className="dash-section-subtitle">Seus marcos de estudo</p>
            </div>
            <span className="pill-tag tabular-nums">
              {unlockedCount}/{ACHIEVEMENTS.length}
            </span>
          </div>

          <div className="dash-achievement-list">
            {ACHIEVEMENTS.map((achievement) => {
              const state = snapshot?.state.achievements[achievement.id];
              const unlocked = Boolean(state?.unlocked);
              return (
                <article
                  className={`dash-achievement ${
                    unlocked ? "dash-achievement--unlocked" : ""
                  }`}
                  key={achievement.id}
                >
                  <div
                    className={`category-badge category-badge--sm ${
                      unlocked
                        ? achievement.badgeClass
                        : "dash-achievement__badge-locked"
                    }`}
                  >
                    <AchievementIcon id={achievement.id} unlocked={unlocked} />
                  </div>
                  <div className="dash-achievement__copy">
                    <strong>{achievement.title}</strong>
                    <span>{achievement.description}</span>
                  </div>
                  <span
                    className={`dash-achievement__status tabular-nums ${
                      unlocked ? "dash-achievement__status--done" : ""
                    }`}
                  >
                    {unlocked
                      ? "Concluído"
                      : `${Math.min(state?.progress ?? 0, achievement.target)}/${achievement.target}`}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({
  badgeClass,
  icon,
  label,
  value,
}: {
  badgeClass: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="dash-metric-card">
      <span
        aria-hidden="true"
        className={`category-badge category-badge--sm ${badgeClass}`}
      >
        {icon}
      </span>
      <div className="dash-metric-card__copy">
        <strong className="dash-metric-card__value tabular-nums">{value}</strong>
        <span className="dash-metric-card__label">{label}</span>
      </div>
    </article>
  );
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
