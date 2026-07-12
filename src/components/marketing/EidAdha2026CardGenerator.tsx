"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import styles from "./EidAdha2026CardGenerator.module.css";

/* ============================================================
   CONSTANTS
============================================================ */
const DESIGN_W = 1080;
const DESIGN_H = 1350;
const NUDGE_STEP = 18;

const COLOR = {
  navy1:    "#061427",
  navy2:    "#0b2240",
  emerald1: "#0a2a22",
  emerald2: "#133b30",
  gold1:    "#d6b977",
  gold2:    "#b48a3e",
  gold3:    "#f3dfa6",
  ivory:    "#f4ecd8",
  ivoryDim: "#d9cfb8",
};

/* ============================================================
   THEME PALETTE  (dark ←→ bright interpolation)
============================================================ */
const DARK_BG   = { top: "#061427", mid: "#0b2240", bot: "#0a2a22" };
const BRIGHT_BG = { top: "#1b4baa", mid: "#2272c4", bot: "#0e6850" };

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lerpColor(dark: string, bright: string, t: number): string {
  const [dr, dg, db] = hexToRgb(dark);
  const [br, bg, bb] = hexToRgb(bright);
  const r = Math.round(dr + (br - dr) * t);
  const g = Math.round(dg + (bg - dg) * t);
  const b = Math.round(db + (bb - db) * t);
  return `rgb(${r},${g},${b})`;
}

/* ============================================================
   TYPES
============================================================ */
interface CardState {
  photo:       HTMLImageElement | null;
  photoZoom:   number;
  photoX:      number;
  photoY:      number;
  name:        string;
  designation: string;
  logo:        HTMLImageElement | null;
  patternTile: HTMLCanvasElement | null;
  theme:       number; // 0 = very dark, 1 = very bright
}

/* ============================================================
   CANVAS DRAWING FUNCTIONS  (all pure — no React refs)
============================================================ */

function buildStarTile(px: number): HTMLCanvasElement {
  const tile = Math.round(200 * px);
  const off  = document.createElement("canvas");
  off.width  = tile;
  off.height = tile;
  const c = off.getContext("2d")!;
  c.strokeStyle = COLOR.gold1;
  c.lineWidth   = Math.max(0.6, 0.9 * px);

  const cx = tile / 2, cy = tile / 2;
  const r1 = 50 * px, r2 = 22 * px;
  c.beginPath();
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 16;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.closePath();
  c.stroke();

  c.beginPath();
  c.arc(cx, cy, 7 * px, 0, Math.PI * 2);
  c.stroke();

  const drawDiamond = (x: number, y: number, s: number) => {
    c.save();
    c.translate(x, y);
    c.rotate(Math.PI / 4);
    c.strokeRect(-s / 2, -s / 2, s, s);
    c.restore();
  };
  drawDiamond(0,      tile / 2, 9 * px);
  drawDiamond(tile,   tile / 2, 9 * px);
  drawDiamond(tile / 2, 0,      9 * px);
  drawDiamond(tile / 2, tile,   9 * px);

  return off;
}

function drawStarPattern(ctx: CanvasRenderingContext2D, W: number, H: number, px: number, s: CardState) {
  const want = Math.round(200 * px);
  if (!s.patternTile || s.patternTile.width !== want) {
    s.patternTile = buildStarTile(px);
  }
  const t = Math.max(0, Math.min(1, s.theme ?? 0.7));
  ctx.save();
  ctx.globalAlpha = 0.12 + 0.10 * t; // 0.12 at dark → 0.22 at bright
  const pat = ctx.createPattern(s.patternTile, "repeat");
  if (pat) ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawMosque(ctx: CanvasRenderingContext2D, W: number, H: number, px: number) {
  const mw = 640 * px, mh = 220 * px;
  const mx = (W - mw) / 2, my = 844 * px - mh;

  ctx.save();
  ctx.translate(mx, my);
  const grad = ctx.createLinearGradient(0, 0, 0, mh);
  grad.addColorStop(0, "rgba(214,185,119,0.20)");
  grad.addColorStop(1, "rgba(214,185,119,0)");
  ctx.fillStyle = grad;

  ctx.fillRect(40 * px, 70 * px, 14 * px, 150 * px);
  ctx.beginPath();
  ctx.moveTo(40 * px, 70 * px); ctx.lineTo(54 * px, 70 * px); ctx.lineTo(47 * px, 48 * px);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(47 * px, 40 * px, 6 * px, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(44 * px, 28 * px, 6 * px, 14 * px);

  ctx.fillRect(586 * px, 70 * px, 14 * px, 150 * px);
  ctx.beginPath();
  ctx.moveTo(586 * px, 70 * px); ctx.lineTo(600 * px, 70 * px); ctx.lineTo(593 * px, 48 * px);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(593 * px, 40 * px, 6 * px, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(590 * px, 28 * px, 6 * px, 14 * px);

  ctx.beginPath();
  ctx.moveTo(170 * px, 220 * px);
  ctx.lineTo(170 * px, 130 * px);
  ctx.quadraticCurveTo(170 * px, 60 * px, 320 * px, 50 * px);
  ctx.quadraticCurveTo(470 * px, 60 * px, 470 * px, 130 * px);
  ctx.lineTo(470 * px, 220 * px);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(320 * px, 40 * px, 8 * px, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(317 * px, 20 * px, 6 * px, 22 * px);

  const bay = (cx: number) => {
    ctx.beginPath();
    ctx.moveTo((cx - 50) * px, 220 * px);
    ctx.lineTo((cx - 50) * px, 150 * px);
    ctx.quadraticCurveTo((cx - 50) * px, 110 * px, cx * px, 105 * px);
    ctx.quadraticCurveTo((cx + 50) * px, 110 * px, (cx + 50) * px, 150 * px);
    ctx.lineTo((cx + 50) * px, 220 * px);
    ctx.closePath(); ctx.fill();
  };
  bay(140); bay(500);

  ctx.fillRect(0, 218 * px, 640 * px, 2 * px);
  ctx.restore();
}

function drawSideOrnaments(ctx: CanvasRenderingContext2D, W: number, _H: number, px: number) {
  const drawOne = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(214,185,119,0.55)";
    ctx.lineWidth   = 1.1 * px;
    ctx.lineCap     = "round";

    ctx.beginPath(); ctx.moveTo(60 * px, 0); ctx.lineTo(60 * px, 220 * px); ctx.stroke();
    ctx.beginPath(); ctx.arc(60 * px, 40 * px, 14 * px, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(60 * px, 40 * px,  6 * px, 0, Math.PI * 2); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60 * px, 70 * px);
    ctx.quadraticCurveTo(38 * px, 92 * px, 60 * px, 114 * px);
    ctx.quadraticCurveTo(82 * px, 136 * px, 60 * px, 158 * px);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(60 * px, 70 * px);
    ctx.quadraticCurveTo(82 * px, 92 * px, 60 * px, 114 * px);
    ctx.quadraticCurveTo(38 * px, 136 * px, 60 * px, 158 * px);
    ctx.stroke();

    ctx.beginPath(); ctx.arc(60 * px, 180 * px, 10 * px, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(60 * px, 180 * px,  4 * px, 0, Math.PI * 2); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(48 * px, 200 * px);
    ctx.quadraticCurveTo(60 * px, 212 * px, 72 * px, 200 * px);
    ctx.stroke();
    ctx.restore();
  };
  drawOne(90 * px, 562 * px);
  drawOne((DESIGN_W - 90 - 120) * px, 562 * px);
}

function archPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  rTop: number, rBot: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y + rTop);
  ctx.arcTo(x, y, x + rTop, y, rTop);
  ctx.lineTo(x + w - rTop, y);
  ctx.arcTo(x + w, y, x + w, y + rTop, rTop);
  ctx.lineTo(x + w, y + h - rBot);
  ctx.arcTo(x + w, y + h, x + w - rBot, y + h, rBot);
  ctx.lineTo(x + rBot, y + h);
  ctx.arcTo(x, y + h, x, y + h - rBot, rBot);
  ctx.closePath();
}

function drawPhotoCovered(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
  zoom: number, offX: number, offY: number
) {
  const iw    = img.naturalWidth  || (img as HTMLImageElement).width;
  const ih    = img.naturalHeight || (img as HTMLImageElement).height;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw    = iw * scale, dh = ih * scale;
  const dx    = x + (w - dw) / 2 + offX;
  const dy    = y + (h - dh) / 2 + offY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPortraitArch(ctx: CanvasRenderingContext2D, W: number, _H: number, px: number, s: CardState) {
  const w    = 320 * px, h = 410 * px;
  const x    = (W - w) / 2, y = 432 * px;
  const rTop = 160 * px, rBot = 8 * px;

  ctx.save();
  ctx.shadowColor   = "rgba(0,0,0,0.55)";
  ctx.shadowOffsetY = 24 * px;
  ctx.shadowBlur    = 50 * px;
  ctx.fillStyle     = COLOR.navy1;
  archPath(ctx, x, y, w, h, rTop, rBot); ctx.fill();
  ctx.restore();

  const ring = (offset: number, fill: string) => {
    ctx.fillStyle = fill;
    archPath(ctx, x - offset, y - offset, w + 2 * offset, h + 2 * offset, rTop + offset, rBot + offset);
    ctx.fill();
  };
  ring(8 * px, COLOR.gold1);
  ring(6 * px, COLOR.navy1);
  ring(3 * px, COLOR.gold2);

  ctx.save();
  archPath(ctx, x, y, w, h, rTop, rBot);
  ctx.clip();

  if (s.photo) {
    drawPhotoCovered(ctx, s.photo, x, y, w, h, s.photoZoom, s.photoX * px, s.photoY * px);
  } else {
    const plg = ctx.createLinearGradient(x, y, x, y + h);
    plg.addColorStop(0, "#0d2238");
    plg.addColorStop(1, "#0a2a22");
    ctx.fillStyle = plg; ctx.fillRect(x, y, w, h);

    const glow = ctx.createRadialGradient(x + w / 2, y + h * 0.4, 0, x + w / 2, y + h * 0.4, w * 0.7);
    glow.addColorStop(0, "rgba(244,236,216,0.08)");
    glow.addColorStop(1, "rgba(244,236,216,0)");
    ctx.fillStyle = glow; ctx.fillRect(x, y, w, h);

    ctx.fillStyle    = "rgba(244,236,216,0.55)";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.font         = `300 ${22 * px}px Georgia, serif`;
    ctx.fillText("Upload your portrait", x + w / 2, y + h / 2 - 12 * px);
    ctx.font      = `400 ${12 * px}px 'Inter', sans-serif`;
    ctx.fillStyle = "rgba(214,185,119,0.5)";
    setLetterSpacing(ctx, 0.22 * 12 * px);
    ctx.fillText("JPG · PNG · WEBP", x + w / 2, y + h / 2 + 14 * px);
    setLetterSpacing(ctx, 0);
  }
  ctx.restore();

  const kCx = x + w / 2, kCy = y, kR = 22 * px;
  ctx.fillStyle = COLOR.gold1;
  ctx.beginPath(); ctx.arc(kCx, kCy, kR + 2 * px, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLOR.navy1;
  ctx.beginPath(); ctx.arc(kCx, kCy, kR, 0, Math.PI * 2); ctx.fill();
  const kg = ctx.createRadialGradient(kCx - kR * 0.3, kCy - kR * 0.3, 0, kCx, kCy, kR);
  kg.addColorStop(0, COLOR.gold3); kg.addColorStop(1, COLOR.gold2);
  ctx.fillStyle = kg;
  ctx.beginPath(); ctx.arc(kCx, kCy, kR - 2 * px, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(kCx, kCy); ctx.rotate(Math.PI / 4);
  ctx.fillStyle = COLOR.navy1;
  const ds = 7 * px; ctx.fillRect(-ds, -ds, ds * 2, ds * 2);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = px + "px"; } catch { /* noop */ }
}

function drawHeader(ctx: CanvasRenderingContext2D, W: number, _H: number, px: number, s: CardState) {
  if (s.logo) {
    const lh   = 70 * px;
    const lw   = lh * (s.logo.naturalWidth / s.logo.naturalHeight);
    const padX = 16 * px, padT = 12 * px, padB = 10 * px;
    const lx   = 84 * px, ly = 78 * px;
    const plateX = lx - padX, plateY = ly - padT;
    const plateW = lw + 2 * padX, plateH = lh + padT + padB;

    ctx.save();
    ctx.shadowColor   = "rgba(0,0,0,0.35)";
    ctx.shadowOffsetY = 6 * px;
    ctx.shadowBlur    = 18 * px;
    ctx.fillStyle     = "rgba(244,236,216,0.96)";
    roundRect(ctx, plateX, plateY, plateW, plateH, 4 * px);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "rgba(180,138,62,0.4)";
    ctx.lineWidth   = 1 * px;
    roundRect(ctx, plateX + 0.5 * px, plateY + 0.5 * px, plateW - 1 * px, plateH - 1 * px, 4 * px);
    ctx.stroke();
    ctx.drawImage(s.logo, lx, ly, lw, lh);
  }

  const rightX = W - 84 * px;
  ctx.textAlign    = "right";
  ctx.textBaseline = "top";

  ctx.fillStyle = COLOR.ivoryDim;
  ctx.font      = `500 ${10.5 * px}px 'Cinzel', Georgia, serif`;
  setLetterSpacing(ctx, 0.35 * 10.5 * px);
  ctx.fillText("ON BEHALF OF PUNAB", rightX, 86 * px);

  ctx.fillStyle = COLOR.gold3;
  ctx.font      = `600 ${14 * px}px 'Cinzel', Georgia, serif`;
  setLetterSpacing(ctx, 0.22 * 14 * px);
  ctx.fillText("2026", rightX, 112 * px);
  setLetterSpacing(ctx, 0);
}

function gradientRule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0,   "rgba(214,185,119,0)");
  g.addColorStop(0.5, COLOR.gold1);
  g.addColorStop(1,   "rgba(214,185,119,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y - 0.5, w, 1.4);
}

function drawCrescent(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, mirror: boolean
) {
  const off    = document.createElement("canvas");
  off.width    = Math.ceil(size);
  off.height   = Math.ceil(size);
  const c      = off.getContext("2d")!;
  const cg     = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  cg.addColorStop(0, COLOR.gold3);
  cg.addColorStop(1, COLOR.gold2);
  c.fillStyle = cg;
  c.beginPath(); c.arc(size * 13 / 26, size * 13 / 26, size * 8 / 26, 0, Math.PI * 2); c.fill();
  c.globalCompositeOperation = "destination-out";
  c.beginPath(); c.arc(size * 15 / 26, size * 11 / 26, size * 6 / 26, 0, Math.PI * 2); c.fill();
  c.globalCompositeOperation = "source-over";
  c.fillStyle = COLOR.gold3;
  c.beginPath(); c.arc(size * 22 / 26, size * 5 / 26, size * 1.6 / 26, 0, Math.PI * 2); c.fill();

  if (mirror) {
    ctx.save(); ctx.translate(x + size, y); ctx.scale(-1, 1); ctx.drawImage(off, 0, 0); ctx.restore();
  } else {
    ctx.drawImage(off, x, y);
  }
}

function drawTopOrnament(ctx: CanvasRenderingContext2D, W: number, _H: number, px: number) {
  const y      = 226 * px;
  const cx     = W / 2;
  const ruleW  = 110 * px;
  const cresW  = 26 * px;
  const diamS  = 10 * px;
  const gap    = 16 * px;
  const totalW = ruleW + gap + cresW + gap + diamS + gap + cresW + gap + ruleW;
  let lx       = cx - totalW / 2;

  gradientRule(ctx, lx, y, ruleW); lx += ruleW + gap;
  drawCrescent(ctx, lx, y - cresW / 2, cresW, false); lx += cresW + gap;
  ctx.save();
  ctx.translate(lx + diamS / 2, y); ctx.rotate(Math.PI / 4);
  ctx.fillStyle    = COLOR.gold1;
  ctx.shadowColor  = "rgba(214,185,119,0.6)";
  ctx.shadowBlur   = 12 * px;
  ctx.fillRect(-diamS / 2, -diamS / 2, diamS, diamS);
  ctx.restore();
  lx += diamS + gap;
  drawCrescent(ctx, lx, y - cresW / 2, cresW, true); lx += cresW + gap;
  gradientRule(ctx, lx, y, ruleW);
}

function drawArabic(ctx: CanvasRenderingContext2D, W: number, _H: number, px: number) {
  ctx.save();
  ctx.textAlign    = "center";
  ctx.textBaseline = "alphabetic";
  ctx.direction    = "rtl";

  const headSize     = 86 * px;
  const headBaseline = 336 * px;
  ctx.font = `700 ${headSize}px 'Amiri', 'Scheherazade New', 'Traditional Arabic', serif`;
  const gg = ctx.createLinearGradient(0, headBaseline - headSize, 0, headBaseline + headSize * 0.1);
  gg.addColorStop(0,   COLOR.gold3);
  gg.addColorStop(0.5, COLOR.gold1);
  gg.addColorStop(1,   COLOR.gold2);
  ctx.fillStyle    = gg;
  ctx.shadowColor  = "rgba(214,185,119,0.22)";
  ctx.shadowBlur   = 14 * px;
  ctx.shadowOffsetY = 4 * px;
  ctx.fillText("عيد أضحى مبارك", W / 2, headBaseline);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = String(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line); line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawFooter(ctx: CanvasRenderingContext2D, W: number, _H: number, px: number, s: CardState) {
  const cx = W / 2;
  ctx.textAlign    = "center";
  ctx.textBaseline = "alphabetic";

  let y = 988 * px;
  ctx.fillStyle   = COLOR.gold3;
  ctx.font        = `600 ${42 * px}px 'Cinzel', Georgia, serif`;
  setLetterSpacing(ctx, 0.14 * 42 * px);
  ctx.shadowColor = "rgba(214,185,119,0.25)";
  ctx.shadowBlur  = 12 * px;
  ctx.fillText("EID-UL-ADHA MUBARAK", cx, y);
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  setLetterSpacing(ctx, 0);

  y += 28 * px;
  const segW = 60 * px, gap = 14 * px, dot = 6 * px;
  const totalW = segW * 2 + gap * 2 + dot;
  let dx = cx - totalW / 2;
  gradientRule(ctx, dx, y, segW); dx += segW + gap;
  ctx.save();
  ctx.translate(dx + dot / 2, y); ctx.rotate(Math.PI / 4);
  ctx.fillStyle = COLOR.gold1; ctx.fillRect(-dot / 2, -dot / 2, dot, dot);
  ctx.restore();
  dx += dot + gap;
  gradientRule(ctx, dx, y, segW);

  y += 36 * px;
  ctx.fillStyle = "rgba(244,236,216,0.95)";
  ctx.font      = `italic 400 ${22 * px}px 'Cormorant Garamond', Georgia, 'Times New Roman', serif`;
  const message = "On the blessed occasion of Eid-ul-Adha, I extend my heartfelt greetings and warmest wishes to you and your family. May this sacred festival bring peace, prosperity, and abundant blessings to all.";
  const lines   = wrapText(ctx, message, 780 * px);
  const lh      = 1.5 * 22 * px;
  for (const line of lines) { ctx.fillText(line, cx, y); y += lh; }

  y += 18 * px;
  ctx.fillStyle = COLOR.ivoryDim;
  ctx.font      = `italic 400 ${19 * px}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillText("With warm wishes,", cx, y);

  y += 38 * px;
  const nameText = (s.name || "").trim().toUpperCase() || " ";
  ctx.fillStyle = COLOR.gold3;
  ctx.font      = `600 ${28 * px}px 'Cinzel', Georgia, serif`;
  setLetterSpacing(ctx, 0.18 * 28 * px);
  ctx.fillText(nameText, cx, y);
  setLetterSpacing(ctx, 0);

  y += 30 * px;
  const roleText = (s.designation || "").trim().toUpperCase() || " ";
  ctx.fillStyle = COLOR.gold1;
  ctx.font      = `500 ${13 * px}px 'Inter', -apple-system, 'Segoe UI', sans-serif`;
  setLetterSpacing(ctx, 0.32 * 13 * px);
  ctx.fillText(roleText, cx, y);
  setLetterSpacing(ctx, 0);

  y += 20 * px;
  ctx.fillStyle = COLOR.ivoryDim;
  ctx.font      = `400 ${11.5 * px}px 'Inter', -apple-system, 'Segoe UI', sans-serif`;
  setLetterSpacing(ctx, 0.22 * 11.5 * px);
  ctx.fillText("PRIVATE UNIVERSITY NATIONAL ASSOCIATION OF BANGLADESH · PUNAB", cx, y);
  setLetterSpacing(ctx, 0);
}

function drawBorders(ctx: CanvasRenderingContext2D, W: number, H: number, px: number) {
  ctx.strokeStyle = "rgba(214,185,119,0.55)";
  ctx.lineWidth   = 1 * px;
  ctx.strokeRect(28 * px, 28 * px, W - 56 * px, H - 56 * px);

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0,   COLOR.gold2);
  g.addColorStop(0.4, COLOR.gold3);
  g.addColorStop(0.7, COLOR.gold1);
  g.addColorStop(1,   COLOR.gold2);
  ctx.strokeStyle = g;
  ctx.lineWidth   = 2.5 * px;
  ctx.strokeRect(40 * px, 40 * px, W - 80 * px, H - 80 * px);
}

function drawCorners(ctx: CanvasRenderingContext2D, W: number, H: number, px: number) {
  const off = 32 * px;
  const drawOne = (ox: number, oy: number, sx: number, sy: number) => {
    ctx.save();
    ctx.translate(ox, oy); ctx.scale(sx, sy);
    ctx.strokeStyle = COLOR.gold1; ctx.fillStyle = COLOR.gold1;
    ctx.lineWidth   = 1.4 * px; ctx.lineCap = "round";

    ctx.beginPath(); ctx.moveTo(2 * px, 18 * px);
    ctx.quadraticCurveTo(2 * px, 2 * px, 18 * px, 2 * px); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8 * px, 22 * px);
    ctx.quadraticCurveTo(8 * px, 8 * px, 22 * px, 8 * px); ctx.stroke();

    ctx.beginPath(); ctx.arc(10 * px, 10 * px, 2.4 * px, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(2 * px, 32 * px); ctx.lineTo(2 * px, 36 * px);
    ctx.moveTo(2 * px, 42 * px); ctx.lineTo(2 * px, 48 * px);
    ctx.moveTo(32 * px, 2 * px); ctx.lineTo(36 * px, 2 * px);
    ctx.moveTo(42 * px, 2 * px); ctx.lineTo(48 * px, 2 * px);
    ctx.stroke();
    ctx.restore();
  };
  drawOne(off,      off,       1,  1);
  drawOne(W - off,  off,      -1,  1);
  drawOne(off,      H - off,   1, -1);
  drawOne(W - off,  H - off,  -1, -1);
}

function renderCard(ctx: CanvasRenderingContext2D, W: number, H: number, s: CardState) {
  const px = W / DESIGN_W;
  const t  = Math.max(0, Math.min(1, s.theme ?? 0.7)); // clamp 0–1

  /* ── background gradient (theme-sensitive) ── */
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,    lerpColor(DARK_BG.top, BRIGHT_BG.top, t));
  bg.addColorStop(0.35, lerpColor(DARK_BG.mid, BRIGHT_BG.mid, t));
  bg.addColorStop(1,    lerpColor(DARK_BG.bot, BRIGHT_BG.bot, t));
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  /* ── gold glow at top (more prominent when bright) ── */
  const glowAlpha = 0.10 + 0.22 * t;
  const topGlow = ctx.createRadialGradient(W * 0.5, H * 0.18, 0, W * 0.5, H * 0.18, W * 0.58);
  topGlow.addColorStop(0, `rgba(214,185,119,${glowAlpha.toFixed(3)})`);
  topGlow.addColorStop(1, "rgba(214,185,119,0)");
  ctx.fillStyle = topGlow; ctx.fillRect(0, 0, W, H);

  /* ── bottom emerald wash (stays rich, fades slightly when bright) ── */
  const washAlpha = 0.85 - 0.25 * t;
  const bottomWash = ctx.createRadialGradient(W * 0.5, H * 1.05, 0, W * 0.5, H * 1.05, W * 0.7);
  bottomWash.addColorStop(0, `rgba(19,59,48,${washAlpha.toFixed(3)})`);
  bottomWash.addColorStop(1, "rgba(11,34,64,0)");
  ctx.fillStyle = bottomWash; ctx.fillRect(0, 0, W, H);

  /* ── star pattern (slightly more visible when bright) ── */
  drawStarPattern(ctx, W, H, px, s);

  /* ── vignette (much lighter when bright) ── */
  const vignAlpha = 0.45 - 0.35 * t;
  const vign = ctx.createRadialGradient(W / 2, H / 2, W * 0.30, W / 2, H / 2, W * 0.78);
  vign.addColorStop(0, "rgba(0,0,0,0)");
  vign.addColorStop(1, `rgba(0,0,0,${vignAlpha.toFixed(3)})`);
  ctx.fillStyle = vign; ctx.fillRect(0, 0, W, H);

  drawMosque(ctx, W, H, px);
  drawSideOrnaments(ctx, W, H, px);
  drawPortraitArch(ctx, W, H, px, s);
  drawHeader(ctx, W, H, px, s);
  drawTopOrnament(ctx, W, H, px);
  drawArabic(ctx, W, H, px);
  drawFooter(ctx, W, H, px, s);
  drawBorders(ctx, W, H, px);
  drawCorners(ctx, W, H, px);
}

/* ============================================================
   IMAGE HELPERS  (mobile-safe: data-URL avoids canvas CORS taint)
============================================================ */

/**
 * Fetches any URL and returns it as a base64 data URL string.
 * Images loaded from data URLs have no origin, so they can never
 * taint a canvas or be evicted by the iOS blob GC.
 */
async function fetchAsDataUrl(url: string): Promise<string> {
  const res  = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Reads a File as a base64 data URL.
 * Safer than URL.createObjectURL() on mobile: the data lives in JS
 * memory and cannot be evicted under iOS memory pressure.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Load an image from any src (URL or data URL) into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img  = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed: " + src.slice(0, 60)));
    img.src = src;
  });
}

/* ============================================================
   DOWNLOAD HELPERS
============================================================ */
async function ensureFontsLoaded() {
  if (!document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load("700 86px 'Amiri'"),
      document.fonts.load("400 26px 'Amiri'"),
      document.fonts.load("600 42px 'Cinzel'"),
      document.fonts.load("600 28px 'Cinzel'"),
      document.fonts.load("600 14px 'Cinzel'"),
      document.fonts.load("500 13px 'Inter'"),
      document.fonts.load("400 11.5px 'Inter'"),
      document.fonts.load("italic 22px 'Cormorant Garamond'"),
      document.fonts.load("italic 19px 'Cormorant Garamond'"),
    ]);
    await document.fonts.ready;
  } catch { /* noop */ }
}

function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(",");
  const meta  = parts[0];
  const b64   = parts[1];
  const mime  = (meta.match(/data:([^;]+)/) || [, "application/octet-stream"])[1]!;
  const bin   = atob(b64);
  const arr   = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    if (canvas.toBlob) {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob produced empty result"))), "image/png");
    } else {
      try { resolve(dataURLToBlob(canvas.toDataURL("image/png"))); }
      catch (e) { reject(e); }
    }
  });

  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener"; a.target = "_self";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);

  setTimeout(() => {
    try {
      const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
      if (isIOS) window.open(url, "_blank");
    } catch { /* noop */ }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }, 200);
}

function makeFilename(name: string): string {
  const safe = String(name || "PUNAB").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "PUNAB";
  return `Eid-ul-Adha-2026-${safe}.png`;
}

/* ============================================================
   COMPONENT
============================================================ */
export function EidAdha2026CardGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef  = useRef<HTMLDivElement>(null);

  const cardState = useRef<CardState>({
    photo:       null,
    photoZoom:   1,
    photoX:      0,
    photoY:      0,
    name:        "",
    designation: "",
    logo:        null,
    patternTile: null,
    theme:       0.7,
  });

  const [name,          setName]          = useState("");
  const [designation,   setDesignation]   = useState("");
  const [zoom,          setZoom]          = useState(1);
  const [theme,         setTheme]         = useState(0.7);
  const [status,        setStatusState]   = useState({ msg: "", ok: true });
  const [isDownloading, setIsDownloading] = useState(false);

  const dragRef = useRef({
    dragging: false, startX: 0, startY: 0,
    startOffX: 0, startOffY: 0, scale: 1,
  });

  const setStatus = useCallback((msg: string, ok = true) => {
    setStatusState({ msg, ok });
  }, []);

  const refresh = useCallback(() => {
    const canvas = canvasRef.current;
    const stage  = stageRef.current;
    if (!canvas || !stage) return;
    const rect = stage.getBoundingClientRect();
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const w    = Math.max(200, Math.round(rect.width));
    const h    = Math.max(250, Math.round(rect.height));
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderCard(ctx, w, h, cardState.current);
  }, []);

  /* load logo + initial paint
   * Uses fetch → data URL so the resulting Image has no origin,
   * preventing iOS Safari from silently skipping ctx.drawImage(). */
  useEffect(() => {
    fetchAsDataUrl("/images/eid-adha-2026/punab-logo.png")
      .catch(() => fetchAsDataUrl("/branding/punab-logo-transparent-cropped.png"))
      .then((dataUrl) => loadImage(dataUrl))
      .then((img)     => { cardState.current.logo = img; refresh(); })
      .catch(()       => refresh()); // proceed without logo on failure
  }, [refresh]);

  /* resize + font-ready */
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(refresh);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(refresh).catch(() => {});
    refresh();
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, [refresh]);

  /* photo upload
   * Uses FileReader → data URL instead of URL.createObjectURL().
   * Blob URLs backed by file inputs can be GC'd on iOS under memory
   * pressure, making ctx.drawImage() silently produce nothing.
   * Data URLs live in JS memory and are always valid. */
  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    fileToDataUrl(file)
      .then((dataUrl) => loadImage(dataUrl))
      .then((img) => {
        cardState.current.photo     = img;
        cardState.current.photoZoom = 1;
        cardState.current.photoX    = 0;
        cardState.current.photoY    = 0;
        setZoom(1);
        setStatus("Photo loaded — drag to reposition or use zoom.");
        refresh();
      })
      .catch(() => setStatus("Could not load that image — try another file.", false));
  }, [refresh, setStatus]);

  /* text inputs */
  const handleName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    cardState.current.name = e.target.value;
    refresh();
  }, [refresh]);

  const handleDesignation = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDesignation(e.target.value);
    cardState.current.designation = e.target.value;
    refresh();
  }, [refresh]);

  /* zoom */
  const handleZoom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setZoom(val);
    cardState.current.photoZoom = val;
    refresh();
  }, [refresh]);

  /* theme brightness */
  const handleTheme = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTheme(val);
    cardState.current.theme = val;
    cardState.current.patternTile = null; // rebuild pattern at new opacity
    refresh();
  }, [refresh]);

  /* nudge */
  const nudge = useCallback((dx: number, dy: number) => {
    cardState.current.photoX += dx;
    cardState.current.photoY += dy;
    refresh();
  }, [refresh]);

  const handleCenter = useCallback(() => {
    cardState.current.photoX = 0;
    cardState.current.photoY = 0;
    refresh();
  }, [refresh]);

  /* reset */
  const handleReset = useCallback(() => {
    cardState.current.photoX    = 0;
    cardState.current.photoY    = 0;
    cardState.current.photoZoom = 1;
    setZoom(1);
    refresh();
    setStatus("Photo position reset.");
  }, [refresh, setStatus]);

  /* drag-to-reposition */
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardState.current.photo) return;
    const ds    = dragRef.current;
    ds.dragging = true;
    ds.startX   = e.clientX; ds.startY = e.clientY;
    ds.startOffX = cardState.current.photoX;
    ds.startOffY = cardState.current.photoY;
    ds.scale = DESIGN_W / (stageRef.current?.getBoundingClientRect().width || 1);
    try { (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragRef.current;
    if (!ds.dragging) return;
    cardState.current.photoX = ds.startOffX + (e.clientX - ds.startX) * ds.scale;
    cardState.current.photoY = ds.startOffY + (e.clientY - ds.startY) * ds.scale;
    refresh();
  }, [refresh]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragRef.current;
    if (!ds.dragging) return;
    ds.dragging = false;
    try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }, []);

  /* download */
  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    // Mobile devices have a ~16–32 MB canvas pixel budget.
    // 3000×3750 = 45 MB → exceeds iOS Safari limit on many iPhones.
    // 1500×1875 = ~11 MB → safe on all devices, still crisp on mobile screens.
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const exportW  = isMobile ? 1500 : 3000;
    const exportH  = isMobile ? 1875 : 3750;

    setStatus(`Rendering at ${exportW} × ${exportH}…`);
    try {
      await ensureFontsLoaded();
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const c = document.createElement("canvas");
      c.width = exportW; c.height = exportH;
      const ectx = c.getContext("2d");
      if (!ectx) throw new Error("Canvas context unavailable");
      cardState.current.patternTile = null;
      renderCard(ectx, exportW, exportH, cardState.current);
      await downloadCanvas(c, makeFilename(cardState.current.name));
      setStatus("Card downloaded — ready to share.", true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("Download failed: " + msg, false);
    } finally {
      setIsDownloading(false);
      cardState.current.patternTile = null;
      refresh();
    }
  }, [isDownloading, refresh, setStatus]);

  return (
    <div className={styles.wrap}>
      {/* Top bar */}
      <div className={styles.topbar}>
        <h1 className={styles.topbarTitle}>Eid-ul-Adha 2026 · Card Generator</h1>
        <div className={styles.topbarSub}>
          PUNAB · Private University National Association of Bangladesh
        </div>
      </div>

      <div className={styles.app}>
        {/* ── FORM PANEL ── */}
        <aside className={styles.form} aria-label="Card details form">
          <h2 className={styles.sectionTitle}>Personal details</h2>

          <div className={styles.field}>
            <label htmlFor="eid-photo">Portrait photo</label>
            <input id="eid-photo" type="file" accept="image/*" onChange={handlePhoto} />
            <div className={styles.hint}>
              JPG, PNG, or WebP. Any size — auto-fits to the arched frame.
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="eid-name">Full name</label>
            <input
              id="eid-name"
              type="text"
              value={name}
              onChange={handleName}
              maxLength={60}
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="eid-role">Designation</label>
            <input
              id="eid-role"
              type="text"
              value={designation}
              onChange={handleDesignation}
              maxLength={60}
              placeholder="Your designation"
            />
          </div>

          <h2 className={styles.sectionTitle}>Card theme</h2>

          <div className={styles.field}>
            <label htmlFor="eid-theme">Brightness</label>
            <div className={styles.sliderRow}>
              <input
                id="eid-theme"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={theme}
                onChange={handleTheme}
              />
              <span className={styles.val}>{Math.round(theme * 100)}%</span>
            </div>
            <div className={styles.themeLabels}>
              <span>Very dark</span>
              <span>Very bright</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Photo positioning</h2>

          <div className={styles.field}>
            <label htmlFor="eid-zoom">Zoom</label>
            <div className={styles.sliderRow}>
              <input
                id="eid-zoom"
                type="range"
                min="0.5"
                max="3"
                step="0.01"
                value={zoom}
                onChange={handleZoom}
              />
              <span className={styles.val}>{zoom.toFixed(2)}×</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>Nudge position</label>
            <div className={styles.nudge}>
              <button type="button" className={styles.spacer} aria-hidden />
              <button type="button" onClick={() => nudge(0, -NUDGE_STEP)} aria-label="Move up">↑</button>
              <button type="button" className={styles.spacer} aria-hidden />
              <button type="button" onClick={() => nudge(-NUDGE_STEP, 0)} aria-label="Move left">←</button>
              <button type="button" onClick={handleCenter} aria-label="Center photo">●</button>
              <button type="button" onClick={() => nudge(NUDGE_STEP, 0)} aria-label="Move right">→</button>
              <button type="button" className={styles.spacer} aria-hidden />
              <button type="button" onClick={() => nudge(0, NUDGE_STEP)} aria-label="Move down">↓</button>
              <button type="button" className={styles.spacer} aria-hidden />
            </div>
            <div className={styles.hint}>Or drag the photo directly in the preview.</div>
          </div>

          <div className={styles.btnRow}>
            <button
              type="button"
              className={`${styles.btn} ${styles.primary}`}
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <><span className={styles.spinner} /> Generating…</>
              ) : (
                "Download high-res PNG"
              )}
            </button>
            <button type="button" className={styles.btn} onClick={handleReset}>
              Reset photo position
            </button>
          </div>

          {status.msg && (
            <div
              className={`${styles.status} ${status.ok ? styles.statusOk : styles.statusError}`}
              aria-live="polite"
            >
              {status.msg}
            </div>
          )}
        </aside>

        {/* ── PREVIEW ── */}
        <section className={styles.previewWrap}>
          <div
            ref={stageRef}
            className={styles.previewStage}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <canvas ref={canvasRef} />
            <div className={styles.previewHint}>Drag the portrait to reposition</div>
          </div>
        </section>
      </div>
    </div>
  );
}
