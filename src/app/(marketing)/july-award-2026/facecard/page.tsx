import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Anton, Archivo, Bricolage_Grotesque, Inter } from "next/font/google";
import { JulyAwardFaceCardGenerator } from "@/components/marketing/JulyAwardFaceCardGenerator";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Section } from "@/components/ui/Section";

const display = Anton({ subsets: ["latin"], weight: "400" });
const semiCondensed = Archivo({ subsets: ["latin"], weight: ["700", "800"] });
const value = Bricolage_Grotesque({ subsets: ["latin"], weight: "700" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "July Award 2026 — Facecard",
  description:
    "Drop your photo into the July Uprising Memorial Award 2026 facecard and download a print-ready PNG (1080×1350).",
};

export default function JulyAwardFaceCardPage() {
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
          <span className="font-medium">Facecard</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">Show up for July</p>
          <h1 className="text-h1 mt-3 text-balance text-[color:var(--color-text)]">Facecard generator</h1>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)]">
            Drop your photo into the portrait well, zoom and nudge to fit, then download a PNG—no server upload.
          </p>
        </header>

        <div className={`${display.className} ${semiCondensed.className} ${value.className} ${body.className} mt-12`}>
          <Suspense fallback={null}>
            <JulyAwardFaceCardGenerator />
          </Suspense>
        </div>
      </MarketingContainer>
    </Section>
  );
}
