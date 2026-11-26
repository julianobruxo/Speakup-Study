import type { PropsWithChildren } from "react";

interface GlassCardProps {
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  onClick,
}: PropsWithChildren<GlassCardProps>) {
  return (
    <div
      onClick={onClick}
      className={`surface-card p-6 ${onClick ? "surface-card--interactive cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
