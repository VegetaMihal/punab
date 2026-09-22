import Link from "next/link";
import { bloodHeroMainActionLinks } from "@/components/bloodhero/bloodhero-nav";

/** Closing reminder — compact chips so we do not repeat the full hero button row. */
export function BloodHeroCtaStrip() {
  return (
    <section className="bg-(--bh-ink) py-10 text-(--bh-bg) sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-base font-semibold sm:text-lg">
          Ready when you are—same steps, any time.
        </p>
        <nav
          aria-label="BloodHero main actions"
          className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3"
        >
          {bloodHeroMainActionLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center justify-center bh-focus rounded-xl border-2 border-(--bh-bg) px-5 text-sm font-bold text-(--bh-bg) transition-colors duration-150 hover:bg-(--bh-bg) hover:text-(--bh-ink)"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
