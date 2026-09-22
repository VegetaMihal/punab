import { BloodHeroBloodGroups } from "@/components/bloodhero/BloodHeroBloodGroups";
import { BloodHeroFigure } from "@/components/bloodhero/BloodHeroFigure";
import { BloodHeroMainActions } from "@/components/bloodhero/BloodHeroMainActions";
import { BloodHeroParallax } from "@/components/bloodhero/BloodHeroParallax";
import { BloodHeroStatStrip } from "@/components/bloodhero/BloodHeroStatStrip";
import { fetchPublicRequests, fetchPublicStats } from "@/lib/bloodhero/public-board";

function figureMessage(open: number, critical: number): string {
  if (open === 0) return "Nobody is waiting right now. Stay ready.";
  if (critical > 0) return `${critical} urgent ${critical === 1 ? "request needs" : "requests need"} blood now.`;
  return `${open} ${open === 1 ? "request is" : "requests are"} open. Can you help?`;
}

/** First viewport: actions, the figure reporting live need, and the ward board directly below. */
export async function BloodHeroHeroSection() {
  const [requests, stats] = await Promise.all([fetchPublicRequests(), fetchPublicStats()]);
  const critical = requests.filter((r) => r.criticality === "critical").length;

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-12">
        <div className="grid items-end gap-8 md:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 className="bh-display text-4xl font-bold leading-[1.15] text-(--bh-ink) sm:text-5xl md:text-6xl">
              When minutes matter, <span className="text-(--bh-blood)">good people</span> show up.
            </h1>
            <p className="mt-2 text-lg font-medium text-(--bh-ink-soft)" lang="bn">
              যখন প্রতিটি মুহূর্ত গুরুত্বপূর্ণ, ভালো মানুষ এগিয়ে আসে।
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-(--bh-ink-soft) sm:text-lg">
              Real requests, real districts, real donors. Find who needs blood, or tell us you can give it.
            </p>
            <div className="mt-6">
              <BloodHeroMainActions />
            </div>
            <BloodHeroStatStrip
              active_donors={stats?.active_donors ?? 0}
              open_requests={stats?.open_requests ?? requests.length}
              fulfilled_requests={stats?.fulfilled_requests ?? 0}
            />
          </div>
          <div className="flex justify-center md:justify-end">
            <BloodHeroParallax range={18}>
              <BloodHeroFigure
                message={figureMessage(stats?.open_requests ?? requests.length, critical)}
                critical={critical > 0}
              />
            </BloodHeroParallax>
          </div>
        </div>
      </section>
      <BloodHeroBloodGroups requests={requests} stats={stats} />
    </>
  );
}
