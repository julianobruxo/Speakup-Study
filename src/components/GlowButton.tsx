import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function GlowButton({
  children,
  className = "",
  ...rest
}: PropsWithChildren<GlowButtonProps>) {
  return (
    <button
      className={`glow-btn px-8 py-3 text-base ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
