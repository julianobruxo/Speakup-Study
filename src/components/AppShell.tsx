import type { PropsWithChildren, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/speakup-logo.png";
import AppIcon from "./AppIcon";

interface AppShellProps {
  activeNav?: "home" | "study" | "progress" | "profile";
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

  return (
    <div className="app-viewport">
      <div
        className={`app-shell ${
          showGlobalNavigation ? "main-shell" : "focus-shell"
        }`}
      >
        {showGlobalNavigation && <GlobalHeader />}
        {showGlobalNavigation && (
          <DesktopSidebar active={activeNav} hidden={dialogOpen} />
        )}
        <main className={`app-content ${className}`}>{children}</main>
        {showGlobalNavigation && (
          <BottomNavigation active={activeNav} hidden={dialogOpen} />
        )}
      </div>
    </div>
  );
}

type NavId = "home" | "study" | "progress" | "profile";

const NAV_ITEMS: {
  id: NavId;
  label: string;
  icon: "home" | "book" | "chart" | "user";
  to: string;
}[] = [
  { id: "home", label: "Início", icon: "home", to: "/" },
  { id: "study", label: "Estudar", icon: "book", to: "/praticar" },
  { id: "progress", label: "Progresso", icon: "chart", to: "/progresso" },
  { id: "profile", label: "Perfil", icon: "user", to: "/perfil" },
];

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

function GlobalHeader() {
  const navigate = useNavigate();
  return (
    <header className="global-header">
      <button
        aria-label="Ir para o início"
        className="brand-button"
        onClick={() => navigate("/")}
      >
        <img alt="Speak UP English School" src={logo} />
      </button>
      <button
        aria-label="Abrir perfil"
        className="avatar-button"
        onClick={() => navigate("/perfil")}
      >
        <AppIcon name="user" size={18} />
      </button>
    </header>
  );
}

function DesktopSidebar({
  active,
  hidden = false,
}: {
  active?: NavId;
  hidden?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      aria-hidden={hidden || undefined}
      aria-label="Navegação principal"
      className={`app-sidebar ${hidden ? "nav-hidden" : ""}`}
    >
      <button
        aria-label="Ir para o início"
        className="sidebar-brand"
        onClick={() => navigate("/")}
      >
        <img alt="Speak UP English School" src={logo} />
      </button>
      <nav className="sidebar-nav" aria-label="Áreas principais">
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
              <AppIcon name={item.icon} size={20} />
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-secondary">
        <button onClick={() => navigate("/jogos")}>
          <AppIcon name="game" size={20} />
          <span className="sidebar-nav-label">Jogos</span>
        </button>
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
      className={`bottom-navigation ${hidden ? "nav-hidden" : ""}`}
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
            <AppIcon name={item.icon} size={21} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
