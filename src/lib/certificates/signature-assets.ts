import { getGalleryBucket, getSupabaseObjectPathFromPublicUrl } from "@/lib/storage";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

async function loadSignatureBytes(publicUrl: string): Promise<{ buf: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(publicUrl, { cache: "no-store" });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const rawCt = res.headers.get("content-type")?.split(";")[0]?.trim() || "";
      const ct =
        /^image\/(png|jpeg|webp|gif)$/i.test(rawCt) ? rawCt : inferMimeFromPath(publicUrl);
      if (buf.length > 0) {
        return { buf, contentType: ct };
      }
    }
  } catch {
    // Fetch often fails in PDF worker env; use Storage API below.
  }

  const bucket = getGalleryBucket();
  const path = getSupabaseObjectPathFromPublicUrl(publicUrl, bucket);
  if (!path) {
    return null;
  }

  const storage = createServiceRoleSupabase();
  const { data, error } = await storage.storage.from(bucket).download(path);
  if (error || !data) {
    return null;
  }
  const buf = Buffer.from(await data.arrayBuffer());
  return { buf, contentType: inferMimeFromPath(path) };
}

function inferMimeFromPath(pathOrUrl: string): string {
  const lower = pathOrUrl.toLowerCase();
  if (lower.endsWith(".png")) {
    return "image/png";
  }
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lower.endsWith(".webp")) {
    return "image/webp";
  }
  return "image/png";
}

/** Inline signature images for PDF — always embed as data URLs (Puppeteer + Storage download fallback). */
export async function resolveSignatureSrcForPdf(url: string | null | undefined): Promise<string> {
  const u = url?.trim();
  if (!u) {
    return "";
  }
  const loaded = await loadSignatureBytes(u);
  if (!loaded || loaded.buf.length === 0) {
    return "";
  }
  return `data:${loaded.contentType};base64,${loaded.buf.toString("base64")}`;
}
