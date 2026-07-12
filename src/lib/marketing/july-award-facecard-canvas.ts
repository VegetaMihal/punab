import { loadJulyAwardImage } from "@/lib/marketing/july-award-background-removal";
import { ASSETS, CARD, EXPORT_SCALE, PHOTO_WELL, type PhotoPlace } from "@/lib/marketing/july-award-facecard-constants";

export const FACECARD_W = CARD.width;
export const FACECARD_H = CARD.height;

export type FaceCardDrawInput = {
  template: { bg: HTMLImageElement };
  photo: HTMLImageElement | null;
  photoPlace: PhotoPlace;
};

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** CSS preview ↔ canvas export contract — see `facecard-photo-transform.reference.ts`. */
export function drawUserPhoto(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null, photoPlace: PhotoPlace): void {
  const { x, y, width, height, radius, centerX, centerY, emptyBg } = PHOTO_WELL;

  ctx.save();
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.clip();

  ctx.fillStyle = emptyBg;
  ctx.fillRect(x, y, width, height);

  if (!photo || !photo.naturalWidth) {
    ctx.restore();
    return;
  }

  ctx.translate(centerX, centerY);
  ctx.translate(photoPlace.panXPx, photoPlace.panYPx);
  ctx.scale(photoPlace.zoom, photoPlace.zoom);

  const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
  const drawW = photo.naturalWidth * scale;
  const drawH = photo.naturalHeight * scale;
  ctx.drawImage(photo, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();
}

/** Draw the full facecard onto `canvas` at export resolution — background art is a single flattened image. */
export function drawJulyAwardFaceCard(canvas: HTMLCanvasElement, input: FaceCardDrawInput): void {
  const { template, photo, photoPlace } = input;
  canvas.width = FACECARD_W * EXPORT_SCALE;
  canvas.height = FACECARD_H * EXPORT_SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

  ctx.drawImage(template.bg, 0, 0, CARD.width, CARD.height);
  drawUserPhoto(ctx, photo, photoPlace);
}

export type FaceCardAssets = {
  bg: HTMLImageElement;
};

/** Static art preloaded once on mount, mirrors `preloadParticipationCardAssets`. */
export async function preloadFaceCardAssets(): Promise<FaceCardAssets> {
  const bg = await loadJulyAwardImage(ASSETS.bg);
  return { bg };
}

export async function loadFaceCardPhoto(src: string): Promise<HTMLImageElement> {
  return loadJulyAwardImage(src);
}
