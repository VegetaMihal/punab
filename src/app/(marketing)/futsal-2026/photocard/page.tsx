import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Anton, Archivo, Bricolage_Grotesque, Inter } from "next/font/google";
import { PunabFutsalPhotoCardGenerator } from "@/components/marketing/PunabFutsalPhotoCardGenerator";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Section } from "@/components/ui/Section";

const display = Anton({ subsets: ["latin"], weight: "400" });
const semiCondensed = Archivo({ subsets: ["latin"], weight: ["700", "800"] });
const value = Bricolage_Grotesque({ subsets: ["latin"], weight: "700" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "July Memorial Futsal Tournament 2026 — Photocard",
  description:
    "Drop your photo into the PUNAB July Memorial Futsal Tournament 2026 photocard and download it to share.",
};

export default function FutsalPhotoCardPage() {
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
          <span className="font-medium">Futsal Photocard</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
            Honouring the Spirit of July
          </p>
          <h1 className="text-h1 mt-3 text-balance text-[color:var(--color-text)]">
            July Memorial Futsal Tournament 2026 — Photocard
          </h1>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)]">
            Drop your photo into the well, zoom and nudge to fit, then download and share.
          </p>
        </header>

        <div className={`${display.className} ${semiCondensed.className} ${value.className} ${body.className} mt-12`}>
          <Suspense fallback={null}>
            <PunabFutsalPhotoCardGenerator />
          </Suspense>
        </div>
      </MarketingContainer>
    </Section>
  );
}
