"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  fileToDownscaledJpegBlob,
  JULY_AWARD_SEGMENT_INPUT_MAX,
  preloadJulyAwardSegmenter,
  removeBackgroundWithDeviceFallback,
  tightenMattePngBlob,
} from "@/lib/marketing/july-award-background-removal";
import {
  ASSETS,
  CARD,
  DEFAULT_PHOTO_PLACE,
  PHOTO_PLACE_LIMITS,
  PHOTO_WELL,
  COPY,
  type PhotoPlace,
} from "@/lib/marketing/july-award-facecard-constants";
import {
  drawJulyAwardFaceCard,
  loadFaceCardPhoto,
  preloadFaceCardAssets,
  type FaceCardAssets,
} from "@/lib/marketing/july-award-facecard-canvas";
import {
  exportJulyAwardCanvasPng,
  isJulyAwardExportAbortError,
  julyAwardExportSuccessMessage,
  JULY_AWARD_TRANSPARENT_PIXEL,
} from "@/lib/marketing/july-award-export";
import styles from "./JulyAwardFaceCardGenerator.module.css";

let photoJobSeq = 0;

const LOGO_PAN_PX_MAX = PHOTO_PLACE_LIMITS.panPxMax;

export function JulyAwardFaceCardGenerator() {
  const fileId = useId();
  const removeBgId = useId();
  const searchParams = useSearchParams();
  const autoPhotoUrl = searchParams.get("photo");
  const autoLoadedRef = useRef(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const assetsRef = useRef<FaceCardAssets | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastPhotoFileRef = useRef<File | null>(null);
  const segmentingJobsRef = useRef(0);

  const [assetsReady, setAssetsReady] = useState(false);
  const [assetsErr, setAssetsErr] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [removeBg, setRemoveBg] = useState(false);
  const [segmenting, setSegmenting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.4);
  const [photoPlace, setPhotoPlace] = useState<PhotoPlace>({ ...DEFAULT_PHOTO_PLACE });

  useEffect(() => {
    preloadJulyAwardSegmenter();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void preloadFaceCardAssets()
      .then((assets) => {
        if (cancelled) return;
        assetsRef.current = assets;
        setAssetsReady(true);
        setAssetsErr(null);
      })
      .catch(() => {
        if (!cancelled) {
          setAssetsReady(false);
          setAssetsErr("Could not load the facecard background. Try Wi‑Fi or refresh.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const photoUrlRef = useRef<string | null>(null);
  photoUrlRef.current = photoUrl;

  useEffect(() => {
    return () => {
      const u = photoUrlRef.current;
      if (u) URL.revokeObjectURL(u);
    };
  }, []);

  const updatePreviewScale = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    setPreviewScale(Math.min(1, Math.max(0.24, (w - 32) / CARD.width)));
  }, []);

  useEffect(() => {
    if (!assetsReady) return;
    const el = viewportRef.current;
    if (!el) return;
    updatePreviewScale();
    const ro = new ResizeObserver(() => updatePreviewScale());
    ro.observe(el);
    return () => ro.disconnect();
  }, [assetsReady, updatePreviewScale]);

  const processPhotoFromFile = useCallback(async (f: File, stripBackground: boolean) => {
    const job = ++photoJobSeq;
    lastPhotoFileRef.current = f;
    setPhotoPlace({ ...DEFAULT_PHOTO_PLACE });
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (stripBackground) {
      segmentingJobsRef.current += 1;
      setSegmenting(true);
      try {
        const workBlob = await fileToDownscaledJpegBlob(f, JULY_AWARD_SEGMENT_INPUT_MAX);
        if (job !== photoJobSeq) return;
        let blob = await removeBackgroundWithDeviceFallback(workBlob);
        if (job !== photoJobSeq) return;
        blob = await tightenMattePngBlob(blob);
        if (job !== photoJobSeq) return;
        const url = URL.createObjectURL(blob);
        if (job !== photoJobSeq) {
          URL.revokeObjectURL(url);
          return;
        }
        setPhotoUrl(url);
      } catch {
        if (job === photoJobSeq) {
          try {
            const fallbackUrl = URL.createObjectURL(f);
            setPhotoUrl(fallbackUrl);
            toast.message("Background removal isn’t supported on this device — using your original photo.");
          } catch {
            toast.error("Could not load that image. Try a different photo.");
          }
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
        if (job !== photoJobSeq) {
          URL.revokeObjectURL(url);
          return;
        }
        setPhotoUrl(url);
      } catch {
        if (job === photoJobSeq) toast.error("Could not load that image.");
      }
    }
  }, []);

  useEffect(() => {
    if (!autoPhotoUrl || autoLoadedRef.current) return;
    autoLoadedRef.current = true;
    void (async () => {
      try {
        const res = await fetch(autoPhotoUrl);
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        const name = autoPhotoUrl.split("/").pop() ?? "photo.jpg";
        const file = new File([blob], name, { type: blob.type || "image/jpeg" });
        await processPhotoFromFile(file, removeBg);
      } catch {
        toast.error("Could not load your registration photo. Upload it manually below.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPhotoUrl]);

  const onFile = (f: File | undefined) => {
    if (!f?.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    void processPhotoFromFile(f, removeBg);
  };

  const onRemoveBgChange = (checked: boolean) => {
    setRemoveBg(checked);
    const file = lastPhotoFileRef.current;
    if (file) void processPhotoFromFile(file, checked);
  };

  const clearPhoto = () => {
    lastPhotoFileRef.current = null;
    setPhotoPlace({ ...DEFAULT_PHOTO_PLACE });
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const download = useCallback(async () => {
    const assets = assetsRef.current;
    if (!assets || !assetsReady) {
      toast.error(assetsErr ?? "Card assets not ready.");
      return;
    }
    setBusy(true);
    try {
      let photo: HTMLImageElement | null = null;
      if (photoUrl) {
        photo = await loadFaceCardPhoto(photoUrl);
      }
      const canvas = document.createElement("canvas");
      drawJulyAwardFaceCard(canvas, { template: assets, photo, photoPlace });
      await exportJulyAwardCanvasPng(canvas, "punab-july-award-facecard.jpg");
      toast.success(julyAwardExportSuccessMessage());
    } catch (e) {
      if (isJulyAwardExportAbortError(e)) {
        return;
      }
      toast.error("Could not export image. Try again on Wi‑Fi or use a smaller photo.");
    } finally {
      setBusy(false);
    }
  }, [assetsErr, assetsReady, photoUrl, photoPlace]);

  return (
    <div className={`${styles.root} grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start`}>
      <Card className="min-w-0 space-y-6 p-6 md:p-8">
        <div>
          <h2 className="text-h3 text-[color:var(--color-text)]">Upload your photo</h2>
        </div>

        {assetsErr ? (
          <div
            className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_28%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
            role="alert"
          >
            {assetsErr}
          </div>
        ) : null}

        <div>
          <label htmlFor={fileId} className="ds-label">
            Your photo (portrait, 4:5 looks best)
          </label>
          <input
            id={fileId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={segmenting}
            className="mt-2 block w-full cursor-pointer text-small file:mr-3 file:cursor-pointer file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-surface-2)] file:px-3 file:py-2 file:font-semibold file:text-[color:var(--color-text)] hover:file:bg-[color:color-mix(in_srgb,var(--brand-green-muted)_40%,var(--color-surface-2))] disabled:cursor-not-allowed disabled:opacity-60"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {segmenting ? (
            <p
              className="mt-2 flex items-center gap-2 text-small font-semibold text-brand-green"
              role="status"
            >
              <span className={styles.removingBgSpinnerInline} aria-hidden="true" />
              Removing background… hold on
            </p>
          ) : null}
        </div>

        <div className="flex items-start gap-3">
          <input
            id={removeBgId}
            type="checkbox"
            checked={removeBg}
            onChange={(e) => onRemoveBgChange(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-[color:var(--color-border)] accent-[color:var(--brand-green)]"
          />
          <label
            htmlFor={removeBgId}
            className="min-w-0 flex-1 text-small leading-relaxed text-[color:var(--color-text-muted)]"
          >
            <span className="font-semibold text-[color:var(--color-text)]">Remove background</span> — optional. We
            use your photo as-is by default; turn this on only if you need the backdrop cut out (best for plain
            backgrounds).
          </label>
        </div>

        <div className="border-t border-[color:var(--color-border)] pt-6">
          <h3 className="text-base font-bold text-[color:var(--color-text)]">Edit on the card</h3>

          {photoUrl ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                <span className="ds-label m-0 min-w-0">Photo in well</span>
                <Button type="button" variant="ghost" size="sm" onClick={clearPhoto}>
                  Reset photo
                </Button>
              </div>
              <div>
                <label htmlFor="july-face-zoom" className="ds-label">
                  Zoom ({Math.round(photoPlace.zoom * 100)}%)
                </label>
                <input
                  id="july-face-zoom"
                  type="range"
                  min={PHOTO_PLACE_LIMITS.zoomMin}
                  max={PHOTO_PLACE_LIMITS.zoomMax}
                  step={PHOTO_PLACE_LIMITS.zoomStep}
                  value={photoPlace.zoom}
                  onChange={(e) => setPhotoPlace((p) => ({ ...p, zoom: Number.parseFloat(e.target.value) }))}
                  className="mt-2 w-full accent-[color:var(--brand-green)]"
                />
              </div>
              <div>
                <label htmlFor="july-face-panx" className="ds-label">
                  Move sideways
                </label>
                <input
                  id="july-face-panx"
                  type="range"
                  min={-LOGO_PAN_PX_MAX}
                  max={LOGO_PAN_PX_MAX}
                  step={2}
                  value={photoPlace.panXPx}
                  onChange={(e) => setPhotoPlace((p) => ({ ...p, panXPx: Number.parseFloat(e.target.value) }))}
                  className="mt-2 w-full accent-[color:var(--brand-green)]"
                />
              </div>
              <div>
                <label htmlFor="july-face-pany" className="ds-label">
                  Move up / down
                </label>
                <input
                  id="july-face-pany"
                  type="range"
                  min={-LOGO_PAN_PX_MAX}
                  max={LOGO_PAN_PX_MAX}
                  step={2}
                  value={photoPlace.panYPx}
                  onChange={(e) => setPhotoPlace((p) => ({ ...p, panYPx: Number.parseFloat(e.target.value) }))}
                  className="mt-2 w-full accent-[color:var(--brand-green)]"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {photoUrl ? (
            <>
              <Button type="button" variant="primary" disabled={!assetsReady || busy} onClick={() => void download()}>
                {busy ? "Exporting…" : "Download Photo Card"}
              </Button>
              <Button type="button" variant="secondary" onClick={clearPhoto}>
                Clear photo
              </Button>
            </>
          ) : (
            <p className="text-small text-[color:var(--color-text-muted)]">Upload your photo above to download the card.</p>
          )}
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
            {assetsReady ? (
              <div className={styles.scaleShell} style={{ width: CARD.width * previewScale, height: CARD.height * previewScale }}>
                <section
                  ref={cardRef}
                  className={styles.card}
                  style={{ transform: `scale(${previewScale})`, transformOrigin: "top left" }}
                  aria-label="PUNAB July Uprising Memorial Award 2026 facecard"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static asset + canvas export */}
                  <img className={styles.bgImg} src={ASSETS.bg} alt="" draggable={false} />

                  <div
                    className={styles.photoWell}
                    style={{
                      left: PHOTO_WELL.x,
                      top: PHOTO_WELL.y,
                      width: PHOTO_WELL.width,
                      height: PHOTO_WELL.height,
                      borderRadius: PHOTO_WELL.radius,
                    }}
                    aria-label="Your photo"
                  >
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- blob URL for canvas export
                      <img
                        className={styles.photoImg}
                        src={photoUrl}
                        alt=""
                        draggable={false}
                        style={{
                          transform: `translate(${photoPlace.panXPx}px, ${photoPlace.panYPx}px) scale(${photoPlace.zoom})`,
                          transformOrigin: "center center",
                        }}
                      />
                    ) : (
                      <div className={styles.plabel}>
                        <div className={styles.plabelTitle}>{COPY.wellPlaceholderTitle}</div>
                        <div className={styles.plabelSub}>{COPY.wellPlaceholderSub}</div>
                      </div>
                    )}
                    {segmenting ? (
                      <div className={styles.removingBgOverlay} role="status">
                        <span className={styles.removingBgSpinner} aria-hidden="true" />
                        <span className={styles.removingBgText}>Removing background…</span>
                      </div>
                    ) : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={JULY_AWARD_TRANSPARENT_PIXEL} alt="" className="hidden" />
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex min-h-[min(85vh,52rem)] w-full min-w-0 flex-col items-center justify-center gap-2 p-6 text-center text-small text-[color:var(--color-text-muted)]">
                {assetsErr ? (
                  <span className="text-[color:var(--color-text)]">{assetsErr}</span>
                ) : (
                  <>
                    <span className="font-medium text-[color:var(--color-text)]">Loading card…</span>
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
