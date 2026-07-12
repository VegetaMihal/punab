import Link from "next/link";
import { notFound } from "next/navigation";
import { CertificateDetailActions } from "@/components/admin/CertificateDetailActions";
import { CertificateForm } from "@/components/admin/CertificateForm";
import { CertificateSignatureUploads } from "@/components/admin/CertificateSignatureUploads";
import { Card } from "@/components/ui/Card";
import {
  getCertificateById,
  listActiveCertificateTemplates,
  listCertificateEmailLogsByCertificateId,
} from "@/lib/repositories";

export const metadata = {
  title: "Certificate detail",
};

export default async function AdminCertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certificate = await getCertificateById(id);
  if (!certificate) {
    notFound();
  }
  const templates = await listActiveCertificateTemplates();
  const emailLogs = await listCertificateEmailLogsByCertificateId(id);

  return (
    <div className="space-y-6">
      <Link href="/admin/certificates" className="text-sm text-accent hover:underline">
        ← All certificates
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">{certificate.certificateTitle}</h1>
        <p className="mt-1 text-sm text-muted">
          {certificate.recipientName} · {certificate.status}
        </p>
      </div>

      <Card>
        <CertificateDetailActions certificate={certificate} />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Edit certificate</h2>
        <div className="mt-4">
          <CertificateForm templates={templates} initialValues={certificate} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Validator signature</h2>
        <p className="mt-1 text-sm text-muted">
          One signature image for the PDF footer. Click Generate Certificate after each change.
        </p>
        <div className="mt-4">
          <CertificateSignatureUploads certificate={certificate} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Certificate info</h2>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Field label="Certificate number" value={certificate.certificateNumber || "Not issued"} />
          <Field label="Type" value={certificate.certificateType} />
          <Field label="Reason" value={certificate.reason} />
          <Field label="Issue date" value={new Date(certificate.issueDate).toLocaleDateString("en-GB")} />
          <Field label="Verification URL" value={certificate.verificationUrl || "Not generated"} />
          <Field label="PDF URL" value={certificate.pdfUrl || "Not generated"} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Email logs</h2>
        <div className="mt-4 space-y-2 text-sm">
          {emailLogs.length === 0 && <p className="text-muted">No email attempts yet.</p>}
          {emailLogs.map((log) => (
            <div key={log.id} className="rounded-md border border-stone-200 px-3 py-2 dark:border-stone-800">
              <div className="font-medium">{log.status}</div>
              <div className="text-muted">
                {log.recipientEmail} · {new Date(log.sentAt).toLocaleString("en-GB")}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 break-all text-stone-900 dark:text-stone-100">{value}</div>
    </div>
  );
}
