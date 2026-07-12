"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { upsertForumMember, type AdminActionState } from "@/actions/admin";
import { uploadForumMemberPhoto } from "@/actions/cms";
import {
  ensureSupabasePublicObjectUrl,
  getLeadershipBucket,
  getSupabaseObjectPathFromPublicUrl,
} from "@/lib/storage";
import type { ForumMember } from "@/types/database";
import { toast } from "sonner";

const initial: AdminActionState = {};
const FORUM_PHOTO_MAX_EDGE = 900;

type Props = {
  forumId: string;
  member?: ForumMember | null;
  labels: { id: string; title: string }[];
  defaultLabelId?: string;
};

async function prepareForumPhoto(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, FORUM_PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale >= 1) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
  if (!blob) {
    return file;
  }
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

export function ForumMemberForm({ forumId, member, labels, defaultLabelId }: Props) {
  const [state, formAction, pending] = useActionState(upsertForumMember, initial);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(
    member?.photo_url ? ensureSupabasePublicObjectUrl(member.photo_url) : "",
  );

  const bucket = useMemo(() => getLeadershipBucket(), []);

  async function onPhotoUpload(file: File) {
    setUploading(true);
    const prevPath = getSupabaseObjectPathFromPublicUrl(photoUrl, bucket) ?? "";
    const uploadFile = await prepareForumPhoto(file);
    const fd = new FormData();
    fd.set("file", uploadFile);
    fd.set("forumId", forumId);
    if (member?.id) {
      fd.set("memberId", member.id);
    }
    if (prevPath) {
      fd.set("prevStoragePath", prevPath);
    }
    const res = await uploadForumMemberPhoto(fd);
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
      <input type="hidden" name="forumId" value={forumId} />
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
        <label className="block text-sm font-medium">Label (section)</label>
        <select
          name="labelId"
          required
          defaultValue={member?.label_id ?? defaultLabelId ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        >
          <option value="" disabled>
            Select a label
          </option>
          {labels.map((l) => (
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
                alt="Forum member photo preview"
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
          id="fmPub"
          defaultChecked={member?.is_published ?? true}
        />
        <label htmlFor="fmPub" className="text-sm">
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
