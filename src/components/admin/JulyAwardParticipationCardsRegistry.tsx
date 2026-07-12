"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteJulyAwardClubCardAdmin } from "@/actions/july-award-participation-card-admin";
import { JulyAwardParticipationCardAdminPanel } from "@/components/admin/JulyAwardParticipationCardAdminPanel";
import { JulyAwardParticipationCardEditPanel } from "@/components/admin/JulyAwardParticipationCardEditPanel";
import { isJulyAwardDebateClubCard } from "@/lib/marketing/july-award-debate";
import type { JulyAwardClubCardRow } from "@/types/database";

type Props = {
  items: JulyAwardClubCardRow[];
};

function formatSubmittedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function JulyAwardParticipationCardsRegistry({ items }: Props) {
  const router = useRouter();
  const [generateId, setGenerateId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<JulyAwardClubCardRow | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [clubQuery, setClubQuery] = useState("");
  const [universityQuery, setUniversityQuery] = useState("");

  const filteredItems = items.filter((item) => {
    const clubMatch = item.club_name.toLowerCase().includes(clubQuery.trim().toLowerCase());
    const universityMatch = item.university_name.toLowerCase().includes(universityQuery.trim().toLowerCase());
    return clubMatch && universityMatch;
  });

  if (items.length === 0) {
    return (
      <p className="mt-6 rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-muted dark:border-stone-700">
        No club nominations saved yet. Entries appear here after a club submits the July Award nomination form.
      </p>
    );
  }

  function onDelete(item: JulyAwardClubCardRow) {
    if (
      !confirm(
        `Delete "${item.club_name}" at ${item.university_name}? This removes the Supabase record, uploaded logo/PDF files, and matching Google Sheet rows (nomination + partner number).`
      )
    ) {
      return;
    }
    startDelete(async () => {
      const res = await deleteJulyAwardClubCardAdmin({ id: item.id });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Entry deleted.");
      if (generateId === item.id) setGenerateId(null);
      if (editItem?.id === item.id) setEditItem(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={clubQuery}
          onChange={(e) => setClubQuery(e.target.value)}
          placeholder="Search by club..."
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <input
          type="text"
          value={universityQuery}
          onChange={(e) => setUniversityQuery(e.target.value)}
          placeholder="Search by university..."
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
      </div>

      {filteredItems.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-muted dark:border-stone-700">
          No entries match your search.
        </p>
      ) : (
      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
        <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-700">
          <thead className="bg-stone-50 dark:bg-stone-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-stone-900 dark:text-stone-100">Club</th>
              <th className="px-4 py-3 text-left font-semibold text-stone-900 dark:text-stone-100">University</th>
              <th className="px-4 py-3 text-left font-semibold text-stone-900 dark:text-stone-100">Partnership</th>
              <th className="px-4 py-3 text-left font-semibold text-stone-900 dark:text-stone-100">Submitted</th>
              <th className="px-4 py-3 text-right font-semibold text-stone-900 dark:text-stone-100">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-950">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-900/50">
                <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">{item.club_name}</td>
                <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{item.university_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-700 dark:text-stone-300">
                  {isJulyAwardDebateClubCard(item)
                    ? item.partner_label ?? "Debate Forum"
                    : "AP (sheet)"}
                </td>
                <td className="px-4 py-3 text-muted">{formatSubmittedAt(item.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-brand-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red/90"
                      onClick={() => setGenerateId(item.id)}
                    >
                      Generate
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-100 dark:hover:bg-stone-800"
                      onClick={() => setEditItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletePending}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      onClick={() => onDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {generateId ? (
        <JulyAwardParticipationCardAdminPanel entryId={generateId} onClose={() => setGenerateId(null)} />
      ) : null}

      {editItem ? (
        <JulyAwardParticipationCardEditPanel
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
