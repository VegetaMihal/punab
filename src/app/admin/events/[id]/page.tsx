import Link from "next/link";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";
import { Card } from "@/components/ui/Card";
import { getEventAdmin } from "@/lib/repositories/events-repository";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventAdmin(id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-accent hover:underline">
        ← All events
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit event</h1>
      <Card className="mt-8 max-w-2xl">
        <EventForm event={event} />
      </Card>
    </div>
  );
}
