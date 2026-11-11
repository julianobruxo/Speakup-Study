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
    <Tag className={`gradient-text font-display font-bold ${className}`}>
      {children}
    </Tag>
  );
}

