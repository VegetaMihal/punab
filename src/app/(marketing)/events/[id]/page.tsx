import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SmartBackLink } from "@/components/ui/SmartBackLink";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedEventById } from "@/lib/repositories/events-repository";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";
import { Reveal } from "@/components/ui/Reveal";

type Props = { params: Promise<{ id: string }> };

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
      <path d="M12 21s7-6.2 7-11.6A7 7 0 0 0 5 9.4C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.4" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function statusBadge(start: Date, end: Date | null) {
  const now = new Date();
  const effectiveEnd = end ?? start;
  if (now < start) {
    return { label: "Upcoming", tone: "brand" as const };
  }
  if (now >= start && now <= effectiveEnd) {
    return { label: "Happening now", tone: "live" as const };
  }
  return { label: "Past event", tone: "muted" as const };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const ev = await getPublishedEventById(id);

  if (!ev) {
    notFound();
  }

  const start = new Date(ev.start_at);
  const end = ev.end_at ? new Date(ev.end_at) : null;
  const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtTime = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const banner = ev.banner_url ? ensureSupabasePublicObjectUrl(ev.banner_url) : null;
  const badge = statusBadge(start, end);
  const paragraphs = ev.description ? ev.description.split(/\n{2,}/).filter((p) => p.trim()) : [];

  const badgeToneClass = {
    brand: "bg-[color:var(--color-brand)] text-white",
    live: "bg-[color:var(--color-success,#16a34a)] text-white",
    muted: "bg-[color:var(--color-surface-3)] text-[color:var(--color-text-muted)]",
  }[badge.tone];

  return (
    <>
      <PageHeader title={ev.title} tone="pattern" />

      <MarketingContainer maxWidth="3xl" className="py-10">
        <Reveal>
          <div className="relative -mt-2 mb-8">
            <div
              className={
                banner
                  ? "relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[color:var(--color-border)] shadow-[var(--shadow-md)]"
                  : "relative flex aspect-[21/9] w-full items-center overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[linear-gradient(135deg,var(--color-brand)_0%,color-mix(in_srgb,var(--color-brand)_55%,black)_100%)] shadow-[var(--shadow-md)]"
              }
            >
              {banner ? (
                <Image src={banner} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 64rem" priority quality={90} />
              ) : (
                <>
                  <div className="pointer-events-none absolute top-1/2 -right-6 h-[130%] w-[45%] min-w-40 -translate-y-1/2 sm:-right-2">
                    <Image src="/images/mun-globe-watermark.png" alt="" fill className="object-contain" sizes="20rem" priority />
                  </div>
                  <span className="relative max-w-[60%] px-6 text-left text-h4 font-bold leading-tight text-white sm:px-8 sm:text-h3">
                    {ev.title}
                  </span>
                </>
              )}
            </div>
            <span
              className={`absolute top-4 left-4 rounded-full px-3 py-1 text-small font-bold shadow-[var(--shadow-sm)] ${badgeToneClass}`}
            >
              {badge.label}
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Reveal staggerIndex={0}>
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
              <span className="mt-0.5 text-[color:var(--color-brand)]">
                <CalendarIcon />
              </span>
              <div>
                <p className="text-small font-semibold text-[color:var(--color-text)]">{fmtDate(start)}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-small text-[color:var(--color-text-muted)]">
                  <ClockIcon />
                  {fmtTime(start)}
                  {end ? ` – ${end.toDateString() !== start.toDateString() ? fmtDate(end) + " " : ""}${fmtTime(end)}` : ""}
                </p>
              </div>
            </div>
          </Reveal>
          {ev.location && (
            <Reveal staggerIndex={1}>
              <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <span className="mt-0.5 text-[color:var(--color-brand)]">
                  <PinIcon />
                </span>
                <div>
                  <p className="text-small font-semibold text-[color:var(--color-text)]">Venue</p>
                  <p className="mt-0.5 text-small text-[color:var(--color-text-muted)]">{ev.location}</p>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {paragraphs.length > 0 && (
          <Reveal>
            <div className="mt-8 space-y-4 text-body leading-relaxed text-[color:var(--color-text-2)]">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[color:var(--color-border)] pt-8">
            {ev.post_url && (
              <Button
                variant="primary"
                size="md"
                href={ev.post_url}
                {...(ev.post_url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                View Event
              </Button>
            )}
          </div>
        </Reveal>

        <SmartBackLink
          fallbackHref="/events"
          className="mt-8 inline-block text-sm font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← All events
        </SmartBackLink>
      </MarketingContainer>
    </>
  );
}
