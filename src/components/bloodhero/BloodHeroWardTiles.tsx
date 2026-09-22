import Link from "next/link";
import { BLOOD_GROUPS, type BloodGroup, type PublicRequest } from "@/lib/bloodhero/public-board";

type Tally = { open: number; critical: number };

function tallyOf(requests: PublicRequest[]): Record<BloodGroup, Tally> {
  const tally = Object.fromEntries(BLOOD_GROUPS.map((g) => [g, { open: 0, critical: 0 } satisfies Tally])) as Record<
    BloodGroup,
    Tally
  >;
  for (const r of requests) {
    tally[r.blood_group].open += r.request_quantity;
    if (r.criticality === "critical") tally[r.blood_group].critical += 1;
  }
  return tally;
}

/**
 * Shared ward-board tile grid — the one identity device for "need by group."
 * Used on the home board (full) and reused as the live filter on /bloodhero/requests,
 * so the board a visitor taps never hands off to a page that looks like a different product.
 */
export function BloodHeroWardTiles({
  requests,
  activeGroup,
  compact = false,
}: {
  requests: PublicRequest[];
  /** When set, this tile is outlined as the current filter and links back to the unfiltered board. */
  activeGroup?: BloodGroup;
  compact?: boolean;
}) {
  const tally = tallyOf(requests);

  return (
    <ul className={`grid grid-cols-4 gap-2 sm:gap-3 ${compact ? "" : ""}`}>
      {BLOOD_GROUPS.map((g) => {
        const t = tally[g];
        const hot = t.critical > 0;
        const needed = t.open > 0;
        const active = activeGroup === g;
        return (
          <li key={g}>
            <Link
              href={active ? "/bloodhero/requests" : `/bloodhero/requests?group=${encodeURIComponent(g)}`}
              aria-current={active ? "true" : undefined}
              aria-label={`${g}: ${needed ? `${t.open} units needed${hot ? ", critical" : ""}` : "none needed now"}${active ? " (showing this group, tap to clear)" : ""}`}
              className={`bh-focus relative flex ${compact ? "min-h-16 p-2 sm:min-h-20" : "min-h-24 p-2.5 sm:min-h-28 sm:p-3.5"} flex-col justify-between rounded-xl border-2 transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
                active ? "ring-2 ring-(--bh-ink) ring-offset-2 ring-offset-(--bh-bg)" : ""
              } ${
                hot
                  ? "border-(--bh-blood) bg-(--bh-blood) text-(--bh-on-blood)"
                  : needed
                    ? "border-(--bh-blood) bg-(--bh-blood-tint) text-(--bh-ink)"
                    : "border-(--bh-line) bg-(--bh-panel) text-(--bh-ink-soft)"
              }`}
            >
              {hot ? (
                <span className="absolute right-2 top-2 flex size-2.5" aria-hidden>
                  <span className="bh-pulse absolute inline-flex size-full rounded-full bg-(--bh-on-blood) opacity-70" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-(--bh-on-blood)" />
                </span>
              ) : null}
              <span className={`bh-display font-bold leading-none ${compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"}`}>
                {g}
              </span>
              <span className="text-xs font-semibold tabular-nums sm:text-sm">
                {needed ? `${t.open} ${t.open === 1 ? "unit" : "units"}` : "none now"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
