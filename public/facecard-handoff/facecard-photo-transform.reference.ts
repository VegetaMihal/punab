/**
 * PHOTO TRANSFORM — CSS preview vs Canvas export MUST match
 * ========================================================
 * This is the one piece that breaks if preview and export drift apart.
 * The user photo is positioned by photoPlace { zoom, panXPx, panYPx },
 * centered on the photo well, clipped to the well's rounded rect.
 *
 * IMPORTANT: panXPx / panYPx and all rects are in BASE 1080x1350 px space.
 * In the canvas fn, apply ctx.scale(EXPORT_SCALE) ONCE at the very top so
 * the rest of the drawing (including the transform below) uses base coords.
 */

import { PHOTO_WELL, DEFAULT_PHOTO_PLACE, type PhotoPlace } from "./facecard-constants";

/* ---------- 1) LIVE PREVIEW (React + CSS) ---------- */
/*
  The well div clips; the img is transformed inside it.

  <div
    className={styles.photoWell}            // overflow:hidden; border-radius:12px
    // width/height/position come from the CSS module, matching PHOTO_WELL
  >
    {photoUrl ? (
      <img
        src={photoUrl}
        className={styles.photoImg}
        style={{
          transform: `translate(${photoPlace.panXPx}px, ${photoPlace.panYPx}px) scale(${photoPlace.zoom})`,
          transformOrigin: "center center",
        }}
      />
    ) : (
      <PlaceholderLabel />                   // "YOUR PHOTO HERE / PORTRAIT 4:5"
    )}
  </div>

  CSS (.photoImg): position absolute; inset 0; width 100%; height 100%;
                   object-fit: cover;  // so the photo fills the well at scale 1

  NOTE: the whole card is separately wrapped in transform: scale(previewScale)
  for responsive fit — that is NOT part of photoPlace and must not be folded
  into these numbers.
*/

/* ---------- 2) CANVAS EXPORT (must replicate the above) ---------- */
export function drawUserPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  photoPlace: PhotoPlace = DEFAULT_PHOTO_PLACE,
) {
  const { x, y, width, height, radius, centerX, centerY, emptyBg } = PHOTO_WELL;

  ctx.save();

  // clip to the well's rounded rect
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.clip();

  if (!photo) {
    ctx.fillStyle = emptyBg;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
    // (draw the "YOUR PHOTO HERE" placeholder separately, outside the clip if preferred)
    return;
  }

  // Replicate CSS: translate(pan) then scale(zoom), centered on the well.
  // object-fit: cover means: at zoom=1, the image covers the well exactly.
  ctx.translate(centerX, centerY);
  ctx.translate(photoPlace.panXPx, photoPlace.panYPx);
  ctx.scale(photoPlace.zoom, photoPlace.zoom);

  // Compute cover dimensions for the photo relative to the well (object-fit: cover)
  const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
  const drawW = photo.naturalWidth * scale;
  const drawH = photo.naturalHeight * scale;

  // draw centered on the (already translated) origin
  ctx.drawImage(photo, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();
}

/* rounded-rect path helper (use ctx.roundRect if your target supports it) */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/* ---------- 3) The 3 range controls + reset (copy verbatim, rename) ---------- */
/*
  import { PHOTO_PLACE_LIMITS, DEFAULT_PHOTO_PLACE } from "./facecard-constants";
  const { zoomMin, zoomMax, zoomStep, panPxMax } = PHOTO_PLACE_LIMITS;

  <input type="range" min={zoomMin} max={zoomMax} step={zoomStep}
    value={photoPlace.zoom}
    onChange={e => setPhotoPlace(p => ({ ...p, zoom: +e.target.value }))} />

  <input type="range" min={-panPxMax} max={panPxMax} step={1}
    value={photoPlace.panXPx}
    onChange={e => setPhotoPlace(p => ({ ...p, panXPx: +e.target.value }))} />

  <input type="range" min={-panPxMax} max={panPxMax} step={1}
    value={photoPlace.panYPx}
    onChange={e => setPhotoPlace(p => ({ ...p, panYPx: +e.target.value }))} />

  <button onClick={() => setPhotoPlace({ ...DEFAULT_PHOTO_PLACE })}>
    Reset photo
  </button>
*/
