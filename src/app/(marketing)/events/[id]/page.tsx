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
  // assumed: matched by title since Event has no dedicated "registration form" link field — adjust the match if the event title changes
  const isBabbfChampionship = /babbf|armwrestl/i.test(ev.title);

  const badgeToneClass = {
    brand: "bg-[#c41e3a] text-[#fffaf2]",
    live: "bg-[#1f8a5b] text-white",
    muted: "bg-[#d8d2c3] text-[#3a382f]",
  }[badge.tone];

  return (
    <>
      <PageHeader title={ev.title} tone="pattern" />

      <MarketingContainer maxWidth="3xl" className="py-10">
        <Reveal>
          <div className="wall-sheet relative mb-10 -mt-2 -rotate-1 p-2 pt-5">
            <div
              className={
                banner
                  ? "relative aspect-[21/9] w-full overflow-hidden"
                  : "relative flex aspect-[21/9] w-full items-center overflow-hidden bg-[#a5182f]"
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
              className={`absolute top-6 left-5 px-3 py-1 text-small font-extrabold uppercase tracking-wide ${badgeToneClass}`}
            >
              {badge.label}
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Reveal staggerIndex={0}>
            <div className="wall-sheet wall-text flex items-start gap-3 p-5 pt-7">
              <span className="mt-0.5 text-[#c41e3a]">
                <CalendarIcon />
              </span>
              <div>
                <p className="text-small font-extrabold text-[#1b1a17]">{fmtDate(start)}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-small text-[#3a382f]">
                  <ClockIcon />
                  {fmtTime(start)}
                  {end ? ` – ${end.toDateString() !== start.toDateString() ? fmtDate(end) + " " : ""}${fmtTime(end)}` : ""}
                </p>
              </div>
            </div>
          </Reveal>
          {ev.location && (
            <Reveal staggerIndex={1}>
              <div className="wall-sheet wall-text flex items-start gap-3 p-5 pt-7">
                <span className="mt-0.5 text-[#c41e3a]">
                  <PinIcon />
                </span>
                <div>
                  <p className="text-small font-extrabold text-[#1b1a17]">Venue</p>
                  <p className="mt-0.5 text-small text-[#3a382f]">{ev.location}</p>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {paragraphs.length > 0 && (
          <Reveal>
            <div className="mt-8 space-y-4 wall-text text-body leading-relaxed text-[color:var(--wall-chalk,#efeae0)]">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-10 flex flex-wrap items-center gap-3 pt-4">
            {isBabbfChampionship && (
              <>
                <Button variant="primary" size="md" href="/babbf-championship-2026/register?event=bodybuilding">
                  Register — Bodybuilding
                </Button>
                <Button variant="primary" size="md" href="/babbf-championship-2026/register?event=armwrestling">
                  Register — Armwrestling
                </Button>
              </>
            )}
            {ev.post_url && (
              <Button
                variant={isBabbfChampionship ? "secondary" : "primary"}
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
          className="wall-link mt-8 inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← All events
        </SmartBackLink>
      </MarketingContainer>
    </>
  );
}
