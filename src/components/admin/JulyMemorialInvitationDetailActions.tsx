"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { JulyMemorialInvitation } from "@/types/database";

export function JulyMemorialInvitationDetailActions({ invitation }: { invitation: JulyMemorialInvitation }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function generatePdf() {
    setBusy("generate");
    try {
      const res = await fetch(`/api/admin/invitations/july-memorial-award/${invitation.id}/generate-pdf`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || res.statusText || "Request failed");
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const m = cd?.match(/filename="([^"]+)"/);
      const name = m?.[1] ?? "punab-invitation.pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Invitation PDF generated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void generatePdf()}
        disabled={Boolean(busy)}
        className="rounded-md bg-brand-red px-3 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60"
      >
        {busy === "generate" ? "Generating…" : "Generate Invitation PDF"}
      </button>
      <button
        type="button"
        onClick={() => void generatePdf()}
        disabled={Boolean(busy) || !invitation.pdfGeneratedAt}
        className={`rounded-md border px-3 py-2 text-sm ${
          invitation.pdfGeneratedAt
            ? "border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
            : "pointer-events-none border-stone-200 opacity-50 dark:border-stone-800"
        }`}
      >
        Download PDF
      </button>
      {invitation.pdfGeneratedAt ? (
        <span className="text-xs text-muted">
          Last generated {new Date(invitation.pdfGeneratedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </span>
      ) : (
        <span className="text-xs text-muted">Generate once to enable download</span>
      )}
      <button
        type="button"
        onClick={async () => {
          if (
            !window.confirm(
              `Delete invitation for ${invitation.recipientName}? This cannot be undone.`,
            )
          ) {
            return;
          }
          setBusy("delete");
          try {
            const res = await fetch(`/api/admin/invitations/july-memorial-award/${invitation.id}`, {
              method: "DELETE",
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
              toast.error(data.error || "Delete failed");
              return;
            }
            toast.success("Invitation deleted");
            router.push("/admin/invitations");
            router.refresh();
          } catch {
            toast.error("Delete failed");
          } finally {
            setBusy(null);
          }
        }}
        disabled={Boolean(busy)}
        className="rounded-md border border-red-500 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/20"
      >
        {busy === "delete" ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
