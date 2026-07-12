import Image from "next/image";
import Link from "next/link";
import { bloodHeroFooterQuickLinks, bloodHeroFooterSecondaryLinks } from "@/components/bloodhero/bloodhero-nav";

const quickClass =
  "text-xs text-zinc-500 transition hover:text-red-700 dark:text-zinc-500 dark:hover:text-red-400";
const secondaryClass =
  "text-sm font-medium text-zinc-600 transition hover:text-red-700 dark:text-zinc-400 dark:hover:text-red-400";

/** Canonical BloodHero module map — Home + primary flows + info pages. Keeps the header nav-free. */
export function BloodHeroFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
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
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            A Service by <span className="text-emerald-800 dark:text-emerald-400">PUNAB</span>
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-5">
          <nav aria-label="BloodHero quick links" className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            {bloodHeroFooterQuickLinks.map((item, i) => (
              <span key={item.href} className="inline-flex items-center">
                {i > 0 ? (
                  <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden>
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
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-zinc-100 pt-5 dark:border-zinc-800/80"
          >
            {bloodHeroFooterSecondaryLinks.map((item) => (
              <Link key={item.href} href={item.href} className={secondaryClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
          © {new Date().getFullYear()} BloodHero · Private University National Association of Bangladesh
        </p>
      </div>
    </footer>
  );
}
