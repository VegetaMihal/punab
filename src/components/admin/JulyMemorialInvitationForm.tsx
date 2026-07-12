"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  freshJulyMemorialInvitationDefaults,
  julyMemorialInvitationRowToInput,
  normalizeJulyMemorialInvitationInput,
  type JulyMemorialInvitationInput,
} from "@/lib/invitations/july-memorial-schema";
import type { JulyMemorialInvitation } from "@/types/database";

function Field({
  label,
  value,
  onChange,
  rows,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  const common =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      {hint ? <p className="mb-1 text-xs text-muted">{hint}</p> : null}
      {rows ? (
        <textarea rows={rows} className={common} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" className={common} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

type Props = {
  initialValues?: JulyMemorialInvitation;
};

export function JulyMemorialInvitationForm({ initialValues }: Props) {
  const router = useRouter();
  const isEditMode = Boolean(initialValues?.id);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<JulyMemorialInvitationInput>(() =>
    initialValues
      ? julyMemorialInvitationRowToInput(initialValues)
      : normalizeJulyMemorialInvitationInput(freshJulyMemorialInvitationDefaults()),
  );

  function patch<K extends keyof JulyMemorialInvitationInput>(key: K, value: JulyMemorialInvitationInput[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = isEditMode
        ? `/api/admin/invitations/july-memorial-award/${initialValues!.id}`
        : "/api/admin/invitations/july-memorial-award";
      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json()) as {
        item?: { id: string };
        created?: boolean;
        error?: string;
        fieldErrors?: Record<string, string[] | undefined>;
      };
      if (!res.ok || !body.item) {
        const firstFieldError = body.fieldErrors
          ? Object.values(body.fieldErrors).find((arr) => Array.isArray(arr) && arr.length > 0)?.[0]
          : undefined;
        toast.error(firstFieldError || body.error || "Save failed");
        return;
      }
      toast.success(
        isEditMode
          ? "Invitation updated"
          : body.created === false
            ? "Guest already in registry — opened existing record"
            : "Invitation draft saved",
      );
      if (isEditMode) {
        router.refresh();
      } else {
        router.push(`/admin/invitations/${body.item.id}`);
        router.refresh();
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-xl space-y-6">
      <div className="space-y-4 rounded-xl border border-stone-200 p-4 dark:border-stone-800">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Presented to</h3>
        <Field label="Name" value={data.recipientName} onChange={(v) => patch("recipientName", v)} />
        <Field label="Designation" value={data.recipientDesignation} onChange={(v) => patch("recipientDesignation", v)} />
        <Field label="Institution name" value={data.recipientInstitution} onChange={(v) => patch("recipientInstitution", v)} />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.isChiefGuest}
            onChange={(e) => patch("isChiefGuest", e.target.checked)}
          />
          <span className="text-stone-900 dark:text-stone-100">Chief Guest (large guest card)</span>
        </label>
      </div>

      <div className="space-y-4 rounded-xl border border-stone-200 p-4 dark:border-stone-800">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Contact blocks</h3>
        <p className="text-xs text-muted">
          Both boxes print side by side on the card. Line 1 = phone &amp; name; line 2 = role.
        </p>
        <Field
          label="Contact person"
          hint="Left column — CONTACT PERSON"
          value={data.contactPerson}
          onChange={(v) => patch("contactPerson", v)}
          rows={4}
        />
        <Field
          label="Special contact"
          hint="Right column — SPECIAL CONTACT"
          value={data.specialContact}
          onChange={(v) => patch("specialContact", v)}
          rows={4}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? "Saving…" : isEditMode ? "Update invitation" : "Save draft"}
        </Button>
        {!isEditMode ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={() => setData(normalizeJulyMemorialInvitationInput(freshJulyMemorialInvitationDefaults()))}
          >
            Reset sample
          </Button>
        ) : null}
      </div>
      {isEditMode ? (
        <p className="text-xs text-muted">After changing fields, click Generate Invitation PDF again.</p>
      ) : null}
    </form>
  );
}
