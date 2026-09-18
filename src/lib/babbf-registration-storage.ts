import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { ensureSupabasePublicObjectUrl, getGalleryBucket, sanitizeStorageFileName } from "@/lib/storage";

export type BabbfDocumentKind = "photo" | "payment_proof";

const KIND_PREFIX: Record<BabbfDocumentKind, string> = {
  photo: "babbf-championship-2026/participants",
  payment_proof: "babbf-championship-2026/payments",
};

export async function uploadBabbfDocumentFile(
  file: File,
  referenceNumber: string,
  kind: BabbfDocumentKind
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const safe = sanitizeStorageFileName(file.name || kind);
    const path = `${KIND_PREFIX[kind]}/${referenceNumber}/${Date.now()}-${safe}`;

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
    return { ok: true, url: ensureSupabasePublicObjectUrl(pub.publicUrl) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }
}
