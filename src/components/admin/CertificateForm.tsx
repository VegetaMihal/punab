"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CERTIFICATE_TYPES } from "@/lib/certificates/constants";
import type { CertificateTemplate } from "@/types/database";

type Props = {
  templates: (CertificateTemplate & { previewHtml?: string })[];
  initialValues?: Partial<{
    id: string;
    certificateTitle: string;
    certificateType: string;
    recipientName: string;
    recipientEmail: string | null;
    universityName: string | null;
    eventName: string | null;
    role: string | null;
    achievement: string | null;
    timePeriod: string | null;
    reason: string;
    issueDate: string;
    templateId: string | null;
    signatoryName1: string | null;
    signatoryDesignation1: string | null;
    signatoryName2: string | null;
    signatoryDesignation2: string | null;
  }>;
};

function isoDate(dateLike: string | undefined): string {
  if (!dateLike) {
    return "";
  }
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toISOString().slice(0, 10);
}

export function CertificateForm({ templates, initialValues }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(initialValues?.id);
  const [templatePicked, setTemplatePicked] = useState(isEditMode);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    initialValues?.templateId ?? null,
  );

  async function onSubmit(formData: FormData) {
    setIsSaving(true);
    const payload = {
      certificateTitle: String(formData.get("certificateTitle") || ""),
      certificateType: String(formData.get("certificateType") || ""),
      recipientName: String(formData.get("recipientName") || ""),
      recipientEmail: String(formData.get("recipientEmail") || "") || null,
      universityName: String(formData.get("universityName") || "") || null,
      eventName: String(formData.get("eventName") || "") || null,
      role: String(formData.get("role") || "") || null,
      achievement: String(formData.get("achievement") || "") || null,
      timePeriod: String(formData.get("timePeriod") || "") || null,
      reason: String(formData.get("reason") || ""),
      issueDate: String(formData.get("issueDate") || ""),
      templateId: String(formData.get("templateId") || ""),
      signatoryName1: String(formData.get("signatoryName1") || "") || null,
      signatoryDesignation1: String(formData.get("signatoryDesignation1") || "") || null,
      signatoryName2: null,
      signatoryDesignation2: null,
    };

    if (!isEditMode && !payload.templateId) {
      toast.error("Choose a template");
      setIsSaving(false);
      return;
    }

    try {
      const url = isEditMode ? `/api/admin/certificates/${initialValues?.id}` : "/api/admin/certificates";
      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        item?: { id: string };
        error?: string;
        fieldErrors?: Record<string, string[] | undefined>;
      };
      if (!res.ok || !data.item) {
        const firstFieldError = data.fieldErrors
          ? Object.values(data.fieldErrors).find((arr) => Array.isArray(arr) && arr.length > 0)?.[0]
          : undefined;
        toast.error(
          firstFieldError || data.error || (isEditMode ? "Failed to update certificate" : "Failed to save draft"),
        );
        return;
      }
      toast.success(isEditMode ? "Certificate updated" : "Certificate draft saved");
      if (isEditMode && initialValues?.id === data.item.id) {
        router.refresh();
      } else {
        router.push(`/admin/certificates/${data.item.id}?autogen=1`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditMode && !templatePicked) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">Pick a template to continue.</p>
        {templates.length === 0 ? (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            No active templates. Add one under Certificate templates first.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setTemplatePicked(true);
                  }}
                  className={`flex flex-col rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                    isSelected
                      ? "border-brand-red bg-brand-red/5 ring-1 ring-brand-red"
                      : "border-stone-300 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-500"
                  }`}
                >
                  {tpl.previewHtml ? (
                    <div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-600">
                      <iframe
                        title={`Preview: ${tpl.name}`}
                        srcDoc={tpl.previewHtml}
                        sandbox=""
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[794px] w-[1122px] -translate-x-1/2 -translate-y-1/2 scale-[0.19] border-0"
                      />
                    </div>
                  ) : null}
                  <div className="font-semibold text-stone-900 dark:text-stone-50">{tpl.name}</div>
                  {tpl.type ? (
                    <div className="mt-1 text-xs text-muted">Type: {tpl.type}</div>
                  ) : null}
                  <div className="mt-2 truncate font-mono text-xs text-stone-500 dark:text-stone-400">{tpl.slug}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const selectedTpl = templates.find((t) => t.id === selectedTemplateId);

  return (
    <form action={onSubmit} className="space-y-4">
      {!isEditMode ? (
        <input
          type="hidden"
          name="templateId"
          defaultValue={selectedTemplateId ?? ""}
          key={selectedTemplateId ?? ""}
        />
      ) : null}
      {!isEditMode ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-900/40">
          <div>
            <div className="text-xs text-muted">Template</div>
            <div className="font-medium text-stone-900 dark:text-stone-50">
              {selectedTpl?.name ?? "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTemplatePicked(false)}
            className="shrink-0 rounded-md border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-600"
          >
            Change template
          </button>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="certificateTitle" label="Certificate title" required defaultValue={initialValues?.certificateTitle ?? ""} />
        <Select
          name="certificateType"
          label="Certificate type"
          required
          defaultValue={initialValues?.certificateType ?? ""}
        >
          <option value="">Select type</option>
          {CERTIFICATE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Input name="recipientName" label="Recipient name" required defaultValue={initialValues?.recipientName ?? ""} />
        <Input name="recipientEmail" type="email" label="Recipient email" defaultValue={initialValues?.recipientEmail ?? ""} />
        <Input name="universityName" label="University name" defaultValue={initialValues?.universityName ?? ""} />
        <Input name="eventName" label="Event name" defaultValue={initialValues?.eventName ?? ""} />
        <Input name="role" label="Role" defaultValue={initialValues?.role ?? ""} />
        <Input name="achievement" label="Achievement" defaultValue={initialValues?.achievement ?? ""} />
        <Input name="timePeriod" label="Time period" defaultValue={initialValues?.timePeriod ?? ""} />
        <Input name="issueDate" type="date" label="Issue date" required defaultValue={isoDate(initialValues?.issueDate)} />
        {isEditMode ? (
          <Select name="templateId" label="Template" required defaultValue={initialValues?.templateId ?? ""}>
            <option value="">Select template</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </Select>
        ) : null}
      </div>
      <TextArea name="reason" label="Reason" required defaultValue={initialValues?.reason ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="signatoryName1" label="Signatory 1 name" defaultValue={initialValues?.signatoryName1 ?? ""} />
        <Input
          name="signatoryDesignation1"
          label="Signatory 1 designation"
          defaultValue={initialValues?.signatoryDesignation1 ?? ""}
        />
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60"
      >
        {isSaving ? "Saving..." : isEditMode ? "Update Certificate" : "Save Draft"}
      </button>
    </form>
  );
}

function Input({
  name,
  label,
  required,
  type = "text",
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
      />
    </label>
  );
}

function Select({
  name,
  label,
  required,
  children,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
      >
        {children}
      </select>
    </label>
  );
}

function TextArea({
  name,
  label,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        rows={4}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
      />
    </label>
  );
}
