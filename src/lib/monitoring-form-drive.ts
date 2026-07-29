import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { ensureSupabasePublicObjectUrl, getGalleryBucket, sanitizeStorageFileName } from "@/lib/storage";

export async function uploadMonitoringEvidenceFile(
  file: File,
  referenceNumber: string
): Promise<{ ok: true; url: string; fileId: string } | { ok: false; message: string }> {
  try {
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const safe = sanitizeStorageFileName(file.name || "evidence");
    const path = `monitoring-form/${referenceNumber}/${Date.now()}-${safe}`;

    const { error: upErr } = await storage.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
      cacheControl: "31536000",
    });
    if (upErr) {
      const msg = upErr.message.toLowerCase().includes("bucket not found")
        ? `Storage bucket "${bucket}" not found in Supabase.`
        : upErr.message;
      return { ok: false, message: msg };
    }

    const { data: pub } = storage.storage.from(bucket).getPublicUrl(path);
    return { ok: true, url: ensureSupabasePublicObjectUrl(pub.publicUrl), fileId: path };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }
}
