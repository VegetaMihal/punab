import Link from "next/link";
import { bloodHeroMainActionLinks } from "@/components/bloodhero/bloodhero-nav";

const baseBtn =
  "bh-focus inline-flex min-h-14 w-full touch-manipulation items-center justify-center rounded-xl border-2 px-5 py-2 text-center text-base font-bold leading-snug transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0";

/** Primary action trio. Donate = blood red, request = inked outline, track = quiet. */
export function BloodHeroMainActions({ id }: { id?: string }) {
  const [donor, request, track] = bloodHeroMainActionLinks;

  return (
    <div id={id} className="w-full max-w-xl">
      <ul className="flex flex-col gap-3 sm:grid sm:grid-cols-3">
        <li>
          <Link
            href={donor.href}
            className={`${baseBtn} flex-col gap-0 border-(--bh-blood) bg-(--bh-blood) text-(--bh-on-blood)`}
          >
            {donor.label}
            <span className="text-xs font-medium opacity-85" lang="bn">
              {donor.labelBn}
            </span>
          </Link>
        </li>
        <li>
          <Link
            href={request.href}
            className={`${baseBtn} flex-col gap-0 border-(--bh-ink) bg-(--bh-panel) text-(--bh-ink)`}
          >
            {request.label}
            <span className="text-xs font-medium text-(--bh-ink-soft)" lang="bn">
              {request.labelBn}
            </span>
          </Link>
        </li>
        <li>
          <Link
            href={track.href}
            className={`${baseBtn} flex-col gap-0 border-(--bh-line) bg-transparent text-(--bh-ink-soft) hover:border-(--bh-ink)`}
          >
            {track.label}
            <span className="text-xs font-medium opacity-80" lang="bn">
              {track.labelBn}
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
