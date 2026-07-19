import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PUNAB_LOGO_SRC } from "@/components/layout/logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { JULY_AWARD_CLUB_CATEGORIES } from "@/lib/july-award-2026-clubs";
import {
  JULY_AWARD_2026_EVENT_DETAILS,
  JULY_AWARD_2026_VENUE_CALLOUT,
  julyAward2026HeroCityTag,
  julyAward2026MapIframeTitle,
  julyAward2026ProgramScheduleIntro,
  julyAward2026ProgramScheduleRows,
  julyAward2026VenueMapEmbedUrl,
  julyAward2026VenueMapOpenUrl,
} from "@/lib/july-award-2026-event";

const JULY_AWARD_HERO_IMAGE_SRC = "/images/marketing/july-uprising-memorial-hero.png";

/** Post-hero partners: infinite marquee strip only (BGMEA + NextGen IT + ADUST). */
const JULY_AWARD_PARTNERS_MARQUEE = [
  {
    id: "bgmea",
    roleLabel: "Bronze supporter",
    name: "BGMEA University of Fashion & Technology",
    acronym: "BUFT",
    logoSrc: "/images/marketing/july-award-2026-bronze-sponsor-buft.png",
    logoW: 120,
    logoH: 100,
    logoClassName: "max-h-11 w-auto max-w-[5.75rem] object-contain sm:max-h-12 sm:max-w-[6.25rem]",
  },
  {
    id: "nextgenit",
    roleLabel: "IT partner",
    name: "NextGen IT",
    acronym: "NextGenIT",
    logoSrc: "/branding/nextgenit-logo.png",
    logoW: 220,
    logoH: 64,
    logoClassName: "max-h-9 w-auto max-w-[11.5rem] object-contain sm:max-h-10 sm:max-w-[12.5rem]",
  },
  {
    id: "adust",
    roleLabel: "Bronze supporter",
    name: "Atish Dipankar University of Science & Technology",
    acronym: "ADUST",
    logoSrc: "/branding/adust-logo.png",
    logoW: 344,
    logoH: 66,
    logoClassName: "max-h-9 w-auto max-w-[15rem] object-contain sm:max-h-10 sm:max-w-[17rem]",
  },
] as const;

/** How many times the full partner list tiles inside one marquee half (must match duplicate half for seamless -50% loop). */
const JULY_AWARD_PARTNERS_MARQUEE_TILES = 10;

/** Event copy & TBAs — date/time/venue: `src/lib/july-award-2026-event.ts`. Adjust `forms.*.href` here as announcements go live. */
const JULY_AWARD_2026 = {
  eventTagline: "We remember July. We lift up those who stood—and those who fell.",
  heroLead:
    "One national gathering for Bangladesh's private universities: Shaheed families, injured students, teachers who refused to look away, and student clubs that turned conviction into action.",
  eventDetails: JULY_AWARD_2026_EVENT_DETAILS,
  forms: {
    participant: {
      href: "/july-award-2026/participants/register",
      label: "Register as a participant",
      description:
        "Reserve your seat at the July Uprising Memorial Award programme. Quick details now, confirmation before the day.",
    },
    teacher: {
      href: "/july-award-2026/teacher-honor/nominate",
      label: "Nominate a teacher",
      description:
        "If a faculty member stood with students when it mattered—shielded, guided, or spoke truth—put their name forward. The jury considers nominations backed by evidence and community voice.",
    },
    injured: {
      href: "/july-award-2026/injured-student/register",
      label: "Register as an injured student",
      description:
        "Students harmed during the July 2024 uprising deserve public recognition, not silence. Share your details here; PUNAB verifies privately before the programme.",
    },
  },
  clubGateway: {
    label: "Club excellence",
    description:
      "Ten lanes—from debate and culture to social welfare, pharmacy, and sport—each with its own application. Pick the category that matches what your club actually built on campus. You may enter two.",
  },
} as const;

const PROGRAM_SEGMENTS = julyAward2026ProgramScheduleRows();

const CLUB_SCORING: { criterion: string; marks: string }[] = [
  { criterion: "Activities", marks: "20" },
  { criterion: "Impact", marks: "25" },
  { criterion: "Quality", marks: "15" },
  { criterion: "Leadership", marks: "10" },
  { criterion: "Collaboration", marks: "10" },
  { criterion: "Documentation", marks: "10" },
  { criterion: "Engagement", marks: "5" },
  { criterion: "Sustainability", marks: "5" },
];

const TEACHER_SCORING: { criterion: string; marks: string }[] = [
  { criterion: "Direct support", marks: "25" },
  { criterion: "Evidence", marks: "20" },
  { criterion: "Impact", marks: "20" },
  { criterion: "Humanitarian role", marks: "15" },
  { criterion: "Public / institutional role", marks: "10" },
  { criterion: "Community trust", marks: "10" },
];

const CLUB_RULE_LINES: ReactNode[] = [
  <>Official club submissions—or credible student nominations routed through your chapter.</>,
  <>
    Cap at <strong className="text-[color:var(--color-text)]">two categories</strong>; secretariat may re-slot work if evidence fits
    elsewhere.
  </>,
  <>Bring receipts: activity logs, photos, links, reach notes, wins—and an advisor or referee when you have one.</>,
];

const TEACHER_RULE_LINES: ReactNode[] = [
  <>Open to whole-campus testimony—not only office titles.</>,
  <>
    File opens with either <strong className="text-[color:var(--color-text)]">three separate nominations</strong> or{" "}
    <strong className="text-[color:var(--color-text)]">one nomination thick with proof</strong>.
  </>,
  <>Attach posts, news clips, photos, short videos, referee contacts—anything that survives sceptical reading.</>,
  <>
    Fair spread rule: <strong className="text-[color:var(--color-text)]">two teachers cap per university</strong> in the final twenty
    where geography demands it.
  </>,
];

function JulyScoreRulesCard({
  variant,
  kicker,
  title,
  ruleLines,
  scoringTitle,
  rows,
}: {
  variant: "clubs" | "teachers";
  kicker: string;
  title: string;
  ruleLines: readonly ReactNode[];
  scoringTitle: string;
  rows: readonly { criterion: string; marks: string }[];
}) {
  const stripeClass =
    variant === "clubs"
      ? "bg-[linear-gradient(180deg,var(--brand-green)_0%,color-mix(in_srgb,var(--color-brand)_55%,var(--brand-green))_100%)]"
      : "bg-[linear-gradient(180deg,var(--color-brand)_0%,var(--brand-green)_100%)]";

  const barClass =
    variant === "clubs"
      ? "bg-[linear-gradient(90deg,var(--brand-green)_0%,var(--color-brand)_100%)]"
      : "bg-[linear-gradient(90deg,var(--color-brand)_0%,var(--brand-green)_100%)]";

  return (
    <article className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-md)] ring-1 ring-[color:color-mix(in_srgb,var(--color-text)_6%,var(--color-border))] md:p-7">
      <span aria-hidden className={`pointer-events-none absolute inset-y-5 left-0 w-1 rounded-full ${stripeClass}`} />
      <div className="relative pl-5 md:pl-6">
        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.26em] text-[color:var(--brand-green)]">{kicker}</p>
        <h3 className="text-h3 mt-2 text-[color:var(--color-text)]">{title}</h3>
        <ul className="mt-5 space-y-4">
          {ruleLines.map((line, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--brand-green-muted)_65%,var(--color-surface))] font-mono text-[0.68rem] font-bold tabular-nums text-[color:var(--brand-green)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 pt-0.5 text-[0.98rem] leading-relaxed text-[color:var(--color-text-muted)]">{line}</div>
            </li>
          ))}
        </ul>

        <div className="mt-8 overflow-hidden rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--brand-green)_15%,var(--color-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-green-muted)_42%,var(--color-surface))_0%,var(--color-surface)_100%)]">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[color:color-mix(in_srgb,var(--color-border)_85%,transparent)] px-4 py-3 md:px-5">
            <div>
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                Scoring rubric
              </p>
              <p className="mt-1 text-small font-semibold text-[color:var(--color-text)]">{scoringTitle}</p>
            </div>
            <p className="rounded-full bg-[color:color-mix(in_srgb,var(--brand-green-muted)_70%,var(--color-surface))] px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[color:var(--brand-green)]">
              Total 100
            </p>
          </div>
          <ul className="divide-y divide-[color:color-mix(in_srgb,var(--color-border)_90%,transparent)] px-2 py-1 md:px-3">
            {rows.map((row) => {
              const m = Number.parseInt(row.marks, 10);
              const pct = Number.isFinite(m) ? Math.min(100, Math.round((m / 25) * 100)) : 0;
              return (
                <li key={row.criterion} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-2 py-3 md:px-3">
                  <span className="min-w-0 flex-1 text-[0.9375rem] text-[color:var(--color-text-muted)]">{row.criterion}</span>
                  <span className="font-mono text-[0.95rem] font-bold tabular-nums text-[color:var(--brand-green)]">{row.marks}</span>
                  <span
                    className="hidden h-2 w-[clamp(5rem,26vw,9rem)] overflow-hidden rounded-full bg-[color:var(--color-surface-2)] sm:block"
                    aria-hidden
                  >
                    <span className={`block h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
}

function JulySectionHead({
  step,
  eyebrow,
  title,
  description,
  staggerIndex,
  children,
}: {
  step: string;
  eyebrow: string;
  title: string;
  description?: string;
  staggerIndex?: number;
  children?: ReactNode;
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
          {children}
        </div>
      </header>
    </Reveal>
  );
}

const SAVE_DETAIL_ROWS: { label: string; value: keyof typeof JULY_AWARD_2026.eventDetails }[] = [
  { label: "Date", value: "dateLabel" },
  { label: "Time", value: "timeLabel" },
  { label: "Venue", value: "venueLabel" },
  { label: "City / location", value: "cityLabel" },
  { label: "Expected audience", value: "audienceLabel" },
  { label: "Duration", value: "durationLabel" },
];

export const metadata = {
  title: "July Uprising Memorial Award 2026",
  description:
    "PUNAB brings private universities together to remember July 2024—honouring families, injured students, steadfast teachers, and clubs that earned their stripes.",
};

export default function JulyAward2026Page() {
  const d = JULY_AWARD_2026.eventDetails;

  return (
    <>
      <section
        className="relative flex min-h-[min(76dvh,40rem)] flex-col overflow-hidden md:min-h-[min(84dvh,44rem)]"
        aria-labelledby="july-award-hero-title"
      >
        <div
          className="absolute inset-x-0 top-0 z-[2] h-[3px] bg-[linear-gradient(90deg,#047857_0%,#c41e3a_50%,#047857_100%)]"
          aria-hidden
        />
        <Image
          src={JULY_AWARD_HERO_IMAGE_SRC}
          alt="Demonstrators during Bangladesh's 2024 quota reform movement—students in national colours; placards include Bengali messaging on quota and merit."
          fill
          className="object-cover object-[46%_34%]"
          sizes="100vw"
          priority
          quality={88}
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-black/22 dark:bg-black/28" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,transparent_36%,transparent_58%,rgba(0,0,0,0.22)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.48)_34%,rgba(0,0,0,0.15)_55%,transparent_76%)]"
          aria-hidden
        />

        <MarketingContainer className="relative z-[1] flex flex-1 flex-col justify-between pb-10 pt-5 md:pb-14 md:pt-8">
          <nav
            aria-label="Breadcrumb"
            className="text-small inline-flex w-fit flex-wrap items-center gap-x-2 gap-y-1 rounded-[var(--radius-full)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-3.5 py-2 text-[color:var(--color-text)] shadow-[var(--shadow-sm)] ring-1 ring-[color:color-mix(in_srgb,var(--color-text)_12%,transparent)] backdrop-blur-sm dark:bg-[color:color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
          >
            <Link href="/" className="hover:text-[color:var(--color-brand)] motion-safe:transition-colors">
              Home
            </Link>
            <span aria-hidden className="text-[color:var(--color-text-muted)]">
              /
            </span>
            <span className="font-medium">July Award 2026</span>
          </nav>

          <div className="mt-10 flex w-full flex-col gap-8 md:mt-auto lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-xl lg:max-w-lg xl:max-w-xl">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.38em] text-white/70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
                Memorial programme · {julyAward2026HeroCityTag()}
              </p>
              <h1
                id="july-award-hero-title"
                className="mt-3 text-balance font-bold leading-[1.06] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] text-[clamp(1.65rem,4vw+0.6rem,2.35rem)]"
              >
                <span className="bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.78)_100%)] bg-clip-text text-transparent">
                  July Uprising Memorial Award
                </span>{" "}
                <span className="whitespace-nowrap text-white/95">2026</span>
              </h1>
              <p className="mt-4 max-w-md border-l-[3px] border-[color:color-mix(in_srgb,var(--color-brand)_80%,white)] pl-4 text-base font-semibold leading-snug text-red-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-[1.05rem]">
                {JULY_AWARD_2026.eventTagline}
              </p>
              <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)] sm:text-[1.02rem]">
                {JULY_AWARD_2026.heroLead}
              </p>
            </div>
            <div className="flex shrink-0 justify-end lg:self-end">
              <div className="relative rounded-[var(--radius-lg)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-4 shadow-[var(--shadow-lg)] ring-1 ring-white/35 backdrop-blur-md dark:bg-[color:color-mix(in_srgb,var(--color-surface)_78%,transparent)] dark:ring-white/20">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-1 h-14 w-14 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand)_35%,transparent)_0%,transparent_72%)]"
                />
                <Image
                  src={PUNAB_LOGO_SRC}
                  alt="PUNAB"
                  width={140}
                  height={140}
                  className="relative h-[6.25rem] w-[6.25rem] object-contain sm:h-[7rem] sm:w-[7rem]"
                />
              </div>
            </div>
          </div>
        </MarketingContainer>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-14 overflow-hidden md:h-20" aria-hidden>
          <svg
            className="h-[calc(100%+1px)] w-full"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="fill-(--color-surface)"
              d="M0,84 C 180,20 360,144 540,84 C 720,24 900,144 1080,84 C 1260,24 1360,58 1440,34 L1440,160 L0,160 Z"
            />
          </svg>
        </div>
      </section>

      <Section
        surface="muted"
        divider
        paddingY="md"
        className="relative overflow-hidden bg-[linear-gradient(90deg,color-mix(in_srgb,var(--brand-green-muted)_60%,var(--color-surface-2))_0%,var(--color-surface-2)_60%)]"
      >
        <MarketingContainer>
          <Reveal>
            <div className="flex flex-col items-start gap-4 rounded-[var(--radius-xl)] border border-[color:color-mix(in_srgb,var(--brand-green)_25%,var(--color-border))] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-md)] md:flex-row md:items-center md:justify-between md:p-7">
              <div>
                <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[color:var(--brand-green)]">
                  Results are in
                </p>
                <h2 className="text-h3 mt-2 text-[color:var(--color-text)]">See the 2026 Award Winners</h2>
                <p className="mt-1.5 max-w-xl text-[0.9375rem] leading-relaxed text-[color:var(--color-text-muted)]">
                  Club excellence, national special awards, appreciation crests, honoured teachers, and the injured
                  crest list—everyone named at the 2026 programme.
                </p>
              </div>
              <Button href="/july-award-2026/winners" prefetch={false} variant="primary" size="lg" className="w-full shrink-0 md:w-auto">
                See the winners
              </Button>
            </div>
          </Reveal>
        </MarketingContainer>
      </Section>

      <Section surface="white" divider paddingY="section" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--brand-green)_45%,var(--color-brand)),transparent)] opacity-70"
        />
        <MarketingContainer>
          <JulySectionHead
            step="00"
            eyebrow="Partners"
            title="Our Supporting Partner"
            description="Partners who help carry the hall, the story"
          />
          <div
            className="july-partners-marquee mt-8"
            aria-label="Partner logos: Bronze supporters BGMEA and ADUST; IT partner NextGen IT — infinite scroll."
          >
            <div className="july-partners-marquee__track">
              <div className="july-partners-marquee__segment flex shrink-0 flex-nowrap items-center gap-10 px-5 sm:gap-14 sm:px-8">
                {Array.from({ length: JULY_AWARD_PARTNERS_MARQUEE_TILES }, (_, rep) =>
                  JULY_AWARD_PARTNERS_MARQUEE.map((p) => (
                    <div
                      key={`${p.id}-a-${rep}`}
                      className="flex w-[10.5rem] shrink-0 flex-col items-center gap-1.5 text-center sm:w-[12.5rem]"
                      title={`${p.name} · ${p.roleLabel}`}
                      aria-hidden={rep > 0}
                    >
                      <div className="flex h-12 w-full items-center justify-center sm:h-14">
                        <Image
                          src={p.logoSrc}
                          alt={rep === 0 ? `${p.name} (${p.acronym})` : ""}
                          width={p.logoW}
                          height={p.logoH}
                          className={p.logoClassName}
                          sizes="(max-width: 640px) 42vw, 12rem"
                        />
                      </div>
                      <p className="line-clamp-2 text-[0.72rem] font-semibold leading-tight text-[color:var(--color-text)] sm:text-[0.78rem]">
                        {p.name}
                      </p>
                      <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[color:var(--brand-green)]">
                        {p.roleLabel}
                      </p>
                    </div>
                  ))
                ).flat()}
              </div>
              <div
                className="july-partners-marquee__segment july-partners-marquee__segment--duplicate flex shrink-0 flex-nowrap items-center gap-10 px-5 sm:gap-14 sm:px-8"
                aria-hidden
              >
                {Array.from({ length: JULY_AWARD_PARTNERS_MARQUEE_TILES }, (_, rep) =>
                  JULY_AWARD_PARTNERS_MARQUEE.map((p) => (
                    <div
                      key={`${p.id}-b-${rep}`}
                      className="flex w-[10.5rem] shrink-0 flex-col items-center gap-1.5 text-center sm:w-[12.5rem]"
                    >
                      <div className="flex h-12 w-full items-center justify-center sm:h-14">
                        <Image
                          src={p.logoSrc}
                          alt=""
                          width={p.logoW}
                          height={p.logoH}
                          className={p.logoClassName}
                          sizes="(max-width: 640px) 42vw, 12rem"
                        />
                      </div>
                      <p className="line-clamp-2 text-[0.72rem] font-semibold leading-tight text-[color:var(--color-text)] sm:text-[0.78rem]">
                        {p.name}
                      </p>
                      <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[color:var(--brand-green)]">
                        {p.roleLabel}
                      </p>
                    </div>
                  ))
                ).flat()}
              </div>
            </div>
          </div>
        </MarketingContainer>
      </Section>

      <Section surface="white" divider paddingY="section">
        <MarketingContainer>
          <Reveal>
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:color-mix(in_srgb,var(--brand-green)_28%,var(--color-border))] bg-[color:var(--color-surface)] shadow-[var(--shadow-md)] ring-1 ring-[color:color-mix(in_srgb,var(--color-brand)_10%,transparent)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,var(--color-brand)_0%,var(--brand-green)_55%,var(--color-brand)_100%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-green)_18%,transparent)_0%,transparent_68%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand)_14%,transparent)_0%,transparent_70%)]"
              />
              <div className="relative grid gap-10 p-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)] md:gap-12 md:p-10 lg:p-12">
                <div className="flex flex-col justify-center">
                  <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.32em] text-[color:var(--color-text-muted)]">
                    Save the date
                  </p>
                  <h2 className="text-h2 mt-4 text-balance text-[color:var(--color-text)]">July Uprising Memorial Award</h2>
                  <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)]">
                    When the hall, clock, and calendar are fixed, they land here first—no fuss, just facts.
                  </p>
                  <p className="mt-5 text-[0.9375rem] leading-relaxed text-[color:var(--color-text-muted)]">
                    <Link
                      href="/july-award-2026/facecard"
                      className="font-semibold text-[color:var(--color-brand)] underline-offset-4 hover:underline"
                    >
                      Create a shareable facecard
                    </Link>{" "}
                    with your photo on the official poster artwork, or{" "}
                    <Link
                      href="/july-award-2026/participation-card"
                      className="font-semibold text-[color:var(--color-brand)] underline-offset-4 hover:underline"
                    >
                      build an Appreciation Partner card
                    </Link>{" "}
                    manually (logo, club, university, partner number). Nomination submitters are redirected there
                    automatically.
                  </p>
                  <p className="mt-8 font-mono text-[clamp(2.75rem,6vw,4rem)] font-bold leading-none tracking-tight text-[color:var(--color-text)]">
                    2026
                  </p>
                  <p className="mt-2 font-mono text-small font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-green)]">
                    National chapter gathering
                  </p>
                </div>
                <div className="flex min-h-0 flex-col gap-8">
                  <div className="min-h-0">
                    <div className="relative mt-1">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-6 z-0 rounded-[2rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,color-mix(in_srgb,var(--brand-green)_14%,transparent)_0%,color-mix(in_srgb,var(--color-brand)_10%,transparent)_38%,transparent_72%)] blur-2xl dark:opacity-80"
                      />
                      <div className="relative z-[1] rounded-[calc(var(--radius-lg)+2px)] bg-[linear-gradient(138deg,var(--color-brand)_0%,var(--brand-green)_48%,color-mix(in_srgb,var(--brand-green)_65%,var(--color-brand))_100%)] p-[1.5px] shadow-[0_22px_48px_-20px_color-mix(in_srgb,var(--color-brand)_38%,transparent),0_8px_24px_-14px_color-mix(in_srgb,var(--brand-green)_22%,transparent)] dark:shadow-[0_24px_56px_-22px_rgba(0,0,0,0.55)]">
                        <div className="overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ring-1 ring-[color:color-mix(in_srgb,var(--color-text)_6%,var(--color-border))] dark:bg-[color:color-mix(in_srgb,var(--color-surface-2)_88%,var(--color-surface))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:ring-[color:color-mix(in_srgb,var(--color-text)_10%,var(--color-border))]">
                          <div className="relative flex items-start justify-between gap-4 border-b border-[color:color-mix(in_srgb,var(--brand-green)_14%,var(--color-border))] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--brand-green-muted)_32%,var(--color-surface))_0%,var(--color-surface)_55%,color-mix(in_srgb,var(--color-surface)_96%,var(--brand-green-muted))_100%)] px-4 py-3.5 sm:px-5 sm:py-4">
                            <div className="min-w-0 space-y-1">
                              <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.26em] text-[color:var(--brand-green)]">
                                Venue
                              </p>
                              <p className="text-[1.02rem] font-semibold leading-snug tracking-tight text-[color:var(--color-text)] sm:text-[1.06rem]">
                                {JULY_AWARD_2026_VENUE_CALLOUT.primary}
                              </p>
                              <p className="max-w-[16rem] text-[0.8125rem] leading-relaxed text-[color:var(--color-text-muted)]">
                                {JULY_AWARD_2026_VENUE_CALLOUT.secondary}
                              </p>
                            </div>
                            <div
                              aria-hidden
                              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-brand)_16%,var(--color-surface-2)),color-mix(in_srgb,var(--brand-green)_20%,var(--color-surface-2)))] text-[color:var(--color-brand)] shadow-[var(--shadow-sm)] ring-1 ring-[color:color-mix(in_srgb,var(--brand-green)_28%,var(--color-border))]"
                            >
                              <svg className="h-[1.15rem] w-[1.15rem]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                              </svg>
                            </div>
                          </div>
                          <div className="relative h-36 w-full sm:h-40 md:h-44">
                            <iframe
                              title={julyAward2026MapIframeTitle()}
                              src={julyAward2026VenueMapEmbedUrl()}
                              className="absolute inset-0 h-full w-full border-0"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              allowFullScreen
                            />
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_52px_rgba(0,0,0,0.045)] dark:shadow-[inset_0_0_56px_rgba(0,0,0,0.32)]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <a
                      href={julyAward2026VenueMapOpenUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-green-muted)_26%,var(--color-surface))_0%,var(--color-surface)_48%,color-mix(in_srgb,var(--color-surface)_92%,var(--brand-green-muted))_100%)] px-5 py-2.5 text-small font-semibold text-[color:var(--color-text)] shadow-[var(--shadow-sm)] ring-1 ring-[color:color-mix(in_srgb,var(--brand-green)_22%,var(--color-border))] motion-safe:transition-[transform,box-shadow,ring-color,color] hover:-translate-y-px hover:text-[color:var(--color-brand)] hover:shadow-[var(--shadow-md)] hover:ring-[color:color-mix(in_srgb,var(--color-brand)_28%,var(--color-border))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-brand)] active:translate-y-0 sm:w-auto"
                    >
                      Open in Google Maps
                      <svg
                        className="h-3.5 w-3.5 shrink-0 opacity-75 motion-safe:transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M7 17L17 7M17 7H9M17 7V15" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                  <dl className="grid gap-0 sm:grid-cols-2">
                    {SAVE_DETAIL_ROWS.map((row, i) => (
                      <div
                        key={row.label}
                        className={`border-[color:var(--color-border)] px-1 py-4 sm:px-2 ${i > 0 ? "border-t" : ""} ${i < 2 ? "sm:border-t-0" : ""}`}
                      >
                        <dt className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
                          {row.label}
                        </dt>
                        <dd className="mt-2 text-[1.05rem] font-semibold leading-snug text-[color:var(--color-text)]">{d[row.value]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </Reveal>
        </MarketingContainer>
      </Section>

      <Section surface="white" divider paddingY="section" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_center_bottom,color-mix(in_srgb,var(--brand-green-muted)_55%,transparent)_0%,transparent_68%)]"
        />
        <MarketingContainer className="relative">
          <JulySectionHead
            step="01"
            eyebrow="Take part"
            title="Apply & register"
            description="Clubs: jump to the lane list—pick the form that matches your work. Teachers and injured students each have a single, direct door."
          />
          <ul className="mt-10 grid gap-6 lg:grid-cols-4">
            {(
              [{ key: "participant", accentClass: "bg-[color:var(--color-brand)]", chip: "Everyone" }] as const
            ).map(({ key, accentClass, chip }) => {
              const f = JULY_AWARD_2026.forms[key];
              return (
                <li key={key}>
                  <Reveal staggerIndex={0} className="h-full">
                    <Card
                      variant="elevated"
                      className="relative flex h-full min-h-92 flex-col overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-md)] ring-1 ring-[color:color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                    >
                      <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${accentClass}`} />
                      <span className="inline-flex w-fit rounded-[var(--radius-full)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-1 text-small font-semibold text-[color:var(--color-brand)]">
                        {chip}
                      </span>
                      <h3 className="text-h3 mt-4 text-[color:var(--color-text)]">{f.label}</h3>
                      <p className="mt-3 flex-1 text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">{f.description}</p>
                      <Button href={f.href} prefetch={false} variant="primary" size="lg" className="mt-6 w-full">
                        Open registration
                      </Button>
                    </Card>
                  </Reveal>
                </li>
              );
            })}
            <li>
              <Reveal staggerIndex={1} className="h-full">
                <Card
                  variant="elevated"
                  className="relative flex h-full min-h-92 flex-col overflow-hidden border border-[color:color-mix(in_srgb,var(--brand-green)_22%,var(--color-border))] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-md)] ring-1 ring-[color:color-mix(in_srgb,var(--brand-green)_12%,transparent)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--brand-green)_0%,var(--color-brand)_100%)]"
                  />
                  <span className="inline-flex w-fit rounded-[var(--radius-full)] border border-[color:color-mix(in_srgb,var(--brand-green)_25%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--brand-green-muted)_40%,var(--color-surface))] px-3 py-1 text-small font-semibold text-[color:var(--brand-green)]">
                    Clubs
                  </span>
                  <h3 className="text-h3 mt-4 text-[color:var(--color-text)]">{JULY_AWARD_2026.clubGateway.label}</h3>
                  <p className="mt-3 flex-1 text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
                    {JULY_AWARD_2026.clubGateway.description}
                  </p>
                  <Button href="/july-award-2026/clubs" variant="primary" size="lg" className="mt-6 w-full">
                    Pick your category
                  </Button>
                </Card>
              </Reveal>
            </li>
            {(
              [
                { key: "teacher", accentClass: "bg-[color:var(--color-brand)]", chip: "Faculty" },
                { key: "injured", accentClass: "bg-[color:var(--brand-green)]", chip: "Students" },
              ] as const
            ).map(({ key, accentClass, chip }, i) => {
              const f = JULY_AWARD_2026.forms[key];
              const cta = key === "teacher" ? "Open nomination form" : "Open registration";
              return (
                <li key={key}>
                  <Reveal staggerIndex={i + 2} className="h-full">
                    <Card
                      variant="elevated"
                      className={`relative flex h-full min-h-92 flex-col overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-md)] ring-1 ring-[color:color-mix(in_srgb,var(--color-text)_6%,transparent)]`}
                    >
                      <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${accentClass}`} />
                      <span className="inline-flex w-fit rounded-[var(--radius-full)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-1 text-small font-semibold text-[color:var(--color-brand)]">
                        {chip}
                      </span>
                      <h3 className="text-h3 mt-4 text-[color:var(--color-text)]">{f.label}</h3>
                      <p className="mt-3 flex-1 text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">{f.description}</p>
                      <Button href={f.href} prefetch={false} variant="primary" size="lg" className="mt-6 w-full">
                        {cta}
                      </Button>
                    </Card>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </MarketingContainer>
      </Section>

      <Section surface="white" divider paddingY="section">
        <MarketingContainer>
          <JulySectionHead
            step="02"
            eyebrow="Why we gather"
            title="About this programme"
            staggerIndex={1}
          >
            <div className="mt-6 max-w-3xl space-y-5 text-[1.0625rem] leading-[1.7] text-[color:var(--color-text-muted)]">
              <p className="text-[color:var(--color-text)]">
                The{" "}
                <strong className="font-semibold">July Uprising Memorial Award</strong>
                {" "}
                is PUNAB&apos;s answer to a simple question: who carried courage after July—and who keeps carrying it?
              </p>
              <p>
                In one afternoon we honour families who buried sons and daughters from our campuses; students whose scars still
                show; teachers who broke silence when silence cost lives; and clubs—from welfare and blood drives to pharmacy chapters and debate societies—that refused to shrink.
              </p>
              <p>
                Nothing here is ceremonial-for-show. We assemble chapter delegates, faculty allies, and the wider sector so memory
                turns into standards: how leaders behave when campuses shake again.
              </p>
            </div>
          </JulySectionHead>
        </MarketingContainer>
      </Section>

      <Section
        surface="muted"
        divider
        paddingY="section"
        className="relative overflow-hidden bg-[linear-gradient(165deg,color-mix(in_srgb,var(--brand-green-muted)_55%,var(--color-surface-2))_0%,var(--color-surface-2)_42%,var(--color-surface-2)_100%)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-brand),transparent)] opacity-60" />
        <MarketingContainer>
          <JulySectionHead
            step="03"
            eyebrow="Order of the day"
            title="How the four hours move"
            description={julyAward2026ProgramScheduleIntro()}
          />
          <div className="relative mt-10 rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--color-text)_8%,var(--color-border))] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-sm)] md:p-6">
            {/** Time column 11rem + gap-8 (2rem): line sits on column boundary so it never crosses clock badges. */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-[calc(11rem+2rem-0.5px)] top-6 hidden w-px bg-[linear-gradient(180deg,var(--brand-green)_0%,color-mix(in_srgb,var(--color-brand)_55%,var(--brand-green))_38%,var(--color-border)_100%)] md:block"
            />
            <div className="divide-y divide-[color:var(--color-border)] md:divide-y-0">
              {PROGRAM_SEGMENTS.map((row) => (
                <div
                  key={row.time}
                  className="grid gap-3 py-5 first:pt-2 last:pb-2 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8 md:py-6 md:first:pt-3 md:last:pb-3"
                >
                  <div className="relative z-[1] flex items-start md:justify-end md:pt-0.5">
                    <span className="inline-flex max-w-full rounded-md bg-[color:color-mix(in_srgb,var(--brand-green-muted)_55%,var(--color-surface))] px-2 py-1 font-mono text-[0.72rem] font-bold tabular-nums tracking-[0.04em] text-[color:var(--brand-green)]">
                      {row.time}
                    </span>
                  </div>
                  <div className="min-w-0 md:border-l md:border-[color:color-mix(in_srgb,var(--color-border)_85%,transparent)] md:pl-8">
                    <p className="text-[1.02rem] font-semibold text-[color:var(--color-text)]">{row.title}</p>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-[color:var(--color-text-muted)]">{row.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MarketingContainer>
      </Section>

      <Section surface="white" divider paddingY="section">
        <MarketingContainer className="space-y-12">
          <JulySectionHead
            step="04"
            eyebrow="Recognition"
            title="Who the stage belongs to"
            description="Five clusters of honour anchor the afternoon; club prizes stretch across ten lanes—thirty named clubs in all."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Shaheed families",
                body: "Private-university families receive gifts, flowers, and a written tribute—public grief held with dignity.",
              },
              {
                title: "Injured students",
                body: "Crest and a brief moment for peers hurt in July 2024; PUNAB confirms facts quietly before names reach the hall.",
              },
              {
                title: "Teachers who stood",
                body: "Twenty faculty—not fame-chasers—who sheltered, testified, or organised when students faced danger.",
              },
              {
                title: "Club excellence",
                body: "Ten categories × three places each: winner, first runner-up, second runner-up—merit read against evidence, not hype.",
              },
              {
                title: "Volunteers",
                body: "The unseen roster—logistics, ushers, stage hands—gets certificates they can pin beside medals.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-sm)] ring-1 ring-[color:color-mix(in_srgb,var(--brand-green)_20%,var(--color-border))] transition-[box-shadow,transform] motion-safe:md:hover:-translate-y-0.5 motion-safe:md:hover:shadow-[var(--shadow-md)]"
              >
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full ${i % 2 === 0 ? "bg-[linear-gradient(180deg,var(--color-brand)_0%,var(--brand-green)_100%)]" : "bg-[linear-gradient(180deg,var(--brand-green)_0%,var(--color-brand)_100%)]"}`}
                />
                <p className="pl-4 font-mono text-[0.62rem] font-bold uppercase tracking-[0.26em] text-[color:var(--color-text-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="text-h3 mt-2 pl-4 text-[color:var(--color-text)]">{item.title}</h3>
                <p className="mt-2 pl-4 text-body leading-relaxed text-[color:var(--color-text-muted)]">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[color:color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--brand-green-muted)_28%,var(--color-surface))] p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
              <div>
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[color:var(--brand-green)]">
                  Club lanes
                </p>
                <h3 className="text-h3 mt-2 text-[color:var(--color-text)]">Ten lanes for student clubs</h3>
              </div>
              <p className="max-w-xl text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)] md:text-right">
                Each lane crowns three clubs—thirty slots nationwide. Apply where your receipts actually live.
              </p>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {JULY_AWARD_CLUB_CATEGORIES.map((c, i) => (
                <li key={c.key}>
                  <Reveal staggerIndex={i % 6}>
                    <Card className="group h-full border-[color:color-mix(in_srgb,var(--color-text)_6%,var(--color-border))] bg-[color:var(--color-surface)] p-4 transition-[box-shadow,border-color] motion-safe:hover:border-[color:color-mix(in_srgb,var(--brand-green)_35%,var(--color-border))] motion-safe:hover:shadow-[var(--shadow-md)]">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[color:var(--color-brand)]">
                          Lane {String(i + 1).padStart(2, "0")}
                        </p>
                        <span aria-hidden className="h-px flex-1 bg-[linear-gradient(90deg,var(--color-border),transparent)] opacity-80" />
                      </div>
                      <h4 className="mt-3 font-semibold text-[color:var(--color-text)]">{c.name}</h4>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-[color:var(--color-text-muted)]">{c.blurb}</p>
                    </Card>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </MarketingContainer>
      </Section>

      <Section
        surface="muted"
        divider
        paddingY="section"
        className="relative bg-[linear-gradient(180deg,var(--color-surface-2)_0%,color-mix(in_srgb,var(--brand-green-muted)_22%,var(--color-surface-2))_55%,var(--color-surface-2)_100%)]"
      >
        <MarketingContainer className="space-y-10">
          <JulySectionHead
            step="05"
            eyebrow="Fair process"
            title="Applications & how we score"
            description="No popularity contests—panels read proof. Clubs may aim at two categories at most; we sometimes move a file to a fairer lane. Across campuses we weigh balance alongside straight merit."
          />

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <JulyScoreRulesCard
              variant="clubs"
              kicker="Student clubs"
              title="Clubs applying themselves"
              ruleLines={CLUB_RULE_LINES}
              scoringTitle="Clubs — how the 100 marks split"
              rows={CLUB_SCORING}
            />
            <JulyScoreRulesCard
              variant="teachers"
              kicker="Faculty honours"
              title="Teachers students nominate"
              ruleLines={TEACHER_RULE_LINES}
              scoringTitle="Teachers — how the 100 marks split"
              rows={TEACHER_SCORING}
            />
          </div>

          <Card className="p-5">
            <h3 className="text-h3 text-[color:var(--color-text)]">Injured students</h3>
            <p className="mt-3 max-w-3xl text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
              If July left you physically harmed, you belong in this chapter of the programme—not as a statistic, but by name. Use{" "}
              <strong className="font-semibold text-[color:var(--color-text)]">Register as an injured student</strong> via Apply &amp;
              register above; our team checks quietly before anything reaches the stage.
            </p>
          </Card>

          <Card variant="flat" className="border-[color:color-mix(in_srgb,var(--color-brand)_25%,var(--color-border))] p-5">
            <h3 className="text-h3 text-[color:var(--color-text)]">How files become finalists</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
              <li>Windows open; submissions pour in by category and nomination type.</li>
              <li>Staff strip incomplete or dodgy rows—fairness starts with clean data.</li>
              <li>Evidence officers match claims to artefacts (photos, logs, URLs).</li>
              <li>Shortlists: top five clubs per lane; thirty-to-forty teacher dossiers for jurors.</li>
              <li>Independent jury signs off—thirty clubs, twenty teachers—before invitations leave Dhaka.</li>
            </ol>
          </Card>
        </MarketingContainer>
      </Section>
    </>
  );
}
