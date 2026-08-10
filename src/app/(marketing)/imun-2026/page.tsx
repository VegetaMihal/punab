import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { MUN_COMMITTEES, MUN_COMMITTEE_FULL_NAME, MUN_REGISTRATION_FEE_BDT } from "@/lib/validations/mun-form";

export const metadata = {
  title: "PUNAB IMUN 2026",
  description: "PUNAB International Model United Nations Conference 2026 — 26-28 November 2026.",
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6 shrink-0">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6 shrink-0">
      <path d="M12 21s7-6.2 7-11.6A7 7 0 0 0 5 9.4C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.4" r="2.5" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6 shrink-0">
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9Z" />
      <path d="M9 7v10" strokeDasharray="2 2" />
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
      <PageHeader
        title="PUNAB International Model United Nations Conference 2026"
        description="A three-day academic and diplomatic simulation — 26, 27 and 28 November 2026. Proposed venue: Southeast University (tentative)."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "PUNAB IMUN 2026" }]}
        tone="pattern"
      />

      <Section surface="white" divider={false} paddingY="section">
        <MarketingContainer maxWidth="3xl">
          <Reveal>
            <div className="relative flex aspect-[21/9] w-full items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] shadow-[var(--shadow-md)]">
              <Image
                src="/images/mun-globe-watermark.jpg"
                alt=""
                fill
                className="object-contain p-8 opacity-80 mix-blend-multiply"
                sizes="(max-width: 1024px) 100vw, 64rem"
                priority
              />
              <span className="relative px-6 text-center text-h3 font-bold text-[color:var(--color-text)] drop-shadow-[0_1px_4px_rgba(255,255,255,0.6)]">
                PUNAB IMUN 2026
              </span>
            </div>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Reveal staggerIndex={0}>
              <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <span className="mt-0.5 text-[color:var(--color-brand)]">
                  <CalendarIcon />
                </span>
                <div>
                  <p className="text-small font-semibold text-[color:var(--color-text)]">26–28 November 2026</p>
                  <p className="mt-0.5 text-small text-[color:var(--color-text-muted)]">Three-day conference</p>
                </div>
              </div>
            </Reveal>
            <Reveal staggerIndex={1}>
              <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <span className="mt-0.5 text-[color:var(--color-brand)]">
                  <PinIcon />
                </span>
                <div>
                  <p className="text-small font-semibold text-[color:var(--color-text)]">Southeast University</p>
                  <p className="mt-0.5 text-small text-[color:var(--color-text-muted)]">Venue (tentative)</p>
                </div>
              </div>
            </Reveal>
            <Reveal staggerIndex={2}>
              <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <span className="mt-0.5 text-[color:var(--color-brand)]">
                  <TicketIcon />
                </span>
                <div>
                  <p className="text-small font-semibold text-[color:var(--color-text)]">BDT {MUN_REGISTRATION_FEE_BDT}</p>
                  <p className="mt-0.5 text-small text-[color:var(--color-text-muted)]">Early bird registration fee</p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="mx-auto mt-8 max-w-3xl space-y-6 text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
              <p>
                PUNAB International Model United Nations Conference 2026 (PUNAB IMUN 2026) provides students and
                emerging young leaders a professional platform to develop their understanding of international
                relations, diplomacy, global governance, human rights, international security, environmental affairs,
                law, parliamentary practices and responsible journalism.
              </p>
              <p>
                Delegates will represent assigned countries, organizations, political portfolios, judicial roles or
                press responsibilities — taking part in research-based discussions, formal debates, diplomatic
                negotiations, policy analysis and collaborative decision-making under the guidance of experienced
                Executive Board members.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 text-center">
            <Button href="/imun-2026/register" variant="primary" size="lg">
              Apply as a Delegate
            </Button>
          </div>
        </MarketingContainer>
      </Section>

      <Section surface="muted" divider paddingY="section">
        <MarketingContainer>
          <Reveal>
            <h2 className="text-center text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
              Committees
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-h2 font-black leading-tight text-[color:var(--color-text)]">
              Official conference structure
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-center text-body text-[color:var(--color-text-muted)]">
              Ten committees spanning security, human rights, environment, law, journalism, and regional cooperation.
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
      </Section>

      <Section surface="white" divider paddingY="section">
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
          <Reveal>
            <p className="mt-6 text-center text-small text-[color:var(--color-text-muted)]">
              Certificate distribution and recognition of outstanding participants close the conference.
            </p>
          </Reveal>
        </MarketingContainer>
      </Section>

      <Section surface="muted" divider={false} paddingY="section">
        <MarketingContainer maxWidth="3xl">
          <Reveal>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[linear-gradient(135deg,var(--color-brand)_0%,color-mix(in_srgb,var(--color-brand)_55%,black)_100%)] px-8 py-14 text-center shadow-[var(--shadow-md)]">
              <p className="text-h2 font-black text-white">Ready to represent?</p>
              <p className="mx-auto mt-3 max-w-xl text-body text-white/90">
                Early bird registration is <strong>BDT {MUN_REGISTRATION_FEE_BDT}</strong>. Seats are allocated by the
                Secretariat based on availability and experience.
              </p>
              <div className="mt-8">
                <Button href="/imun-2026/register" variant="inverse" size="lg">
                  Apply as a Delegate
                </Button>
              </div>
            </div>
          </Reveal>
        </MarketingContainer>
      </Section>
    </>
  );
}
