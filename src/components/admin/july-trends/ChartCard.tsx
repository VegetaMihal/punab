import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  help,
  children,
}: {
  title: string;
  subtitle?: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">{title}</p>
      {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
      <div className="mt-3 h-64">{children}</div>
      {help ? <p className="mt-3 text-xs text-muted">{help}</p> : null}
    </div>
  );
}

export function StatTile({ label, value, tone }: { label: string; value: string | number; tone?: "default" | "warn" }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-0.5 text-2xl font-bold ${
          tone === "warn" ? "text-amber-700 dark:text-amber-400" : "text-stone-900 dark:text-stone-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
