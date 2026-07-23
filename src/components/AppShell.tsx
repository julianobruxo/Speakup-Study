import type { PropsWithChildren, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/speakup-logo.png";
import AppIcon from "./AppIcon";

interface AppShellProps {
  activeNav?: "home" | "study" | "progress" | "profile";
  className?: string;
  hideNavigation?: boolean;
}

export function AppShell({
  activeNav,
  children,
  className = "",
  hideNavigation = false,
}: PropsWithChildren<AppShellProps>) {
  const showGlobalNavigation = Boolean(activeNav) && !hideNavigation;

  return (
    <div className="app-viewport">
      <div
        className={`app-shell ${
          showGlobalNavigation ? "main-shell" : "focus-shell"
        }`}
      >
        {showGlobalNavigation && <GlobalHeader active={activeNav} />}
        <main className={`app-content ${className}`}>{children}</main>
        {showGlobalNavigation && <GlobalNavigation active={activeNav} />}
      </div>
    </div>
  );
}

function GlobalHeader({
  active,
}: {
  active?: "home" | "study" | "progress" | "profile";
}) {
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
      <GlobalNavigation active={active} desktop />
      <button
        aria-label="Abrir perfil"
        className="avatar-button"
        onClick={() => navigate("/perfil")}
      >
        J
      </button>
    </header>
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

function GlobalNavigation({
  active,
  desktop = false,
}: {
  active?: "home" | "study" | "progress" | "profile";
  desktop?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    { id: "home" as const, label: "Início", icon: "home" as const, to: "/" },
    {
      id: "study" as const,
      label: "Estudar",
      icon: "book" as const,
      to: "/praticar",
    },
    {
      id: "progress" as const,
      label: "Progresso",
      icon: "chart" as const,
      to: "/progresso",
    },
    {
      id: "profile" as const,
      label: "Perfil",
      icon: "user" as const,
      to: "/perfil",
    },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className={desktop ? "desktop-navigation" : "bottom-navigation"}
    >
      {items.map((item) => {
        const isActive =
          active === item.id ||
          (!active &&
            (location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to))));
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
