import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { MUN_COMMITTEES, MUN_COMMITTEE_FULL_NAME } from "@/lib/validations/mun-form";

export const metadata = {
  title: "PUNAB IMUN 2026",
  description: "PUNAB International Model United Nations Conference 2026 — 26-28 November 2026.",
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
      <path d="M12 21s7-6.2 7-11.6A7 7 0 0 0 5 9.4C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.4" r="2.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
      <path d="M12 2.5c.3 3.2 1.1 5.4 2.5 6.8 1.4 1.4 3.6 2.2 6.8 2.5-3.2.3-5.4 1.1-6.8 2.5-1.4 1.4-2.2 3.6-2.5 6.8-.3-3.2-1.1-5.4-2.5-6.8C8.1 12.9 5.9 12.1 2.7 11.8c3.2-.3 5.4-1.1 6.8-2.5 1.4-1.4 2.2-3.6 2.5-6.8Z" />
    </svg>
  );
}

function CommitteeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" strokeOpacity="0.5" />
    </svg>
  );
}

/** Wavy divider matching the homepage hero — fillColor should equal the section it hands off to. */
function CurveDivider({ fillColor }: { fillColor: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-hidden sm:h-20" aria-hidden>
      <svg className="absolute bottom-0 left-0 h-full w-full" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,120 C 240,40 480,200 720,120 C 960,40 1200,200 1440,120 L1440,200 L0,200 Z" fill={fillColor} />
      </svg>
    </div>
  );
}

const PROGRAMME_STEPS = [
  "Participant registration",
  "Opening ceremony",
  "Delegate orientation",
  "Committee sessions",
  "Moderated & unmoderated caucuses",
  "Diplomatic negotiations",
  "Working papers & draft resolutions",
  "Voting procedures",
  "Press activities",
  "Closing ceremony & awards",
];

export default function ImunLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-brand)_0%,color-mix(in_srgb,var(--color-brand)_55%,black)_100%)] pt-10 pb-24 sm:pt-14 sm:pb-28">
        <div className="pointer-events-none absolute top-1/2 -right-8 hidden h-80 w-80 -translate-y-1/2 sm:block lg:right-8 lg:h-[26rem] lg:w-[26rem]">
          <Image
            src="/images/mun-globe-watermark.png"
            alt="PUNAB IMUN globe emblem"
            fill
            className="object-contain"
            sizes="26rem"
            priority
          />
        </div>
        <MarketingContainer maxWidth="3xl" className="relative">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-small text-white/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">PUNAB IMUN 2026</span>
          </nav>

          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/30 bg-white/10 px-4 py-1.5 text-small font-semibold text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rotate-45 bg-white" aria-hidden />
              PUNAB IMUN 2026
            </p>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              PUNAB International Model United Nations Conference
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/90">
              A three-day academic and diplomatic simulation for students and emerging young leaders — research-based
              debate, negotiation, and policy under the guidance of an experienced Executive Board.
            </p>
          </Reveal>

          <Reveal>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button href="/imun-2026/register" variant="inverse" size="lg" className="mun-apply-pulse whitespace-nowrap">
                Apply as a Delegate
              </Button>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-small font-medium text-white/85">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon />
                  26–28 Nov 2026
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <PinIcon />
                  Southeast University
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-white/15 px-3 py-1 font-bold text-white">
                  <SparkIcon />
                  Early Bird Registration Open
                </span>
              </div>
            </div>
          </Reveal>
        </MarketingContainer>

        <CurveDivider fillColor="var(--color-surface)" />
      </section>

      {/* About */}
      <Section surface="white" divider={false} paddingY="md">
        <MarketingContainer maxWidth="3xl">
          <Reveal>
            <p className="mx-auto max-w-3xl text-center text-[1.05rem] leading-relaxed text-[color:var(--color-text-muted)]">
              Delegates represent assigned countries, organizations, political portfolios, judicial roles or press
              responsibilities — taking part in moderated and unmoderated caucuses, diplomatic negotiations, and
              collaborative decision-making that build real understanding of international relations, human rights,
              environmental affairs, law, and responsible journalism.
            </p>
          </Reveal>
        </MarketingContainer>
      </Section>

      {/* Committees */}
      <section className="relative overflow-hidden bg-[color:var(--color-surface-2)] pt-14 pb-24 sm:pt-16 sm:pb-28">
        <MarketingContainer>
          <Reveal>
            <h2 className="text-center text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
              Committees
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-h2 font-black leading-tight text-[color:var(--color-text)]">
              Official conference structure
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MUN_COMMITTEES.map((c, i) => (
              <Reveal key={c} staggerIndex={i % 6}>
                <div className="group flex items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-sm)] motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-[var(--transition-base)] hover:-translate-y-1.5 hover:border-[color:var(--color-brand)] hover:shadow-[var(--shadow-lg)]">
                  <span className="mt-0.5 text-[color:var(--color-brand)] motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] group-hover:scale-110">
                    <CommitteeIcon />
                  </span>
                  <div>
                    <p className="font-bold text-[color:var(--color-text)]">{c}</p>
                    <p className="mt-0.5 text-small text-[color:var(--color-text-muted)]">{MUN_COMMITTEE_FULL_NAME[c]}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </MarketingContainer>

        <CurveDivider fillColor="var(--color-surface)" />
      </section>

      {/* Programme */}
      <Section surface="white" divider={false} paddingY="md">
        <MarketingContainer maxWidth="3xl">
          <Reveal>
            <h2 className="text-center text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
              Programme
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-h2 font-black leading-tight text-[color:var(--color-text)]">
              What to expect
            </p>
          </Reveal>

          <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PROGRAMME_STEPS.map((step, i) => (
              <Reveal key={step} staggerIndex={i % 6} variant="left">
                <li className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] hover:translate-x-1 hover:shadow-[var(--shadow-sm)]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-small font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-small font-medium text-[color:var(--color-text)]">{step}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </MarketingContainer>
      </Section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-brand)_0%,color-mix(in_srgb,var(--color-brand)_55%,black)_100%)] pt-16 pb-16 sm:pt-20 sm:pb-20">
        <MarketingContainer maxWidth="3xl">
          <Reveal>
            <div className="text-center">
              <p className="text-h2 font-black text-white">Ready to represent?</p>
              <p className="mx-auto mt-3 max-w-xl text-body text-white/90">
                <strong>Early bird registration is now open.</strong> Seats are allocated by the Secretariat based on
                availability and experience.
              </p>
              <div className="mt-8">
                <Button href="/imun-2026/register" variant="inverse" size="lg" className="mun-apply-pulse">
                  Apply as a Delegate
                </Button>
              </div>
            </div>
          </Reveal>
        </MarketingContainer>
      </section>
    </>
  );
}
