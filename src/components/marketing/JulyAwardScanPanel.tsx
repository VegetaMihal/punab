"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { Button } from "@/components/ui/Button";

function extractTicketId(scanned: string): string {
  const trimmed = scanned.trim();
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || trimmed;
  } catch {
    return trimmed;
  }
}

export function JulyAwardScanPanel() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [manualTicketId, setManualTicketId] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | null = null;
    let rafId: number;
    let stopped = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stopped || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        tick();
      } catch {
        setCameraError("Could not access camera. Use manual entry below instead.");
      }
    }

    function tick() {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            stopped = true;
            router.push(`/july-award-2026/ticket/${extractTicketId(code.data)}`);
            return;
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    start();
    return () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning, router]);

  return (
    <div className="space-y-6">
      <div>
        {scanning ? (
          <div className="space-y-2">
            <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)]">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} className="w-full" muted playsInline />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative aspect-square w-2/3 max-w-64">
                  <div className="absolute inset-0 rounded-lg border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                  <div className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-[color:var(--color-accent)]" />
                  <div className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-[color:var(--color-accent)]" />
                  <div className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-[color:var(--color-accent)]" />
                  <div className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-[color:var(--color-accent)]" />
                  <div className="absolute inset-x-0 top-0 h-0.5 animate-[july-scan-line_2s_ease-in-out_infinite] bg-[color:var(--color-accent)]" />
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            {cameraError && (
              <p className="text-small font-medium text-[color:var(--color-error)]" role="alert">
                {cameraError}
              </p>
            )}
            <Button type="button" variant="secondary" onClick={() => setScanning(false)} className="w-full sm:w-auto">
              Stop scanning
            </Button>
          </div>
        ) : (
          <Button type="button" variant="primary" onClick={() => { setCameraError(null); setScanning(true); }} className="w-full sm:w-auto">
            Scan QR code
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 text-small text-[color:var(--color-text-muted)]">
        <div className="h-px flex-1 bg-[color:var(--color-border)]" />
        or
        <div className="h-px flex-1 bg-[color:var(--color-border)]" />
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          const id = manualTicketId.trim();
          if (id) router.push(`/july-award-2026/ticket/${extractTicketId(id)}`);
        }}
      >
        <input
          type="text"
          value={manualTicketId}
          onChange={(e) => setManualTicketId(e.target.value)}
          placeholder="Enter ticket ID (e.g. JA26-XXXXXXXX)"
          className="ds-input flex-1"
        />
        <Button type="submit" variant="secondary">
          Look up
        </Button>
      </form>
    </div>
  );
}
