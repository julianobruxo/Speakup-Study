import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import AppDialog from "../components/AppDialog";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import Toast from "../components/Toast";
import {
  getLeagueStandings,
  getWeekRemaining,
  getWeeklyGoal,
  sanitizeAvatarTone,
  type EngagementSnapshot,
  type LeagueStanding,
} from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import { useProgressSummary } from "../services/progress/useProgressSummary";
import { fetchGlobalWeeklyStandings } from "../services/firebase/leaderboardSync";
import "../styles/dashboard.css";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "J";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function ProgressDots({ percentage }: { percentage: number }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const activeIndex =
    clamped >= 100 ? 4 : Math.min(4, Math.floor((clamped / 100) * 5));

  return (
    <div
      aria-label={`${clamped}% concluído`}
      className="progress-dots"
      role="img"
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex || (clamped >= 100 && index === 4);
        return (
          <span
            className={`progress-dot ${
              isActive
                ? "progress-dot--active"
                : isDone
                  ? "progress-dot--done"
                  : ""
            }`}
            key={index}
          />
        );
      })}
    </div>
  );
}

function GrammarBadgeIllustration() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="34"
      viewBox="0 0 36 36"
      width="34"
    >
      <path
        d="M6 10.5C6 9.1 7.1 8 8.5 8H17V27.5H8.5C7.1 27.5 6 26.4 6 25V10.5Z"
        fill="#FFFFFF"
        stroke="#2D3A42"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M30 10.5C30 9.1 28.9 8 27.5 8H19V27.5H27.5C28.9 27.5 30 26.4 30 25V10.5Z"
        fill="#EEF4FF"
        stroke="#2D3A42"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M18 8V27.5"
        stroke="#2D3A42"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <path
        d="M10 13.5H14.5M10 17.5H14.5M21.5 13.5H26M21.5 17.5H25"
        stroke="#5C92F4"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function VocabBadgeIllustration() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="34"
      viewBox="0 0 36 36"
      width="34"
    >
      <rect
        fill="#DDF4FA"
        height="18"
        rx="4"
        stroke="#2D3A42"
        strokeLinejoin="round"
        strokeWidth="1.9"
        width="18"
        x="11"
        y="7"
      />
      <rect
        fill="#FFFFFF"
        height="18"
        rx="4"
        stroke="#2D3A42"
        strokeLinejoin="round"
        strokeWidth="1.9"
        width="18"
        x="7"
        y="11"
      />
      <path
        d="M12 18.5H20M12 22.5H17"
        stroke="#5C92F4"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { summary } = useProgressSummary();
  const { snapshot } = useEngagement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const practiced = summary?.uniqueQuestions ?? 0;
  const mission = snapshot?.state.dailyMission;
  const weeklyGoal = snapshot
    ? getWeeklyGoal(snapshot)
    : { activeDays: 0, percentage: 0 };

  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference -
    (Math.max(0, Math.min(100, weeklyGoal.percentage)) / 100) *
      ringCircumference;

  function nextMissionAction() {
    if (
      !mission ||
      mission.grammarAnswers < 5 ||
      !mission.grammarSessionCompleted
    ) {
      navigate("/gramatica/present_tobe");
    } else if (mission.vocabularyCardsRevealed.length < 5) {
      navigate("/vocabulario/body/flashcards");
    } else {
      setNotice("Missão concluída! O bônus de +80 XP já foi concedido.");
    }
  }

  return (
    <AppShell activeNav="home" className="dash-page dash-home" dialogOpen={dialogOpen}>
      <div className="dash-home-top">
        <article className="surface-card dash-hero">
          <div className="dash-hero__content">
            <span className="pill-tag pill-tag--blue">Jornada personalizada</span>
            <h1 className="dash-hero__title">
              Estude, pratique e{" "}
              <span className="dash-hero__accent">avance.</span>
            </h1>
            <p className="dash-hero__copy">
              Um caminho de prática criado para manter o inglês vivo todos os
              dias — com gramática, vocabulário e desafios que evoluem junto com
              você.
            </p>
            <div className="dash-hero__actions">
              <button
                className="btn-3d-primary"
                onClick={() => setDialogOpen(true)}
                type="button"
              >
                Bora praticar <AppIcon name="chevron-right" size={18} />
              </button>
              <button
                className="btn-pill-outline"
                onClick={() => navigate("/estudar")}
                type="button"
              >
                Explorar conteúdos
              </button>
            </div>
          </div>

          <div
            aria-label={`${weeklyGoal.percentage}% da meta semanal`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={weeklyGoal.percentage}
            className="dash-goal-ring"
            role="progressbar"
          >
            <svg className="dash-goal-ring__svg" viewBox="0 0 124 124">
              <circle
                className="dash-goal-ring__track"
                cx="62"
                cy="62"
                r={ringRadius}
              />
              <circle
                className="dash-goal-ring__fill"
                cx="62"
                cy="62"
                r={ringRadius}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div className="dash-goal-ring__center">
              <strong className="dash-goal-ring__value tabular-nums">
                {weeklyGoal.percentage}%
              </strong>
              <span className="dash-goal-ring__label">Meta semanal</span>
            </div>
          </div>
        </article>

        <MissionCard mission={mission} onAction={nextMissionAction} />
      </div>

      <div className="dash-home-bottom">
        <section className="dash-path-section">
          <div className="dash-section-head">
            <div>
              <h2 className="dash-section-title">Seu caminho</h2>
              <p className="dash-section-subtitle">
                Aprenda em pequenas vitórias
              </p>
            </div>
            <button
              className="dash-link-btn"
              onClick={() => navigate("/estudar")}
              type="button"
            >
              Ver jornada <AppIcon name="chevron-right" size={16} />
            </button>
          </div>

          <div className="dash-path-grid">
            <PathCard
              badgeClass="category-badge--orange"
              copy={`18 tópicos do Livro Intro · ${practiced} questões de TO BE praticadas`}
              icon={<GrammarBadgeIllustration />}
              onClick={() => navigate("/livro/intro/gramatica")}
              progress={Math.min(100, Math.round((practiced / 130) * 100))}
              title="Gramática essencial"
            />
            <PathCard
              badgeClass="category-badge--cyan"
              copy="14 conjuntos com flashcards e Jogo da Memória"
              icon={<VocabBadgeIllustration />}
              onClick={() => navigate("/livro/intro/vocabulario")}
              progress={Math.min(
                100,
                (mission?.vocabularyCardsRevealed.length ?? 0) * 20,
              )}
              title="Vocabulário visual"
            />
          </div>
        </section>

        <LeagueCard snapshot={snapshot} />
      </div>

      <AppDialog
        description="Você pode continuar sua rota recomendada ou escolher um conteúdo específico."
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title="O que você quer praticar agora?"
      >
        <div className="dash-mode-grid">
          <button
            className="dash-mode-btn"
            onClick={() => navigate("/livro/intro/gramatica")}
            type="button"
          >
            <span className="category-badge category-badge--sm category-badge--orange">
              <GrammarBadgeIllustration />
            </span>
            <strong>Gramática</strong>
            <span>
              18 tópicos do Livro Intro com explicação, áudio e prática.
            </span>
          </button>
          <button
            className="dash-mode-btn"
            onClick={() => navigate("/livro/intro/vocabulario")}
            type="button"
          >
            <span className="category-badge category-badge--sm category-badge--cyan">
              <VocabBadgeIllustration />
            </span>
            <strong>Vocabulário</strong>
            <span>14 conjuntos com flashcards e Jogo da Memória.</span>
          </button>
        </div>
      </AppDialog>
      <Toast message={notice} />
    </AppShell>
  );
}

function MissionCard({
  mission,
  onAction,
}: {
  mission: EngagementSnapshot["state"]["dailyMission"] | undefined;
  onAction: () => void;
}) {
  const answersDone = (mission?.grammarAnswers ?? 0) >= 5;
  const sessionDone = mission?.grammarSessionCompleted ?? false;
  const vocabularyDone = (mission?.vocabularyCardsRevealed.length ?? 0) >= 5;
  const complete = mission?.completed ?? false;
  const started =
    (mission?.grammarAnswers ?? 0) > 0 ||
    sessionDone ||
    (mission?.vocabularyCardsRevealed.length ?? 0) > 0;
  const current = answersDone ? (sessionDone ? 3 : 2) : 1;
  const completedSteps =
    Number(answersDone) + Number(sessionDone) + Number(vocabularyDone);
  const progressPct = Math.round((completedSteps / 3) * 100);

  return (
    <article className="surface-card dash-mission">
      <div className="dash-mission__head">
        <div>
          <h2 className="dash-section-title">Missão de hoje</h2>
          <p className="dash-section-subtitle">Complete os três desafios</p>
        </div>
        <span className="pill-tag pill-tag--blue tabular-nums">+80 XP</span>
      </div>

      <div
        aria-label={`${completedSteps} de 3 desafios concluídos`}
        className="progress-track"
      >
        <div
          className="progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="dash-mission__steps">
        <MissionStep
          copy={`${Math.min(5, mission?.grammarAnswers ?? 0)}/5 perguntas`}
          current={current === 1 && !complete}
          done={answersDone}
          index={1}
          title="Aquecimento"
        />
        <MissionStep
          copy="Concluir uma rodada"
          current={current === 2 && !complete}
          done={sessionDone}
          index={2}
          title="Present TO BE"
        />
        <MissionStep
          copy={`${Math.min(5, mission?.vocabularyCardsRevealed.length ?? 0)}/5 flashcards`}
          current={current === 3 && !complete}
          done={vocabularyDone}
          index={3}
          title="Vocabulário"
        />
      </div>

      <button
        className="btn-3d-primary btn-3d-primary--sm dash-mission__cta"
        onClick={onAction}
        type="button"
      >
        {complete
          ? "Missão concluída"
          : started
            ? "Retomar missão"
            : "Começar missão"}
      </button>

      <details className="dash-xp-help">
        <summary>Como ganho XP?</summary>
        <p>
          Acerto +10, erro +2, rodada +20, card novo do dia +3 e missão +80.
        </p>
      </details>
    </article>
  );
}

function MissionStep({
  copy,
  current,
  done,
  index,
  title,
}: {
  copy: string;
  current: boolean;
  done: boolean;
  index: number;
  title: string;
}) {
  return (
    <div className={`dash-step ${current ? "dash-step--current" : ""}`}>
      <div
        className={`dash-step__dot ${
          done
            ? "dash-step__dot--done"
            : current
              ? "dash-step__dot--current"
              : ""
        }`}
      >
        {done ? <AppIcon name="check" size={16} /> : index}
      </div>
      <div className="dash-step__copy">
        <strong>{title}</strong>
        <span>{copy}</span>
      </div>
    </div>
  );
}

function PathCard({
  badgeClass,
  copy,
  icon,
  onClick,
  progress,
  title,
}: {
  badgeClass: string;
  copy: string;
  icon: ReactNode;
  onClick: () => void;
  progress: number;
  title: string;
}) {
  return (
    <button
      className="surface-card surface-card--interactive dash-path-card"
      onClick={onClick}
      type="button"
    >
      <span className={`category-badge ${badgeClass}`} aria-hidden="true">
        {icon}
      </span>
      <h3 className="dash-path-card__title">{title}</h3>
      <p className="dash-path-card__meta">{copy}</p>
      <div className="dash-path-card__footer">
        <ProgressDots percentage={progress} />
        <span className="dash-path-card__pct tabular-nums">{progress}%</span>
      </div>
    </button>
  );
}

function LeagueCard({ snapshot }: { snapshot: EngagementSnapshot | null }) {
  const localStandings = snapshot ? getLeagueStandings(snapshot) : [];
  const [liveState, setLiveState] = useState<{
    standings: LeagueStanding[];
    mode: "live" | "local";
    realPlayerCount: number;
    outsideTopLimit: boolean;
  } | null>(null);

  const weeklyXp = snapshot?.state.weeklyXp ?? 0;
  const weekKey = snapshot?.state.league.weekKey ?? "";
  const displayName = snapshot?.profile.displayName ?? "";
  const avatarId = snapshot?.profile.avatarId ?? "fox";
  const avatarTone = snapshot?.profile.avatarTone ?? "cyan";

  useEffect(() => {
    if (!snapshot) return;
    let active = true;
    const fallback = getLeagueStandings(snapshot);
    void fetchGlobalWeeklyStandings(snapshot, fallback).then((result) => {
      if (!active) return;
      setLiveState(result);
    });
    return () => {
      active = false;
    };
  }, [snapshot, weeklyXp, weekKey, displayName, avatarId, avatarTone]);

  const standings = liveState?.standings ?? localStandings;
  const mode = liveState?.mode ?? "local";
  const realPlayerCount = liveState?.realPlayerCount ?? 0;
  const outsideTopLimit = liveState?.outsideTopLimit ?? false;

  const topRows = standings.slice(0, 5);
  const playerRow = standings.find((item) => item.isPlayer);
  const rows =
    playerRow && !topRows.some((item) => item.id === playerRow.id)
      ? [...topRows.slice(0, 4), playerRow]
      : topRows;

  return (
    <section className="surface-card dash-league" aria-label="Leaderboard semanal">
      <div className="dash-league__head">
        <div>
          <h2 className="dash-section-title">Leaderboard</h2>
          <p className="dash-section-subtitle">
            {mode === "live" ? "Liga Speak UP" : "Liga Safira"}
          </p>
        </div>
        <span className="pill-tag">{getWeekRemaining()}</span>
      </div>

      <div className="dash-league__cols">
        <span>Semanal</span>
        <span>Pontos</span>
      </div>

      <div className="dash-league__list">
        {rows.map((item) => {
          const rank = standings.indexOf(item) + 1;
          const isOutside = item.isPlayer && outsideTopLimit;
          const medalClass = isOutside
            ? "medal-badge--plain"
            : rank === 1
              ? "medal-badge--gold"
              : rank === 2
                ? "medal-badge--silver"
                : rank === 3
                  ? "medal-badge--bronze"
                  : "medal-badge--plain";
          const safeTone = sanitizeAvatarTone(item.tone);

          return (
            <div
              className={`dash-league__row ${
                item.isPlayer || rank === 1 ? "is-highlighted" : ""
              }`}
              key={item.id}
            >
              <span className={`medal-badge ${medalClass}`}>
                {isOutside ? "25+" : rank}
              </span>
              <span
                aria-hidden="true"
                className={`dash-avatar dash-avatar--${safeTone}`}
              >
                {getInitials(item.name)}
              </span>
              <span className="dash-league__name">
                {item.name}
                {item.isPlayer && (
                  <span className="dash-league__you">Você</span>
                )}
              </span>
              <span className="dash-league__pts tabular-nums">
                {item.xp.toLocaleString("pt-BR")}
              </span>
            </div>
          );
        })}
      </div>

      <p className="dash-league__note">
        {mode === "live"
          ? realPlayerCount < 10
            ? `Ranking global ativo (${realPlayerCount} aluno${realPlayerCount === 1 ? "" : "s"} nesta semana · bots completam até 10 vagas).`
            : `Ranking global semanal com ${realPlayerCount} alunos ativos.`
          : "Modo local/offline — seu XP sincroniza automaticamente ao reconectar."}
      </p>
    </section>
  );
}
