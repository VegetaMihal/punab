export const JULY_AWARD_MAX_LOGO_BYTES = 10 * 1024 * 1024;
export const JULY_AWARD_MAX_PDF_BYTES = 5 * 1024 * 1024;

const LOGO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function formatJulyAwardMaxFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${Math.trunc(mb)} MB`;
  return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

export function isJulyAwardPdfFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (type === "application/pdf") return true;
  return /\.pdf$/i.test(file.name.trim());
}

export function isJulyAwardLogoImage(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (LOGO_MIME_TYPES.has(type)) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name.trim());
}

/** Last non-empty file for a field (avoids empty placeholder entries from multipart forms). */
export function getJulyAwardUploadFile(formData: FormData, fieldName: string): File | null {
  const files = formData
    .getAll(fieldName)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  return files.length > 0 ? files[files.length - 1]! : null;
}

export function validateJulyAwardLogoFile(file: File, byteLength = file.size): string | null {
  if (isJulyAwardPdfFile(file)) {
    return "This looks like a PDF. Use “Supporting documents — PDF upload” below (max 5 MB).";
  }
  if (!Number.isFinite(byteLength) || byteLength <= 0) {
    return "Could not read that image. Try choosing the file again.";
  }
  if (byteLength > JULY_AWARD_MAX_LOGO_BYTES) {
    return `Club logo must be ${formatJulyAwardMaxFileSize(JULY_AWARD_MAX_LOGO_BYTES)} or smaller.`;
  }
  if (!isJulyAwardLogoImage(file)) {
    return "Club logo must be JPEG, PNG, WebP, or GIF.";
  }
  return null;
}

/** Server actions: `file.size` from multipart can be wrong — measure the body. */
export async function validateJulyAwardLogoFileServer(file: File): Promise<string | null> {
  const byteLength = (await file.arrayBuffer()).byteLength;
  return validateJulyAwardLogoFile(file, byteLength);
}

export function validateJulyAwardPdfFile(file: File): string | null {
  if (file.size > JULY_AWARD_MAX_PDF_BYTES) {
    return `Supporting PDF must be ${formatJulyAwardMaxFileSize(JULY_AWARD_MAX_PDF_BYTES)} or smaller.`;
  }
  if (!isJulyAwardPdfFile(file)) {
    return "Supporting document must be a PDF file (.pdf).";
  }
  return null;
}

export function julyAwardLogoContentType(file: File): string {
  const type = (file.type || "").toLowerCase();
  if (LOGO_MIME_TYPES.has(type)) return type;
  if (/\.png$/i.test(file.name)) return "image/png";
  if (/\.webp$/i.test(file.name)) return "image/webp";
  if (/\.gif$/i.test(file.name)) return "image/gif";
  return "image/jpeg";
}
