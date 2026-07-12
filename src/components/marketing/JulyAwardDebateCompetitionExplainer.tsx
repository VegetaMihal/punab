import { Reveal } from "@/components/ui/Reveal";

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v3M8 21h8" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M6 16V10m4 6V6m4 10v-8m4 8V12" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.109V8.25c0-3.728-3.134-6.75-7-6.75S4 4.522 4 8.25v.109a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Compete with us",
    body: "PUNAB debate programmes and tournaments are where chapters prove rigour, discipline, and voice—round by round, on the record.",
    Icon: MicIcon,
  },
  {
    n: "02",
    title: "Judged in the arena",
    body: "Jurists read what happens live: preparation, sportsmanship, and how your club carries the room—not a one-off PDF drop.",
    Icon: ChartIcon,
  },
  {
    n: "03",
    title: "Award follows merit",
    body: "The Best Debate Club honour is decided from those competition lines. After you compete, register below for your participation card (partnership: Debate Forum).",
    Icon: BellIcon,
  },
] as const;

/**
 * Rich callout for the debate club lane: explains the competition-first award path
 * (replaces the generic nomination form on `/july-award-2026/clubs/debate/nominate`).
 */
export function JulyAwardDebateCompetitionExplainer() {
  return (
    <Reveal>
      <article
        className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[color:var(--color-surface)] shadow-[var(--shadow-md)] ring-1 ring-[color:color-mix(in_srgb,var(--color-text)_6%,var(--color-border))]"
        aria-labelledby="debate-award-info-heading"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 h-[22rem] w-[22rem] rounded-full bg-[color:color-mix(in_srgb,var(--color-brand)_22%,transparent)] blur-3xl motion-reduce:blur-none"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-[18rem] w-[18rem] rounded-full bg-[color:color-mix(in_srgb,var(--brand-green)_20%,transparent)] blur-3xl motion-reduce:blur-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.22] bg-[image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-text)_12%,transparent)_1px,transparent_0)] bg-[length:28px_28px]"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-8 left-0 w-1 rounded-full bg-[linear-gradient(180deg,var(--color-brand)_0%,var(--brand-green)_100%)]"
        />

        <div className="relative px-6 py-8 pl-7 md:px-10 md:py-12 md:pl-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-start lg:gap-14">
            <header className="min-w-0">
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[color:var(--brand-green)]">
                Competition pathway
              </p>
              <h2
                id="debate-award-info-heading"
                className="mt-3 text-[clamp(1.65rem,4vw,2.35rem)] font-semibold leading-[1.12] tracking-tight text-[color:var(--color-text)]"
              >
                Earned in rounds,
                <span className="block bg-[linear-gradient(90deg,var(--color-brand)_0%,var(--brand-green)_100%)] bg-clip-text text-transparent">
                  {" "}
                  not in a form
                </span>
              </h2>
              <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
                Thank you for caring about this lane. If your chapter lives for argument done well, come through the doors we open for
                debate—announcements carry dates, briefs, and how to register.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--brand-green)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--brand-green-muted)_55%,var(--color-surface))] px-4 py-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[color:var(--brand-green)]">
                  Live programme
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--color-border)_90%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface-2)_80%,var(--color-surface))] px-4 py-2 text-small font-medium text-[color:var(--color-text-muted)]">
                  Card registration below
                </span>
              </div>
            </header>

            <ol className="grid min-w-0 gap-4 md:grid-cols-3 lg:grid-cols-1 lg:gap-5">
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--brand-green)_12%,var(--color-border))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand-green-muted)_38%,var(--color-surface))_0%,var(--color-surface)_55%,var(--color-surface)_100%)] p-5 motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--shadow-md)] motion-safe:hover:border-[color:color-mix(in_srgb,var(--brand-green)_28%,var(--color-border))] md:min-h-[12rem] lg:min-h-0"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--color-brand)_14%,var(--color-surface-2))] text-[color:var(--color-brand)] ring-1 ring-[color:color-mix(in_srgb,var(--color-brand)_22%,transparent)] motion-safe:transition-colors motion-safe:duration-[var(--transition-base)] group-hover:bg-[color:color-mix(in_srgb,var(--brand-green-muted)_70%,var(--color-surface))] group-hover:text-[color:var(--brand-green)]">
                      <step.Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                          {step.n}
                        </p>
                      </div>
                      <p className="mt-1.5 text-base font-semibold text-[color:var(--color-text)]">{step.title}</p>
                      <p className="mt-2 text-[0.9rem] leading-relaxed text-[color:var(--color-text-muted)]">{step.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-[color:color-mix(in_srgb,var(--color-border)_85%,transparent)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-small leading-relaxed text-[color:var(--color-text-muted)]">
              <span className="font-semibold text-[color:var(--color-text)]">Heads-up for club leads:</span> keep an eye on PUNAB channels
              for competition notices—when a tournament goes live, that is your window to enter the story we can see and verify.
            </p>
            <div className="shrink-0 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-brand)_20%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-brand)_6%,var(--color-surface))] px-4 py-3 text-center sm:text-left">
              <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                July Uprising Memorial Award
              </p>
              <p className="mt-1 text-small font-semibold text-[color:var(--color-text)]">2026 · Debate lane</p>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
