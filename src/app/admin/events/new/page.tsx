import Link from "next/link";
import { EventForm } from "@/components/admin/EventForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "New event",
};

export default function NewEventPage() {
  return (
    <div>
      <Link href="/admin/events" className="text-sm text-accent hover:underline">
        ← All events
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New event</h1>
      <Card className="mt-8 max-w-2xl">
        <EventForm />
      </Card>
    </div>
  );
}
