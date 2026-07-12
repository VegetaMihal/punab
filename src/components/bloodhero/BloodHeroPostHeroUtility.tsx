import Link from "next/link";
import { bloodHeroFooterSecondaryLinks } from "@/components/bloodhero/bloodhero-nav";

const linkClass =
  "block w-full rounded-lg py-2.5 text-center text-sm font-medium text-zinc-600 transition hover:bg-red-50/80 hover:text-red-800 dark:text-zinc-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 sm:inline-block sm:w-auto sm:px-4 sm:py-2";

/** Low-priority wayfinding directly under the hero — does not compete with primary CTAs. */
export function BloodHeroPostHeroUtility() {
  const [certs, about] = bloodHeroFooterSecondaryLinks;

  return (
    <section
      aria-label="Certificates and about BloodHero"
      className="border-b border-red-100/50 bg-white/40 dark:border-red-950/25 dark:bg-zinc-950/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-md rounded-xl border border-zinc-200/80 bg-white/90 px-4 py-4 shadow-sm ring-1 ring-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/50 dark:ring-zinc-800/80 sm:max-w-xl sm:px-5">
          <nav className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-1">
            <Link href={certs.href} className={linkClass}>
              {certs.label}
            </Link>
            <span
              className="hidden text-zinc-300 dark:text-zinc-600 sm:inline sm:px-2"
              aria-hidden
            >
              ·
            </span>
            <Link href={about.href} className={linkClass}>
              About BloodHero
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
