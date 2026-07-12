import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import {
  ensureSupabasePublicObjectUrl,
  getGalleryBucket,
  sanitizeStorageFileName,
} from "@/lib/storage";

export type UploadedCertificatePdf = {
  storagePath: string;
  publicUrl: string;
};

export async function uploadCertificatePdf(params: {
  certificateNumber: string;
  pdfBuffer: Buffer;
}): Promise<UploadedCertificatePdf> {
  const storage = createServiceRoleSupabase();
  const bucket = getGalleryBucket();
  const safeNumber = sanitizeStorageFileName(params.certificateNumber);
  const fileName = `${safeNumber}.pdf`;
  const storagePath = `certificates/${new Date().getUTCFullYear()}/${fileName}`;

  const { error: upErr } = await storage.storage.from(bucket).upload(storagePath, params.pdfBuffer, {
    upsert: true,
    contentType: "application/pdf",
    cacheControl: "31536000",
  });
  if (upErr) {
    throw new Error(`Certificate PDF upload failed (${bucket}): ${upErr.message}`);
  }

  const { data } = storage.storage.from(bucket).getPublicUrl(storagePath);
  const baseUrl = ensureSupabasePublicObjectUrl(data.publicUrl);
  // Same object path on regenerating → URL unchanged → CDN/browser serves stale PDF; bust cache per upload.
  const publicUrl = new URL(baseUrl);
  publicUrl.searchParams.set("v", String(Date.now()));

  return {
    storagePath,
    publicUrl: publicUrl.toString(),
  };
}
