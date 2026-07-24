import type { ReactNode } from "react";
import { AppShell, PageHeader } from "../../components/AppShell";

interface GameShellProps {
  title: string;
  onBack: () => void;
  action?: ReactNode;
  children: ReactNode;
}

export function GameShell({ action, children, onBack, title }: GameShellProps) {
  return (
    <AppShell className="game-play-page" hideNavigation>
      <PageHeader action={action} onBack={onBack} title={title} />
      {children}
    </AppShell>
  );
}

export function GameProgressBar({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  return (
    <div
      aria-label={`${Math.round(progress)}% da rodada concluída`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(progress)}
      className="session-progress game-progress"
      role="progressbar"
    >
      <i style={{ width: `${progress}%` }} />
    </div>
  );
}
