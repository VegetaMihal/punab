"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { upsertLeadership, type AdminActionState } from "@/actions/admin";
import { uploadLeadershipPhoto } from "@/actions/cms";
import {
  ensureSupabasePublicObjectUrl,
  getLeadershipBucket,
  getSupabaseObjectPathFromPublicUrl,
} from "@/lib/storage";
import type { LeadershipMember } from "@/types/database";
import { toast } from "sonner";

const initial: AdminActionState = {};

type Props = {
  member?: LeadershipMember | null;
  layers: { id: string; title: string }[];
  /** Pre-select layer on “new member” (e.g. honorary flow). */
  defaultLayerId?: string;
};

export function LeadershipForm({ member, layers, defaultLayerId }: Props) {
  const [state, formAction, pending] = useActionState(upsertLeadership, initial);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(
    member?.photo_url ? ensureSupabasePublicObjectUrl(member.photo_url) : "",
  );

  const bucket = useMemo(() => getLeadershipBucket(), []);

  async function onPhotoUpload(file: File) {
    setUploading(true);
    const prevPath = getSupabaseObjectPathFromPublicUrl(photoUrl, bucket) ?? "";
    const fd = new FormData();
    fd.set("file", file);
    if (member?.id) {
      fd.set("memberId", member.id);
    }
    if (prevPath) {
      fd.set("prevStoragePath", prevPath);
    }
    const res = await uploadLeadershipPhoto(fd);
    setUploading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.url) {
      setPhotoUrl(res.url);
      toast.success("Photo uploaded. Save form to apply.");
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {member?.id && <input type="hidden" name="id" value={member.id} />}
      <input type="hidden" name="photoUrl" value={photoUrl} readOnly />
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green-muted px-3 py-2 text-sm text-brand-green">
          Saved.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Layer</label>
        <select
          name="layerId"
          required
          defaultValue={member?.layer_id ?? defaultLayerId ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        >
          <option value="" disabled>
            Select a layer
          </option>
          {layers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          required
          defaultValue={member?.name ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Position</label>
        <input
          name="position"
          required
          defaultValue={member?.position ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          name="bio"
          rows={4}
          defaultValue={member?.bio ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Photo</label>
        <div className="mt-1 space-y-3">
          <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-lg border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt="Leadership member photo preview"
                fill
                className="object-cover"
                sizes="320px"
                quality={90}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">No photo</div>
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
              await onPhotoUpload(file);
              input.value = "";
            }}
            className="text-sm"
          />
          <p className="text-xs text-muted">{uploading ? "Uploading..." : "Upload from your device, then save form."}</p>
          <details className="rounded border border-stone-200 p-2 dark:border-stone-700">
            <summary className="cursor-pointer text-xs text-muted">Advanced: manual URL</summary>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
              placeholder="https://..."
            />
          </details>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Sort order</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={member?.sort_order ?? 0}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          id="lpub"
          defaultChecked={member?.is_published ?? true}
        />
        <label htmlFor="lpub" className="text-sm">
          Published
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : member?.id ? "Update" : "Create"}
      </button>
    </form>
  );
}
