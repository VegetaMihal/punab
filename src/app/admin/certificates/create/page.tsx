import Link from "next/link";
import { CertificateForm } from "@/components/admin/CertificateForm";
import { Card } from "@/components/ui/Card";
import { getCertificateLogoSource } from "@/lib/certificates/logo";
import { renderCertificateTemplatePreviewHtml } from "@/lib/certificates/templates";
import { listActiveCertificateTemplates } from "@/lib/repositories";

export const metadata = {
  title: "Create certificate",
};

export default async function CreateCertificatePage() {
  const templates = await listActiveCertificateTemplates();
  const logoSrc = await getCertificateLogoSource();
  const templatesWithPreview = templates.map((t) => {
    try {
      return { ...t, previewHtml: renderCertificateTemplatePreviewHtml(t, logoSrc) };
    } catch {
      return { ...t };
    }
  });

  return (
    <div>
      <Link href="/admin/certificates" className="text-sm text-accent hover:underline">
        ← All certificates
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Create certificate</h1>
      <Card className="mt-8 max-w-5xl">
        <CertificateForm templates={templatesWithPreview} />
      </Card>
    </div>
  );
}
