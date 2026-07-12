"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Certificate } from "@/types/database";

type Props = {
  items: Certificate[];
};

export function AdminCertificatesTable({ items }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const allSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [items.length, selectedIds.length],
  );

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelectedIds((prev) => (prev.length === items.length ? [] : items.map((i) => i.id)));
  }

  async function runBulk(action: "issue" | "send" | "revoke" | "archive" | "delete") {
    if (selectedIds.length === 0) {
      toast.error("Select at least one certificate");
      return;
    }
    const actionLabel =
      action === "issue"
        ? "generate PDFs for"
        : action === "send"
          ? "send emails for"
          : action === "revoke"
            ? "revoke"
              : action === "archive"
                ? "archive"
                : "delete";
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${selectedIds.length} selected certificate(s)?`)) {
      return;
    }
    setBusy(action);
    try {
      if (action === "archive" || action === "revoke" || action === "delete") {
        const res = await fetch("/api/admin/certificates/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
            action,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string; count?: number };
        if (!res.ok) {
          toast.error(data.error || `Bulk ${action} failed`);
          return;
        }
        toast.success(`Bulk ${action} done (${data.count ?? 0})`);
        setSelectedIds([]);
        router.refresh();
        return;
      }

      let ok = 0;
      for (const id of selectedIds) {
        const endpoint =
          action === "issue"
            ? `/api/admin/certificates/${id}/generate-pdf`
            : `/api/admin/certificates/${id}/send-email`;
        const res = await fetch(endpoint, { method: "POST" });
        if (res.ok) {
          ok += 1;
        }
      }
      toast.success(`Bulk ${action} done (${ok}/${selectedIds.length})`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error(`Bulk ${action} failed`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 px-4 py-3 dark:border-stone-800">
        <button
          type="button"
          onClick={() => void runBulk("issue")}
          disabled={Boolean(busy)}
          className="rounded-md border border-stone-300 px-3 py-1 text-sm dark:border-stone-700"
        >
          {busy === "issue" ? "Issuing..." : "Bulk Issue"}
        </button>
        <button
          type="button"
          onClick={() => void runBulk("send")}
          disabled={Boolean(busy)}
          className="rounded-md border border-stone-300 px-3 py-1 text-sm dark:border-stone-700"
        >
          {busy === "send" ? "Sending..." : "Bulk Send Email"}
        </button>
        <button
          type="button"
          onClick={() => void runBulk("revoke")}
          disabled={Boolean(busy)}
          className="rounded-md border border-red-400 px-3 py-1 text-sm text-red-700 dark:text-red-300"
        >
          {busy === "revoke" ? "Revoking..." : "Bulk Revoke"}
        </button>
        <button
          type="button"
          onClick={() => void runBulk("archive")}
          disabled={Boolean(busy)}
          className="rounded-md border border-stone-300 px-3 py-1 text-sm dark:border-stone-700"
        >
          {busy === "archive" ? "Archiving..." : "Bulk Archive"}
        </button>
        <button
          type="button"
          onClick={() => void runBulk("delete")}
          disabled={Boolean(busy)}
          className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-700 dark:text-red-300"
        >
          {busy === "delete" ? "Deleting..." : "Bulk Delete"}
        </button>
      </div>
      <table className="min-w-full text-sm">
        <thead className="border-b border-stone-200 text-left dark:border-stone-800">
          <tr>
            <th className="px-4 py-3">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all certificates" />
            </th>
            <th className="px-4 py-3">Certificate No</th>
            <th className="px-4 py-3">Recipient</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Event / Program</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Issue date</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-stone-100 dark:border-stone-800/80">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggle(item.id)}
                  aria-label={`Select ${item.recipientName}`}
                />
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/certificates/${item.id}`} className="text-accent hover:underline">
                  {item.certificateNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{item.recipientName}</td>
              <td className="px-4 py-3">{item.certificateTitle}</td>
              <td className="px-4 py-3">{item.certificateType}</td>
              <td className="px-4 py-3">{item.eventName || "-"}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">{new Date(item.issueDate).toLocaleDateString("en-GB")}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/certificates/${item.id}`} className="text-accent hover:underline">
                    View
                  </Link>
                  <a
                    href={item.pdfUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`${item.pdfUrl ? "text-stone-700 hover:underline dark:text-stone-300" : "pointer-events-none text-stone-400"}`}
                  >
                    Download PDF
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
