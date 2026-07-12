"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CertificateTemplate } from "@/types/database";

type Props = {
  initialTemplates: CertificateTemplate[];
};

type TemplatePayload = {
  name: string;
  slug: string;
  type: string | null;
  htmlContent: string;
  cssContent: string | null;
  isActive: boolean;
};

const emptyTemplate: TemplatePayload = {
  name: "",
  slug: "",
  type: null,
  htmlContent: "",
  cssContent: null,
  isActive: true,
};

export function CertificateTemplatesManager({ initialTemplates }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplatePayload>(emptyTemplate);
  const [busy, setBusy] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm(emptyTemplate);
  }

  function startEdit(template: CertificateTemplate) {
    setEditingId(template.id);
    setForm({
      name: template.name,
      slug: template.slug,
      type: template.type,
      htmlContent: template.htmlContent,
      cssContent: template.cssContent,
      isActive: template.isActive,
    });
  }

  async function refreshTemplates() {
    const res = await fetch("/api/admin/certificates/templates");
    const data = (await res.json()) as { items?: CertificateTemplate[] };
    if (res.ok && data.items) {
      setTemplates(data.items);
      router.refresh();
    }
  }

  async function save() {
    if (!window.confirm(editingId ? "Update this template?" : "Create this template?")) {
      return;
    }
    setBusy(true);
    try {
      const url = editingId
        ? `/api/admin/certificates/templates/${editingId}`
        : "/api/admin/certificates/templates";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Failed to save template");
        return;
      }
      toast.success(editingId ? "Template updated" : "Template created");
      await refreshTemplates();
      startCreate();
    } catch {
      toast.error("Failed to save template");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(template: CertificateTemplate) {
    if (!window.confirm(`${template.isActive ? "Deactivate" : "Activate"} template "${template.name}"?`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/certificates/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Failed to update status");
        return;
      }
      toast.success(template.isActive ? "Template deactivated" : "Template activated");
      await refreshTemplates();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setBusy(false);
    }
  }

  async function remove(template: CertificateTemplate) {
    if (!window.confirm(`Delete template "${template.name}"?`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/certificates/templates/${template.id}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Failed to delete template");
        return;
      }
      toast.success("Template deleted");
      await refreshTemplates();
      if (editingId === template.id) {
        startCreate();
      }
    } catch {
      toast.error("Failed to delete template");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{editingId ? "Edit template" : "Create template"}</h2>
          {editingId && (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-md border border-stone-300 px-3 py-1 text-sm dark:border-stone-700"
            >
              Cancel edit
            </button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Input label="Slug" value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: v }))} />
          <Input
            label="Type"
            value={form.type ?? ""}
            onChange={(v) => setForm((p) => ({ ...p, type: v || null }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            />
            Active
          </label>
        </div>
        <div className="mt-3 space-y-3">
          <TextArea
            label="HTML content"
            value={form.htmlContent}
            onChange={(v) => setForm((p) => ({ ...p, htmlContent: v }))}
            rows={10}
          />
          <TextArea
            label="CSS content"
            value={form.cssContent ?? ""}
            onChange={(v) => setForm((p) => ({ ...p, cssContent: v || null }))}
            rows={8}
          />
        </div>
        <button
          type="button"
          onClick={save}
          disabled={busy || !form.name.trim() || !form.slug.trim() || !form.htmlContent.trim()}
          className="mt-3 rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60"
        >
          {busy ? "Saving..." : editingId ? "Update template" : "Create template"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl) => (
          <div key={tpl.id} className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-base font-semibold">{tpl.name}</h3>
            <p className="mt-1 text-sm text-muted">Slug: {tpl.slug}</p>
            <p className="mt-1 text-sm text-muted">Type: {tpl.type || "N/A"}</p>
            <p className="mt-1 text-sm text-muted">Status: {tpl.isActive ? "Active" : "Inactive"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startEdit(tpl)}
                className="rounded-md border border-stone-300 px-3 py-1 text-sm dark:border-stone-700"
                disabled={busy}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void toggleActive(tpl)}
                className="rounded-md border border-stone-300 px-3 py-1 text-sm dark:border-stone-700"
                disabled={busy}
              >
                {tpl.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                onClick={() => void remove(tpl)}
                className="rounded-md border border-red-400 px-3 py-1 text-sm text-red-700 dark:text-red-300"
                disabled={busy}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-md border border-stone-300 px-3 py-2 font-mono text-xs dark:border-stone-700 dark:bg-stone-950"
      />
    </label>
  );
}
