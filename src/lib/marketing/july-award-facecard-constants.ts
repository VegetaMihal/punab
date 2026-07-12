/**
 * FACECARD DESIGN CONSTANTS — single source of truth.
 * The card art (logo, headline, date/time/venue, crowd photo, footer) is a
 * single flattened background image (`ASSETS.bg`) — only the photo well is
 * drawn dynamically on top. CARD matches that image's aspect ratio exactly.
 */

export const CARD = {
  width: 1080,
  height: 1230,
} as const;

export const EXPORT_SCALE = 3; // 1080*3 x 1230*3 = 3240 x 3690 final PNG

export const COLORS = {
  green: "#15562D",
  greenDeep: "#0E3D20",
  greenBright: "#1C6B3A",
  greenInk: "#10331C",
  red: "#D82027",
  redDeep: "#B2171D",
  orange: "#FAA525",
  gold: "#C8972F",
  goldBright: "#E3B94A",
  paper: "#F7F5EF",
  paper2: "#FBFAF6",
  ink: "#16140F",
} as const;

/** Inner photo area — clip the user photo to this rounded rect, pixel-measured from ASSETS.bg. */
export const PHOTO_WELL = {
  x: 337,
  y: 204,
  width: 365,
  height: 461,
  radius: 44,
  centerX: 337 + 365 / 2,
  centerY: 204 + 461 / 2,
  emptyBg: "#FFFFFF",
} as const;

export const PHOTO_PLACE_LIMITS = {
  zoomMin: 0.72,
  zoomMax: 1.28,
  zoomStep: 0.02,
  panPxMax: 120,
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
  wellPlaceholderSub: "PORTRAIT",
} as const;

export const ASSETS = {
  bg: "/images/marketing/july-award-2026-facecard-bg-v3.jpg",
} as const;
