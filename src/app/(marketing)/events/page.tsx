export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { listPublishedEvents } from "@/lib/repositories/events-repository";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";
import type { EventRow } from "@/types/database";

export const metadata = {
  title: "Upcoming Events",
};

function formatRange(start: string, end: string | null) {
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };
  if (!end) {
    return s.toLocaleString("en-GB", opts);
  }
  const e = new Date(end);
  return `${s.toLocaleString("en-GB", opts)} – ${e.toLocaleString("en-GB", opts)}`;
}

function formatDayBadge(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleString("en-GB", { day: "2-digit" }),
    mon: d.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
  };
}

function isJulyAwardSignatureDuplicate(ev: EventRow): boolean {
  const t = ev.title.toLowerCase();
  return (
    t.includes("july uprising memorial award") ||
    t.includes("july awards 2026") ||
    t.includes("july award 2026") ||
    t.includes("memorial award 2026")
  );
}

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof listPublishedEvents>> = [];
  let error: string | null = null;
  try {
    events = await listPublishedEvents();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  const otherEvents = events.filter((ev) => !isJulyAwardSignatureDuplicate(ev));

  return (
    <>
      <PageHeader
        title="Upcoming Events"
        description="Programmes, chapter meetings, and national initiatives—listed by start date."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Upcoming Events" }]}
      />
      <MarketingContainer className="py-12 md:py-16">
        <div className="space-y-12 md:space-y-16">
          {error ? (
            <EmptyState title="Unable to load events" description={error} />
          ) : otherEvents.length === 0 ? (
            <p className="mx-auto max-w-xl text-center text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
              Further chapter dates and programmes will be published here when confirmed. Check{" "}
              <Link href="/notices" className="font-semibold text-[color:var(--color-brand)] underline-offset-2 hover:underline">
                Notices
              </Link>{" "}
              for formal letters and updates.
            </p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2">
              {otherEvents.map((ev, i) => (
                <EventCard key={ev.id} ev={ev} muted={false} staggerIndex={i % 4} />
              ))}
            </ul>
          )}
        </div>
      </MarketingContainer>
    </>
  );
}

function EventCard({ ev, muted, staggerIndex }: { ev: EventRow; muted: boolean; staggerIndex: number }) {
  const badge = formatDayBadge(ev.start_at);
  const banner = ev.banner_url ? ensureSupabasePublicObjectUrl(ev.banner_url) : null;
  const isMun = ev.title.toLowerCase().includes("model united nations") || ev.title.toLowerCase().includes("imun");

  return (
    <li>
      <Reveal staggerIndex={staggerIndex}>
        <article
          className={`wall-sheet wall-text group p-2 pt-5 ${staggerIndex % 2 === 0 ? "-rotate-1" : "rotate-1"} ${
            muted ? "opacity-75" : ""
          }`}
        >
          <Link href={`/events/${ev.id}`} className="block focus-visible:outline-none">
            <div
              className={`relative aspect-[21/9] overflow-hidden ${
                !banner && isMun
                  ? "bg-[linear-gradient(135deg,var(--color-brand)_0%,color-mix(in_srgb,var(--color-brand)_55%,black)_100%)]"
                  : "bg-[color:var(--color-surface-3)]"
              }`}
            >
              {banner ? (
                <Image
                  src={banner}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw,50vw"
                  quality={90}
                />
              ) : isMun ? (
                <>
                  <div className="pointer-events-none absolute top-1/2 -right-4 h-[140%] w-[42%] min-w-32 -translate-y-1/2">
                    <Image src="/images/mun-globe-watermark.png" alt="" fill className="object-contain" sizes="16rem" />
                  </div>
                  <p className="absolute top-1/2 left-3 max-w-[55%] -translate-y-1/2 text-small font-bold leading-tight text-white">{ev.title}</p>
                </>
              ) : (
                <div className="absolute inset-0 punab-hero-sheen opacity-60" aria-hidden />
              )}
              <div className="absolute left-3 top-3 bg-[#c41e3a] px-3 py-2 text-center text-[#fffaf2]">
                <p className="text-lg font-bold leading-none">{badge.day}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90">{badge.mon}</p>
              </div>
            </div>
            <div className="px-3 pb-4 pt-5">
              <h3 className="text-h3 text-[#1b1a17] group-hover:text-[#a5182f] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)]">
                {ev.title}
              </h3>
              <p className="text-small mt-2 font-semibold text-[#3a382f]">{formatRange(ev.start_at, ev.end_at)}</p>
              {ev.location && <p className="text-small mt-1 text-[#3a382f]">{ev.location}</p>}
              {ev.description && (
                <p className="text-small mt-2 line-clamp-3 text-[#3a382f]">{ev.description}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 border-b-[3px] border-[#c41e3a] pb-0.5 text-small font-extrabold uppercase tracking-wide text-[#a5182f]">
                View Event
                <span aria-hidden className="motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        </article>
      </Reveal>
    </li>
  );
}
