export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import {
  julyAward2026EventsSignatureDateLine,
  julyAward2026EventsSignatureLocationLine,
} from "@/lib/july-award-2026-event";
import { listPublishedEvents } from "@/lib/repositories/events-repository";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";
import type { EventRow } from "@/types/database";

/** Fixed flagship listing — not from CMS; links to marketing route. */
const SIGNATURE_JULY_AWARD_2026 = {
  href: "/july-award-2026",
  title: "July Uprising Memorial Award 2026",
  kicker: "Signature national programme",
  summary:
    "PUNAB’s flagship gathering: memorial, honours for families, injured students, and steadfast teachers, plus club excellence across ten lanes.",
  dateLabel: julyAward2026EventsSignatureDateLine(),
  locationLabel: julyAward2026EventsSignatureLocationLine(),
  imageSrc: "/images/marketing/july-uprising-memorial-hero.png",
  imageAlt:
    "Demonstrators during Bangladesh's 2024 quota reform movement—students in national colours; placards include Bengali messaging on quota and merit.",
} as const;

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

function SignatureJulyAwardFeatured() {
  const s = SIGNATURE_JULY_AWARD_2026;
  return (
    <section aria-labelledby="signature-july-award-heading">
      <Reveal>
        <article className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:color-mix(in_srgb,var(--brand-green)_22%,var(--color-border))] shadow-[var(--shadow-lg)] ring-1 ring-[color:color-mix(in_srgb,var(--color-brand)_12%,transparent)]">
          <div
            className="absolute inset-x-0 top-0 z-[2] h-[3px] bg-[linear-gradient(90deg,#047857_0%,#c41e3a_50%,#047857_100%)]"
            aria-hidden
          />
          <Link href={s.href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2">
            <div className="relative min-h-[min(52vh,28rem)] w-full md:min-h-[min(48vh,26rem)] lg:min-h-[min(46vh,24rem)]">
              <Image
                src={s.imageSrc}
                alt={s.imageAlt}
                fill
                className="object-cover object-[46%_34%] motion-safe:transition-transform motion-safe:duration-[var(--transition-slow)] motion-safe:group-hover:scale-[1.02]"
                sizes="100vw"
                priority
                quality={88}
              />
              <div className="pointer-events-none absolute inset-0 bg-black/28 dark:bg-black/35" aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,transparent_38%,transparent_52%,rgba(0,0,0,0.72)_100%)]"
                aria-hidden
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:p-12">
                <div className="max-w-3xl">
                  <p className="inline-flex rounded-[var(--radius-full)] border border-white/35 bg-black/30 px-3 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-white/95 backdrop-blur-sm">
                    {s.kicker}
                  </p>
                  <h2
                    id="signature-july-award-heading"
                    className="mt-4 text-balance text-[clamp(1.75rem,4vw+0.75rem,3rem)] font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
                  >
                    {s.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)] md:text-[1.0625rem]">
                    {s.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white/85">
                    <span>{s.dateLabel}</span>
                    <span aria-hidden className="hidden text-white/40 sm:inline">
                      ·
                    </span>
                    <span>{s.locationLabel}</span>
                  </div>
                  <p className="mt-6 inline-flex items-center gap-2 text-small font-bold uppercase tracking-[0.14em] text-white underline-offset-4 group-hover:underline">
                    View full programme
                    <span aria-hidden className="motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] motion-safe:group-hover:translate-x-1">
                      →
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </article>
      </Reveal>
    </section>
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
          <SignatureJulyAwardFeatured />

          {error ? (
            <EmptyState title="Unable to load other events" description={error} />
          ) : otherEvents.length === 0 ? (
            <p className="mx-auto max-w-xl text-center text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
              Further chapter dates and programmes will be published here when confirmed. Check{" "}
              <Link href="/notices" className="font-semibold text-[color:var(--color-brand)] underline-offset-2 hover:underline">
                Notices
              </Link>{" "}
              for formal letters and updates.
            </p>
          ) : (
            <section aria-label="More upcoming events" className="border-t border-[color:var(--color-border)] pt-10 md:pt-12">
              <h2 className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
                More upcoming events
              </h2>
              <ul className="mt-6 grid gap-6 md:grid-cols-2">
                {otherEvents.map((ev, i) => (
                  <EventCard key={ev.id} ev={ev} muted={false} staggerIndex={i % 4} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </MarketingContainer>
    </>
  );
}

function EventCard({ ev, muted, staggerIndex }: { ev: EventRow; muted: boolean; staggerIndex: number }) {
  const badge = formatDayBadge(ev.start_at);
  const banner = ev.banner_url ? ensureSupabasePublicObjectUrl(ev.banner_url) : null;

  return (
    <li>
      <Reveal staggerIndex={staggerIndex}>
        <article
          className={`group overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-sm)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-md)] ${
            muted ? "opacity-75" : ""
          }`}
        >
          <Link href={`/events/${ev.id}`} className="block focus-visible:outline-none">
            <div className="relative aspect-[21/9] bg-[color:var(--color-surface-3)]">
              {banner ? (
                <Image
                  src={banner}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw,50vw"
                  quality={90}
                />
              ) : (
                <div className="absolute inset-0 punab-hero-sheen opacity-60" aria-hidden />
              )}
              <div className="absolute left-3 top-3 rounded-[var(--radius-md)] bg-[color:var(--color-brand)] px-3 py-2 text-center text-[color:var(--color-surface)] shadow-[var(--shadow-sm)]">
                <p className="text-lg font-bold leading-none">{badge.day}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90">{badge.mon}</p>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-h3 text-[color:var(--color-text)] group-hover:text-[color:var(--color-brand)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)]">
                {ev.title}
              </h3>
              <p className="text-small mt-2 text-[color:var(--color-text-muted)]">{formatRange(ev.start_at, ev.end_at)}</p>
              {ev.location && <p className="text-small mt-1 text-[color:var(--color-text-2)]">{ev.location}</p>}
              {ev.description && (
                <p className="text-small mt-2 line-clamp-3 text-[color:var(--color-text-muted)]">{ev.description}</p>
              )}
            </div>
          </Link>
        </article>
      </Reveal>
    </li>
  );
}
