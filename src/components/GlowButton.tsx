import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function GlowButton({
  children,
  className = "",
  type = "button",
  ...rest
}: PropsWithChildren<GlowButtonProps>) {
  return (
    <button
      className={`btn-3d-primary ${className}`}
      type={type}
      {...rest}
    >
      {children}
    </button>
  );
}
