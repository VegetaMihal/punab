"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Certificate } from "@/types/database";

export function CertificateDetailActions({ certificate }: { certificate: Certificate }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function runAction(
    label: string,
    url: string,
    body?: Record<string, unknown>,
    method: "POST" | "PATCH" | "DELETE" = "POST",
  ) {
    setBusy(label);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || `${label} failed`);
        return;
      }
      toast.success(`${label} completed`);
      router.refresh();
    } catch {
      toast.error(`${label} failed`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => runAction("Generate Certificate", `/api/admin/certificates/${certificate.id}/generate-pdf`)}
        className="rounded-md bg-brand-red px-3 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        disabled={Boolean(busy)}
      >
        {busy === "Generate Certificate" ? "Generating..." : "Generate Certificate"}
      </button>
      <a
        href={certificate.pdfUrl ?? "#"}
        target="_blank"
        rel="noreferrer"
        className={`rounded-md border px-3 py-2 text-sm ${certificate.pdfUrl ? "border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800" : "pointer-events-none border-stone-200 opacity-50 dark:border-stone-800"}`}
      >
        Download PDF
      </a>
      <button
        type="button"
        onClick={() => runAction("Send Email", `/api/admin/certificates/${certificate.id}/send-email`)}
        className="rounded-md border border-stone-300 px-3 py-2 text-sm hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
        disabled={Boolean(busy) || !certificate.recipientEmail}
      >
        {busy === "Send Email" ? "Sending..." : "Send Email"}
      </button>
      <button
        type="button"
        onClick={() => {
          const reason = window.prompt("Revocation reason (optional):") ?? "";
          void runAction("Revoke", `/api/admin/certificates/${certificate.id}/revoke`, { reason });
        }}
        className="rounded-md border border-red-400 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/20"
        disabled={Boolean(busy)}
      >
        {busy === "Revoke" ? "Revoking..." : "Revoke"}
      </button>
      <button
        type="button"
        onClick={() => void runAction("Unrevoke", `/api/admin/certificates/${certificate.id}/unrevoke`)}
        className="rounded-md border border-emerald-400 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/20"
        disabled={Boolean(busy) || certificate.status !== "REVOKED"}
      >
        {busy === "Unrevoke" ? "Restoring..." : "Unrevoke"}
      </button>
      <button
        type="button"
        onClick={() =>
          void runAction("Archive", `/api/admin/certificates/${certificate.id}`, { status: "ARCHIVED" }, "PATCH")
        }
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        disabled={Boolean(busy)}
      >
        {busy === "Archive" ? "Archiving..." : "Archive"}
      </button>
      <button
        type="button"
        onClick={async () => {
          if (!window.confirm("Delete this certificate? Only DRAFT or ARCHIVED can be deleted.")) {
            return;
          }
          setBusy("Delete");
          try {
            const res = await fetch(`/api/admin/certificates/${certificate.id}`, { method: "DELETE" });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
              toast.error(data.error || "Delete failed");
              return;
            }
            toast.success("Deleted");
            router.push("/admin/certificates");
            router.refresh();
          } catch {
            toast.error("Delete failed");
          } finally {
            setBusy(null);
          }
        }}
        className="rounded-md border border-red-500 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/20"
        disabled={Boolean(busy)}
      >
        {busy === "Delete" ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
