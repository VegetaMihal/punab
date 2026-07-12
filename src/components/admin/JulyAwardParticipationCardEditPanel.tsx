"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  updateJulyAwardClubCardAdmin,
  type UpdateJulyAwardClubCardAdminState,
} from "@/actions/july-award-participation-card-admin";
import { Button } from "@/components/ui/Button";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";
import type { JulyAwardClubCardRow } from "@/types/database";

type Props = {
  item: JulyAwardClubCardRow;
  onClose: () => void;
  onSaved: () => void;
};

export function JulyAwardParticipationCardEditPanel({ item, onClose, onSaved }: Props) {
  const [state, formAction, pending] = useActionState(
    updateJulyAwardClubCardAdmin,
    undefined as UpdateJulyAwardClubCardAdminState | undefined
  );
  const logoUrl = ensureSupabasePublicObjectUrl(item.logo_url);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Entry updated. Public participation card will use the new details.");
      onSaved();
      return;
    }
    toast.error(state.error);
  }, [state, onSaved]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="july-participation-edit-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <EditPanelHeader
          id="july-participation-edit-title"
          title="Edit club entry"
          subtitle="Updates the public participation card when clubs return from registration."
          onClose={onClose}
        />

        <form action={formAction} className="space-y-4 px-5 py-5">
          <input type="hidden" name="id" value={item.id} />

          <div>
            <label htmlFor="edit-club-name" className="block text-sm font-medium text-stone-900 dark:text-stone-100">
              Club name
            </label>
            <input
              id="edit-club-name"
              name="clubName"
              required
              defaultValue={item.club_name}
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>

          <div>
            <label htmlFor="edit-university" className="block text-sm font-medium text-stone-900 dark:text-stone-100">
              University
            </label>
            <input
              id="edit-university"
              name="universityName"
              required
              defaultValue={item.university_name}
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">Current logo</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt=""
              className="mt-2 h-16 w-16 rounded-full border border-stone-200 object-contain bg-white p-1 dark:border-stone-700"
            />
          </div>

          <div>
            <label htmlFor="edit-logo-file" className="block text-sm font-medium text-stone-900 dark:text-stone-100">
              Replace logo (optional)
            </label>
            <input
              id="edit-logo-file"
              name="logoFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold dark:file:bg-stone-800"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPanelHeader({
  id,
  title,
  subtitle,
  onClose,
}: {
  id: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-700">
      <div>
        <h2 id={id} className="text-lg font-semibold text-stone-900 dark:text-stone-50">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-sm text-muted hover:bg-stone-100 dark:hover:bg-stone-800"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
