import type { PropsWithChildren, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getLevelSummary,
  getWeekKey,
  type EngagementSnapshot,
} from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import AppIcon from "./AppIcon";

interface AppShellProps {
  activeNav?: "home" | "study" | "progress" | "profile" | "games";
  className?: string;
  hideNavigation?: boolean;
  dialogOpen?: boolean;
}

export function AppShell({
  activeNav,
  children,
  className = "",
  hideNavigation = false,
  dialogOpen = false,
}: PropsWithChildren<AppShellProps>) {
  const showGlobalNavigation = Boolean(activeNav) && !hideNavigation;
  const { snapshot } = useEngagement();

  return (
    <div className="app-viewport">
      <div
        className={`app-shell ${
          showGlobalNavigation ? "main-shell" : "focus-shell"
        }`}
      >
        {showGlobalNavigation && (
          <DesktopSidebar
            active={activeNav}
            hidden={dialogOpen}
            snapshot={snapshot}
          />
        )}
        <div className="shell-main">
          {showGlobalNavigation && (
            <GlobalHeader active={activeNav} snapshot={snapshot} />
          )}
          <main className={`app-content ${className}`}>{children}</main>
        </div>
        {showGlobalNavigation && (
          <BottomNavigation active={activeNav} hidden={dialogOpen} />
        )}
      </div>
    </div>
  );
}

type NavId = "home" | "study" | "progress" | "profile" | "games";

const NAV_ITEMS: {
  id: NavId;
  label: string;
  icon: "home" | "book" | "chart" | "user" | "game";
  to: string;
}[] = [
  { id: "home", label: "Início", icon: "home", to: "/" },
  { id: "study", label: "Estudar", icon: "book", to: "/praticar" },
  // Jogos ficam preservados no código, mas não aparecem na trilha atual.
  // { id: "games", label: "Jogos", icon: "game", to: "/jogos" },
  { id: "progress", label: "Progresso", icon: "chart", to: "/progresso" },
  { id: "profile", label: "Perfil", icon: "user", to: "/perfil" },
];

const PAGE_COPY: Record<NavId, { kicker: string; title: string }> = {
  home: { kicker: "Sua jornada", title: "Olá" },
  study: { kicker: "Biblioteca", title: "O que você quer aprender?" },
  progress: { kicker: "Seu desempenho", title: "Progresso e conquistas" },
  profile: { kicker: "Seu perfil", title: "Perfil e preferências" },
  games: { kicker: "Desafios", title: "Jogos rápidos" },
};

function isItemActive(
  itemId: NavId,
  itemTo: string,
  active: NavId | undefined,
  pathname: string,
) {
  return (
    active === itemId ||
    (!active &&
      (pathname === itemTo || (itemTo !== "/" && pathname.startsWith(itemTo))))
  );
}

function GlobalHeader({
  active = "home",
  snapshot,
}: {
  active?: NavId;
  snapshot: EngagementSnapshot | null;
}) {
  const navigate = useNavigate();
  const profile = snapshot?.profile ?? {
    displayName: "Jogador",
    avatarInitial: "J",
    avatarTone: "cyan",
  };
  const level = getLevelSummary(snapshot?.state.totalXp ?? 0);
  const pathname = useLocation().pathname;
  const copy = pathname.startsWith("/passado") ? { kicker: "Simple Past", title: "Seu laboratório do passado" } : PAGE_COPY[active];
  const title =
    active === "home" ? `${greeting()}, ${profile.displayName}` : copy.title;

  return (
    <header className="global-header topbar">
      <div>
        <div className="page-kicker">{copy.kicker}</div>
        <div className="page-title">{title}</div>
      </div>
      <button
        aria-label="Abrir perfil"
        className="profile-button"
        onClick={() => navigate("/perfil")}
      >
        <span className={`avatar avatar-${profile.avatarTone}`}>
          {profile.avatarInitial}
        </span>
        <span className="profile-copy">
          <strong>{profile.displayName}</strong>
          <span>
            Nível {level.level} · {level.title}
          </span>
        </span>
      </button>
    </header>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function DesktopSidebar({
  active,
  hidden = false,
  snapshot,
}: {
  active?: NavId;
  hidden?: boolean;
  snapshot: EngagementSnapshot | null;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const streak = snapshot?.state.currentStreak ?? 0;
  const currentWeek = getWeekKey();
  const activeDays = new Set(
    (snapshot?.state.activeDates ?? []).filter(
      (date) => getWeekKey(new Date(`${date}T12:00:00`)) === currentWeek,
    ),
  );
  const monday = new Date(`${currentWeek}T12:00:00`);
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  return (
    <aside
      aria-hidden={hidden || undefined}
      aria-label="Navegação principal"
      className={`app-sidebar sidebar ${hidden ? "nav-hidden" : ""}`}
    >
      <button aria-label="Início · Speak Up Study" className="brand sidebar-brand" onClick={() => navigate("/")}>
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-copy">
          <strong>Speak Up<br />Study</strong>
          <small>Speak UP!</small>
        </span>
      </button>

      <nav className="study-navigation" aria-label="Conteúdos de estudo">
        <div className="nav-label">Principal</div>
        <button aria-label="Início" className={`nav-button ${location.pathname === "/" ? "active" : ""}`} onClick={() => navigate("/")}><span className="nav-icon"><AppIcon name="home" /></span><span className="sidebar-nav-label">Início</span></button>
        <button aria-label="Biblioteca" className={`nav-button ${location.pathname === "/praticar" ? "active" : ""}`} onClick={() => navigate("/praticar")}><span className="nav-icon"><AppIcon name="book" /></span><span className="sidebar-nav-label">Biblioteca</span></button>
        <div className="nav-label">O que estudar</div>
        <details className="past-menu" open={location.pathname.startsWith("/gramatica")}>
          <summary aria-label="Gramática"><span className="nav-icon"><AppIcon name="book" /></span><span className="sidebar-nav-label">Gramática</span><span className="past-chevron">⌄</span></summary>
          <div className="past-menu-links">
            {[
              ["/gramatica", "Todos os tópicos"],
              ["/gramatica/present_tobe", "TO BE · presente"],
              ["/gramatica/simple_present", "Simple Present"],
              ["/gramatica/present_continuous", "Present Continuous"],
              ["/gramatica/be_going_to", "Be Going To"],
              ["/gramatica/there_tobe", "There Is / Are"],
            ].map(([path, label]) => <button key={path} className={location.pathname === path ? "active" : ""} onClick={() => navigate(path)}>{label}</button>)}
          </div>
        </details>
        <button aria-label="Vocabulário" className={`nav-button ${location.pathname.startsWith("/vocabulario") ? "active" : ""}`} onClick={() => navigate("/vocabulario")}><span className="nav-icon"><AppIcon name="grid" /></span><span className="sidebar-nav-label">Vocabulário</span></button>
        <button aria-label="Acervo da escola" className={`nav-button ${location.pathname.startsWith("/escola") ? "active" : ""}`} onClick={() => navigate("/escola/vocabulario")}><span className="nav-icon"><AppIcon name="sparkles" /></span><span className="sidebar-nav-label">Acervo da escola</span></button>
        <details className="past-menu" open={location.pathname.startsWith("/passado")}>
          <summary aria-label="Simple Past"><span className="nav-icon"><AppIcon name="clock" /></span><span className="sidebar-nav-label">Simple Past</span><span className="past-chevron">⌄</span></summary>
          <div className="past-menu-links">
            {[
              ["home", "Visão geral"], ["flash", "Flashcards + áudio"],
              ["gaps", "Fill in the gaps"], ["time", "Time expressions"], ["writing", "Sentence lab"], ["test", "Revisão final · 5 níveis"],
            ].map(([section, label]) => <button key={section} className={location.pathname === `/passado/${section}` ? "active" : ""} onClick={() => navigate(`/passado/${section}`)}>{label}</button>)}
          </div>
        </details>
        <div className="nav-label">Pratique e acompanhe</div>
        {/* Jogos serão reativados quando houver uma nova decisão pedagógica.
        <button aria-label="Jogos" className={`nav-button ${active === "games" ? "active" : ""}`} onClick={() => navigate("/jogos")}><span className="nav-icon"><AppIcon name="game" /></span><span className="sidebar-nav-label">Jogos</span><b className="nav-badge sidebar-nav-label">9</b></button>
        */}
        <button aria-label="Progresso" className={`nav-button ${active === "progress" ? "active" : ""}`} onClick={() => navigate("/progresso")}><span className="nav-icon"><AppIcon name="chart" /></span><span className="sidebar-nav-label">Progresso</span></button>
        <button aria-label="Perfil e som" className={`nav-button ${active === "profile" ? "active" : ""}`} onClick={() => navigate("/perfil")}><span className="nav-icon"><AppIcon name="user" /></span><span className="sidebar-nav-label">Perfil e som</span></button>
      </nav>

      <div className="sidebar-footer">
        <div className="streak-panel">
          <div className="streak-top">
            <span>🔥 Sequência</span>
            <strong className="streak-value">{streak}</strong>
          </div>
          <p>
            {streak
              ? `${streak} ${streak === 1 ? "dia ativo" : "dias ativos"} em sequência.`
              : "Comece hoje. Sua primeira prática inicia a sequência."}
          </p>
          <div className="mini-days" aria-label="Dias ativos nesta semana">
            {weekDates.map((date) => (
              <i
                className={`mini-day ${activeDays.has(date) ? "done" : ""}`}
                key={date}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

interface PageHeaderProps {
  backTo?: string;
  title: string;
  action?: ReactNode;
  onBack?: () => void;
}

export function PageHeader({
  action,
  backTo,
  onBack,
  title,
}: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <button
        aria-label="Voltar"
        className="icon-button"
        onClick={onBack ?? (() => (backTo ? navigate(backTo) : navigate(-1)))}
      >
        <AppIcon name="arrow-left" />
      </button>
      <h1>{title}</h1>
      <div className="page-header-action">{action}</div>
    </header>
  );
}

interface PrimaryButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
}

export function PrimaryButton({
  children,
  className = "",
  icon,
  variant = "primary",
  ...props
}: PrimaryButtonProps) {
  return (
    <motion.button
      className={`primary-button ${variant} ${className}`}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}

interface AppCardProps
  extends Omit<HTMLMotionProps<"button">, "children" | "title"> {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  trailing?: ReactNode;
}

export function AppCard({
  description,
  eyebrow,
  icon,
  title,
  trailing,
  className = "",
  ...props
}: AppCardProps) {
  return (
    <motion.button
      className={`app-card ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      {...props}
    >
      {icon && <span className="card-icon">{icon}</span>}
      <span className="card-copy">
        {eyebrow && <span className="card-eyebrow">{eyebrow}</span>}
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </span>
      {trailing ?? (
        <span className="card-chevron">
          <AppIcon name="chevron-right" size={19} />
        </span>
      )}
    </motion.button>
  );
}

export function LockedCard({
  description,
  onClick,
  title,
}: {
  description?: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <AppCard
      aria-disabled="true"
      className="locked-card"
      description={description}
      icon={<AppIcon name="lock" size={19} />}
      onClick={onClick}
      title={title}
      trailing={<span className="status-pill">Em breve</span>}
    />
  );
}

function BottomNavigation({
  active,
  hidden = false,
}: {
  active?: NavId;
  hidden?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      aria-hidden={hidden || undefined}
      aria-label="Navegação principal"
      className={`bottom-navigation mobile-nav ${hidden ? "nav-hidden" : ""}`}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isItemActive(
          item.id,
          item.to,
          active,
          location.pathname,
        );
        return (
          <button
            aria-current={isActive ? "page" : undefined}
            className={isActive ? "active" : ""}
            key={item.id}
            onClick={() => navigate(item.to)}
          >
            <span className="nav-icon">
              <AppIcon name={item.icon} size={20} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

