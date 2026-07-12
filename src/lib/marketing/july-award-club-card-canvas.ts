import { loadJulyAwardImage } from "@/lib/marketing/july-award-background-removal";

/** Export size — matches `.card` in JulyAwardClubCardGenerator.module.css */
export const CLUB_CARD_W = 1080;
export const CLUB_CARD_H = 1350;

const BADGE_TOP = 184;
const BADGE_SIZE = 520;
const BADGE_CX = CLUB_CARD_W / 2;
const BADGE_CY = BADGE_TOP + BADGE_SIZE / 2;
const BADGE_R = BADGE_SIZE / 2;
const LOGO_FRAC = 0.76;
const INNER_INSET = 14;

export type ClubCardLogoPlace = {
  zoom: number;
  panXPx: number;
  panYPx: number;
};

export type ClubCardDrawInput = {
  template: HTMLImageElement;
  logo: HTMLImageElement | null;
  logoPlace: ClubCardLogoPlace;
};

/** Draw club greeting poster (template + circular logo badge) — no html2canvas. */
export function drawJulyAwardClubCard(canvas: HTMLCanvasElement, input: ClubCardDrawInput): void {
  const { template, logo, logoPlace } = input;
  canvas.width = CLUB_CARD_W;
  canvas.height = CLUB_CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(template, 0, 0, CLUB_CARD_W, CLUB_CARD_H);

  ctx.save();
  ctx.beginPath();
  ctx.arc(BADGE_CX, BADGE_CY, BADGE_R, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#f7d778";
  ctx.lineWidth = 7;
  ctx.stroke();

  const innerR = BADGE_R - INNER_INSET;
  ctx.beginPath();
  ctx.arc(BADGE_CX, BADGE_CY, innerR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(117, 81, 20, 0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (logo && logo.naturalWidth > 0 && logo.naturalHeight > 0) {
    const clipR = innerR - 2;
    ctx.beginPath();
    ctx.arc(BADGE_CX, BADGE_CY, clipR, 0, Math.PI * 2);
    ctx.clip();

    const logoBox = BADGE_SIZE * LOGO_FRAC * logoPlace.zoom;
    const iw = logo.naturalWidth;
    const ih = logo.naturalHeight;
    const scale = Math.min(logoBox / iw, logoBox / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const x = BADGE_CX - dw / 2 + logoPlace.panXPx;
    const y = BADGE_CY - dh / 2 + logoPlace.panYPx;
    ctx.drawImage(logo, x, y, dw, dh);
  }

  ctx.restore();
}

export async function loadJulyAwardClubCardLogo(src: string): Promise<HTMLImageElement> {
  return loadJulyAwardImage(src);
}
