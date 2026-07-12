"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { allocateJulyAwardPartnerNo } from "@/actions/july-award-participation-card";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  drawParticipationCard,
  loadParticipationClubLogo,
  PARTICIPATION_CARD_H,
  PARTICIPATION_CARD_W,
  preloadParticipationCardAssets,
} from "@/lib/marketing/july-award-participation-card-canvas";
import {
  exportJulyAwardCanvasPng,
  isJulyAwardExportAbortError,
  julyAwardExportSuccessMessage,
} from "@/lib/marketing/july-award-export";
import { JULY_AWARD_DEBATE_PARTNER_LABEL } from "@/lib/marketing/july-award-debate";
import { consumeJulyAwardParticipationPrefill } from "@/lib/marketing/july-award-participation-prefill";
import styles from "./JulyAwardParticipationCardGenerator.module.css";

type Props = {
  initialClubName?: string;
  initialUniversityName?: string;
  fromRegistration?: boolean;
  /** Debate lane: fixed partnership label Debate Forum (no AP number). */
  debateForum?: boolean;
};

export function JulyAwardParticipationCardGenerator({
  initialClubName = "",
  initialUniversityName = "",
  fromRegistration = false,
  debateForum = false,
}: Props) {
  const fileId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const punabLogoRef = useRef<HTMLImageElement | null>(null);
  const verifiedSealRef = useRef<HTMLImageElement | null>(null);
  const clubLogoImgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [clubName, setClubName] = useState(initialClubName);
  const [universityName, setUniversityName] = useState(initialUniversityName);
  const [partnerNo, setPartnerNo] = useState("");
  const [partnerBusy, setPartnerBusy] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoFromRegistration, setLogoFromRegistration] = useState(fromRegistration);
  const [logoLoading, setLogoLoading] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.38);
  const [busy, setBusy] = useState(false);
  const [debateForumMode, setDebateForumMode] = useState(debateForum);
  const prefillAppliedRef = useRef(false);

  useEffect(() => {
    setClubName(initialClubName);
    setUniversityName(initialUniversityName);
  }, [initialClubName, initialUniversityName]);

  useEffect(() => {
    if (prefillAppliedRef.current) return;
    const prefill = consumeJulyAwardParticipationPrefill();
    if (!prefill) return;
    prefillAppliedRef.current = true;
    if (prefill.debateForum) setDebateForumMode(true);
    setClubName(prefill.clubName);
    setUniversityName(prefill.universityName);
    setPartnerNo(prefill.partnerNo);
    setLogoFromRegistration(true);
    setLogoLoading(true);
    void loadParticipationClubLogo(prefill.logoUrl)
      .then((img) => {
        clubLogoImgRef.current = img;
        setLogoPreviewUrl(prefill.logoUrl);
      })
      .catch(() => {
        clubLogoImgRef.current = null;
        setLogoPreviewUrl(null);
        toast.error("Could not load your registration logo. Upload it again.");
      })
      .finally(() => setLogoLoading(false));
  }, []);

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
        if (!cancelled) toast.error("Could not load card assets. Refresh the page.");
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
    setPreviewScale(Math.min(1, Math.max(0.22, (w - 32) / PARTICIPATION_CARD_W)));
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
      partnerNo: debateForumMode ? partnerNo || JULY_AWARD_DEBATE_PARTNER_LABEL : partnerNo,
      partnerFieldLabel: debateForumMode ? "PARTNERSHIP" : "PARTNER N°",
      clubLogoSrc: logoPreviewUrl,
      punabLogo,
      clubLogo: clubLogoImgRef.current,
      verifiedSeal: verifiedSealRef.current,
    });
  }, [clubName, universityName, partnerNo, logoPreviewUrl, ready, debateForumMode]);

  useEffect(() => {
    paintCard();
  }, [paintCard]);

  useEffect(() => {
    if (debateForum && !partnerNo) {
      setPartnerNo(JULY_AWARD_DEBATE_PARTNER_LABEL);
    }
  }, [debateForum, partnerNo]);

  const requestPartnerNo = useCallback(async () => {
    if (debateForumMode) return;
    if (!clubName.trim() || !universityName.trim()) return;
    setPartnerBusy(true);
    try {
      const res = await allocateJulyAwardPartnerNo({ clubName, universityName });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setPartnerNo(res.partnerNo);
    } finally {
      setPartnerBusy(false);
    }
  }, [clubName, universityName, debateForumMode]);

  useEffect(() => {
    if (debateForumMode) return;
    if (!clubName.trim() || !universityName.trim() || partnerNo) return;
    const t = window.setTimeout(() => {
      void requestPartnerNo();
    }, 700);
    return () => window.clearTimeout(t);
  }, [clubName, universityName, partnerNo, requestPartnerNo, debateForumMode]);

  const onLogoFile = (f: File | undefined) => {
    if (!f?.type.startsWith("image/")) {
      toast.error("Choose an image file (JPEG or PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        toast.error("Could not read that image.");
        return;
      }
      setLogoFromRegistration(false);
      setLogoPreviewUrl(dataUrl);
      void loadParticipationClubLogo(dataUrl)
        .then((img) => {
          clubLogoImgRef.current = img;
          paintCard();
          toast.success("Logo added.");
        })
        .catch(() => {
          clubLogoImgRef.current = null;
          toast.error("Could not load that image.");
        });
    };
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(f);
  };

  const download = useCallback(() => {
    if (!clubName.trim() || !universityName.trim()) {
      toast.error("Enter club and university names.");
      return;
    }
    if (!clubLogoImgRef.current) {
      toast.error("Upload your club logo first.");
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
        await exportJulyAwardCanvasPng(canvas, `PUNAB-2026-AppreciationPartner-${slug}.jpg`);
        toast.success(julyAwardExportSuccessMessage());
      } catch (e) {
        if (!isJulyAwardExportAbortError(e)) {
          toast.error("Could not export image. Try again on Wi‑Fi.");
        }
      } finally {
        setBusy(false);
      }
    })();
  }, [clubName, universityName, paintCard]);

  return (
    <div className={`${styles.root} grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start`}>
      <Card className="space-y-6 p-6 md:p-8">
        <div>
          <h2 className="text-h3 text-[color:var(--color-text)]">Club details</h2>
          {fromRegistration || logoFromRegistration ? (
            <p className="mt-2 text-small font-medium text-[color:var(--brand-green)]">
              {debateForumMode
                ? "Loaded from your debate registration — partnership shows as Debate Forum."
                : "Loaded from your July Award registration — review and download your card."}
            </p>
          ) : null}
          <p className="mt-2 text-small text-[color:var(--color-text-muted)]">
            {debateForumMode
              ? "Debate chapters use the fixed partnership name Debate Forum on every card."
              : (
                <>
                  Partner number assigns when club and university are filled (
                  <span className="font-mono">AP-2026-####</span>).
                </>
              )}
          </p>
        </div>

        <div>
          <label htmlFor="july-participation-club" className="ds-label">
            Club name
          </label>
          <input
            id="july-participation-club"
            className="ds-input mt-2 w-full"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="july-participation-uni" className="ds-label">
            University
          </label>
          <input
            id="july-participation-uni"
            className="ds-input mt-2 w-full"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            required
          />
        </div>

        <div>
          <p className="ds-label">{debateForumMode ? "Partnership" : "Partner N°"}</p>
          <p className="mt-2 font-mono text-lg font-bold tracking-wide text-[color:var(--color-text)]">
            {debateForumMode ? JULY_AWARD_DEBATE_PARTNER_LABEL : partnerBusy ? "Generating…" : partnerNo || "—"}
          </p>
          {debateForumMode ? (
            <p className="mt-2 text-small text-[color:var(--color-text-muted)]">
              Fixed for all debate chapter cards — saved with your registration in admin.
            </p>
          ) : !logoFromRegistration && !fromRegistration ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              disabled={partnerBusy || !clubName.trim() || !universityName.trim()}
              onClick={() => void requestPartnerNo()}
            >
              {partnerNo ? "Refresh number" : "Assign partner number"}
            </Button>
          ) : (
            <p className="mt-2 text-small text-[color:var(--color-text-muted)]">
              Assigned at registration and stored — same number if you return later.
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fileId} className="ds-label">
            Club logo
          </label>
          <input
            id={fileId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full cursor-pointer text-small file:mr-3 file:cursor-pointer file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-surface-2)] file:px-3 file:py-2 file:font-semibold"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onLogoFile(f);
              e.target.value = "";
            }}
          />
          {logoLoading ? (
            <p className="mt-3 text-small text-[color:var(--color-text-muted)]">Loading your registration logo…</p>
          ) : null}
          {logoPreviewUrl ? (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreviewUrl}
                alt=""
                className="h-14 w-14 rounded-full border border-[color:var(--color-border)] object-contain bg-white p-1"
              />
              <p className="text-small font-medium text-[color:var(--brand-green)]">
                {logoFromRegistration ? "Logo from registration" : "Logo on card"}
              </p>
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={!ready || busy || partnerBusy}
          onClick={() => void download()}
        >
          {busy ? "Exporting…" : "Download PNG"}
        </Button>
        <p className="text-small text-[color:var(--color-text-muted)]">1080×1350 PNG — same size as club card generator.</p>
      </Card>

      <div className="space-y-3">
        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
          Preview
        </p>
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] shadow-[var(--shadow-md)]">
          <div ref={viewportRef} className={styles.previewViewport}>
            {!ready ? (
              <p className="p-8 text-center text-small text-[color:var(--color-text-muted)]">Loading card…</p>
            ) : (
              <div
                className={styles.scaleShell}
                style={{ width: PARTICIPATION_CARD_W * previewScale, height: PARTICIPATION_CARD_H * previewScale }}
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
    </div>
  );
}
