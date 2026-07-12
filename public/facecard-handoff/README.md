# July Uprising Memorial Award 2026 — Facecard (handoff)

This folder contains everything needed to add a **new facecard type** to our
existing client-side greeting-card generator (same architecture as
`JulyAwardClubCardGenerator.tsx` / `JulyAwardParticipationCardGenerator.tsx`).

## What this card is
A personal **facecard**: the user drops THEIR photo into a portrait 4:5 well
in the upper-middle and posts it. Everything else (PUNAB logo, fist-and-flame
trophy badge, headline, date/time/venue, CTA buttons, treated crowd-photo
background) is fixed branding.

## KEY DIFFERENCE from the club/participation cards
On those cards, the adjustable element is the **logo** (`logoPlace`).
On THIS card the logo is **fixed top-left** and the adjustable element is the
**user's photo** in the photo well. So the same zoom/pan pattern is repurposed
as **`photoPlace`** controlling the user photo inside the well.

## Files in this folder

| File | What it is |
|------|------------|
| `facecard-design.html` | The finished design, self-contained (fonts + images embedded as base64). **Source of truth** for layout, colors, fonts, spacing, the SVG logo/badge/icons, and the baked-in background. Open it in a browser to see the exact target; read it to pull any measurement. |
| `facecard-target.png` | The rendered design at 3240×4050 (3× of the 1080×1350 base). The visual goal. |
| `assets/facecard-bg.jpg` | The **standalone color-graded crowd-photo background** (already treated: brand duotone, vignette, darkened). Load this in BOTH the CSS module (`background-image`) and the canvas fn (`drawImage`) instead of re-deriving it. In the design it's masked with a vertical gradient + a paper wash overlay — replicate those (see HTML `.photobg` / `.paperwash`). |
| `facecard-constants.ts` | **Shared constants**: card size, brand colors, the photo-well rect (the bit both CSS preview and canvas export must agree on), logo/badge rects, photoPlace ranges/defaults, fonts, and all static copy (incl. the new **TIME = 3:00 PM**). |
| `facecard-photo-transform.reference.ts` | The exact **CSS-preview ↔ canvas-export** transform math for the user photo, plus the 3 range controls + reset button to copy. This is the part that breaks if preview and export drift — follow it closely. |
| `fonts/` | Anton, Archivo, Bricolage Grotesque, Inter (TTF). Load these the same way the app loads its other fonts; the canvas needs them ready before `fillText`/`drawImage` or text falls back. |

## What to build (match our existing architecture exactly)

1. **`JulyAwardFaceCardGenerator.tsx`**
   - Copy `logoPlace` state + the 3 range inputs + reset button **verbatim**
     from the club generator, renamed `logoPlace` → `photoPlace`
     (see ranges in `facecard-constants.ts`: zoom 0.72–1.28 step 0.02,
     panX/panY ±120).
   - Live preview: user `<img>` inside the photo-well `<div>`, CSS-transformed
     `translate(${panXPx}px,${panYPx}px) scale(${zoom})`, transformOrigin
     center, well has `overflow:hidden` so it clips. Placeholder label when no
     photo.
   - Reproduce the rest of the card from `facecard-design.html` as a CSS module
     (logo, badge, headline, date/time/venue, CTAs, bg) — all static.

2. **`julyAwardFaceCard.module.css`**
   - Port every measurement/color/gradient from the HTML.
   - Use the photo-well rect from `facecard-constants.ts` so it matches canvas.

3. **`julyAwardFaceCard-canvas.ts`**
   - `drawJulyAwardFaceCard(canvas, { template, photo, photoPlace })` with the
     **same signature shape** as our existing draw fns.
   - `ctx.scale(EXPORT_SCALE)` once, then draw in base 1080×1350 coords.
   - Replicate the photo transform from
     `facecard-photo-transform.reference.ts` (clip to well rounded-rect →
     translate to well center → translate(pan) → scale(zoom) → cover-draw).
   - Draw bg, frame, logo, badge, text, CTAs to match the HTML pixel-for-pixel.
   - Use our existing `exportJulyAwardCanvasPng` helper on download.

## Sync contract (don't break this)
Preview (CSS) and export (canvas) must use the **same well rect** and the
**same translate→scale order**, so `preview === export`. The card's responsive
`transform: scale(previewScale)` wrapper is separate sizing — never fold it
into `photoPlace`.

## Suggested first step for the agent
Read `facecard-design.html` and confirm/return the exact constants you'll share
between the CSS module and the canvas fn (well rect, badge rect, colors, font
sizes) against `facecard-constants.ts`. Then implement the three files.

## Notes
- Background photo is a cleared/licensed press image per the client; keep a
  photographer/agency credit on file for publication.
- The source bg is modest resolution; it's intentionally blurred/atmospheric so
  it holds up. If you ever want it sharper, swap in a higher-res graded version.
