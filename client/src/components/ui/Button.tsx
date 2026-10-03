import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "quiet";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-bgprimary text-primary hover:bg-bgprimary/85",
  secondary: "border border-bgsecondary/60 bg-bgsecondary/10 text-bgsecondary hover:bg-bgsecondary/20",
  danger: "border border-danger/70 bg-danger/10 text-danger hover:bg-danger/20",
  quiet: "border border-secondary/50 bg-transparent text-bgsecondary hover:bg-white/5",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
