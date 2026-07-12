"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateJulyMemorialInvitationStatus } from "@/actions/invitations";
import { contactPersonDisplayName } from "@/lib/invitations/july-memorial-schema";
import type { JulyMemorialInvitation, JulyMemorialInvitationResponseStatus } from "@/types/database";

const STATUS_OPTIONS: { value: JulyMemorialInvitationResponseStatus; label: string }[] = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NO", label: "No" },
];

const STATUS_FILTER_OPTIONS: { value: JulyMemorialInvitationResponseStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  ...STATUS_OPTIONS,
];

const STATUS_SELECT_CLASS: Record<JulyMemorialInvitationResponseStatus, string> = {
  CONFIRMED:
    "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-100",
  MAYBE:
    "border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100",
  NO: "border-red-400 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/50 dark:text-red-100",
};

const STATUS_FILTER_ACTIVE: Record<JulyMemorialInvitationResponseStatus | "ALL", string> = {
  ALL: "border-stone-400 bg-stone-100 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100",
  CONFIRMED:
    "border-emerald-500 bg-emerald-100 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-50",
  MAYBE:
    "border-amber-500 bg-amber-100 text-amber-950 dark:border-amber-600 dark:bg-amber-900/60 dark:text-amber-50",
  NO: "border-red-500 bg-red-100 text-red-950 dark:border-red-600 dark:bg-red-900/60 dark:text-red-50",
};

function contactKey(contactPerson: string): string {
  return contactPerson.trim();
}

function designationKey(designation: string): string {
  return designation.trim();
}

type Props = {
  items: JulyMemorialInvitation[];
};

export function JulyMemorialInvitationsRegistry({ items }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [contactFilter, setContactFilter] = useState<string | null>(null);
  const [designationFilter, setDesignationFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<JulyMemorialInvitationResponseStatus | "ALL">("ALL");

  const contactOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      const key = contactKey(item.contactPerson);
      if (!map.has(key)) {
        map.set(key, contactPersonDisplayName(item.contactPerson));
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const designationOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      const key = designationKey(item.recipientDesignation);
      if (key) {
        set.add(key);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "ALL" && item.responseStatus !== statusFilter) {
        return false;
      }
      if (contactFilter && contactKey(item.contactPerson) !== contactFilter) {
        return false;
      }
      if (designationFilter !== null && designationKey(item.recipientDesignation) !== designationFilter) {
        return false;
      }
      return true;
    });
  }, [items, contactFilter, designationFilter, statusFilter]);

  const hasActiveFilters =
    contactFilter !== null || designationFilter !== null || statusFilter !== "ALL";

  function onStatusChange(id: string, responseStatus: JulyMemorialInvitationResponseStatus) {
    setBusyId(id);
    startTransition(async () => {
      const result = await updateJulyMemorialInvitationStatus(id, responseStatus);
      setBusyId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Status updated");
      router.refresh();
    });
  }

  function clearFilters() {
    setContactFilter(null);
    setDesignationFilter(null);
    setStatusFilter("ALL");
  }

  if (items.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        No invitations yet.{" "}
        <Link href="/admin/invitations/create" className="text-accent hover:underline">
          Create one
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Filter by RSVP</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-accent hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === opt.value
                  ? STATUS_FILTER_ACTIVE[opt.value]
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="pt-1 text-xs font-medium uppercase tracking-wide text-muted">Filter by contact person</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setContactFilter(null)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              contactFilter === null
                ? "border-stone-500 bg-stone-200 text-stone-900 dark:border-stone-500 dark:bg-stone-700 dark:text-stone-50"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            All contacts
          </button>
          {contactOptions.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setContactFilter(key)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                contactFilter === key
                  ? "border-brand-red bg-brand-red/10 text-brand-red dark:border-brand-red dark:bg-brand-red/20 dark:text-red-200"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="pt-1 text-xs font-medium uppercase tracking-wide text-muted">Filter by guest designation</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDesignationFilter(null)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              designationFilter === null
                ? "border-stone-500 bg-stone-200 text-stone-900 dark:border-stone-500 dark:bg-stone-700 dark:text-stone-50"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            All designations
          </button>
          {designationOptions.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setDesignationFilter(label)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                designationFilter === label
                  ? "border-stone-700 bg-stone-200 text-stone-900 dark:border-stone-400 dark:bg-stone-700 dark:text-stone-50"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted">
          Showing {filteredItems.length} of {items.length} invitation{items.length === 1 ? "" : "s"}
          {contactFilter ? ` · assigned to ${contactPersonDisplayName(contactFilter)}` : ""}
          {designationFilter ? ` · ${designationFilter}` : ""}
          {statusFilter !== "ALL" ? ` · ${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}` : ""}
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-muted">No invitations match these filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-medium">Invited guest</th>
                <th className="px-4 py-3 font-medium">Assigned contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last updated</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {filteredItems.map((item) => {
                const key = contactKey(item.contactPerson);
                const isContactActive = contactFilter === key;
                const desig = designationKey(item.recipientDesignation);
                const isDesignationActive = designationFilter === desig && desig !== "";
                return (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/invitations/${item.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {item.recipientName}
                      </Link>
                      {desig ? (
                        <button
                          type="button"
                          onClick={() => setDesignationFilter(isDesignationActive ? null : desig)}
                          className={`mt-0.5 block text-left text-sm hover:underline ${
                            isDesignationActive
                              ? "font-medium text-stone-900 dark:text-stone-100"
                              : "text-muted"
                          }`}
                          title={
                            isDesignationActive
                              ? "Show all designations"
                              : `Show only ${desig} guests`
                          }
                        >
                          {item.recipientDesignation}
                        </button>
                      ) : null}
                      <p className="text-muted">{item.recipientInstitution}</p>
                    </td>
                    <td className="max-w-xs px-4 py-3 whitespace-pre-wrap text-stone-700 dark:text-stone-300">
                      <button
                        type="button"
                        onClick={() => setContactFilter(isContactActive ? null : key)}
                        className={`text-left font-medium hover:underline ${
                          isContactActive
                            ? "text-brand-red dark:text-red-300"
                            : "text-accent dark:text-red-300"
                        }`}
                        title={isContactActive ? "Show all contacts" : "Show only guests for this contact"}
                      >
                        {contactPersonDisplayName(item.contactPerson)}
                      </button>
                      {item.contactPerson.includes("\n") ? (
                        <p className="mt-1 text-xs text-muted">
                          {item.contactPerson.split("\n").slice(1).join("\n").trim()}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.responseStatus}
                        disabled={pending && busyId === item.id}
                        onChange={(e) =>
                          onStatusChange(item.id, e.target.value as JulyMemorialInvitationResponseStatus)
                        }
                        className={`rounded-lg border px-2 py-1.5 text-sm font-medium ${STATUS_SELECT_CLASS[item.responseStatus]}`}
                        aria-label={`RSVP status for ${item.recipientName}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(item.updatedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/invitations/${item.id}`}
                        className="text-sm text-accent hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
