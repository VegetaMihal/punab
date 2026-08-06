/**
 * FUTSAL PHOTOCARD DESIGN CONSTANTS — single source of truth.
 * Card art (July Memorial banner, monument art, PUNAB logo, footer) is a
 * single flattened background image (`ASSETS.bg`) — only the photo well is
 * drawn dynamically on top. CARD matches that image's aspect ratio exactly.
 */

export const CARD = {
  width: 1254,
  height: 1254,
} as const;

export const EXPORT_SCALE = 3; // 1254*3 x 1254*3 = 3762 x 3762 final image

/** Inner photo area — clip the user photo to this rounded rect, pixel-measured from ASSETS.bg. */
export const PHOTO_WELL = {
  x: 431,
  y: 365,
  width: 775,
  height: 699,
  radius: 40,
  centerX: 431 + 775 / 2,
  centerY: 365 + 699 / 2,
  emptyBg: "#FFFFFF",
} as const;

export const PHOTO_PLACE_LIMITS = {
  zoomMin: 0.72,
  zoomMax: 1.28,
  zoomStep: 0.02,
  panPxMax: 140,
} as const;

export type PhotoPlace = {
  zoom: number;
  panXPx: number;
  panYPx: number;
};

export const DEFAULT_PHOTO_PLACE: PhotoPlace = {
  zoom: 1,
  panXPx: 0,
  panYPx: 0,
};

export const COPY = {
  wellPlaceholderTitle: "YOUR PHOTO HERE",
  wellPlaceholderSub: "SQUARE",
} as const;

export const ASSETS = {
  bg: "/images/marketing/punab-futsal-2026-photocard-bg.jpg",
} as const;
