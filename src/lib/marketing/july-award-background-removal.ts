/** Longest side cap before segmentation — smaller = faster; 720 keeps hair detail usable. */
export const JULY_AWARD_SEGMENT_INPUT_MAX = 720;

const SEGMENT_MODEL = "isnet_fp16" as const;
const MATTE_LOW_CUT = 44;

export function segmenterBaseConfig() {
  return {
    model: SEGMENT_MODEL,
    output: { format: "image/png" as const },
    rescale: false,
  };
}

function resolveJulyAwardSrc(src: string) {
  return typeof window !== "undefined" && src.startsWith("/") ? `${window.location.origin}${src}` : src;
}

function loadImageOnce(resolved: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:\/\//i.test(resolved)) {
      img.crossOrigin = "anonymous";
    }
    const finalize = async () => {
      try {
        if (typeof img.decode === "function") await img.decode();
      } catch (e) {
        reject(e);
        return;
      }
      resolve(img);
    };
    img.onload = () => void finalize().catch(reject);
    img.onerror = () => reject(new Error(`Failed to load image: ${resolved}`));
    img.src = resolved;
  });
}

/** Loads a bitmap for canvas use; retries a few times (mobile / flaky CDN). */
export async function loadJulyAwardImage(src: string): Promise<HTMLImageElement> {
  const resolved = resolveJulyAwardSrc(src);
  const maxAttempts = 3;
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await loadImageOnce(resolved);
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function fileToDownscaledJpegBlob(file: File, maxLongSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const w = bitmap.width;
    const h = bitmap.height;
    const scale = Math.min(1, maxLongSide / Math.max(w, h));
    const nw = Math.max(1, Math.round(w * scale));
    const nh = Math.max(1, Math.round(h * scale));
    const c = document.createElement("canvas");
    c.width = nw;
    c.height = nh;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bitmap, 0, 0, nw, nh);
    return await new Promise((resolve, reject) => {
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.9);
    });
  } finally {
    bitmap.close();
  }
}

export async function tightenMattePngBlob(pngBlob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(pngBlob);
  try {
    const img = await loadJulyAwardImage(url);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return pngBlob;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, w, h);
    const px = d.data;
    const low = MATTE_LOW_CUT;
    for (let i = 3; i < px.length; i += 4) {
      const al = px[i];
      if (al <= low) px[i] = 0;
      else {
        px[i] = Math.min(255, Math.round(((al - low) / (255 - low)) * 255));
      }
    }
    ctx.putImageData(d, 0, 0);
    return await new Promise((resolve, reject) => {
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function removeBackgroundWithDeviceFallback(blob: Blob): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  const base = segmenterBaseConfig();
  for (const device of ["gpu", "cpu"] as const) {
    try {
      return await removeBackground(blob, { ...base, device });
    } catch {
      /* try CPU if WebGPU / wasm path fails */
    }
  }
  throw new Error("removeBackground failed for gpu and cpu");
}

/** Preload IMG.LY weights (optional; first run still works without). */
export function preloadJulyAwardSegmenter(): void {
  const base = segmenterBaseConfig();
  void import("@imgly/background-removal")
    .then(({ preload }) =>
      preload({ ...base, device: "gpu" }).catch(() => preload({ ...base, device: "cpu" }))
    )
    .catch(() => {
      /* optional */
    });
}
