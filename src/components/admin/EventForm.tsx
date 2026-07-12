"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { upsertEvent, type AdminActionState } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { uploadEventBanner } from "@/actions/cms";
import {
  ensureSupabasePublicObjectUrl,
  getGalleryBucket,
  getSupabaseObjectPathFromPublicUrl,
} from "@/lib/storage";
import type { EventRow } from "@/types/database";
import { toast } from "sonner";

const initial: AdminActionState = {};

function toLocal(iso: string | null | undefined) {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  event?: EventRow | null;
};

export function EventForm({ event }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(upsertEvent, initial);
  const [uploading, setUploading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(
    event?.banner_url ? ensureSupabasePublicObjectUrl(event.banner_url) : "",
  );
  const bucket = useMemo(() => getGalleryBucket(), []);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  async function onBannerUpload(file: File) {
    setUploading(true);
    const prevPath = getSupabaseObjectPathFromPublicUrl(bannerUrl, bucket) ?? "";
    const fd = new FormData();
    fd.set("file", file);
    if (event?.id) {
      fd.set("eventId", event.id);
    }
    if (prevPath) {
      fd.set("prevStoragePath", prevPath);
    }
    const res = await uploadEventBanner(fd);
    setUploading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.url) {
      setBannerUrl(res.url);
      toast.success("Photo uploaded. Save the event to keep it.");
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {event?.id && <input type="hidden" name="id" value={event.id} />}
      <input type="hidden" name="bannerUrl" value={bannerUrl} readOnly />
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
          defaultValue={event?.title ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Slug (optional)</label>
        <input
          name="slug"
          defaultValue={event?.slug ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={event?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Event photo</label>
        <p className="mt-0.5 text-xs text-muted">
          Shown on the public event page and in the events list. Stored in the gallery bucket under{" "}
          <code className="text-[11px]">event-banners/…</code>.
        </p>
        <div className="mt-2 space-y-3">
          <div className="relative aspect-[21/9] w-full max-w-xl overflow-hidden rounded-lg border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt="Event banner preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 36rem"
                quality={90}
              />
            ) : (
              <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-muted">No photo</div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            disabled={uploading || pending}
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (!file) {
                return;
              }
              await onBannerUpload(file);
              input.value = "";
            }}
            className="text-sm"
          />
          <p className="text-xs text-muted">{uploading ? "Uploading…" : "Upload an image, then save the event."}</p>
          <details className="rounded border border-stone-200 p-2 dark:border-stone-700">
            <summary className="cursor-pointer text-xs text-muted">Advanced: paste image URL</summary>
            <input
              type="url"
              value={bannerUrl}
              onChange={(ev) => setBannerUrl(ev.target.value)}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
              placeholder="https://..."
            />
          </details>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          name="location"
          defaultValue={event?.location ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Post link (optional)</label>
        <p className="mt-0.5 text-xs text-muted">Facebook, Meet, ticket page, etc. Shown as &quot;View Event&quot; on the public event page.</p>
        <input
          type="text"
          name="postUrl"
          defaultValue={event?.post_url ?? ""}
          placeholder="https://…"
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Start</label>
        <input
          type="datetime-local"
          name="startAt"
          required
          defaultValue={toLocal(event?.start_at)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">End (optional)</label>
        <input
          type="datetime-local"
          name="endAt"
          defaultValue={toLocal(event?.end_at)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          id="epub"
          defaultChecked={event?.is_published ?? false}
        />
        <label htmlFor="epub" className="text-sm">
          Published
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4 dark:border-stone-700">
        <Button type="submit" variant="primary" size="md" loading={pending} disabled={pending}>
          {event?.id ? "Update event" : "Create event"}
        </Button>
        {event?.id &&
          (event.is_published ? (
            <Button
              variant="primary"
              size="md"
              href={`/events/${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Event
            </Button>
          ) : (
            <span
              className="inline-flex min-h-[2.75rem] cursor-not-allowed items-center rounded-[var(--radius-full)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] px-5 text-sm font-semibold text-muted opacity-80"
              title="Turn on Published and save to open the public event page."
            >
              View Event
            </span>
          ))}
      </div>
    </form>
  );
}
