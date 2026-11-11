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
      className={`glass-card p-6 ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

