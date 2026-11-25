import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppDialog from "../components/AppDialog";
import AppIcon from "../components/AppIcon";
import { AppShell } from "../components/AppShell";
import Toast from "../components/Toast";
import {
  getAvatarEmoji,
  getLeagueStandings,
  getWeekRemaining,
  getWeeklyGoal,
  type EngagementSnapshot,
  type LeagueStanding,
} from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import { useProgressSummary } from "../services/progress/useProgressSummary";
import { fetchGlobalWeeklyStandings } from "../services/firebase/leaderboardSync";

/* Jogos preservados para uma futura retomada.
const games = [
  { route: "/jogos/contra-o-relogio", symbol: "⏱", title: "Contra o relógio", copy: "Responda rápido e mantenha a sequência." },
  { route: "/jogos/conectando", symbol: "◫", title: "Conectando", copy: "Associe palavra em inglês e imagem." },
  { route: "/jogos/monte-a-frase", symbol: "ABC", title: "Monte a frase", copy: "Organize as palavras na ordem certa." },
];
*/

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

  function nextMissionAction() {
    if (!mission || mission.grammarAnswers < 5 || !mission.grammarSessionCompleted) {
      navigate("/gramatica/present_tobe");
    } else if (mission.vocabularyCardsRevealed.length < 5) {
      navigate("/vocabulario/body/flashcards");
    } else {
      setNotice("Missão concluída! O bônus de +80 XP já foi concedido.");
    }
  }

  return (
    <AppShell activeNav="home" className="home-page" dialogOpen={dialogOpen}>
      <div className="hero-grid">
        <article className="hero">
          <div className="hero-content">
            <div className="pill">✦ Jornada personalizada</div>
            <h1>Estude, pratique e <em>avance.</em></h1>
            <p>
              Um caminho de prática criado para manter o inglês vivo todos os dias —
              com gramática, vocabulário e desafios que evoluem junto com você.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setDialogOpen(true)}>
                Bora praticar <AppIcon name="chevron-right" size={17} />
              </button>
              <button className="ghost-button" onClick={() => navigate("/praticar")}>
                Explorar conteúdos
              </button>
            </div>
          </div>
          <div
            aria-label={`${weeklyGoal.percentage}% da meta semanal`}
            className="hero-orbit"
            role="progressbar"
            style={{ "--weekly-goal": `${weeklyGoal.percentage}%` } as React.CSSProperties}
          >
            <div className="orbit-copy">
              <strong>{weeklyGoal.percentage}%</strong>
              <span>Meta semanal</span>
            </div>
          </div>
        </article>

        <MissionCard
          mission={mission}
          onAction={nextMissionAction}
        />
      </div>

      <div className="dashboard-grid">
        <section className="section-card">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Seu caminho</div>
              <h2>Aprenda em pequenas vitórias</h2>
            </div>
            <button className="text-button" onClick={() => navigate("/praticar")}>
              Ver jornada
            </button>
          </div>
          <div className="learning-map">
            <PathCard
              copy={`6 tópicos disponíveis · ${practiced} questões de TO BE praticadas`}
              icon="Aa"
              progress={Math.round((practiced / 130) * 100)}
              title="Gramática essencial"
              tone="grammar"
              onClick={() => navigate("/gramatica")}
            />
            <PathCard
              copy="Partes do corpo · meta diária de 5 flashcards"
              icon="◫"
              progress={Math.min(100, (mission?.vocabularyCardsRevealed.length ?? 0) * 20)}
              title="Vocabulário visual"
              tone="vocab"
              onClick={() => navigate("/vocabulario/body/flashcards")}
            />
            <PathCard copy="104 verbos com áudio · lacunas, escrita e testes" icon="↺" progress={0} title="Laboratório de Simple Past" tone="grammar" onClick={() => navigate("/passado/home")} />
            {/* Jogos preservados para reativação futura.
            <PathCard
              copy="9 jogos para reforçar TO BE e partes do corpo"
              icon="✦"
              progress={0}
              title="Jogos rápidos"
              tone="game"
              onClick={() => navigate("/jogos")}
            />
            */}
          </div>
        </section>

        <LeagueCard snapshot={snapshot} />
      </div>

      {/* Jogos preservados no código, mas retirados da experiência atual.
      <section className="games-strip section-card">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Jogue para fixar</div>
            <h2>Desafios rápidos</h2>
          </div>
          <button className="text-button" onClick={() => navigate("/jogos")}>
            Ver todos
          </button>
        </div>
        <div className="game-grid">
          {games.map((game) => (
            <button
              className="game-card"
              key={game.title}
              onClick={() => navigate(game.route)}
            >
              <span className="game-lock">Jogar</span>
              <span className="game-symbol">{game.symbol}</span>
              <strong>{game.title}</strong>
              <span>{game.copy}</span>
            </button>
          ))}
        </div>
      </section>
      */}

      <AppDialog
        className="practice-choice-dialog"
        description="Você pode continuar sua rota recomendada ou escolher um conteúdo específico."
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title="O que você quer praticar agora?"
      >
        <div className="mode-grid">
          <button onClick={() => navigate("/gramatica")}>
            <span className="mode-icon">Aa</span>
            <strong>Gramática</strong>
            <span>Seis tópicos com explicação, prática e revisão.</span>
          </button>
          <button className="vocab" onClick={() => navigate("/vocabulario")}>
            <span className="mode-icon">◫</span>
            <strong>Vocabulário</strong>
            <span>Flashcards de partes do corpo com imagem e pronúncia.</span>
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

  return (
    <article className="daily-card">
      <div className="daily-head">
        <div>
          <div className="section-eyebrow">Missão de hoje</div>
          <h2>Complete os três desafios</h2>
        </div>
        <div className="day-score">+80</div>
      </div>
      <div className="daily-path">
        <MissionStep
          copy={`${Math.min(5, mission?.grammarAnswers ?? 0)}/5 perguntas`}
          done={answersDone}
          current={current === 1}
          index={1}
          title="Aquecimento"
        />
        <MissionStep
          copy="Concluir uma rodada"
          done={sessionDone}
          current={current === 2}
          index={2}
          title="Present TO BE"
        />
        <MissionStep
          copy={`${Math.min(5, mission?.vocabularyCardsRevealed.length ?? 0)}/5 flashcards`}
          done={vocabularyDone}
          current={current === 3}
          index={3}
          title="Vocabulário"
        />
      </div>
      <button className="primary-button" onClick={onAction}>
        {complete ? "Missão concluída" : started ? "Retomar missão" : "Começar missão"}
      </button>
      <details className="xp-help">
        <summary>Como ganho XP?</summary>
        <p>Acerto +10, erro +2, rodada +20, card novo do dia +3 e missão +80.</p>
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
    <>
      <div className={`step-dot ${done ? "done" : current ? "current" : ""}`}>
        {done ? <AppIcon name="check" size={18} /> : index}
      </div>
      <div className="step-copy">
        <strong>{title}</strong>
        <span>{copy}</span>
      </div>
    </>
  );
}

function PathCard({
  copy,
  icon,
  onClick,
  progress,
  title,
  tone,
}: {
  copy: string;
  icon: string;
  onClick: () => void;
  progress: number;
  title: string;
  tone: string;
}) {
  return (
    <article className="map-card">
      <div className={`map-icon ${tone}`}>{icon}</div>
      <div className="map-copy">
        <strong>{title}</strong>
        <span>{copy}</span>
        <div className="progress-mini"><span style={{ width: `${progress}%` }} /></div>
      </div>
      <button aria-label={`Abrir ${title}`} className="map-action" onClick={onClick}>
        <AppIcon name="chevron-right" size={17} />
      </button>
    </article>
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
  const podium = standings.slice(0, 3);
  const playerIndex = standings.findIndex((item) => item.isPlayer);
  const safeStart = Math.max(
    0,
    Math.min(playerIndex >= 0 ? playerIndex : 0, Math.max(0, standings.length - 3)),
  );
  const nearby = standings.slice(safeStart, safeStart + 3);

  return (
    <section className="section-card league-card">
      <div className="league-top">
        <div>
          <div className="section-eyebrow">
            {mode === "live" ? "Liga global da semana" : "Liga da semana"}
          </div>
          <h2>{mode === "live" ? "Ranking Speak UP" : "Liga Safira"}</h2>
        </div>
        <span className="league-badge">{getWeekRemaining()}</span>
      </div>
      <div className="podium">
        {[podium[1], podium[0], podium[2]].map((item, index) =>
          item ? (
            <div className={`podium-item ${index === 1 ? "first" : ""}`} key={item.id}>
              <div className={`podium-avatar avatar-${item.tone}`} aria-hidden="true">
                {getAvatarEmoji(item.avatarId)}
              </div>
              <div className="podium-name">{item.name}</div>
              <div className="podium-points">{item.xp.toLocaleString("pt-BR")} XP</div>
              <div className="podium-base">{index === 1 ? 1 : index === 0 ? 2 : 3}</div>
            </div>
          ) : null,
        )}
      </div>
      <div className="rank-list">
        {nearby.map((item) => (
          <div className={`rank-row ${item.isPlayer ? "me" : ""}`} key={item.id}>
            <span className="rank-no">
              {item.isPlayer && outsideTopLimit
                ? "25+"
                : standings.indexOf(item) + 1}
            </span>
            <span className={`rank-avatar avatar-${item.tone}`} aria-hidden="true">
              {getAvatarEmoji(item.avatarId)}
            </span>
            <span className="rank-name">
              {item.isPlayer ? `${item.name} · Você` : item.name}
            </span>
            <span className="rank-xp">{item.xp} XP</span>
          </div>
        ))}
      </div>
      <p className="league-disclosure">
        {mode === "live"
          ? realPlayerCount < 10
            ? `Ranking global ativo (${realPlayerCount} aluno${realPlayerCount === 1 ? "" : "s"} nesta semana · bots completam até 10 vagas).`
            : `Ranking global semanal com ${realPlayerCount} alunos ativos.`
          : "Modo local/offline — seu XP sincroniza automaticamente ao reconectar."}
      </p>
    </section>
  );
}

