import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type CardVariant = "default" | "flat" | "elevated";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
};

const variantClass: Record<CardVariant, string> = {
  default:
    "border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-sm)] motion-safe:transition-[box-shadow,transform,border-color] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--shadow-md)] motion-safe:hover:border-[color:var(--color-brand-light)]",
  flat: "border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-none",
  elevated:
    "border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-lg)] motion-safe:transition-[box-shadow,transform,border-color] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[color:var(--color-brand-light)]",
};

export function Card({ children, className = "", variant = "default" }: Props) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border p-4 dark:border-[color:var(--color-border)] dark:bg-[color:var(--color-surface)]",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
