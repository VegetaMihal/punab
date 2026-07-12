import type { Metadata } from "next";
import {
  BloodHeroFooter,
  BloodHeroHeader,
  BloodHeroSkipToMain,
} from "@/components/bloodhero";

/**
 * BloodHero route group — standalone from PUNAB marketing chrome.
 *
 * Navigation contract (no top nav bar):
 * - Header: brand + trust line + exit to punab.org only (`BloodHeroHeader`).
 * - Primary tasks: landing hero / in-page CTAs (`BloodHeroMainActions`, etc.).
 * - Module wayfinding: footer link rows from `bloodhero-nav.ts` (`BloodHeroFooter`).
 * Do not add multi-link navigation to the header; extend footer or page body instead.
 */
export const metadata: Metadata = {
  title: {
    default: "BloodHero — A service by PUNAB",
    template: "%s | BloodHero",
  },
  description:
    "Fast blood donor coordination by district and blood group. Connect donors and requesters through simple, secure steps—no public account required.",
};

export default function BloodHeroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#fafafa] text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
      <BloodHeroSkipToMain />
      <BloodHeroHeader />
      <main id="bloodhero-main" className="flex-1 scroll-mt-0" tabIndex={-1}>
        {children}
      </main>
      <BloodHeroFooter />
    </div>
  );
}
