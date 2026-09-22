import type { Metadata } from "next";
import Link from "next/link";
import { BloodHeroPageHero } from "@/components/bloodhero";
import { BloodHeroWardTiles } from "@/components/bloodhero/BloodHeroWardTiles";
import { BLOOD_GROUPS, fetchPublicRequests, type PublicRequest } from "@/lib/bloodhero/public-board";

export const metadata: Metadata = {
  title: "Blood needed now",
  description: "Open blood requests by group and district. Donate, or share a request to help it reach a donor.",
};

export const revalidate = 60;

type Props = { searchParams: Promise<{ group?: string; district?: string }> };

const critStyle: Record<PublicRequest["criticality"], string> = {
  critical: "bg-(--bh-blood) text-(--bh-on-blood)",
  urgent: "border border-(--bh-blood) bg-(--bh-blood-tint) text-(--bh-ink)",
  normal: "border border-(--bh-line) text-(--bh-ink-soft)",
};

const critLabelBn: Record<PublicRequest["criticality"], string> = {
  critical: "জরুরি",
  urgent: "দ্রুত প্রয়োজন",
  normal: "সাধারণ",
};

function whenLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(new Date(iso));
}

function shareLinks(r: PublicRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const url = `${base}/bloodhero/requests?group=${encodeURIComponent(r.blood_group)}`;
  const text = `${r.blood_group} blood needed in ${r.district} (${r.donation_location}) by ${whenLabel(r.planned_donation_at)}. Can you help? ${url}`;
  return {
    wa: `https://wa.me/?text=${encodeURIComponent(text)}`,
    fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };
}

export default async function BloodHeroRequestsPage({ searchParams }: Props) {
  const { group, district } = await searchParams;
  const activeGroup = BLOOD_GROUPS.find((g) => g === group);
  // Tiles need the unfiltered tally to show every group's true count; the list below applies the filter.
  const [allRequests, filteredRequests] = await Promise.all([
    fetchPublicRequests(),
    district?.trim() || activeGroup ? fetchPublicRequests({ group, district }) : Promise.resolve(null),
  ]);
  const requests = filteredRequests ?? allRequests;

  return (
    <>
      <BloodHeroPageHero
        title="Blood needed now"
        description="Open requests, most urgent first. Contact details stay private. Donors are matched and notified by BloodHero."
      />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-sm font-semibold text-(--bh-ink-soft)">Tap a group to filter</h2>
        <div className="mt-3">
          <BloodHeroWardTiles requests={allRequests} activeGroup={activeGroup} compact />
        </div>

        <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          {activeGroup ? <input type="hidden" name="group" value={activeGroup} /> : null}
          <label className="flex flex-1 flex-col gap-1 text-sm font-semibold text-(--bh-ink-soft)">
            District
            <input
              name="district"
              defaultValue={district ?? ""}
              placeholder="e.g. Dhaka"
              maxLength={60}
              className="min-h-11 bh-focus rounded-xl border-2 border-(--bh-line) bg-(--bh-panel) px-3 text-base text-(--bh-ink)"
            />
          </label>
          <button
            type="submit"
            className="bh-focus min-h-11 rounded-xl border-2 border-(--bh-ink) bg-(--bh-ink) px-5 text-sm font-bold text-(--bh-bg)"
          >
            Filter
          </button>
          {activeGroup || district?.trim() ? (
            <Link
              href="/bloodhero/requests"
              className="bh-focus inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-(--bh-line) px-4 text-sm font-semibold text-(--bh-ink-soft) hover:border-(--bh-ink)"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <details className="mt-4 text-xs text-(--bh-ink-soft)">
          <summary className="bh-focus cursor-pointer font-semibold text-(--bh-ink)">What do critical / urgent / normal mean?</summary>
          <dl className="mt-2 space-y-1">
            <div>
              <dt className="inline font-bold text-(--bh-blood-deep)">Critical</dt>
              <dd className="inline"> — needed within hours; every eligible donor nearby is being contacted.</dd>
            </div>
            <div>
              <dt className="inline font-bold text-(--bh-blood-deep)">Urgent</dt>
              <dd className="inline"> — needed within a day or two.</dd>
            </div>
            <div>
              <dt className="inline font-bold text-(--bh-blood-deep)">Normal</dt>
              <dd className="inline"> — planned ahead, no immediate rush.</dd>
            </div>
          </dl>
        </details>

        {requests.length === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-(--bh-line) p-8 text-center">
            <p className="font-semibold text-(--bh-ink)">No open requests match.</p>
            <p className="mt-2 text-sm text-(--bh-ink-soft)">
              Good news, or try another group or district. Register as a donor so you are ready when one appears.
            </p>
            <Link
              href="/bloodhero/donor"
              className="bh-focus mt-5 inline-flex min-h-11 items-center rounded-xl border-2 border-(--bh-blood) bg-(--bh-blood) px-5 text-sm font-bold text-(--bh-on-blood)"
            >
              Become a Donor
            </Link>
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {requests.map((r) => {
              const s = shareLinks(r);
              const hot = r.criticality === "critical";
              return (
                <li
                  key={r.id}
                  id={r.id}
                  className={`rounded-2xl border-2 bg-(--bh-panel) p-5 ${hot ? "border-(--bh-blood)" : "border-(--bh-line)"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex size-16 shrink-0 items-center justify-center bh-display rounded-xl bg-(--bh-blood-tint) text-3xl font-bold text-(--bh-blood-deep)">
                      {hot ? (
                        <span className="absolute right-1 top-1 flex size-2.5" aria-hidden>
                          <span className="bh-pulse absolute inline-flex size-full rounded-full bg-(--bh-blood) opacity-70" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-(--bh-blood)" />
                        </span>
                      ) : null}
                      {r.blood_group}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${critStyle[r.criticality]}`}>
                          {r.criticality} <span lang="bn">· {critLabelBn[r.criticality]}</span>
                        </span>
                        <span className="text-sm text-(--bh-ink-soft) tabular-nums">
                          {r.request_quantity} {r.request_quantity === 1 ? "unit" : "units"}
                        </span>
                      </div>
                      <p className="mt-1.5 font-semibold text-(--bh-ink)">{r.donation_location}</p>
                      <p className="text-sm text-(--bh-ink-soft)">
                        {r.district} · by {whenLabel(r.planned_donation_at)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/bloodhero/donor"
                      className="bh-focus inline-flex min-h-11 items-center rounded-xl border-2 border-(--bh-blood) bg-(--bh-blood) px-4 text-sm font-bold text-(--bh-on-blood)"
                    >
                      I can donate <span className="ml-1 font-normal opacity-90" lang="bn">· আমি পারি</span>
                    </Link>
                    <a
                      href={s.wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bh-focus inline-flex min-h-11 items-center rounded-xl border-2 border-(--bh-line) px-4 text-sm font-semibold text-(--bh-ink) hover:border-(--bh-ink)"
                    >
                      Share on WhatsApp
                    </a>
                    <a
                      href={s.fb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bh-focus inline-flex min-h-11 items-center rounded-xl border-2 border-(--bh-line) px-4 text-sm font-semibold text-(--bh-ink) hover:border-(--bh-ink)"
                    >
                      Share on Facebook
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
