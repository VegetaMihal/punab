import { ensureSupabasePublicObjectUrl, getGalleryBucket, getSupabaseObjectPathFromPublicUrl } from "@/lib/storage";

export type JulyAwardNominationStagedUploads = {
  logoUrl?: string;
  supportingPdfUrl?: string;
};

/** Validates a prior upload URL from this nomination flow (retry after server error). */
export function parseStagedJulyAwardUploadUrl(
  raw: string | undefined,
  subfolder: "logo" | "supporting-pdf"
): string | null {
  const url = (raw ?? "").trim();
  if (!url) return null;
  const bucket = getGalleryBucket();
  const path = getSupabaseObjectPathFromPublicUrl(url, bucket);
  if (!path?.startsWith("july-award-2026/") || !path.includes(`/${subfolder}/`)) {
    return null;
  }
  return ensureSupabasePublicObjectUrl(url);
}

export function stagedUploadsFromFormData(formData: FormData): JulyAwardNominationStagedUploads {
  const logoUrl =
    parseStagedJulyAwardUploadUrl(formData.get("stagedLogoUrl")?.toString(), "logo") ?? undefined;
  const supportingPdfUrl =
    parseStagedJulyAwardUploadUrl(formData.get("stagedSupportingPdfUrl")?.toString(), "supporting-pdf") ??
    undefined;
  return { logoUrl, supportingPdfUrl };
}
