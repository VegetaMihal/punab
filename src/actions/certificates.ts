"use server";

import { z } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { getCertificateById, updateCertificate } from "@/lib/repositories";
import {
  ensureSupabasePublicObjectUrl,
  getGalleryBucket,
  getSupabaseObjectPathFromPublicUrl,
  sanitizeStorageFileName,
} from "@/lib/storage";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

const uploadSchema = z.object({
  certificateId: z.string().min(1),
  slot: z.enum(["1", "2"]),
});

const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

function normalizeMime(raw: string): string {
  return (raw || "").toLowerCase().split(";")[0]?.trim() ?? "";
}

/** Many browsers send empty type or application/octet-stream; infer from extension. */
function resolveSignatureMime(file: File): string | null {
  let mime = normalizeMime(file.type);
  if (mime === "application/octet-stream") {
    mime = "";
  }
  if (mime && ALLOWED.has(mime)) {
    return mime === "image/jpg" ? "image/jpeg" : mime;
  }
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".png")) {
    return "image/png";
  }
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lower.endsWith(".webp")) {
    return "image/webp";
  }
  return null;
}

export async function uploadCertificateSignature(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  try {
    await assertAdminScope("certificates");
    const parsed = uploadSchema.safeParse({
      certificateId: formData.get("certificateId"),
      slot: formData.get("slot"),
    });
    if (!parsed.success) {
      return { error: "Invalid request" };
    }
    const existing = await getCertificateById(parsed.data.certificateId);
    if (!existing) {
      return { error: "Certificate not found" };
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { error: "No file" };
    }
    if (file.size > MAX_BYTES) {
      return { error: "Image must be 2MB or smaller" };
    }
    const contentType = resolveSignatureMime(file);
    if (!contentType) {
      return { error: "Use PNG, JPG, or WebP (check the file extension if upload keeps failing)" };
    }

    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const safeName = sanitizeStorageFileName(file.name) || `signature.${contentType.replace("image/", "")}`;
    const storagePath = `certificates/signatures/${parsed.data.certificateId}/sig-${parsed.data.slot}-${Date.now()}-${safeName}`;

    const { error: upErr } = await storage.storage.from(bucket).upload(storagePath, file, {
      upsert: false,
      contentType,
      cacheControl: "31536000",
    });
    if (upErr) {
      const msg = upErr.message.toLowerCase().includes("bucket not found")
        ? `Storage bucket "${bucket}" not found. Create it in Supabase Storage.`
        : upErr.message;
      return { error: msg };
    }

    const { data: pub } = storage.storage.from(bucket).getPublicUrl(storagePath);
    const base = ensureSupabasePublicObjectUrl(pub.publicUrl);
    const publicUrl = new URL(base);
    publicUrl.searchParams.set("v", String(Date.now()));

    const prevUrl =
      parsed.data.slot === "1" ? existing.signatorySignature1Url : existing.signatorySignature2Url;
    if (prevUrl) {
      const prevPath = getSupabaseObjectPathFromPublicUrl(prevUrl, bucket);
      if (prevPath?.startsWith(`certificates/signatures/${parsed.data.certificateId}/`)) {
        await storage.storage.from(bucket).remove([prevPath]);
      }
    }

    await updateCertificate(parsed.data.certificateId, {
      ...(parsed.data.slot === "1"
        ? { signatorySignature1Url: publicUrl.toString() }
        : { signatorySignature2Url: publicUrl.toString() }),
    });

    return { url: publicUrl.toString() };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (
      msg.includes("signatorySignature") ||
      msg.includes("Unknown argument") ||
      msg.includes("does not exist")
    ) {
      return {
        error:
          "Database is missing signature columns. Run: npx prisma migrate dev (or deploy migration 20260509120000_certificate_signature_urls), then npx prisma generate.",
      };
    }
    return { error: msg };
  }
}

export async function clearCertificateSignature(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  try {
    await assertAdminScope("certificates");
    const parsed = uploadSchema.safeParse({
      certificateId: formData.get("certificateId"),
      slot: formData.get("slot"),
    });
    if (!parsed.success) {
      return { error: "Invalid request" };
    }
    const existing = await getCertificateById(parsed.data.certificateId);
    if (!existing) {
      return { error: "Certificate not found" };
    }

    const prevUrl =
      parsed.data.slot === "1" ? existing.signatorySignature1Url : existing.signatorySignature2Url;
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    if (prevUrl) {
      const prevPath = getSupabaseObjectPathFromPublicUrl(prevUrl, bucket);
      if (prevPath?.startsWith(`certificates/signatures/${parsed.data.certificateId}/`)) {
        await storage.storage.from(bucket).remove([prevPath]);
      }
    }

    await updateCertificate(parsed.data.certificateId, {
      ...(parsed.data.slot === "1"
        ? { signatorySignature1Url: null }
        : { signatorySignature2Url: null }),
    });

    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Clear failed" };
  }
}
