import Link from "next/link";
import type { ReactNode } from "react";
import { MarketingContainer } from "@/components/ui/MarketingContainer";

type Props = {
  title: string;
  lead: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
};

/** Wall-style page for event registrations: brush headline on the wall, the form (a paper sheet) beside it. */
export function FormPageShell({ title, lead, backHref, backLabel, children }: Props) {
  return (
    <div className="wall min-h-[calc(100dvh-12rem)]">
      <MarketingContainer className="grid items-start gap-12 py-14 md:py-20 lg:grid-cols-[minmax(0,22rem)_minmax(0,46rem)] lg:justify-between lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <p className="wall-text text-sm font-extrabold uppercase tracking-[0.2em] text-[color:var(--wall-chalk-dim)]">
            Unity · Mobilizing · Progress
          </p>
          <h1 className="wall-brush mt-4 text-balance text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.12] text-[color:var(--wall-chalk)]">
            {title}
          </h1>
          <p className="wall-text mt-5 text-lg leading-relaxed text-[color:var(--wall-chalk-dim)]">{lead}</p>
          <Link href={backHref} className="wall-link mt-7 inline-block">
            ← {backLabel}
          </Link>
        </div>
        <div className="min-w-0">{children}</div>
      </MarketingContainer>
    </div>
  );
}
