import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { getGalleryBucket, getSupabaseObjectPathFromPublicUrl } from "@/lib/storage";

/** Removes july-award-2026 objects from the gallery bucket (best-effort). */
export async function deleteJulyAwardGalleryObjectsFromUrls(urls: string[]): Promise<void> {
  const bucket = getGalleryBucket();
  const paths = new Set<string>();
  for (const url of urls) {
    const path = getSupabaseObjectPathFromPublicUrl(url.trim(), bucket);
    if (path?.startsWith("july-award-2026/")) {
      paths.add(path);
    }
  }
  if (paths.size === 0) {
    return;
  }
  try {
    const storage = createServiceRoleSupabase();
    await storage.storage.from(bucket).remove([...paths]);
  } catch {
    // assumed: orphan URLs or already removed — do not block admin delete
  }
}
