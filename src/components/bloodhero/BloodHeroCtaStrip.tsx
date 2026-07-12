import Link from "next/link";
import { bloodHeroMainActionLinks } from "@/components/bloodhero/bloodhero-nav";

/** Closing reminder — compact chips so we do not repeat the full hero button row. */
export function BloodHeroCtaStrip() {
  return (
    <section className="bg-zinc-900 py-10 text-white dark:bg-black sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-base font-medium text-zinc-200 sm:text-lg">
          Ready when you are—same three steps, any time.
        </p>
        <nav
          aria-label="BloodHero main actions"
          className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3"
        >
          {bloodHeroMainActionLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-5 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
