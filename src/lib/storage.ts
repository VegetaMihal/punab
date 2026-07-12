export function getGalleryBucket() {
  return process.env.NEXT_PUBLIC_GALLERY_BUCKET || "gallery";
}

export function getLeadershipBucket() {
  return process.env.NEXT_PUBLIC_LEADERSHIP_BUCKET || "leadership-photos";
}

export function sanitizeStorageFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
}

/** Object path inside bucket from a public object URL (handles legacy URLs without `/public/`). */
export function getSupabaseObjectPathFromPublicUrl(url: string, bucket: string): string | null {
  if (!url) {
    return null;
  }
  try {
    const u = new URL(url);
    const publicMarker = `/storage/v1/object/public/${bucket}/`;
    const legacyMarker = `/storage/v1/object/${bucket}/`;
    const idx = u.pathname.indexOf(publicMarker);
    if (idx !== -1) {
      return decodeURIComponent(u.pathname.slice(idx + publicMarker.length));
    }
    const legacyIdx = u.pathname.indexOf(legacyMarker);
    if (legacyIdx !== -1) {
      return decodeURIComponent(u.pathname.slice(legacyIdx + legacyMarker.length));
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Supabase public file URLs must include `/object/public/{bucket}/...`.
 * Some stored URLs omit `public` (manual paste, older clients, or mistaken transforms) and then GET returns 400.
 */
export function ensureSupabasePublicObjectUrl(url: string): string {
  const needle = "/storage/v1/object/";
  const i = url.indexOf(needle);
  if (i === -1) {
    return url;
  }
  const rest = url.slice(i + needle.length);
  if (rest.startsWith("public/") || rest.startsWith("sign/")) {
    return url;
  }
  return `${url.slice(0, i + needle.length)}public/${rest}`;
}
