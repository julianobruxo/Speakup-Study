import type { PropsWithChildren } from "react";

interface GradientTextProps {
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
}

export default function GradientText({
  children,
  as: Tag = "span",
  className = "",
}: PropsWithChildren<GradientTextProps>) {
  return (
    <Tag
      className={`font-bold tracking-tight ${className}`}
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </Tag>
  );
}
