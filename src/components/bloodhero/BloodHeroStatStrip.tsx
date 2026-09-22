import { BloodHeroNumberTicker } from "@/components/bloodhero/BloodHeroNumberTicker";

const STATS = [
  { key: "active_donors", label: "Active donors" },
  { key: "open_requests", label: "Open requests" },
  { key: "fulfilled_requests", label: "Fulfilled" },
] as const;

/** Live network trust strip — ticks up once in view, real values for screen readers. */
export function BloodHeroStatStrip({
  active_donors,
  open_requests,
  fulfilled_requests,
}: {
  active_donors: number;
  open_requests: number;
  fulfilled_requests: number;
}) {
  const values = { active_donors, open_requests, fulfilled_requests };

  return (
    <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
      {STATS.map((s) => (
        <div key={s.key}>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-(--bh-ink-soft)">{s.label}</dt>
          <dd className="bh-display text-2xl font-bold leading-tight text-(--bh-ink) sm:text-3xl">
            <BloodHeroNumberTicker value={values[s.key]} />
            <span className="sr-only">{values[s.key]}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
