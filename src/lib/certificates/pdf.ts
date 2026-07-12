import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import { getGalleryBucket } from "@/lib/storage";

/**
 * Chromium pack for @sparticuz/chromium (serverless). Priority:
 * 1. `CHROMIUM_PACK_URL` — full HTTPS URL (Supabase public object or any host)
 * 2. `CHROMIUM_PACK_OBJECT_PATH` + `NEXT_PUBLIC_SUPABASE_URL` — $0 Supabase Storage public file
 *    Optional `CHROMIUM_PACK_BUCKET` (defaults to gallery bucket)
 * 3. GitHub release (free but slower / rate-limited on cold start)
 */
const DEFAULT_CHROMIUM_PACK_BASE =
  "https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack";

function encodeStorageObjectPath(objectPath: string): string {
  return objectPath
    .replace(/^\/+/, "")
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export function resolveChromiumPackUrl(): string {
  const explicit = process.env.CHROMIUM_PACK_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const objectPath = process.env.CHROMIUM_PACK_OBJECT_PATH?.trim().replace(/^\/+/, "");
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  if (objectPath && base) {
    const bucket = process.env.CHROMIUM_PACK_BUCKET?.trim() || getGalleryBucket();
    return `${base}/storage/v1/object/public/${bucket}/${encodeStorageObjectPath(objectPath)}`;
  }

  const arch = process.arch === "arm64" ? "arm64" : "x64";
  return `${DEFAULT_CHROMIUM_PACK_BASE}.${arch}.tar`;
}

async function resolveChromiumExecutablePath(): Promise<string> {
  return chromium.executablePath(resolveChromiumPackUrl());
}

async function launchServerlessChromium() {
  return puppeteerCore.launch({
    args: puppeteerCore.defaultArgs({ args: chromium.args, headless: "shell" }),
    executablePath: await resolveChromiumExecutablePath(),
    headless: "shell",
    // assumed: first cold start downloads ~68MB pack from GitHub; default 30s is often too short on Vercel.
    timeout: 120_000,
  });
}

async function launchCertificateBrowser() {
  if (process.env.VERCEL) {
    return launchServerlessChromium();
  }

  try {
    return await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes("could not find chrome")) {
      throw error;
    }
    return launchServerlessChromium();
  }
}

export type HtmlPdfLayoutOptions = {
  format?: "A4" | "Letter";
  landscape?: boolean;
  /** When set, wait until this selector exists (e.g. client-rendered invitation bundle). */
  waitForSelector?: string;
  setContentTimeoutMs?: number;
  /** Default true. Some @page CSS (e.g. bundled invitations) yields blank PDFs when combined with format. */
  preferCSSPageSize?: boolean;
};

export async function renderHtmlPdfBuffer(html: string, layout: HtmlPdfLayoutOptions = {}): Promise<Buffer> {
  const browser = await launchCertificateBrowser();

  try {
    const page = await browser.newPage();
    const timeout = layout.setContentTimeoutMs ?? 60_000;
    // Avoid networkidle0: Google Fonts in templates can keep network active and timeout on serverless.
    await page.setContent(html, { waitUntil: "load", timeout });
    if (layout.waitForSelector) {
      await page.waitForSelector(layout.waitForSelector, { visible: true, timeout });
    }
    const output = await page.pdf({
      format: layout.format ?? "A4",
      landscape: layout.landscape ?? false,
      printBackground: true,
      preferCSSPageSize: layout.preferCSSPageSize ?? true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    });
    return Buffer.from(output);
  } finally {
    await browser.close();
  }
}

export async function renderCertificatePdfBuffer(html: string): Promise<Buffer> {
  return renderHtmlPdfBuffer(html, { format: "A4", landscape: true });
}

/**
 * Bundled invitation: two `.card` elements (210mm×297mm, @page A4 portrait).
 * - Card 1 may need `zoom` when guest copy overflows.
 * - Card 2 (program overview) must never be zoomed as a whole — it breaks grid/flex "orientation";
 *   enforce print grids/flex rows so stats, segments, schedule strip, and contacts stay horizontal.
 */
const INVITATION_PRINT_FIX_CSS = `
@page { size: A4 portrait; margin: 0; }
/* Page 2 contact row — outside @media print for Chromium PDF */
.card:nth-of-type(2) .contact-row {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: stretch !important;
  gap: 20px !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}
.card:nth-of-type(2) .contact-box {
  flex: 1 1 0 !important;
  display: block !important;
  min-width: 0 !important;
  max-width: none !important;
  box-sizing: border-box !important;
}
.card:nth-of-type(2) .contact-box p,
.card:nth-of-type(2) .contact-box span {
  overflow-wrap: break-word !important;
  word-break: break-word !important;
}
.card:nth-of-type(1) .event-meta-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr) !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 28px !important;
  width: 100% !important;
  max-width: 560px !important;
  margin: 22px auto 28px !important;
}
.card:nth-of-type(1) .event-meta-item {
  text-align: center !important;
  min-width: 0 !important;
}
.card:nth-of-type(1) .event-meta-divider {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px !important;
  height: 58px !important;
  background: transparent !important;
  overflow: visible !important;
}
.card:nth-of-type(1) .event-meta-divider-svg {
  display: block !important;
  width: 28px !important;
  height: 58px !important;
}
.card .logo-plate {
  background: #fff !important;
  background-color: #fff !important;
  box-shadow: none !important;
}
.card .logo-plate img {
  background: #fff !important;
  box-shadow: none !important;
}
@media print {
  html, body {
    width: 210mm !important;
    max-width: 210mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    -webkit-font-smoothing: auto !important;
    -moz-osx-font-smoothing: auto !important;
    text-rendering: geometricPrecision !important;
  }
  .card .logo-plate img {
    image-rendering: auto !important;
  }
  .card {
    width: 210mm !important;
    height: 297mm !important;
    max-height: 297mm !important;
    margin: 0 auto !important;
    padding: 0 !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    break-inside: avoid-page !important;
    page-break-inside: avoid !important;
    page-break-after: always !important;
  }
  .card:nth-of-type(2) {
    page-break-after: auto !important;
  }
  .card .content {
    min-height: 0 !important;
    max-height: 100% !important;
    overflow: hidden !important;
  }
  /* Page 2: schedule row, contact pair, footer */
  .card:nth-of-type(2) .content {
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    writing-mode: horizontal-tb !important;
    direction: ltr !important;
    padding: 50px 56px 48px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .card:nth-of-type(2) .stats-row {
    display: grid !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    grid-auto-flow: row !important;
    width: 100% !important;
  }
  .card:nth-of-type(2) .segments {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    grid-auto-flow: row !important;
    width: 100% !important;
  }
  .card:nth-of-type(2) .schedule-strip {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .card:nth-of-type(2) .schedule-item {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    max-width: 34% !important;
  }
  .card:nth-of-type(2) .schedule-divider {
    flex: 0 0 auto !important;
  }
  .card:nth-of-type(2) .footer {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    text-align: center !important;
    margin-top: auto !important;
    box-sizing: border-box !important;
  }
}
`;

export async function renderInvitationPdfBuffer(html: string): Promise<Buffer> {
  const browser = await launchCertificateBrowser();

  try {
    const page = await browser.newPage();
    // 2× raster for print/PDF — same layout width, sharper type and logo (no CSS zoom on whole card).
    await page.setViewport({ width: 1200, height: 3600, deviceScaleFactor: 2 });

    await page.setContent(html, { waitUntil: "load", timeout: 120_000 });
    await page.waitForSelector(".guest-name", { visible: true, timeout: 120_000 });
    await page.waitForFunction(
      () => {
        const cards = document.querySelectorAll(".card");
        if (cards.length < 2) return false;
        return Array.from(cards).every((c) => c.getBoundingClientRect().height > 200);
      },
      { timeout: 120_000 },
    );

    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const imgs = Array.from(document.querySelectorAll("img[src]")).filter(
        (el): el is HTMLImageElement => el instanceof HTMLImageElement,
      );
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      );
    });
    await new Promise((r) => setTimeout(r, 300));

    await page.emulateMediaType("print");
    await page.addStyleTag({ content: INVITATION_PRINT_FIX_CSS });

    await page.evaluate(() => {
      const first = document.querySelector(".card");
      if (!(first instanceof HTMLElement)) return;
      const inner = first.querySelector(".content-main") ?? first.querySelector(".content");
      if (!(inner instanceof HTMLElement)) return;
      const content = first.querySelector(".content");
      const fits = () => inner.scrollHeight <= inner.clientHeight + 2;

      if (content instanceof HTMLElement && !fits()) {
        content.style.paddingTop = "48px";
        content.style.paddingBottom = "48px";
      }
      const tightSelectors = [".guest-block", ".invite-body", ".honoring-line", ".event-meta-row", ".header"];
      for (const sel of tightSelectors) {
        if (fits()) break;
        const el = inner.querySelector(sel);
        if (!(el instanceof HTMLElement)) continue;
        const mt = Number.parseFloat(getComputedStyle(el).marginTop) || 0;
        const mb = Number.parseFloat(getComputedStyle(el).marginBottom) || 0;
        el.style.marginTop = `${Math.max(4, mt * 0.82)}px`;
        el.style.marginBottom = `${Math.max(4, mb * 0.82)}px`;
      }
      // CSS zoom softens PDF text — only use if still overflowing after spacing tweaks.
      if (!fits()) {
        const visible = inner.clientHeight;
        const total = inner.scrollHeight;
        if (visible > 0 && total > visible + 2) {
          const pct = Math.min(100, (visible / total) * 100 * 0.995);
          if (pct < 99) {
            inner.style.zoom = `${pct}%`;
          }
        }
      }
    });

    await new Promise((r) => setTimeout(r, 150));

    const output = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });
    return Buffer.from(output);
  } finally {
    await browser.close();
  }
}
