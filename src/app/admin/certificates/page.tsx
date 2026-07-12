import Link from "next/link";
import { AdminCertificatesTable } from "@/components/admin/AdminCertificatesTable";
import { CERTIFICATE_TYPES } from "@/lib/certificates/constants";
import { listCertificatesAdmin } from "@/lib/repositories";

export const metadata = {
  title: "Certificates",
};

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    from?: string;
    to?: string;
    event?: string;
    recipient?: string;
  }>;
}) {
  const filters = await searchParams;
  const items = await listCertificatesAdmin({
    query: filters.q,
    status: (filters.status as "DRAFT" | "ISSUED" | "EMAILED" | "REVOKED" | "ARCHIVED" | undefined) ?? undefined,
    certificateType: filters.type,
    eventName: filters.event,
    recipientName: filters.recipient,
    fromDate: filters.from ? new Date(filters.from) : undefined,
    toDate: filters.to ? new Date(filters.to) : undefined,
  });
  const allItems = await listCertificatesAdmin();
  const eventOptions = [...new Set(allItems.map((item) => item.eventName?.trim()).filter(Boolean))] as string[];
  const recipientOptions = [...new Set(allItems.map((item) => item.recipientName?.trim()).filter(Boolean))] as string[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Certificates</h1>
          <p className="mt-1 text-sm text-muted">Manage generated and draft certificates.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/certificates/templates"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm dark:border-stone-700"
          >
            Templates
          </Link>
          <Link
            href="/admin/certificates/create"
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
          >
            Create certificate
          </Link>
        </div>
      </div>

      <form className="mt-6 grid gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 md:grid-cols-4">
        <input
          name="q"
          placeholder="Search by name, title, number..."
          defaultValue={filters.q ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
        />
        <select
          name="status"
          aria-label="Filter by status"
          defaultValue={filters.status ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="">All status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ISSUED">ISSUED</option>
          <option value="EMAILED">EMAILED</option>
          <option value="REVOKED">REVOKED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <select
          name="type"
          aria-label="Filter by certificate type"
          defaultValue={filters.type ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="">All types</option>
          {CERTIFICATE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          name="recipient"
          aria-label="Filter by recipient"
          defaultValue={filters.recipient ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="">All recipients</option>
          {recipientOptions.map((recipient) => (
            <option key={recipient} value={recipient}>
              {recipient}
            </option>
          ))}
        </select>
        <select
          name="event"
          aria-label="Filter by event or program"
          defaultValue={filters.event ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="">All events / programs</option>
          {eventOptions.map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
        <input
          name="from"
          type="date"
          aria-label="Issue date from"
          defaultValue={filters.from ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
        />
        <input
          name="to"
          type="date"
          aria-label="Issue date to"
          defaultValue={filters.to ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
        />
        <button className="rounded-md bg-stone-900 px-3 py-2 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900">
          Apply filters
        </button>
      </form>

      <AdminCertificatesTable items={items} />
    </div>
  );
}
