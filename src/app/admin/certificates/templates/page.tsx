import Link from "next/link";
import { CertificateTemplatesManager } from "@/components/admin/CertificateTemplatesManager";
import { Card } from "@/components/ui/Card";
import { listCertificateTemplatesAdmin } from "@/lib/repositories";

export const metadata = {
  title: "Certificate templates",
};

export default async function CertificateTemplatesPage() {
  const templates = await listCertificateTemplatesAdmin();

  return (
    <div>
      <Link href="/admin/certificates" className="text-sm text-accent hover:underline">
        ← All certificates
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Certificate templates</h1>
      <Card className="mt-6">
        <CertificateTemplatesManager initialTemplates={templates} />
      </Card>
    </div>
  );
}
