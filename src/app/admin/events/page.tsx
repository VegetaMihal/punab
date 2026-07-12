import Link from "next/link";
import { DeleteEventButton } from "@/components/admin/DeleteEventButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { listEventsAdmin } from "@/lib/repositories/events-repository";
import type { EventRow } from "@/types/database";

export const metadata = {
  title: "Events",
};

export default async function AdminEventsPage() {
  let events: EventRow[] = [];
  let error: string | null = null;
  try {
    events = await listEventsAdmin();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Events</h1>
          <p className="mt-1 text-sm text-muted">Manage public events.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          New event
        </Link>
      </div>
      <div className="mt-8 space-y-3">
        {error && <EmptyState title="Error" description={error} />}
        {!error && events.length === 0 && <EmptyState title="No events" description="Create your first event." />}
        {!error &&
          events.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                <Link href={`/admin/events/${ev.id}`} className="font-medium text-stone-900 hover:underline dark:text-stone-50">
                  {ev.title}
                </Link>
                <p className="text-xs text-muted">
                  {ev.is_published ? "Published" : "Draft"} · {new Date(ev.start_at).toLocaleString("en-GB")}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                {ev.is_published ? (
                  <Button
                    variant="primary"
                    size="sm"
                    href={`/events/${ev.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Event
                  </Button>
                ) : (
                  <span
                    className="inline-flex min-h-[2.25rem] cursor-not-allowed items-center rounded-[var(--radius-full)] border border-dashed border-[color:var(--color-border-strong)] px-3 text-sm font-semibold text-muted opacity-80"
                    title="Publish this event to enable the public page."
                  >
                    View Event
                  </span>
                )}
                <DeleteEventButton id={ev.id} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
