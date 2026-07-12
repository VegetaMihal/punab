/** Inline 1×1 transparent GIF — safe placeholder when an image fails during export. */
export const JULY_AWARD_TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

async function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Could not read image data."));
    };
    reader.onerror = () => reject(new Error("Could not read image data."));
    reader.readAsDataURL(blob);
  });
}

/** html2canvas on mobile Safari often fails on blob: and remote src without inlined data. */
export async function resolveJulyAwardExportImageSrc(src: string): Promise<string> {
  const trimmed = src.trim();
  if (!trimmed || trimmed === JULY_AWARD_TRANSPARENT_PIXEL) {
    return JULY_AWARD_TRANSPARENT_PIXEL;
  }
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  try {
    const absolute =
      typeof window !== "undefined" && trimmed.startsWith("/")
        ? `${window.location.origin}${trimmed}`
        : trimmed;
    const res = await fetch(absolute);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await readBlobAsDataUrl(await res.blob());
  } catch {
    return trimmed;
  }
}

export async function inlineExportImages(root: ParentNode): Promise<void> {
  const imgs = root.querySelectorAll("img");
  await Promise.all(
    [...imgs].map(async (img) => {
      try {
        const dataUrl = await resolveJulyAwardExportImageSrc(img.src);
        img.src = dataUrl;
        img.removeAttribute("srcset");
        if (/^https?:\/\//i.test(dataUrl)) {
          img.crossOrigin = "anonymous";
        } else {
          img.removeAttribute("crossorigin");
        }
      } catch {
        img.src = JULY_AWARD_TRANSPARENT_PIXEL;
      }
    })
  );
}

export async function waitForExportImages(root: ParentNode): Promise<void> {
  const imgs = root.querySelectorAll("img");
  await Promise.all(
    [...imgs].map(
      (img) =>
        new Promise<void>((resolve) => {
          const done = () => {
            void (img.decode?.() ?? Promise.resolve())
              .then(() => resolve())
              .catch(() => resolve());
          };
          if (img.complete && img.naturalWidth > 0) {
            done();
            return;
          }
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", () => {
            img.src = JULY_AWARD_TRANSPARENT_PIXEL;
            done();
          }, { once: true });
        })
    )
  );
}

// WebKit's canvas area ceiling is ~16.7MP (4096×4096) before toBlob/toDataURL
// silently fails on iOS Safari. Cap a bit under that so the full-res export
// (~12MP for the current card designs) ships untouched on mobile — only
// genuinely oversized canvases get downscaled.
const MOBILE_EXPORT_MAX_AREA = 14_000_000;

function isCoarseTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Downscale only genuinely huge canvases so iOS/Android can toBlob / share without OOM. */
export function prepareJulyAwardExportCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  if (!isCoarseTouchDevice()) {
    return canvas;
  }
  const { width: w, height: h } = canvas;
  const area = w * h;
  if (area <= MOBILE_EXPORT_MAX_AREA) {
    return canvas;
  }
  const scale = Math.sqrt(MOBILE_EXPORT_MAX_AREA / area);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(w * scale));
  out.height = Math.max(1, Math.round(h * scale));
  const ctx = out.getContext("2d");
  if (!ctx) {
    return canvas;
  }
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  return out;
}

/**
 * Cards have no transparency, so export as JPEG instead of lossless PNG —
 * same visual quality at a fraction of the file size (PNG re-encodes every
 * pixel losslessly; a photo-bearing card doesn't need that). iOS Safari
 * sometimes returns null from toBlob on large canvases, hence the fallback.
 */
const EXPORT_JPEG_QUALITY = 0.92;

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const exportCanvas = prepareJulyAwardExportCanvas(canvas);
  const fromBlob = await new Promise<Blob | null>((resolve) => {
    exportCanvas.toBlob((b) => resolve(b), "image/jpeg", EXPORT_JPEG_QUALITY);
  });
  if (fromBlob) {
    return fromBlob;
  }

  const dataUrl = exportCanvas.toDataURL("image/jpeg", EXPORT_JPEG_QUALITY);
  const base64 = dataUrl.split(",")[1];
  if (!base64) {
    throw new Error("Canvas export produced empty data.");
  }
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new Blob([bytes], { type: "image/jpeg" });
}

/** Mobile save — anchor download weak on iOS; Android often needs share too. Never on Windows desktop. */
function prefersWebShareDownload(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return false;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return true;
  return /Android/i.test(ua) && window.matchMedia("(pointer: coarse)").matches;
}

export function isJulyAwardMobileSaveDevice(): boolean {
  return prefersWebShareDownload();
}

export function julyAwardExportSuccessMessage(): string {
  if (!isJulyAwardMobileSaveDevice()) return "Download started.";
  return isIosSafari()
    ? "Choose Save Image in the share menu (or long‑press the photo to save)."
    : "Choose Save or Downloads in the share menu.";
}

export function isJulyAwardExportAbortError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.toLowerCase().includes("share") || msg.toLowerCase().includes("abort");
}

/** Canvas → PNG blob → download or mobile share (all July Award card generators). */
export async function exportJulyAwardCanvasPng(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<void> {
  const blob = await canvasToPngBlob(canvas);
  await downloadJulyAwardPng(blob, filename);
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export async function downloadJulyAwardPng(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
  if (
    prefersWebShareDownload() &&
    typeof navigator.share === "function" &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (e) {
      if (isJulyAwardExportAbortError(e)) return;
      /* fall through to anchor/new-tab below */
    }
  }

  const url = URL.createObjectURL(blob);

  // iOS Safari ignores the `download` attribute — open in a new tab so the
  // user can long-press → "Save Image" instead of nothing happening.
  if (isIosSafari()) {
    const win = window.open(url, "_blank");
    if (!win) {
      window.location.href = url;
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
