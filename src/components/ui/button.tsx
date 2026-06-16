import React from "react";

type ButtonVariant = "primary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-bold px-6 py-3 shadow-soft transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-terracotta text-cream hover:bg-terracotta-dark active:scale-95",
    ghost:
      "bg-transparent border border-line text-espresso hover:bg-cream-soft active:scale-95",
    danger:
      "bg-terracotta-dark text-cream hover:bg-terracotta active:scale-95",
  };

  const disabledCls = disabled
    ? "opacity-40 pointer-events-none cursor-not-allowed"
    : "";

  const widthCls = fullWidth ? "w-full" : "";

  return (
    <button
      disabled={disabled}
      className={[base, variants[variant], disabledCls, widthCls, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
