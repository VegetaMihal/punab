import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { JULY_AWARD_2026_EVENT_DETAILS } from "@/lib/july-award-2026-event";
import {
  APPRECIATION_CREST,
  CLUB_EXCELLENCE_WINNERS,
  INJURED_CREST_OUTSIDE_PRIVATE_UNIVERSITY,
  INJURED_CREST_PRIVATE_UNIVERSITY,
  NATIONAL_SPECIAL_AWARDS,
  TEACHERS_AWARD,
} from "@/lib/july-award-2026-winners";

export const metadata = {
  title: "Winners — July Uprising Memorial Award 2026",
  description:
    "The named honourees of the July Uprising Memorial Award 2026: club excellence winners, national special awards, appreciation crests, honoured teachers, and injured students recognised.",
};

function SectionHead({
  step,
  eyebrow,
  title,
  description,
  staggerIndex,
}: {
  step: string;
  eyebrow: string;
  title: string;
  description?: string;
  staggerIndex?: number;
}) {
  return (
    <Reveal staggerIndex={staggerIndex}>
      <header className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-10 lg:gap-14">
        <div className="flex md:flex-col md:items-start md:gap-3">
          <span className="inline-flex items-center rounded-md border border-[color:color-mix(in_srgb,var(--color-text)_12%,var(--color-border))] bg-[color:var(--color-surface-2)] px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[color:var(--color-text-muted)]">
            {step}
          </span>
          <span
            aria-hidden
            className="mt-3 hidden h-16 w-px shrink-0 bg-[linear-gradient(180deg,var(--color-brand)_0%,var(--brand-green)_55%,transparent_100%)] md:mt-0 md:block"
          />
        </div>
        <div className="min-w-0 space-y-3">
          <p className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">{eyebrow}</p>
          <h2 className="text-h2 text-[color:var(--color-text)]">{title}</h2>
          {description ? (
            <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)]">{description}</p>
          ) : null}
        </div>
      </header>
    </Reveal>
  );
}

/** Detection order matters (specific before generic); priority values encode the requested display order. */
const TEACHER_RANK_RULES: { keyword: string; priority: number }[] = [
  { keyword: "Vice Chancellor", priority: 0 },
  { keyword: "Proctor", priority: 1 },
  { keyword: "Chairman", priority: 2 },
  { keyword: "Associate Professor", priority: 4 },
  { keyword: "Assistant Professor", priority: 4 },
  { keyword: "Professor", priority: 3 },
  { keyword: "Senior Lecturer", priority: 5 },
  { keyword: "Lecturer", priority: 6 },
];

function teacherRank(role: string): number {
  const rule = TEACHER_RANK_RULES.find((r) => role.includes(r.keyword));
  return rule ? rule.priority : TEACHER_RANK_RULES.length;
}

/** One badge color per rank tier — keyed by teacherRank() priority. */
const TEACHER_RANK_BADGE_CLASS: Record<number, string> = {
  0: "border-[color:color-mix(in_srgb,#d4af37_45%,var(--color-border))] bg-[color:color-mix(in_srgb,#d4af37_16%,var(--color-surface))] text-[#a3831f] dark:text-[#e8c85a]",
  1: "border-[color:color-mix(in_srgb,#c41e3a_35%,var(--color-border))] bg-[color:color-mix(in_srgb,#c41e3a_12%,var(--color-surface))] text-[#a4172d] dark:text-[#ef8a9a]",
  2: "border-[color:color-mix(in_srgb,#7c3aed_35%,var(--color-border))] bg-[color:color-mix(in_srgb,#7c3aed_12%,var(--color-surface))] text-[#6d28d9] dark:text-[#c4b5fd]",
  3: "border-[color:color-mix(in_srgb,var(--brand-green)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--brand-green-muted)_45%,var(--color-surface))] text-[color:var(--brand-green)]",
  4: "border-[color:color-mix(in_srgb,#0284c7_35%,var(--color-border))] bg-[color:color-mix(in_srgb,#0284c7_12%,var(--color-surface))] text-[#0369a1] dark:text-[#7dd3fc]",
  5: "border-[color:color-mix(in_srgb,#ea580c_35%,var(--color-border))] bg-[color:color-mix(in_srgb,#ea580c_12%,var(--color-surface))] text-[#c2410c] dark:text-[#fdba74]",
  6: "border-[color:color-mix(in_srgb,#0d9488_35%,var(--color-border))] bg-[color:color-mix(in_srgb,#0d9488_12%,var(--color-surface))] text-[#0f766e] dark:text-[#5eead4]",
};

function teacherBadgeClass(role: string): string {
  return TEACHER_RANK_BADGE_CLASS[teacherRank(role)] ?? TEACHER_RANK_BADGE_CLASS[6];
}

const SORTED_TEACHERS_AWARD = [...TEACHERS_AWARD].sort((a, b) => teacherRank(a.role) - teacherRank(b.role));

function NameTag({ children }: { children: ReactNode }): ReactNode {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-full)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-1 text-small font-semibold text-[color:var(--color-text)]">
      {children}
    </span>
  );
}

export default function JulyAward2026WinnersPage() {
  return (
    <>
      <section className="relative overflow-hidden" aria-labelledby="winners-hero-title">
        <div
          className="absolute inset-x-0 top-0 z-[2] h-[3px] bg-[linear-gradient(90deg,#047857_0%,#c41e3a_50%,#047857_100%)]"
          aria-hidden
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,color-mix(in_srgb,var(--brand-green-muted)_50%,var(--color-surface-2))_0%,var(--color-surface-2)_45%,var(--color-surface-2)_100%)]"
        />
        <MarketingContainer className="relative py-16 md:py-24">
          <Reveal>
            <span className="inline-flex items-center rounded-[var(--radius-full)] border border-[color:color-mix(in_srgb,var(--brand-green)_30%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--brand-green-muted)_45%,var(--color-surface))] px-3 py-1 text-small font-bold uppercase tracking-[0.2em] text-[color:var(--brand-green)]">
              Results
            </span>
            <h1
              id="winners-hero-title"
              className="text-display mt-5 max-w-3xl text-[color:var(--color-text)]"
            >
              July Uprising Memorial Award 2026 — Honourees
            </h1>
            <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)]">
              Named on {JULY_AWARD_2026_EVENT_DETAILS.dateLabel} at {JULY_AWARD_2026_EVENT_DETAILS.venueLabel}—club
              excellence, national special recognition, appreciation crests, honoured teachers, and injured students
              carried forward by their campuses.
            </p>
            <div className="mt-8">
              <Button href="/july-award-2026" variant="secondary" size="lg">
                Back to July Award 2026
              </Button>
            </div>
          </Reveal>
        </MarketingContainer>
      </section>

      {/* Club Excellence Award */}
      <Section surface="white" divider paddingY="section">
        <MarketingContainer className="space-y-10">
          <SectionHead
            step="01"
            eyebrow="Club excellence award"
            title="Eight lanes, twenty-four clubs"
            description="Every category crowns a winner, a first runner-up, and a second runner-up—merit read against submitted evidence."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {CLUB_EXCELLENCE_WINNERS.map((cat, i) => (
              <Reveal key={cat.key} staggerIndex={i % 6}>
                <Card
                  variant="elevated"
                  className="relative flex h-full flex-col overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-md)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--brand-green)_0%,var(--color-brand)_100%)]"
                  />
                  <h3 className="text-h3 text-[color:var(--color-text)]">{cat.category}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {cat.places.map((p) => (
                      <li
                        key={p.place}
                        className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5"
                      >
                        <span className="text-[0.9375rem] leading-snug text-[color:var(--color-text)]">{p.club}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ))}
          </div>
        </MarketingContainer>
      </Section>

      {/* National Special Category + Appreciation Crest */}
      <Section
        surface="muted"
        divider
        paddingY="section"
        className="relative bg-[linear-gradient(180deg,var(--color-surface-2)_0%,color-mix(in_srgb,var(--brand-green-muted)_22%,var(--color-surface-2))_55%,var(--color-surface-2)_100%)]"
      >
        <MarketingContainer className="space-y-14">
          <div className="space-y-8">
            <SectionHead
              step="02"
              eyebrow="National special category"
              title="One-of-a-kind recognitions"
              description="Three national honours, each naming the group whose work stood apart from the standard club lanes."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {NATIONAL_SPECIAL_AWARDS.map((a, i) => (
                <Reveal key={a.title} staggerIndex={i}>
                  <div className="group relative overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-sm)] ring-1 ring-[color:color-mix(in_srgb,var(--brand-green)_20%,var(--color-border))]">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-[linear-gradient(180deg,var(--color-brand)_0%,var(--brand-green)_100%)]"
                    />
                    <p className="pl-4 text-[0.9375rem] font-semibold leading-snug text-[color:var(--color-text)]">{a.title}</p>
                    <p className="mt-2 pl-4 text-body font-semibold text-[color:var(--brand-green)]">{a.recipient}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <SectionHead
              step="03"
              eyebrow="Appreciation crest"
              title="Clubs recognised for consistent effort"
            />
            <Reveal>
              <div className="rounded-[var(--radius-xl)] border border-[color:color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color:var(--color-surface)] p-6 md:p-8">
                <div className="flex flex-wrap gap-2.5">
                  {APPRECIATION_CREST.map((club) => (
                    <NameTag key={club}>{club}</NameTag>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </MarketingContainer>
      </Section>

      {/* Teachers' Award */}
      <Section surface="white" divider paddingY="section">
        <MarketingContainer className="space-y-10">
          <SectionHead
            step="04"
            eyebrow="Teachers' award"
            title="Faculty who stood with students"
            description="Twenty-five educators—across ranks and campuses—honoured for shielding, testifying, or organising when it mattered."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SORTED_TEACHERS_AWARD.map((t, i) => (
              <Reveal key={t.name} staggerIndex={i % 6}>
                <Card
                  className={`h-full border p-4 ${t.isLate ? "border-[color:color-mix(in_srgb,#c41e3a_30%,var(--color-border))] bg-[color:color-mix(in_srgb,#c41e3a_6%,var(--color-surface))]" : "border-[color:color-mix(in_srgb,var(--color-text)_6%,var(--color-border))] bg-[color:var(--color-surface)]"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex w-fit rounded-[var(--radius-full)] border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] ${teacherBadgeClass(t.role)}`}
                    >
                      {t.role}
                    </span>
                    {t.isLate ? (
                      <span className="inline-flex w-fit items-center gap-1 rounded-[var(--radius-full)] border border-[color:color-mix(in_srgb,#c41e3a_35%,var(--color-border))] bg-[color:color-mix(in_srgb,#c41e3a_12%,var(--color-surface))] px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#a4172d] dark:text-[#ef8a9a]">
                        🌸 Remembering
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-2 font-semibold text-[color:var(--color-text)]">{t.name}</h4>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-[color:var(--color-text-muted)]">{t.title}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </MarketingContainer>
      </Section>

      {/* Injured Crest List */}
      <Section
        surface="muted"
        paddingY="section"
        className="relative bg-[linear-gradient(180deg,var(--color-surface-2)_0%,color-mix(in_srgb,var(--brand-green-muted)_22%,var(--color-surface-2))_55%,var(--color-surface-2)_100%)]"
      >
        <MarketingContainer className="space-y-14">
          <div className="space-y-8">
            <SectionHead
              step="05"
              eyebrow="Injured crest list"
              title="Students hurt in July 2024 — private universities"
              description="Twenty-one students from private-university campuses, carrying scars from the uprising, honoured with a crest."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INJURED_CREST_PRIVATE_UNIVERSITY.map((s, i) => (
                <Reveal key={s.name} staggerIndex={i % 6}>
                  <div className="flex flex-col gap-0.5 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3">
                    <p className="font-semibold text-[color:var(--color-text)]">{s.name}</p>
                    <p className="text-[0.875rem] text-[color:var(--color-text-muted)]">{s.institution}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <SectionHead
              step="06"
              eyebrow="Injured crest list"
              title="Outside the private-university sector"
              description="Six honourees from public schools and colleges, recognised alongside their private-university peers."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INJURED_CREST_OUTSIDE_PRIVATE_UNIVERSITY.map((s, i) => (
                <Reveal key={s.name} staggerIndex={i % 6}>
                  <div className="flex flex-col gap-0.5 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3">
                    <p className="font-semibold text-[color:var(--color-text)]">{s.name}</p>
                    {s.institution ? (
                      <p className="text-[0.875rem] text-[color:var(--color-text-muted)]">{s.institution}</p>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </MarketingContainer>
      </Section>

      <Section surface="white" paddingY="lg">
        <MarketingContainer>
          <Reveal>
            <div className="flex flex-col items-start gap-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <p className="text-[1.0625rem] text-[color:var(--color-text)]">
                Want the full story behind the July Uprising Memorial Award 2026?
              </p>
              <Button href="/july-award-2026" variant="primary" size="lg">
                See the programme
              </Button>
            </div>
          </Reveal>
        </MarketingContainer>
      </Section>
    </>
  );
}
