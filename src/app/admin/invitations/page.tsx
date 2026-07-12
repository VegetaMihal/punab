import Link from "next/link";
import { JulyMemorialInvitationsRegistry } from "@/components/admin/JulyMemorialInvitationsRegistry";
import { listJulyMemorialInvitationsAdmin } from "@/lib/repositories/july-memorial-invitations-repository";

export const metadata = {
  title: "July Memorial invitations",
};

export default async function AdminJulyInvitationsPage() {
  const registry = await listJulyMemorialInvitationsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">July Uprising Memorial Award — invitations</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Create a draft, generate the PDF, then edit guest and contact details on the detail page — same flow as certificates.
          </p>
        </div>
        <Link
          href="/admin/invitations/create"
          className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          Create invitation
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Invitation registry</h2>
        <p className="mt-1 text-sm text-muted">
          Track invited guests, assigned contacts, and RSVP status. Open a row to edit or regenerate the PDF.
        </p>
        <JulyMemorialInvitationsRegistry items={registry} />
      </section>
    </div>
  );
}
