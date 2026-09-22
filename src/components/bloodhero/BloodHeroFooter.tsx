import Image from "next/image";
import Link from "next/link";
import { bloodHeroFooterQuickLinks, bloodHeroFooterSecondaryLinks } from "@/components/bloodhero/bloodhero-nav";

const quickClass =
  "text-xs text-(--bh-ink-soft) transition hover:text-(--bh-blood-deep) ";
const secondaryClass =
  "text-sm font-medium text-(--bh-ink-soft) transition hover:text-(--bh-blood-deep) ";

/** Canonical BloodHero module map — Home + primary flows + info pages. Keeps the header nav-free. */
export function BloodHeroFooter() {
  return (
    <footer className="mt-auto border-t border-(--bh-line) bg-(--bh-panel) py-10 ">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link href="/bloodhero">
            <Image
              src="/branding/BloodHeroLogo.png"
              alt="BloodHero"
              width={160}
              height={48}
              className="h-10 w-auto object-contain opacity-95"
            />
          </Link>
          <p className="text-xs font-medium uppercase tracking-wide text-(--bh-ink-soft) ">
            A Service by <span className="font-semibold text-(--bh-ink)">PUNAB</span>
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-5">
          <nav aria-label="BloodHero quick links" className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            {bloodHeroFooterQuickLinks.map((item, i) => (
              <span key={item.href} className="inline-flex items-center">
                {i > 0 ? (
                  <span className="mx-1.5 text-(--bh-ink-soft) " aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link href={item.href} className={quickClass}>
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
          <nav
            aria-label="BloodHero information"
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-(--bh-line) pt-5 "
          >
            {bloodHeroFooterSecondaryLinks.map((item) => (
              <Link key={item.href} href={item.href} className={secondaryClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-center text-xs text-(--bh-ink-soft) ">
          © {new Date().getFullYear()} BloodHero · Private University National Association of Bangladesh
        </p>
      </div>
    </footer>
  );
}
