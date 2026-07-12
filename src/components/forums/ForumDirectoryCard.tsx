import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { Forum } from "@/types/database";

type Props = { forum: Forum };

export function ForumDirectoryCard({ forum }: Props) {
  const initial = forum.title.trim().charAt(0).toUpperCase() || "F";
  const fallback =
    "View members, moderators, and roles for this forum.";

  return (
    <Link
      href={`/forums/${forum.slug}`}
      className={cn(
        "group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-sm)] outline-none motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-[var(--transition-base)]",
        "motion-safe:hover:-translate-y-1 motion-safe:hover:border-[color:color-mix(in_srgb,var(--color-brand)_32%,var(--color-border))] motion-safe:hover:shadow-[var(--shadow-brand)]",
        "focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)]",
      )}
    >
      <div
        className="absolute inset-x-0 top-0 z-[1] h-1 bg-gradient-to-r from-[color:var(--color-brand-dark)] via-[color:var(--color-brand)] to-[color:color-mix(in_srgb,var(--color-brand)_55%,white)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 punab-hero-sheen opacity-[0.28] motion-safe:transition-opacity motion-safe:duration-[var(--transition-slow)] group-hover:opacity-[0.42] dark:opacity-[0.18] dark:group-hover:opacity-[0.32]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-t from-[color:var(--color-surface)] via-[color:color-mix(in_srgb,var(--color-surface)_55%,transparent)] to-transparent dark:from-[color:var(--color-surface)] dark:via-[color:color-mix(in_srgb,var(--color-surface)_40%,transparent)]"
        aria-hidden
      />

      <div className="relative z-[2] flex flex-1 flex-col p-6 pt-8 md:p-7 md:pt-9">
        <div className="flex gap-5">
          <div
            className={cn(
              "flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl border border-[color:color-mix(in_srgb,var(--color-brand)_22%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-brand)_7%,var(--color-surface-2))] text-lg font-bold tabular-nums tracking-tight text-[color:var(--color-brand)] shadow-[var(--shadow-sm)]",
              "motion-safe:transition-[border-color,box-shadow,transform,color] motion-safe:duration-[var(--transition-base)]",
              "group-hover:border-[color:color-mix(in_srgb,var(--color-brand)_50%,var(--color-border))] group-hover:text-[color:var(--color-brand-dark)] motion-safe:group-hover:scale-[1.03] motion-safe:group-hover:shadow-[var(--shadow-brand)]",
            )}
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
              Wing forum
            </p>
            <h2 className="text-h3 mt-1.5 leading-snug tracking-tight text-[color:var(--color-text)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)] group-hover:text-[color:var(--color-brand)]">
              {forum.title}
            </h2>
          </div>
        </div>

        <p className="text-small mt-5 flex-1 leading-relaxed text-[color:var(--color-text-muted)] line-clamp-4">
          {forum.description?.trim() || fallback}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[color:color-mix(in_srgb,var(--color-border)_92%,var(--color-brand))] pt-5 dark:border-stone-700/80">
          <span className="text-small font-semibold tracking-wide text-[color:var(--color-brand)]">
            Enter forum
          </span>
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-full)] border border-[color:color-mix(in_srgb,var(--color-brand)_35%,var(--color-border))] bg-[color:var(--color-surface)] text-[color:var(--color-brand)] shadow-[var(--shadow-sm)]",
              "motion-safe:transition-[transform,background-color,border-color,color,box-shadow] motion-safe:duration-[var(--transition-base)]",
              "group-hover:border-transparent group-hover:bg-[color:var(--color-brand)] group-hover:text-[color:var(--color-surface)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:shadow-[var(--shadow-brand)]",
            )}
            aria-hidden
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
