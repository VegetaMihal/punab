import type { Metadata } from "next";
import { BloodHeroPageSection } from "@/components/bloodhero";
import { SmartBackLink } from "@/components/ui/SmartBackLink";

export const metadata: Metadata = {
  title: "Could not complete response",
  robots: { index: false, follow: false },
};

type ErrorKind = "invalid" | "expired" | "missing" | "used" | "config" | "server" | "apply";

const ERROR_COPY: Record<
  ErrorKind,
  { title: string; summary: string; nextSteps: string; variant: "red" | "amber" | "zinc" }
> = {
  invalid: {
    title: "This link is not valid",
    summary:
      "The address may be incomplete, copied incorrectly, or altered. BloodHero only accepts links exactly as they appear in your email.",
    nextSteps: "Open the message again and use the button or link from there. If it still fails, ask for a new email from coordinators.",
    variant: "red",
  },
  expired: {
    title: "This link has expired",
    summary:
      "For safety, BloodHero links stop working after a limited time. That helps protect your choices if a message is forwarded or found later.",
    nextSteps: "If you still need to respond, contact coordinators so they can send a fresh message.",
    variant: "amber",
  },
  missing: {
    title: "Link incomplete",
    summary: "This page needs the full link from your BloodHero email, including everything after the question mark.",
    nextSteps: "Go back to your inbox, open the email, and tap the same option again.",
    variant: "red",
  },
  used: {
    title: "Already recorded",
    summary:
      "This request was already answered, or that link is no longer active. We only allow one saved response per link to keep records accurate.",
    nextSteps: "If something looks wrong, contact the BloodHero team through PUNAB.",
    variant: "zinc",
  },
  config: {
    title: "Service unavailable",
    summary: "BloodHero could not complete that step right now. This is usually temporary.",
    nextSteps: "Please try again in a little while. If it keeps happening, contact support.",
    variant: "zinc",
  },
  server: {
    title: "Something went wrong",
    summary: "We could not save your response due to a technical problem.",
    nextSteps: "Try once more from your email link. If it continues, contact the team.",
    variant: "zinc",
  },
  apply: {
    title: "Could not apply your choice",
    summary: "Your response could not be saved. The request may have changed or the action may no longer apply.",
    nextSteps: "Use a fresh link from a new email if you have one, or contact coordinators.",
    variant: "zinc",
  },
};

function normalizeReason(r: string | undefined): ErrorKind {
  if (r && r in ERROR_COPY) {
    return r as ErrorKind;
  }
  return "invalid";
}

function cardClass(variant: "red" | "amber" | "zinc"): string {
  switch (variant) {
    case "red":
      return "border-(--bh-blood-tint) bg-(--bh-blood-tint) text-(--bh-blood-deep) ";
    case "amber":
      return "border-amber-200/90 bg-amber-50/90 text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/25 dark:text-amber-50";
    default:
      return "border-(--bh-line) bg-(--bh-panel) text-(--bh-ink) ";
  }
}

export default async function BloodHeroRespondErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; detail?: string }>;
}) {
  const { reason, detail } = await searchParams;
  const key = normalizeReason(reason);
  const e = ERROR_COPY[key];

  return (
    <>
      <div className="border-b border-(--bh-line) bg-(--bh-panel) py-10 sm:py-12">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--bh-ink-soft) ">
            BloodHero
          </p>
          <h1 className="bh-display mt-2 text-2xl font-bold tracking-tight text-(--bh-ink) sm:text-3xl">
            {e.title}
          </h1>
        </div>
      </div>
      <BloodHeroPageSection>
        <div className="mx-auto max-w-lg">
          <div
            className={`rounded-2xl border px-4 py-5 sm:px-6 sm:py-6 ${cardClass(e.variant)}`}
            role="alert"
          >
            <p className="text-sm font-medium leading-relaxed sm:text-base">{e.summary}</p>
            <p className="mt-4 text-sm leading-relaxed opacity-90 dark:opacity-95">{e.nextSteps}</p>
          </div>
          {process.env.NODE_ENV === "development" && detail ? (
            <p className="mt-4 rounded-xl border border-(--bh-line) bg-(--bh-panel) p-3 font-mono text-xs text-(--bh-ink) ">
              {detail}
            </p>
          ) : null}
          <div className="mt-8 flex justify-center">
            <SmartBackLink
              fallbackHref="/bloodhero"
              className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl bg-(--bh-blood) px-5 text-sm font-semibold text-(--bh-on-blood) transition hover:bg-(--bh-blood) focus-visible:outline focus-visible:ring-2 focus-visible:ring-(--bh-blood) sm:w-auto"
            >
              Back to BloodHero
            </SmartBackLink>
          </div>
        </div>
      </BloodHeroPageSection>
    </>
  );
}
