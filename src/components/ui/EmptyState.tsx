import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

function DefaultIcon() {
  return (
    <div
      className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-border-strong)] text-[color:var(--color-text-muted)]"
      aria-hidden
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4" />
      </svg>
    </div>
  );
}

export function EmptyState({ title, description, icon, action, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] px-6 py-12 text-center shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <div className="mb-4">{icon ?? <DefaultIcon />}</div>
      <p className="font-medium text-[color:var(--color-text)]">{title}</p>
      {description && <p className="mt-2 text-small text-[color:var(--color-text-muted)]">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
