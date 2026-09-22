import Link from "next/link";
import { bloodHeroFooterSecondaryLinks } from "@/components/bloodhero/bloodhero-nav";

const linkClass =
  "block w-full rounded-lg py-2.5 text-center text-sm font-medium text-(--bh-ink-soft) transition hover:bg-(--bh-blood-tint) hover:text-(--bh-blood-deep) sm:inline-block sm:w-auto sm:px-4 sm:py-2";

/** Low-priority wayfinding directly under the hero — does not compete with primary CTAs. */
export function BloodHeroPostHeroUtility() {
  const [certs, about] = bloodHeroFooterSecondaryLinks;

  return (
    <section
      aria-label="Certificates and about BloodHero"
      className="border-b border-(--bh-blood-tint) bg-(--bh-panel) "
    >
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-md rounded-xl border border-(--bh-line) bg-(--bh-panel) px-4 py-4 ring-1 ring-(--bh-line) sm:max-w-xl sm:px-5">
          <nav className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-1">
            <Link href={certs.href} className={linkClass}>
              {certs.label}
            </Link>
            <span
              className="hidden text-(--bh-ink-soft) sm:inline sm:px-2"
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
