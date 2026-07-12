import Link from "next/link";
import { notFound } from "next/navigation";
import { JulyMemorialInvitationDetailActions } from "@/components/admin/JulyMemorialInvitationDetailActions";
import { JulyMemorialInvitationForm } from "@/components/admin/JulyMemorialInvitationForm";
import { Card } from "@/components/ui/Card";
import { getJulyMemorialInvitationById } from "@/lib/repositories/july-memorial-invitations-repository";

export const metadata = {
  title: "Invitation detail",
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  MAYBE: "Maybe",
  NO: "No",
};

export default async function JulyMemorialInvitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invitation = await getJulyMemorialInvitationById(id);
  if (!invitation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/invitations" className="text-sm text-accent hover:underline">
        ← All invitations
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">{invitation.recipientName}</h1>
        <p className="mt-1 text-sm text-muted">
          {invitation.recipientInstitution} · RSVP {STATUS_LABEL[invitation.responseStatus] ?? invitation.responseStatus}
        </p>
      </div>

      <Card>
        <JulyMemorialInvitationDetailActions invitation={invitation} />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Edit invitation</h2>
        <p className="mt-1 text-sm text-muted">Contact person and special contact both appear on the printed card.</p>
        <div className="mt-4">
          <JulyMemorialInvitationForm initialValues={invitation} />
        </div>
      </Card>
    </div>
  );
}
