import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Cormorant_Garamond, Manrope } from "next/font/google";
import { JulyAwardParticipationCardGenerator } from "@/components/marketing/JulyAwardParticipationCardGenerator";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Section } from "@/components/ui/Section";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "July Award 2026 — Appreciation Partner card",
  description:
    "Upload your club logo, enter club and university, get an official partner number, and download a print-ready Appreciation Partner card.",
};

export default async function JulyAwardParticipationCardPage({
  searchParams,
}: {
  searchParams: Promise<{
    club?: string | string[];
    university?: string | string[];
    from?: string | string[];
  }>;
}) {
  const sp = await searchParams;
  const clubRaw = sp.club;
  const uniRaw = sp.university;
  const fromRaw = sp.from;
  const initialClubName = (Array.isArray(clubRaw) ? clubRaw[0] : clubRaw) ?? "";
  const initialUniversityName = (Array.isArray(uniRaw) ? uniRaw[0] : uniRaw) ?? "";
  const fromParam = Array.isArray(fromRaw) ? fromRaw[0] : fromRaw;
  const fromRegistration = fromParam === "registration";
  const fromDebateRegistration = fromParam === "debate-registration";

  return (
    <Section surface="white" divider paddingY="section">
      <MarketingContainer>
        <nav
          aria-label="Breadcrumb"
          className="text-small inline-flex w-fit flex-wrap items-center gap-x-2 gap-y-1 rounded-[var(--radius-full)] bg-[color:var(--color-surface-2)] px-3.5 py-2 text-[color:var(--color-text)] ring-1 ring-[color:var(--color-border)]"
        >
          <Link href="/" className="hover:text-[color:var(--color-brand)] motion-safe:transition-colors">
            Home
          </Link>
          <span aria-hidden className="text-[color:var(--color-text-muted)]">
            /
          </span>
          <Link href="/july-award-2026" className="hover:text-[color:var(--color-brand)] motion-safe:transition-colors">
            July Award 2026
          </Link>
          <span aria-hidden className="text-[color:var(--color-text-muted)]">
            /
          </span>
          <span className="font-medium">Participation card</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
            Appreciation Partner
          </p>
          <h1 className="text-h1 mt-3 text-balance text-[color:var(--color-text)]">Club participation card</h1>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)]">
            {fromDebateRegistration
              ? "Debate chapters: partnership shows as Debate Forum on the card. Download a full-size PNG (1080×1350)."
              : (
                <>
                  Matches the official July Uprising Memorial Award 2026 design: logo, club name, university, and an
                  auto-assigned partner number (<span className="font-mono">AP-2026-####</span>). Download a full-size PNG
                  in your browser (1080×1350).
                </>
              )}
          </p>
        </header>

        <div className={`${display.className} ${body.className} ${serif.className} mt-12`}>
          <JulyAwardParticipationCardGenerator
            initialClubName={initialClubName}
            initialUniversityName={initialUniversityName}
            fromRegistration={fromRegistration || fromDebateRegistration}
            debateForum={fromDebateRegistration}
          />
        </div>
      </MarketingContainer>
    </Section>
  );
}
