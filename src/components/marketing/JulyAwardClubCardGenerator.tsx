"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  fileToDownscaledJpegBlob,
  JULY_AWARD_SEGMENT_INPUT_MAX,
  loadJulyAwardImage,
  preloadJulyAwardSegmenter,
  removeBackgroundWithDeviceFallback,
  tightenMattePngBlob,
} from "@/lib/marketing/july-award-background-removal";
import {
  drawJulyAwardClubCard,
  loadJulyAwardClubCardLogo,
} from "@/lib/marketing/july-award-club-card-canvas";
import {
  exportJulyAwardCanvasPng,
  isJulyAwardExportAbortError,
  julyAwardExportSuccessMessage,
  JULY_AWARD_TRANSPARENT_PIXEL,
} from "@/lib/marketing/july-award-export";
import styles from "./JulyAwardClubCardGenerator.module.css";

/** Incremented so a slow segmentation cannot overwrite a newer file pick. */
let logoJobSeq = 0;

const LOGO_PAN_PX_MAX = 120;

const DEFAULT_LOGO_PLACE = { zoom: 1, panXPx: 0, panYPx: 0 } as const;

/** JPEG (~1.2MB) for mobile; same 3240×4050 4:5 art as original PNG. */
export const JULY_AWARD_CLUB_TEMPLATE_SRC = "/images/marketing/july-award-2026-club-greeting-template.jpg";

function clubBackgroundUrl(): string {
  if (typeof window === "undefined") return JULY_AWARD_CLUB_TEMPLATE_SRC;
  return `${window.location.origin}${JULY_AWARD_CLUB_TEMPLATE_SRC}`;
}

export function JulyAwardClubCardGenerator() {
  const fileId = useId();
  const removeBgId = useId();
  const cardRef = useRef<HTMLElement | null>(null);
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastLogoFileRef = useRef<File | null>(null);
  const segmentingJobsRef = useRef(0);

  const [templateReady, setTemplateReady] = useState(false);
  const [templateErr, setTemplateErr] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [removePortraitBg, setRemovePortraitBg] = useState(true);
  const [segmenting, setSegmenting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.4);
  const [logoPlace, setLogoPlace] = useState<{ zoom: number; panXPx: number; panYPx: number }>({
    ...DEFAULT_LOGO_PLACE,
  });

  useEffect(() => {
    preloadJulyAwardSegmenter();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadJulyAwardImage(JULY_AWARD_CLUB_TEMPLATE_SRC)
      .then((img) => {
        if (!cancelled) {
          templateImgRef.current = img;
          setTemplateReady(true);
          setTemplateErr(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTemplateReady(false);
          setTemplateErr(
            `Could not load the club poster (${JULY_AWARD_CLUB_TEMPLATE_SRC}). Try Wi‑Fi or refresh. If this persists, confirm that file is deployed (4:5 print, e.g. 3240×4050).`
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logoUrlRef = useRef<string | null>(null);
  logoUrlRef.current = logoUrl;

  useEffect(() => {
    return () => {
      const u = logoUrlRef.current;
      if (u) URL.revokeObjectURL(u);
    };
  }, []);

  const updatePreviewScale = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    setPreviewScale(Math.min(1, Math.max(0.24, (w - 32) / 1080)));
  }, []);

  useEffect(() => {
    if (!templateReady) return;
    const el = viewportRef.current;
    if (!el) return;
    updatePreviewScale();
    const ro = new ResizeObserver(() => updatePreviewScale());
    ro.observe(el);
    return () => ro.disconnect();
  }, [templateReady, updatePreviewScale]);

  const processLogoFromFile = useCallback(async (f: File, stripBackground: boolean) => {
    const job = ++logoJobSeq;
    lastLogoFileRef.current = f;
    setLogoPlace({ ...DEFAULT_LOGO_PLACE });
    setLogoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (stripBackground) {
      segmentingJobsRef.current += 1;
      setSegmenting(true);
      try {
        const workBlob = await fileToDownscaledJpegBlob(f, JULY_AWARD_SEGMENT_INPUT_MAX);
        if (job !== logoJobSeq) return;
        let blob = await removeBackgroundWithDeviceFallback(workBlob);
        if (job !== logoJobSeq) return;
        blob = await tightenMattePngBlob(blob);
        if (job !== logoJobSeq) return;
        const url = URL.createObjectURL(blob);
        if (job !== logoJobSeq) {
          URL.revokeObjectURL(url);
          return;
        }
        setLogoUrl(url);
      } catch {
        if (job === logoJobSeq) {
          toast.error("Could not remove the background. Try a clearer photo or turn off “Remove background”.");
        }
      } finally {
        segmentingJobsRef.current -= 1;
        if (segmentingJobsRef.current <= 0) {
          segmentingJobsRef.current = 0;
          setSegmenting(false);
        }
      }
    } else {
      try {
        const url = URL.createObjectURL(f);
        if (job !== logoJobSeq) {
          URL.revokeObjectURL(url);
          return;
        }
        setLogoUrl(url);
      } catch {
        if (job === logoJobSeq) toast.error("Could not load that image.");
      }
    }
  }, []);

  const onFile = (f: File | undefined) => {
    if (!f?.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    void processLogoFromFile(f, removePortraitBg);
  };

  const onRemovePortraitBgChange = (checked: boolean) => {
    setRemovePortraitBg(checked);
    const file = lastLogoFileRef.current;
    if (file) void processLogoFromFile(file, checked);
  };

  const clearLogo = () => {
    lastLogoFileRef.current = null;
    setLogoPlace({ ...DEFAULT_LOGO_PLACE });
    setLogoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const download = useCallback(async () => {
    const template = templateImgRef.current;
    if (!template || !templateReady) {
      toast.error(templateErr ?? "Template not ready.");
      return;
    }
    setBusy(true);
    try {
      let logo: HTMLImageElement | null = null;
      if (logoUrl) {
        logo = await loadJulyAwardClubCardLogo(logoUrl);
      }
      const canvas = document.createElement("canvas");
      drawJulyAwardClubCard(canvas, { template, logo, logoPlace });
      await exportJulyAwardCanvasPng(canvas, "punab-july-award-club-card.jpg");
      toast.success(julyAwardExportSuccessMessage());
    } catch (e) {
      if (isJulyAwardExportAbortError(e)) {
        return;
      }
      toast.error("Could not export image. Try again on Wi‑Fi or use a smaller logo.");
    } finally {
      setBusy(false);
    }
  }, [templateErr, templateReady, logoUrl, logoPlace]);

  return (
    <div className={`${styles.root} grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start`}>
      <Card className="space-y-6 p-6 md:p-8">
        <div>
          <h2 className="text-h3 text-[color:var(--color-text)]">Upload logo</h2>
        </div>

        {templateErr ? (
          <div
            className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_28%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
            role="alert"
          >
            {templateErr}
          </div>
        ) : null}

        <div>
          <label htmlFor={fileId} className="ds-label">
            Club logo
          </label>
          <input
            id={fileId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={segmenting}
            className="mt-2 block w-full cursor-pointer text-small file:mr-3 file:cursor-pointer file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-surface-2)] file:px-3 file:py-2 file:font-semibold file:text-[color:var(--color-text)] hover:file:bg-[color:color-mix(in_srgb,var(--brand-green-muted)_40%,var(--color-surface-2))] disabled:cursor-not-allowed disabled:opacity-60"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {segmenting ? (
            <p className="mt-2 text-small font-medium text-[color:var(--brand-green)]" role="status">
              Removing background…
            </p>
          ) : null}
        </div>

        <div className="border-t border-[color:var(--color-border)] pt-6">
          <h3 className="text-base font-bold text-[color:var(--color-text)]">Edit on the card</h3>

          {logoUrl ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="ds-label m-0">Logo in badge</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setLogoPlace({ ...DEFAULT_LOGO_PLACE })}>
                  Reset logo
                </Button>
              </div>
              <div>
                <label htmlFor="july-club-zoom" className="ds-label">
                  Zoom ({Math.round(logoPlace.zoom * 100)}%)
                </label>
                <input
                  id="july-club-zoom"
                  type="range"
                  min={0.72}
                  max={1.28}
                  step={0.02}
                  value={logoPlace.zoom}
                  onChange={(e) =>
                    setLogoPlace((p) => ({ ...p, zoom: Number.parseFloat(e.target.value) }))
                  }
                  className="mt-2 w-full accent-[color:var(--brand-green)]"
                />
              </div>
              <div>
                <label htmlFor="july-club-panx" className="ds-label">
                  Move sideways
                </label>
                <input
                  id="july-club-panx"
                  type="range"
                  min={-LOGO_PAN_PX_MAX}
                  max={LOGO_PAN_PX_MAX}
                  step={2}
                  value={logoPlace.panXPx}
                  onChange={(e) =>
                    setLogoPlace((p) => ({ ...p, panXPx: Number.parseFloat(e.target.value) }))
                  }
                  className="mt-2 w-full accent-[color:var(--brand-green)]"
                />
              </div>
              <div>
                <label htmlFor="july-club-pany" className="ds-label">
                  Move up / down
                </label>
                <input
                  id="july-club-pany"
                  type="range"
                  min={-LOGO_PAN_PX_MAX}
                  max={LOGO_PAN_PX_MAX}
                  step={2}
                  value={logoPlace.panYPx}
                  onChange={(e) =>
                    setLogoPlace((p) => ({ ...p, panYPx: Number.parseFloat(e.target.value) }))
                  }
                  className="mt-2 w-full accent-[color:var(--brand-green)]"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-start gap-3">
          <input
            id={removeBgId}
            type="checkbox"
            checked={removePortraitBg}
            onChange={(e) => onRemovePortraitBgChange(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-[color:var(--color-border)] accent-[color:var(--brand-green)]"
          />
          <label htmlFor={removeBgId} className="text-small leading-relaxed text-[color:var(--color-text-muted)]">
            <span className="font-semibold text-[color:var(--color-text)]">Remove background</span> (recommended for
            people on grey/white studio backdrops). Turn off for flat logos you want unchanged.
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="primary" disabled={!templateReady || busy || segmenting} onClick={() => void download()}>
            {busy ? "Exporting…" : "Download PNG"}
          </Button>
          {logoUrl ? (
            <Button type="button" variant="secondary" onClick={clearLogo}>
              Clear logo
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="space-y-3">
        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
          Preview
        </p>
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] shadow-[var(--shadow-md)]">
          <div
            ref={viewportRef}
            className={`${styles.previewViewport} rounded-[var(--radius-md)] ring-1 ring-[color:color-mix(in_srgb,var(--color-text)_8%,var(--color-border))]`}
          >
            {templateReady ? (
              <div
                className={styles.scaleShell}
                style={{
                  width: 1080 * previewScale,
                  height: 1350 * previewScale,
                }}
              >
                <section
                  ref={cardRef}
                  className={styles.card}
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                  }}
                  aria-label="PUNAB July Uprising Memorial Award 2026 club card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static template + html2canvas export */}
                  <img
                    data-july-club-template
                    className={styles.templateArt}
                    src={clubBackgroundUrl()}
                    alt=""
                    width={1080}
                    height={1350}
                    crossOrigin="anonymous"
                    draggable={false}
                  />
                  <div className={styles.clubBadge} aria-label="Club logo badge">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob/data URLs for html2canvas export */}
                    <img
                      className={styles.clubLogo}
                      src={logoUrl ?? JULY_AWARD_TRANSPARENT_PIXEL}
                      alt=""
                      draggable={false}
                      style={{
                        transform: `translate(${logoPlace.panXPx}px, ${logoPlace.panYPx}px) scale(${logoPlace.zoom})`,
                        transformOrigin: "center center",
                      }}
                    />
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex min-h-[min(85vh,52rem)] w-full min-w-0 flex-col items-center justify-center gap-2 p-6 text-center text-small text-[color:var(--color-text-muted)]">
                {templateErr ? (
                  <span className="text-[color:var(--color-text)]">{templateErr}</span>
                ) : (
                  <>
                    <span className="font-medium text-[color:var(--color-text)]">Loading poster…</span>
                    <span>Optimized for mobile — usually a few seconds.</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
