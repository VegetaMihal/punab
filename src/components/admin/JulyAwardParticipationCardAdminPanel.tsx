"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { loadJulyAwardParticipationCardForAdmin } from "@/actions/july-award-participation-card-admin";
import { Button } from "@/components/ui/Button";
import styles from "@/components/marketing/JulyAwardParticipationCardGenerator.module.css";
import {
  exportJulyAwardCanvasPng,
  isJulyAwardExportAbortError,
  julyAwardExportSuccessMessage,
} from "@/lib/marketing/july-award-export";
import {
  drawParticipationCard,
  loadParticipationClubLogo,
  PARTICIPATION_CARD_H,
  PARTICIPATION_CARD_W,
  preloadParticipationCardAssets,
} from "@/lib/marketing/july-award-participation-card-canvas";

type Props = {
  entryId: string;
  onClose: () => void;
};

export function JulyAwardParticipationCardAdminPanel({ entryId, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const punabLogoRef = useRef<HTMLImageElement | null>(null);
  const verifiedSealRef = useRef<HTMLImageElement | null>(null);
  const clubLogoImgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clubName, setClubName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [partnerNo, setPartnerNo] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(0.32);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void loadJulyAwardParticipationCardForAdmin({ id: entryId })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(res.error);
          return;
        }
        setClubName(res.clubName);
        setUniversityName(res.universityName);
        setPartnerNo(res.partnerNo);
        setLogoPreviewUrl(res.logoUrl);
        try {
          clubLogoImgRef.current = await loadParticipationClubLogo(res.logoUrl);
        } catch {
          clubLogoImgRef.current = null;
          setLoadError("Could not load club logo from storage.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const assets = await preloadParticipationCardAssets();
        if (cancelled) return;
        punabLogoRef.current = assets.punabLogo;
        verifiedSealRef.current = assets.verifiedSeal;
        await Promise.all([
          document.fonts.load('800 104px "Bricolage Grotesque"'),
          document.fonts.load('800 44px "Bricolage Grotesque"'),
          document.fonts.load('italic 500 22px "Cormorant Garamond"'),
          document.fonts.load("700 11px Manrope"),
        ]);
        await document.fonts.ready;
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) toast.error("Could not load card assets.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePreviewScale = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    setPreviewScale(Math.min(1, Math.max(0.2, (w - 24) / PARTICIPATION_CARD_W)));
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    updatePreviewScale();
    const ro = new ResizeObserver(() => updatePreviewScale());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updatePreviewScale]);

  const paintCard = useCallback(() => {
    const canvas = canvasRef.current;
    const punabLogo = punabLogoRef.current;
    if (!canvas || !punabLogo || !ready) return;
    drawParticipationCard(canvas, {
      clubName,
      universityName,
      partnerNo,
      clubLogoSrc: logoPreviewUrl,
      punabLogo,
      clubLogo: clubLogoImgRef.current,
      verifiedSeal: verifiedSealRef.current,
      copyVariant: "admin",
    });
  }, [clubName, universityName, partnerNo, logoPreviewUrl, ready]);

  useEffect(() => {
    paintCard();
  }, [paintCard]);

  const download = useCallback(() => {
    if (!clubLogoImgRef.current) {
      toast.error("Club logo not loaded.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Card not ready.");
      return;
    }
    setBusy(true);
    paintCard();
    void (async () => {
      try {
        const slug = clubName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "club";
        await exportJulyAwardCanvasPng(canvas, `PUNAB-2026-AppreciationPartner-${slug}-admin.jpg`);
        toast.success(julyAwardExportSuccessMessage());
      } catch (e) {
        if (!isJulyAwardExportAbortError(e)) {
          toast.error("Could not export image. Try again on Wi‑Fi.");
        }
      } finally {
        setBusy(false);
      }
    })();
  }, [clubName, paintCard]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="july-participation-admin-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-xl bg-white shadow-xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <MotionlessHeader onClose={onClose} />

        <div className="max-h-[min(85vh,52rem)] overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="text-sm text-muted">Loading entry…</p>
          ) : loadError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
          ) : (
            <>
              <p className="text-sm text-muted">
                Partner N°{" "}
                <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">{partnerNo || "—"}</span>
              </p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-muted">Club</dt>
                  <dd className="mt-0.5 text-stone-900 dark:text-stone-100">{clubName}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted">University</dt>
                  <dd className="mt-0.5 text-stone-900 dark:text-stone-100">{universityName}</dd>
                </div>
              </dl>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:items-start">
                <div className="space-y-3">
                  <Button type="button" variant="primary" disabled={!ready || busy} onClick={() => void download()}>
                    {busy ? "Exporting…" : "Download PNG"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                  <p className="text-xs text-muted">1080×1350 PNG</p>
                </div>

                <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
                  <div ref={viewportRef} className={styles.previewViewport}>
                    {!ready ? (
                      <p className="p-6 text-center text-sm text-muted">Loading preview…</p>
                    ) : (
                      <div
                        className={styles.scaleShell}
                        style={{
                          width: PARTICIPATION_CARD_W * previewScale,
                          height: PARTICIPATION_CARD_H * previewScale,
                        }}
                      >
                        <canvas
                          ref={canvasRef}
                          width={PARTICIPATION_CARD_W}
                          height={PARTICIPATION_CARD_H}
                          className={styles.previewCanvas}
                          style={{
                            width: PARTICIPATION_CARD_W * previewScale,
                            height: PARTICIPATION_CARD_H * previewScale,
                          }}
                          aria-label="Appreciation Partner card preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MotionlessHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-700">
      <div>
        <h2 id="july-participation-admin-title" className="text-lg font-semibold text-stone-900 dark:text-stone-50">
          Generate Appreciation Partner card
        </h2>
        <p className="mt-1 text-sm text-muted">Third-person copy for PUNAB-issued cards.</p>
      </div>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-sm text-muted hover:bg-stone-100 dark:hover:bg-stone-800"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}