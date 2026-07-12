import { PUNAB_LOGO_SRC } from "@/components/layout/logo";
import { julyAward2026ParticipationCardLedger } from "@/lib/july-award-2026-event";
import {
  JULY_AWARD_PARTICIPATION_CARD_PARAGRAPH,
  type JulyAwardParticipationCardCopyVariant,
} from "@/lib/marketing/july-award-participation-card-copy";
import { JULY_AWARD_PARTICIPATION_DEFAULT_THEME } from "@/lib/marketing/july-award-participation-card-themes";
import { loadJulyAwardImage } from "@/lib/marketing/july-award-background-removal";

function isRemoteImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

export const PARTICIPATION_CARD_W = 1080;
export const PARTICIPATION_CARD_H = 1350;

const theme = JULY_AWARD_PARTICIPATION_DEFAULT_THEME;

export const PARTICIPATION_VERIFIED_SEAL_SIZE = 96;

export type ParticipationCardDrawInput = {
  clubName: string;
  universityName: string;
  partnerNo: string;
  /** Ledger column heading (default PARTNER N°; debate uses PARTNERSHIP). */
  partnerFieldLabel?: string;
  clubLogoSrc: string | null;
  punabLogo: HTMLImageElement;
  clubLogo: HTMLImageElement | null;
  verifiedSeal?: HTMLImageElement | null;
  copyVariant?: JulyAwardParticipationCardCopyVariant;
};

function verifiedSealSvgMarkup(red: string, size: number): string {
  const R = size / 2;
  const topId = `punab-vs-top-${size}`;
  const botId = `punab-vs-bot-${size}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <path id="${topId}" d="M ${R * 0.22} ${R} A ${R * 0.78} ${R * 0.78} 0 0 1 ${size - R * 0.22} ${R}"/>
    <path id="${botId}" d="M ${R * 0.3} ${R} A ${R * 0.7} ${R * 0.7} 0 0 0 ${size - R * 0.3} ${R}"/>
  </defs>
  <circle cx="${R}" cy="${R}" r="${R - 2}" fill="none" stroke="${red}" stroke-width="2"/>
  <circle cx="${R}" cy="${R}" r="${R - 9}" fill="none" stroke="${red}" stroke-width="0.6" opacity="0.7"/>
  <text fill="${red}" font-family="Manrope, system-ui, sans-serif" font-size="${size * 0.085}" font-weight="700" letter-spacing="0.34em">
    <textPath href="#${topId}" startOffset="50%" text-anchor="middle">PUNAB · OFFICIAL</textPath>
  </text>
  <text fill="${red}" font-family="Manrope, system-ui, sans-serif" font-size="${size * 0.07}" font-weight="600" letter-spacing="0.42em" opacity="0.85">
    <textPath href="#${botId}" startOffset="50%" text-anchor="middle">★  2026  ★</textPath>
  </text>
  <circle cx="${R}" cy="${R}" r="${R * 0.42}" fill="none" stroke="${red}" stroke-width="1"/>
  <path d="M ${R - R * 0.22} ${R} L ${R - R * 0.04} ${R + R * 0.18} L ${R + R * 0.26} ${R - R * 0.18}"
    fill="none" stroke="${red}" stroke-width="${size * 0.05}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

export async function loadParticipationVerifiedSeal(
  size = PARTICIPATION_VERIFIED_SEAL_SIZE
): Promise<HTMLImageElement> {
  const svg = verifiedSealSvgMarkup(theme.red, size);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return loadJulyAwardImage(url);
}

function loadClubLogo(src: string): Promise<HTMLImageElement> {
  if (isRemoteImageSrc(src)) {
    return loadJulyAwardImage(src);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Club logo failed to load"));
    img.src = src;
  });
}

export type ParticipationCardAssets = {
  punabLogo: HTMLImageElement;
  verifiedSeal: HTMLImageElement;
};

export async function preloadParticipationCardAssets(): Promise<ParticipationCardAssets> {
  const [punabLogo, verifiedSeal] = await Promise.all([
    loadJulyAwardImage(PUNAB_LOGO_SRC),
    loadParticipationVerifiedSeal(),
  ]);
  return { punabLogo, verifiedSeal };
}

export async function loadParticipationClubLogo(src: string): Promise<HTMLImageElement> {
  return loadClubLogo(src);
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  font: string,
  color: string
) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(text, cx, y);
  ctx.restore();
}

function measureWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
  font: string
): { lines: string[]; height: number } {
  ctx.save();
  ctx.font = font;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  ctx.restore();
  return { lines, height: lines.length * lineHeight };
}

/** Returns Y coordinate just below the last line. */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font: string,
  color: string
): number {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const { lines } = measureWrappedLines(ctx, text, maxWidth, lineHeight, font);
  let cy = y;
  for (const ln of lines) {
    ctx.fillText(ln, x, cy);
    cy += lineHeight;
  }
  ctx.restore();
  return lines.length > 0 ? y + lines.length * lineHeight : y;
}

function pickClubNameTypography(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number
): { font: string; lineHeight: number } {
  const family = '"Bricolage Grotesque", Manrope, sans-serif';
  const sizes = [44, 38, 32, 28, 24];
  for (const size of sizes) {
    const font = `800 ${size}px ${family}`;
    const lineHeight = Math.ceil(size * 1.14);
    const { height } = measureWrappedLines(ctx, text, maxWidth, lineHeight, font);
    if (height <= maxHeight || size === sizes[sizes.length - 1]) {
      return { font, lineHeight };
    }
  }
  const fallback = sizes[sizes.length - 1]!;
  return {
    font: `800 ${fallback}px ${family}`,
    lineHeight: Math.ceil(fallback * 1.14),
  };
}

function drawClubLogoRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  logo: HTMLImageElement | null
) {
  const r = size / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
  ctx.strokeStyle = theme.green;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.paper;
  ctx.fill();
  ctx.strokeStyle = theme.red;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  const innerR = r - 14;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.clip();
  if (logo) {
    const pad = innerR * 0.8;
    const iw = logo.naturalWidth;
    const ih = logo.naturalHeight;
    const scale = Math.min((pad * 2) / iw, (pad * 2) / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(logo, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    ctx.fillStyle = theme.paper;
    ctx.fillRect(cx - innerR, cy - innerR, innerR * 2, innerR * 2);
    ctx.font = '700 15px Manrope, system-ui, sans-serif';
    ctx.fillStyle = theme.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CLUB LOGO", cx, cy);
  }
  ctx.restore();
  ctx.restore();
}

/** Draw full 1080×1350 appreciation partner card onto canvas. */
export function drawParticipationCard(
  canvas: HTMLCanvasElement,
  input: ParticipationCardDrawInput
): void {
  const { clubName, universityName, partnerNo, partnerFieldLabel, punabLogo, clubLogo } = input;
  const copyVariant = input.copyVariant ?? "club";
  canvas.width = PARTICIPATION_CARD_W;
  canvas.height = PARTICIPATION_CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = PARTICIPATION_CARD_W;
  const H = PARTICIPATION_CARD_H;
  const cx = W / 2;

  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = theme.green;
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = theme.red;
  ctx.lineWidth = 0.75;
  ctx.strokeRect(38, 38, W - 76, H - 76);
  ctx.globalAlpha = 1;

  const corners: [number, number][] = [
    [38, 38],
    [1042, 38],
    [38, 1312],
    [1042, 1312],
  ];
  for (const [x, y] of corners) {
    ctx.strokeStyle = theme.red;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y + 8);
    ctx.stroke();
    ctx.strokeStyle = theme.green;
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.stroke();
  }

  drawCenteredText(ctx, "PRESENTED BY", cx, 76, '700 11px Manrope, system-ui, sans-serif', theme.green);

  const punabH = 110;
  const punabW = (punabLogo.naturalWidth / punabLogo.naturalHeight) * punabH;
  ctx.drawImage(punabLogo, cx - punabW / 2, 108, punabW, punabH);

  drawCenteredText(
    ctx,
    "PRIVATE UNIVERSITY NATIONAL ASSOCIATION OF BANGLADESH",
    cx,
    236,
    '600 10.5px Manrope, system-ui, sans-serif',
    theme.inkSoft
  );

  ctx.strokeStyle = theme.green;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(120, 282);
  ctx.lineTo(W - 120, 282);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.red;
  ctx.beginPath();
  ctx.arc(cx, 282, 3, 0, Math.PI * 2);
  ctx.fill();

  drawCenteredText(ctx, "APPRECIATION", cx, 330, '800 104px "Bricolage Grotesque", Manrope, sans-serif', theme.green);
  drawCenteredText(ctx, "PARTNER", cx, 430, '800 104px "Bricolage Grotesque", Manrope, sans-serif', theme.red);

  drawCenteredText(
    ctx,
    "JULY UPRISING MEMORIAL AWARD · 2026",
    cx,
    564,
    '700 13px Manrope, system-ui, sans-serif',
    theme.ink
  );

  drawWrappedText(
    ctx,
    JULY_AWARD_PARTICIPATION_CARD_PARAGRAPH[copyVariant],
    156,
    612,
    W - 312,
    32,
    'italic 500 22px "Cormorant Garamond", Georgia, serif',
    theme.inkSoft
  );

  const logoSize = 300;
  const logoCx = 80 + logoSize / 2;
  const logoCy = 800 + logoSize / 2;
  drawClubLogoRing(ctx, logoCx, logoCy, logoSize, clubLogo);

  const textX = 80 + logoSize + 36;
  const textMaxW = W - textX - 80;
  ctx.font = '700 11px Manrope, system-ui, sans-serif';
  ctx.fillStyle = theme.red;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("— APPRECIATION PARTNER —", textX, 820);

  const nameY = 848;
  const name = (clubName.trim() || "—").toUpperCase();
  const uni = (universityName.trim() || " ").toUpperCase();
  const uniFont = '700 16px Manrope, system-ui, sans-serif';
  const uniLineHeight = 22;
  const uniBlockHeight = measureWrappedLines(ctx, uni, textMaxW, uniLineHeight, uniFont).height;
  const blockBottomMax = H - 128 - uniBlockHeight;
  const maxNameHeight = Math.max(52, blockBottomMax - nameY - 28);

  const { font: nameFont, lineHeight: nameLineHeight } = pickClubNameTypography(
    ctx,
    name,
    textMaxW,
    maxNameHeight
  );
  const nameBottom = drawWrappedText(
    ctx,
    name,
    textX,
    nameY,
    textMaxW,
    nameLineHeight,
    nameFont,
    theme.ink
  );

  const dividerY = nameBottom + 14;
  ctx.strokeStyle = theme.green;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(textX, dividerY);
  ctx.lineTo(textX + 80, dividerY);
  ctx.stroke();
  ctx.globalAlpha = 1;

  drawWrappedText(
    ctx,
    uni,
    textX,
    dividerY + 18,
    textMaxW,
    uniLineHeight,
    uniFont,
    theme.green
  );

  const seal = input.verifiedSeal;
  if (seal) {
    const sealSize = PARTICIPATION_VERIFIED_SEAL_SIZE;
    const sealLeft = W - 56 - sealSize;
    const sealTop = 752;
    const sealCx = sealLeft + sealSize / 2;
    const sealCy = sealTop + sealSize / 2;
    ctx.save();
    ctx.translate(sealCx, sealCy);
    ctx.rotate((8 * Math.PI) / 180);
    ctx.drawImage(seal, -sealSize / 2, -sealSize / 2, sealSize, sealSize);
    ctx.restore();
  }

  const ledger = julyAward2026ParticipationCardLedger();
  const ledgerY = H - 112;
  const colW = (W - 160) / 3;
  const cols = [
    { label: partnerFieldLabel?.trim() || "PARTNER N°", value: partnerNo.trim() || "—", mono: true },
    { label: "DATE", value: ledger.dateLabel, mono: false },
    { label: "VENUE", value: ledger.venueLabel, mono: false },
  ];
  cols.forEach((col, i) => {
    const colCx = 80 + colW * i + colW / 2;
    drawCenteredText(ctx, col.label, colCx, ledgerY - 36, '700 10px Manrope, system-ui, sans-serif', theme.green);
    drawCenteredText(
      ctx,
      col.value,
      colCx,
      ledgerY - 8,
      col.mono
        ? '700 16px ui-monospace, Menlo, Consolas, monospace'
        : '700 16px "Bricolage Grotesque", Manrope, sans-serif',
      theme.ink
    );
  });

  ctx.strokeStyle = theme.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, H - 56);
  ctx.lineTo(W - 80, H - 56);
  ctx.stroke();
  ctx.fillStyle = theme.red;
  ctx.beginPath();
  ctx.arc(cx, H - 56, 6, 0, Math.PI * 2);
  ctx.fill();

  drawCenteredText(
    ctx,
    "PUNAB · UNITY · MOBILIZING · PROGRESS",
    cx,
    H - 28,
    '700 9px Manrope, system-ui, sans-serif',
    theme.inkSoft
  );
}
