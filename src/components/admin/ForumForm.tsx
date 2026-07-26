"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { toast } from "sonner";
import { upsertForum, type AdminActionState } from "@/actions/admin";
import { uploadForumLogo } from "@/actions/cms";
import { ensureSupabasePublicObjectUrl, getLeadershipBucket, getSupabaseObjectPathFromPublicUrl } from "@/lib/storage";
import type { Forum } from "@/types/database";

const initial: AdminActionState = {};

export function ForumForm({ forum }: { forum?: Forum | null }) {
  const [state, formAction, pending] = useActionState(upsertForum, initial);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(forum?.logo_url ? ensureSupabasePublicObjectUrl(forum.logo_url) : "");

  const bucket = useMemo(() => getLeadershipBucket(), []);

  async function onLogoUpload(file: File) {
    setUploading(true);
    const prevPath = getSupabaseObjectPathFromPublicUrl(logoUrl, bucket) ?? "";
    const fd = new FormData();
    fd.set("file", file);
    if (forum?.id) {
      fd.set("forumId", forum.id);
    }
    if (prevPath) {
      fd.set("prevStoragePath", prevPath);
    }
    const res = await uploadForumLogo(fd);
    setUploading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.url) {
      setLogoUrl(res.url);
      toast.success("Logo uploaded. Save form to apply.");
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {forum?.id && <input type="hidden" name="id" value={forum.id} />}
      <input type="hidden" name="logoUrl" value={logoUrl} readOnly />
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green-muted px-3 py-2 text-sm text-brand-green">
          Saved.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          defaultValue={forum?.title ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">URL slug (optional)</label>
        <input
          name="slug"
          defaultValue={forum?.slug ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
        <p className="mt-1 text-xs text-muted">Public URL: /forums/your-slug</p>
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={forum?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Logo</label>
        <div className="mt-1 space-y-3">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 p-1.5 dark:border-stone-700 dark:bg-stone-800">
            {logoUrl ? (
              <Image src={logoUrl} alt="Forum logo preview" fill className="object-contain" sizes="80px" quality={90} />
            ) : (
              <span className="text-xs text-muted">No logo</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) {
                return;
              }
              await onLogoUpload(file);
              input.value = "";
            }}
            className="text-sm"
          />
          <p className="text-xs text-muted">
            {uploading ? "Uploading..." : "Upload from your device, then save form. Leave empty to keep the initial-letter badge."}
          </p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Sort order</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={forum?.sort_order ?? 0}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          id="fpub"
          defaultChecked={forum?.is_published ?? true}
        />
        <label htmlFor="fpub" className="text-sm">
          Published
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : forum?.id ? "Update forum" : "Create forum"}
      </button>
    </form>
  );
}
