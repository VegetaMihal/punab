import Link from "next/link";
import type { ReactNode } from "react";
import { MarketingContainer } from "@/components/ui/MarketingContainer";

type Props = {
  title: string;
  lead: string;
  /** Text before the switch link, e.g. "Already have an account?" */
  switchText: string;
  switchLabel: string;
  switchHref: string;
  children: ReactNode;
};

/** Wall-style auth page: brush headline on the wall, form on a taped paper sheet. */
export function AuthShell({ title, lead, switchText, switchLabel, switchHref, children }: Props) {
  return (
    <div className="wall min-h-[calc(100dvh-12rem)]">
      <MarketingContainer className="grid items-start gap-12 py-14 md:py-20 lg:grid-cols-[1fr_30rem] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <p className="wall-text text-sm font-extrabold uppercase tracking-[0.2em] text-[color:var(--wall-chalk-dim)]">
            Unity · Mobilizing · Progress
          </p>
          <h1 className="wall-brush mt-4 text-balance text-[clamp(2.75rem,8vw,4.5rem)] leading-[1.1] text-[color:var(--wall-chalk)]">
            {title}
          </h1>
          <p className="wall-text mt-5 max-w-[42ch] text-lg leading-relaxed text-[color:var(--wall-chalk-dim)]">{lead}</p>
        </div>

        <div className="wall-sheet wall-text ja-sheet p-6 pt-10 sm:p-8 sm:pt-12">
          {children}
          <p className="mt-6 border-t-2 border-dashed border-[#1b1a17]/25 pt-5 text-center text-small text-[#3a382f]">
            {switchText}{" "}
            <Link
              href={switchHref}
              className="border-b-[3px] border-[#c41e3a] pb-0.5 font-extrabold uppercase tracking-wide text-[#a5182f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#a5182f]"
            >
              {switchLabel}
            </Link>
          </p>
        </div>
      </MarketingContainer>
    </div>
  );
}
