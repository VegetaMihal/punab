import Image from "next/image";
import Link from "next/link";
import { PUNAB_LOGO_SRC } from "@/components/layout/logo";

/**
 * Minimal top chrome — BloodHero logo (home); “A Service by” + clickable PUNAB mark → main app home.
 * Intentionally no BloodHero route links here; wayfinding lives in `BloodHeroFooter` and page CTAs.
 */
export function BloodHeroHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-(--bh-ink) bg-(--bh-bg)">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        <Link href="/bloodhero" className="flex min-w-0 shrink items-center gap-2">
          <Image
            src="/branding/BloodHeroLogo.png"
            alt="BloodHero"
            width={132}
            height={38}
            className="h-8 w-auto max-w-[min(100%,9rem)] object-contain object-left sm:h-9"
            priority
          />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <span className="whitespace-nowrap text-[10px] font-medium tracking-wide text-(--bh-ink-soft) sm:text-[11px]">
            A Service by
          </span>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center rounded-md px-1.5 py-1 opacity-[0.92] transition-[opacity,background-color] duration-150 ease-out hover:bg-(--bh-panel) hover:opacity-100 focus-visible:bg-(--bh-panel) focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bh-blood) focus-visible:ring-offset-2 active:bg-(--bh-panel) "
            aria-label="PUNAB main site"
          >
            <Image
              src={PUNAB_LOGO_SRC}
              alt=""
              width={72}
              height={28}
              className="h-6 w-auto max-h-6 object-contain object-right sm:h-7 sm:max-h-7"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
