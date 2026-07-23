import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppDialog from "../components/AppDialog";
import AppIcon from "../components/AppIcon";
import { AppCard, AppShell, PrimaryButton } from "../components/AppShell";
import Toast from "../components/Toast";
import { useProgressSummary } from "../services/progress/useProgressSummary";

const quickGames = [
  {
    icon: "clock" as const,
    title: "Contra o tempo",
    copy: "Responda antes do relógio zerar.",
    tone: "blue",
  },
  {
    icon: "grid" as const,
    title: "Memória",
    copy: "Encontre os pares de palavras.",
    tone: "rose",
  },
  {
    icon: "game" as const,
    title: "Palavras embaralhadas",
    copy: "Coloque cada palavra na ordem certa.",
    tone: "gold",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { summary, loading, error } = useProgressSummary();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const practiced = summary?.uniqueQuestions ?? 0;
  const practicedPercentage = Math.round((practiced / 130) * 100);
  const hasCompletedSession = Boolean(summary?.completedSessions);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <AppShell activeNav="home" className="home-page">
      <div className="home-hero-layout">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="home-pitch"
          initial={{ opacity: 0, y: 8 }}
        >
          <div className="home-intro">
            <span className="eyebrow">Prática rápida. Inglês de verdade.</span>
            <h1>Treine inglês no seu ritmo.</h1>
            <p>
              Escolha o desafio, responda e entenda cada regra com feedback
              direto.
            </p>
          </div>

          <motion.button
            className="practice-hero-card"
            onClick={() => setSheetOpen(true)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
          >
            <span className="practice-hero-icon">
              <AppIcon name="book" size={30} />
            </span>
            <span className="practice-hero-copy">
              <strong>Bora praticar</strong>
              <span>Escolha uma área e monte um desafio do seu jeito.</span>
            </span>
            <span className="card-chevron">
              <AppIcon name="chevron-right" />
            </span>
            <span className="practice-tags">
              <i>Gramática</i>
              <i>Vocabulário</i>
              <i>Rodadas rápidas</i>
            </span>
          </motion.button>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, x: 0 }}
          className="home-progress-panel"
          initial={{ opacity: 0, x: 10 }}
        >
          <div className="home-progress-heading">
            <span className="available-mark">
              <AppIcon name="chart" size={20} />
            </span>
            <div>
              <span>Seu progresso</span>
              <h2>
                {practiced} de 130 questões
              </h2>
            </div>
            <strong>{practicedPercentage}%</strong>
          </div>
          <div
            aria-label={`${practicedPercentage}% das questões praticadas`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={practicedPercentage}
            className="home-progress-bar"
            role="progressbar"
          >
            <i style={{ width: `${practicedPercentage}%` }} />
          </div>
          <div className="home-progress-stats">
            <span>
              <strong>{summary?.accuracy ?? "—"}{summary?.accuracy !== null && summary ? "%" : ""}</strong>
              Precisão
            </span>
            <span>
              <strong>{summary?.completedSessions ?? 0}</strong>
              Sessões
            </span>
            <span>
              <strong>{summary?.reviewCount ?? 0}</strong>
              Para revisar
            </span>
          </div>
          <p>
            {loading
              ? "Carregando seu histórico..."
              : error
                ? "Não foi possível ler o progresso salvo neste dispositivo."
                : practiced
                  ? "Continue de onde parou e avance pelas questões."
                  : "Seu progresso começa na primeira rodada."}
          </p>
          <PrimaryButton
            icon={<AppIcon name="book" size={19} />}
            onClick={() => navigate("/gramatica/present_tobe")}
          >
            {practiced ? "Continuar praticando" : "Começar agora"}
          </PrimaryButton>
        </motion.section>
      </div>

      <section className="games-section">
        <div className="section-heading">
          <div>
            <span>Novos jeitos de treinar</span>
            <h2>Jogos rápidos</h2>
          </div>
          <button onClick={() => navigate("/jogos")}>Ver todos</button>
        </div>
        <div className="quick-games-grid">
          {quickGames.map((game) => (
            <motion.button
              aria-disabled="true"
              className={`quick-game-card tone-${game.tone}`}
              key={game.title}
              onClick={() => showNotice(`${game.title}: disponível em breve.`)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
            >
              <span className="game-card-top">
                <span className="quick-game-icon">
                  <AppIcon name={game.icon} size={24} />
                </span>
                <span className="locked-badge">
                  <AppIcon name="lock" size={12} />
                  Em breve
                </span>
              </span>
              <span className="game-card-copy">
                <strong>{game.title}</strong>
                <span>{game.copy}</span>
              </span>
              <span className="game-card-pattern" aria-hidden="true" />
            </motion.button>
          ))}
        </div>
      </section>

      <section className="home-records-section">
        <div className="section-heading">
          <div>
            <span>Histórico local</span>
            <h2>Seus recordes</h2>
          </div>
        </div>
        {hasCompletedSession && summary ? (
          <div className="home-records-grid">
            <Record icon="sparkles" label="Melhor sequência" value={String(summary.bestStreak)} />
            <Record icon="trophy" label="Melhor resultado" value={`${summary.bestResult}%`} />
            <Record icon="check" label="Sessões concluídas" value={String(summary.completedSessions)} />
            <Record icon="book" label="Questões praticadas" value={`${summary.uniqueQuestions}/130`} />
          </div>
        ) : (
          <p className="home-records-empty">
            Conclua sua primeira sessão para começar a registrar recordes.
          </p>
        )}
      </section>

      <AppDialog
        className="bottom-sheet-dialog"
        description="Depois você escolhe o tópico, a dificuldade e a quantidade de questões."
        onClose={() => setSheetOpen(false)}
        open={sheetOpen}
        title="O que você quer praticar?"
      >
        <div className="sheet-choices">
          <AppCard
            description="TO BE, Simple Present, passado, futuro e mais."
            icon={<AppIcon name="book" />}
            onClick={() => navigate("/gramatica")}
            title="Gramática"
            trailing={<span className="count-pill">8 tópicos</span>}
          />
          <AppCard
            description="Explore palavras organizadas por categoria."
            icon={<AppIcon name="grid" />}
            onClick={() => navigate("/vocabulario")}
            title="Vocabulário"
            trailing={<span className="count-pill">9 categorias</span>}
          />
        </div>
      </AppDialog>
      <Toast message={notice} />
    </AppShell>
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
