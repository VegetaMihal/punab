"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadMemberPhoto } from "@/actions/member";

type Props = {
  userId: string;
  currentUrl: string | null;
};

export function PhotoUpload({ userId: _userId, currentUrl }: Props) {
  const [url, setUrl] = useState<string | null>(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadMemberPhoto(fd);
      if (res.error) {
        setError(res.error);
      } else if (res.url) {
        setUrl(res.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-stone-200 bg-stone-100 dark:border-stone-700">
        {url ? (
          <Image src={url} alt="Profile" fill className="object-cover" sizes="96px" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">No photo</div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Photo (optional)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFile}
          disabled={busy}
          className="mt-1 text-sm"
        />
        {busy && <p className="mt-1 text-xs text-muted">Uploading…</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <p className="mt-1 text-xs text-muted">JPEG, PNG, or WebP. Used only for your member profile.</p>
      </div>
    </div>
  );
}
