import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SmartBackLink } from "@/components/ui/SmartBackLink";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedEventById } from "@/lib/repositories/events-repository";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";

type Props = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const ev = await getPublishedEventById(id);

  if (!ev) {
    notFound();
  }

  const start = new Date(ev.start_at);
  const end = ev.end_at ? new Date(ev.end_at) : null;
  const fmt = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" });
  const banner = ev.banner_url ? ensureSupabasePublicObjectUrl(ev.banner_url) : null;

  return (
    <>
      <PageHeader title={ev.title} />
      {banner && (
        <div className="relative mx-auto aspect-[21/9] w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative h-full min-h-[140px] w-full overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-3)] shadow-[var(--shadow-sm)] sm:min-h-[180px]">
            <Image
              src={banner}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 64rem"
              priority
              quality={90}
            />
          </div>
        </div>
      )}
      <MarketingContainer maxWidth="3xl" className="py-10">
        <p className="text-sm text-muted">
          {fmt(start)}
          {end ? ` — ${fmt(end)}` : ""}
        </p>
        {ev.location && <p className="mt-2 text-stone-800 dark:text-stone-200">{ev.location}</p>}
        {ev.description && (
          <div className="mt-6 max-w-none text-stone-700 dark:text-stone-300">
            <p className="whitespace-pre-wrap">{ev.description}</p>
          </div>
        )}
        {ev.post_url ? (
          <div className="mt-6">
            <Button variant="primary" size="md" href={ev.post_url} target="_blank" rel="noopener noreferrer">
              View Event
            </Button>
          </div>
        ) : null}
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
