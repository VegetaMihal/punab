import Link from "next/link";
import { BloodHeroLiveBoard } from "@/components/bloodhero/BloodHeroLiveBoard";
import { BLOOD_GROUPS, CAN_DONATE_TO, type PublicRequest, type PublicStats } from "@/lib/bloodhero/public-board";

/** The ward board: 8 tiles, red only where blood is actually needed. Data comes from the PII-free public view. */
export function BloodHeroBloodGroups({
  requests,
  stats,
}: {
  requests: PublicRequest[];
  stats: PublicStats | null;
}) {
  return (
    <section id="blood-groups" aria-labelledby="bh-board-title" className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div>
          <h2 id="bh-board-title" className="bh-display text-2xl font-bold text-(--bh-ink) sm:text-3xl">
            Blood needed right now
          </h2>
          <p className="text-sm text-(--bh-ink-soft)" lang="bn">
            এখনই যে রক্তের প্রয়োজন
          </p>
        </div>
      </div>

      <BloodHeroLiveBoard initialRequests={requests} initialStats={stats} />

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/bloodhero/requests"
          className="bh-focus inline-flex min-h-11 items-center rounded-xl border-2 border-(--bh-ink) bg-(--bh-ink) px-5 text-sm font-bold text-(--bh-bg) transition-transform duration-150 ease-out hover:-translate-y-0.5"
        >
          See every open request
        </Link>
        <details className="text-sm text-(--bh-ink-soft)">
          <summary className="bh-focus cursor-pointer rounded font-semibold text-(--bh-ink) underline underline-offset-4">
            Who can my blood group help?
          </summary>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            {BLOOD_GROUPS.map((g) => (
              <div key={g} className="contents">
                <dt className="bh-display font-bold text-(--bh-blood-deep)">{g}</dt>
                <dd>{CAN_DONATE_TO[g].length === 8 ? "Everyone (universal donor)" : CAN_DONATE_TO[g].join(", ")}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  );
}
