import { useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getLevelSummary,
  type EngagementSnapshot,
} from "../services/progress/engagement";
import { useEngagement } from "../services/progress/useEngagement";
import { ensureAnonymousSession } from "../services/firebase/auth";
import { enqueueLeaderboardSync } from "../services/firebase/leaderboardSync";
import AppIcon, {
  BrandMegaphoneIcon,
  MobileTabIcon,
  SidebarNavIcon,
  StreakFlameIcon,
} from "./AppIcon";

interface AppShellProps {
  activeNav?: "home" | "study" | "progress" | "profile" | "games";
  className?: string;
  hideNavigation?: boolean;
  dialogOpen?: boolean;
  showMobileTabs?: boolean;
}

export function AppShell({
  activeNav,
  children,
  className = "",
  hideNavigation = false,
  dialogOpen = false,
  showMobileTabs,
}: PropsWithChildren<AppShellProps>) {
  const location = useLocation();
  const showGlobalNavigation = Boolean(activeNav) && !hideNavigation;
  const isFlashcardRoute = location.pathname.includes("/flashcards");
  const shouldRenderMobileTabs =
    showMobileTabs ?? (showGlobalNavigation || isFlashcardRoute);
  const isStudyRoute =
    activeNav === "study" ||
    location.pathname.startsWith("/estudar") ||
    location.pathname.startsWith("/livro/") ||
    location.pathname === "/livro" ||
    location.pathname.startsWith("/gramatica") ||
    location.pathname.startsWith("/vocabulario");

  const { snapshot } = useEngagement();
  const latestSnapshotRef = useRef<EngagementSnapshot | null>(null);
  const initialSyncTriggeredRef = useRef(false);

  latestSnapshotRef.current = snapshot;

  useEffect(() => {
    void ensureAnonymousSession();
    const handleOnline = () => {
      if (latestSnapshotRef.current) {
        void enqueueLeaderboardSync(latestSnapshotRef.current);
      }
    };
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!snapshot || initialSyncTriggeredRef.current) return;
    initialSyncTriggeredRef.current = true;
    void enqueueLeaderboardSync(snapshot);
  }, [snapshot]);

  return (
    <div className="app-viewport">
      <div
        className={`app-shell ${
          showGlobalNavigation ? "main-shell" : "focus-shell"
        } ${shouldRenderMobileTabs ? "has-mobile-tabs" : ""}`}
      >
        {showGlobalNavigation && (
          <DesktopSidebar
            active={activeNav}
            hidden={dialogOpen}
            snapshot={snapshot}
          />
        )}
        <div className="shell-main">
          {showGlobalNavigation && !isStudyRoute && (
            <GlobalHeader active={activeNav} snapshot={snapshot} />
          )}
          <main className={`app-content ${className}`}>{children}</main>
        </div>
        {shouldRenderMobileTabs && (
          <BottomNavigation
            active={activeNav ?? (isFlashcardRoute ? "study" : undefined)}
            hidden={dialogOpen}
          />
        )}
      </div>
    </div>
  );
}

type NavId = "home" | "study" | "progress" | "profile" | "games";

const DESKTOP_NAV_ITEMS: {
  id: NavId;
  label: string;
  to: string;
}[] = [
  { id: "home", label: "Início", to: "/" },
  { id: "study", label: "Estudar", to: "/estudar" },
  { id: "progress", label: "Progresso", to: "/progresso" },
  { id: "profile", label: "Perfil", to: "/perfil" },
];

const MOBILE_TAB_ITEMS: {
  id: "study" | "home" | "progress" | "profile";
  label: string;
  to: string;
}[] = [
  { id: "home", label: "Início", to: "/" },
  { id: "study", label: "Estudar", to: "/estudar" },
  { id: "progress", label: "Progresso", to: "/progresso" },
  { id: "profile", label: "Perfil", to: "/perfil" },
];

const PAGE_COPY: Record<NavId, { kicker: string; title: string }> = {
  home: { kicker: "Sua jornada", title: "Olá" },
  study: { kicker: "Estudar", title: "Livro Intro" },
  progress: { kicker: "Seu desempenho", title: "Progresso" },
  profile: { kicker: "Sua conta", title: "Perfil" },
  games: { kicker: "Desafios", title: "Jogos" },
};

function isItemActive(
  itemId: NavId,
  itemTo: string,
  active: NavId | undefined,
  pathname: string,
) {
  if (active === itemId) return true;
  if (
    itemId === "study" &&
    (pathname.startsWith("/estudar") ||
      pathname.startsWith("/livro/") ||
      pathname === "/livro" ||
      pathname.startsWith("/gramatica") ||
      pathname.startsWith("/vocabulario"))
  ) {
    return true;
  }
  return (
    !active &&
    (pathname === itemTo || (itemTo !== "/" && pathname.startsWith(itemTo)))
  );
}

function getToneClass(tone: string | undefined): string {
  switch (tone) {
    case "orange":
    case "green":
    case "cyan":
    case "wine":
    case "violet":
    case "purple":
    case "rose":
    case "amber":
    case "teal":
    case "sky":
      return `shell-avatar--${tone}`;
    default:
      return "shell-avatar--sky";
  }
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
    displayName: "Estudante",
    avatarInitial: "E",
    avatarId: "fox" as const,
    avatarTone: "sky",
  };
  const level = getLevelSummary(snapshot?.state.totalXp ?? 0);
  const copy = PAGE_COPY[active];
  const title =
    active === "home" ? `${greeting()}, ${profile.displayName}` : copy.title;
  const initial = (
    profile.avatarInitial ||
    profile.displayName.charAt(0) ||
    "E"
  ).toUpperCase();

  return (
    <header className="global-header">
      <div className="global-header__copy">
        <span className="global-header__kicker">{copy.kicker}</span>
        <h1 className="global-header__title">{title}</h1>
      </div>
      <button
        aria-label="Abrir perfil"
        className="global-header__profile"
        onClick={() => navigate("/perfil")}
        type="button"
      >
        <span
          className={`shell-avatar ${getToneClass(profile.avatarTone)}`}
          aria-hidden="true"
        >
          {initial}
        </span>
        <span className="global-header__profile-copy">
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

  return (
    <aside
      aria-hidden={hidden || undefined}
      aria-label="Navegação principal"
      className={`desktop-sidebar ${hidden ? "nav-hidden" : ""}`}
    >
      <button
        aria-label="Início · Speak UP Study"
        className="sidebar-brand"
        onClick={() => navigate("/")}
        type="button"
      >
        <span className="sidebar-brand__icon" aria-hidden="true">
          <BrandMegaphoneIcon size={38} />
        </span>
        <span className="sidebar-brand__title">
          <span>Speak UP</span>
          <span>Study</span>
        </span>
      </button>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {DESKTOP_NAV_ITEMS.map((item) => {
          const isActive = isItemActive(
            item.id,
            item.to,
            active,
            location.pathname,
          );
          return (
            <button
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={`sidebar-nav__item ${isActive ? "is-active" : ""}`}
              key={item.id}
              onClick={() => navigate(item.to)}
              type="button"
            >
              <span className="sidebar-nav__icon" aria-hidden="true">
                <SidebarNavIcon active={isActive} id={item.id} size={24} />
              </span>
              <span className="sidebar-nav__label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div
          aria-label={`Sequência atual: ${streak} ${streak === 1 ? "dia seguido" : "dias seguidos"}`}
          className="sidebar-streak"
        >
          <div className="sidebar-streak__copy">
            <span className="sidebar-streak__label">Dias seguidos</span>
            <strong className="sidebar-streak__value">
              {streak} {streak === 1 ? "dia" : "dias"}
            </strong>
            <span className="sidebar-streak__label">
              {streak === 1 ? "seguido" : "seguidos"}
            </span>
          </div>
          <span className="sidebar-streak__flame" aria-hidden="true">
            <StreakFlameIcon size={32} />
          </span>
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
        type="button"
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
      className={`mobile-bottom-nav ${hidden ? "nav-hidden" : ""}`}
    >
      {MOBILE_TAB_ITEMS.map((item) => {
        const isActive = isItemActive(
          item.id,
          item.to,
          active,
          location.pathname,
        );
        return (
          <button
            aria-current={isActive ? "page" : undefined}
            className={`mobile-bottom-nav__tab ${isActive ? "is-active" : ""}`}
            key={item.id}
            onClick={() => navigate(item.to)}
            type="button"
          >
            <span className="mobile-bottom-nav__icon" aria-hidden="true">
              {item.id === "home" ? (
                <AppIcon
                  name="home"
                  size={22}
                  strokeWidth={isActive ? 2.1 : 1.75}
                />
              ) : (
                <MobileTabIcon active={isActive} id={item.id} size={22} />
              )}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
