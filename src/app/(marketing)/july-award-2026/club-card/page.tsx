import type { Metadata } from "next";
import Link from "next/link";
import { JulyAwardClubCardNominationWelcome } from "@/components/marketing/JulyAwardClubCardNominationWelcome";
import { JulyAwardClubCardGenerator } from "@/components/marketing/JulyAwardClubCardGenerator";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "July Award 2026 — Club card",
  description: "Upload your club logo, adjust it in the badge, and download a PNG club card in your browser. No server upload.",
};

export default async function JulyAwardClubCardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const sp = await searchParams;
  const fromRaw = sp.from;
  const from = Array.isArray(fromRaw) ? fromRaw[0] : fromRaw;
  const showNominationWelcome = from === "nomination";

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
          <span className="font-medium">Club card</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">Share the date</p>
          <h1 className="text-h1 mt-3 text-balance text-[color:var(--color-text)]">Club card generator</h1>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)]">
            Upload one logo image, fine-tune how it sits in the round badge, then download a full-size PNG. No server upload.
          </p>
          <p className="mt-3 text-small text-[color:var(--color-text-muted)]">
            Personal poster with your photo:{" "}
            <Link
              href="/july-award-2026/facecard"
              className="font-semibold text-[color:var(--color-brand)] underline-offset-4 hover:underline"
            >
              Facecard generator
            </Link>
            .
          </p>
        </header>

        <div className="mt-12">
          <JulyAwardClubCardNominationWelcome initialOpen={showNominationWelcome} />
          <JulyAwardClubCardGenerator />
        </div>
      </MarketingContainer>
    </Section>
  );
}
