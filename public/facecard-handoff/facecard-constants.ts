/**
 * FACECARD DESIGN CONSTANTS — single source of truth
 * ---------------------------------------------------
 * All values are measured at the DESIGN BASE of 1080 x 1350 px (4:5 portrait).
 * The CSS module (live preview) and the canvas draw fn (export) MUST both
 * reference these so that preview === export.
 *
 * For export at higher resolution, multiply every px value by EXPORT_SCALE
 * (e.g. 3 => 3240 x 4050). The canvas fn should do: ctx.scale(EXPORT_SCALE)
 * once at the top, then draw everything in base 1080x1350 coordinates.
 */

export const CARD = {
  width: 1080,
  height: 1350,
} as const;

export const EXPORT_SCALE = 3; // 1080*3 x 1350*3 = 3240 x 4050 final PNG

/* ----- BRAND COLORS (pulled from the PUNAB logo) ----- */
export const COLORS = {
  green: "#15562D",        // primary brand green
  greenDeep: "#0E3D20",
  greenBright: "#1C6B3A",
  greenInk: "#10331C",     // headline "MEMORIAL AWARD" color
  red: "#D82027",          // primary brand red
  redDeep: "#B2171D",
  orange: "#FAA525",       // torch flame
  gold: "#C8972F",         // accent only (divider, CTA step numbers)
  goldBright: "#E3B94A",
  paper: "#F7F5EF",        // off-white base
  paper2: "#FBFAF6",
  ink: "#16140F",
} as const;

/* ----- PHOTO WELL (the USER-EDITABLE area) -----
 * The user's photo is drawn INSIDE this rounded rect and clipped to it.
 * photoPlace { zoom, panXPx, panYPx } transforms the photo within this rect,
 * centered on the rect's center. This is the ONLY user-adjustable element.
 *
 * The outer frame (.photo-frame) is the green→red duo-tone border; the inner
 * well (.photo) is where the photo sits.
 */
export const PHOTO_FRAME = {
  x: 344, y: 224, width: 392, height: 486, // outer duo-tone border box
  padding: 8,                               // border thickness
  radius: 20,                               // outer corner radius
} as const;

export const PHOTO_WELL = {
  x: 352, y: 232, width: 376, height: 470,  // inner photo area (4:5)
  radius: 12,                               // inner corner radius — CLIP TO THIS
  centerX: 352 + 376 / 2,                   // 540
  centerY: 232 + 470 / 2,                   // 467
  emptyBg: "#EFEADD",                       // shown when no photo
} as const;

/* ----- LOGO (FIXED — not user-editable on this card) ----- */
export const LOGO = {
  x: 60, y: 46, height: 112, // width auto (~166 at this height); top-left
} as const;

/* ----- FIST-AND-FLAME TROPHY BADGE (FIXED, top-right) ----- */
export const BADGE = {
  x: 747, y: 43, width: 277, height: 136,
} as const;

/* ----- OTHER STATIC SECTIONS (for reference when porting layout) ----- */
export const SECTIONS = {
  memstrip: { y: 196 },                 // "IN MEMORY · IN SOLIDARITY · IN PRIDE"
  stamp:    { x: 353, y: 754, w: 374, h: 52, rotate: -2.5 }, // tilted red sticker
  headline: { x: 60, y: 762, w: 960, h: 310 },
  details:  { x: 60, y: 1102, w: 960, h: 49 },  // DATE | TIME | VENUE row
  cta:      { x: 60, y: 1254, w: 960, h: 96 },  // 3 rounded buttons
} as const;

/* ----- PHOTOPLACE CONTROL RANGES (copy from club/participation cards) ----- */
export const PHOTO_PLACE_LIMITS = {
  zoomMin: 0.72,
  zoomMax: 1.28,
  zoomStep: 0.02,
  panPxMax: 120, // panX / panY range is ±120 (in base 1080x1350 px space)
} as const;

export const DEFAULT_PHOTO_PLACE = {
  zoom: 1,
  panXPx: 0,
  panYPx: 0,
} as const;

export type PhotoPlace = typeof DEFAULT_PHOTO_PLACE;

/* ----- FONTS (load before canvas fillText / drawImage) ----- */
export const FONTS = {
  display: "Anton",          // headline, badge title, numerals
  semiCondensed: "Archivo",  // labels, eyebrows, CTA titles (weights 700-800)
  value: "Bricolage",        // date/time/venue values (Bricolage Grotesque, 700)
  body: "Inter",             // small body text, URL (400-600)
} as const;

/* ----- EVENT COPY (static text on the card) ----- */
export const COPY = {
  eyebrow: "IN MEMORY · IN SOLIDARITY · IN PRIDE",
  wellPlaceholderTitle: "YOUR PHOTO HERE",
  wellPlaceholderSub: "PORTRAIT · 4 : 5",
  stamp: "I WISH SUCCESS OF THE EVENT",
  headlineUp: "JULY UPRISING",
  headlineMain: "MEMORIAL AWARD",
  year: "2026",
  date: "13 July 2026",
  time: "3:00 PM",
  venue: "National Museum, Bangladesh",
  cta: [
    { num: "01", title: "Nominate",     sub: "Your Teacher" },
    { num: "02", title: "Register",     sub: "Your Club for Club Award" },
    { num: "03", title: "Register Now", sub: "www.punab.com/july-award-2026" },
  ],
} as const;
