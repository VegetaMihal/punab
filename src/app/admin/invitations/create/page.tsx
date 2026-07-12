import Link from "next/link";
import { JulyMemorialInvitationForm } from "@/components/admin/JulyMemorialInvitationForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Create invitation",
};

export default function CreateJulyMemorialInvitationPage() {
  return (
    <div>
      <Link href="/admin/invitations" className="text-sm text-accent hover:underline">
        ← All invitations
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Create invitation</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Save a draft first, then generate the PDF and edit guest or contact details anytime.
      </p>
      <Card className="mt-8">
        <JulyMemorialInvitationForm />
      </Card>
    </div>
  );
}
