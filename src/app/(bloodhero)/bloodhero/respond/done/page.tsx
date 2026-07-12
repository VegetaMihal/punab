import type { Metadata } from "next";
import { BloodHeroPageSection } from "@/components/bloodhero";
import { SmartBackLink } from "@/components/ui/SmartBackLink";

export const metadata: Metadata = {
  title: "Response saved",
  robots: { index: false, follow: false },
};

type OutcomeKey = "accepted" | "block_3m" | "block_2m" | "block_1m";

const OUTCOMES: Record<
  OutcomeKey,
  { headline: string; body: string; accent: "emerald" | "amber" }
> = {
  accepted: {
    headline: "We have your yes",
    body: "Thank you. We recorded that you can help with this request. Coordinators will follow up as BloodHero continues to roll out — watch your email if they need anything else.",
    accent: "emerald",
  },
  block_3m: {
    headline: "Cooling-off updated — 3 months",
    body: "We recorded your choice and set a three-month pause on new BloodHero match emails for you (or extended your existing pause if it was already longer). You can still register again later if your situation changes.",
    accent: "amber",
  },
  block_2m: {
    headline: "Cooling-off updated — 2 months",
    body: "We recorded your choice and set a two-month pause on new BloodHero match emails for you (or extended your existing pause if it was already longer).",
    accent: "amber",
  },
  block_1m: {
    headline: "Cooling-off updated — 1 month",
    body: "We recorded your choice and set a one-month pause on new BloodHero match emails for you (or extended your existing pause if it was already longer).",
    accent: "amber",
  },
};

function isOutcomeKey(s: string | undefined): s is OutcomeKey {
  return s === "accepted" || s === "block_3m" || s === "block_2m" || s === "block_1m";
}

export default async function BloodHeroRespondDonePage({
  searchParams,
}: {
  searchParams: Promise<{ outcome?: string }>;
}) {
  const { outcome } = await searchParams;
  const key = isOutcomeKey(outcome) ? outcome : "accepted";
  const o = OUTCOMES[key];

  const accentRing =
    o.accent === "emerald"
      ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50"
      : "border-amber-200/90 bg-amber-50/90 text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/25 dark:text-amber-50";

  return (
    <>
      <div className="border-b border-zinc-200/80 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950 sm:py-12">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            BloodHero
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {o.headline}
          </h1>
        </div>
      </div>
      <BloodHeroPageSection>
        <div className="mx-auto max-w-lg px-0 sm:px-0">
          <div
            className={`rounded-2xl border px-4 py-5 shadow-sm sm:px-6 sm:py-6 ${accentRing}`}
            role="status"
          >
            <p className="text-sm leading-relaxed sm:text-base">{o.body}</p>
          </div>
          <p className="mt-6 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            You can close this tab. If you chose the wrong option by mistake, contact the team through the main
            PUNAB site and mention BloodHero.
          </p>
          <div className="mt-8 flex justify-center">
            <SmartBackLink
              fallbackHref="/bloodhero"
              className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 sm:w-auto"
            >
              Back to BloodHero
            </SmartBackLink>
          </div>
        </div>
      </BloodHeroPageSection>
    </>
  );
}
