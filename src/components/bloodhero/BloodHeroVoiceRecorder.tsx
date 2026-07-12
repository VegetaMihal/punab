"use client";

import { transcribeConditionAudio } from "@/actions/bloodhero-transcribe";
import { useCallback, useEffect, useRef, useState } from "react";

type RecorderPhase = "idle" | "recording" | "processing";

export type BloodHeroTranscriptionLanguage = "en" | "bn";

const btnBase =
  "inline-flex min-h-12 w-full min-w-0 items-center justify-center rounded-xl border text-base font-semibold shadow-sm transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950 sm:min-h-11 sm:w-auto";

const btnPrimary =
  `${btnBase} border-red-300 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-900/40`;

const btnStop =
  `${btnBase} border-zinc-400 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-500 dark:bg-zinc-800 dark:hover:bg-zinc-700`;

const errBoxClass =
  "mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100";

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return undefined;
}

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export type BloodHeroVoiceRecorderProps = {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
};

const langToggleBase =
  "min-h-12 flex-1 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950 sm:min-h-11";

const langToggleOff =
  `${langToggleBase} border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`;

const langToggleOn =
  `${langToggleBase} border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/60 dark:text-red-50`;

export function BloodHeroVoiceRecorder({
  onTranscript,
  onError,
  disabled = false,
}: BloodHeroVoiceRecorderProps) {
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [language, setLanguage] = useState<BloodHeroTranscriptionLanguage>("en");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeRef = useRef<string | undefined>(undefined);

  const stopTick = useCallback(() => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      for (const t of s.getTracks()) {
        t.stop();
      }
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTick();
      cleanupStream();
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        try {
          mr.stop();
        } catch {
          /* already stopped */
        }
      }
      mediaRecorderRef.current = null;
    };
  }, [cleanupStream, stopTick]);

  async function startRecording() {
    setInlineError(null);
    if (disabled || phase !== "idle") return;
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const msg = "Microphone is not available in this browser.";
      setInlineError(msg);
      onError?.(msg);
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      const msg = "Voice recording is not supported in this browser.";
      setInlineError(msg);
      onError?.(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      mimeRef.current = pickMimeType();

      const languageForThisRecording: BloodHeroTranscriptionLanguage = language;

      const mr = new MediaRecorder(stream, mimeRef.current ? { mimeType: mimeRef.current } : undefined);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      mr.onerror = () => {
        setInlineError("Recording failed.");
        onError?.("Recording failed.");
        setPhase("idle");
        stopTick();
        cleanupStream();
        mediaRecorderRef.current = null;
      };

      mr.onstop = async () => {
        cleanupStream();
        mediaRecorderRef.current = null;
        const mime = mimeRef.current ?? "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];

        if (blob.size < 1) {
          const msg = "No audio captured. Try again.";
          setInlineError(msg);
          onError?.(msg);
          setPhase("idle");
          return;
        }

        setPhase("processing");
        const ext = mime.includes("webm") ? "webm" : mime.includes("mp4") ? "m4a" : "webm";
        const file = new File([blob], `condition.${ext}`, { type: blob.type || mime });
        const fd = new FormData();
        fd.set("audio", file);
        fd.set("language", languageForThisRecording);

        const result = await transcribeConditionAudio(fd);
        if (result.success && result.transcript) {
          onTranscript(result.transcript);
          setPhase("idle");
          setSeconds(0);
        } else {
          const msg = result.error ?? "Transcription failed.";
          setInlineError(msg);
          onError?.(msg);
          setPhase("idle");
          setSeconds(0);
        }
      };

      mr.start(250);
      setPhase("recording");
      setSeconds(0);
      stopTick();
      tickRef.current = setInterval(() => {
        setSeconds((x) => x + 1);
      }, 1000);
    } catch (e) {
      const err = e as { name?: string; message?: string };
      let msg = "Could not access the microphone.";
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        msg = "Microphone permission was denied. Allow access in your browser settings to use voice.";
      } else if (err?.name === "NotFoundError") {
        msg = "No microphone was found on this device.";
      } else if (typeof err?.message === "string" && err.message.trim()) {
        msg = err.message.trim();
      }
      setInlineError(msg);
      onError?.(msg);
      cleanupStream();
      mediaRecorderRef.current = null;
    }
  }

  function stopRecording() {
    if (phase !== "recording") return;
    stopTick();
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "recording") {
      mr.stop();
    } else {
      cleanupStream();
      setPhase("idle");
    }
  }

  const micDisabled = disabled || phase !== "idle";
  const langLocked = phase !== "idle";

  return (
    <div className="w-full min-w-0">
      <div
        className="mb-3 flex w-full min-w-0 gap-2"
        role="radiogroup"
        aria-label="Transcription language"
      >
        <button
          type="button"
          role="radio"
          aria-checked={language === "en"}
          disabled={langLocked}
          onClick={() => setLanguage("en")}
          className={language === "en" ? langToggleOn : langToggleOff}
        >
          English
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={language === "bn"}
          disabled={langLocked}
          onClick={() => setLanguage("bn")}
          className={language === "bn" ? langToggleOn : langToggleOff}
        >
          বাংলা
        </button>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {phase === "processing" ? (
          <div
            className="inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-800 sm:w-auto dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            role="status"
            aria-live="polite"
          >
            <span
              className="size-5 shrink-0 rounded-full border-2 border-red-600 border-t-transparent animate-spin dark:border-red-400"
              aria-hidden
            />
            Transcribing…
          </div>
        ) : null}

        {phase === "idle" ? (
          <button
            type="button"
            onClick={() => void startRecording()}
            disabled={micDisabled}
            className={btnPrimary}
            aria-label="Record condition by voice"
          >
            <span className="flex items-center gap-2 px-3">
              <MicIcon className="size-6 shrink-0" />
              <span className="text-sm font-semibold">Speak</span>
            </span>
          </button>
        ) : null}

        {phase === "recording" ? (
          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={stopRecording}
              className={`${btnStop} gap-2 px-4 sm:flex-initial`}
              aria-label="Stop recording"
            >
              <StopIcon className="size-5 shrink-0" />
              <span className="text-sm font-semibold">Stop</span>
            </button>
            <span
              className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-mono text-sm font-semibold tabular-nums text-zinc-800 sm:h-auto sm:min-h-11 sm:min-w-[4.5rem] sm:flex-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              aria-live="polite"
            >
              {formatDuration(seconds)}
            </span>
          </div>
        ) : null}
      </div>

      {inlineError ? (
        <p className={errBoxClass} role="alert">
          {inlineError}
        </p>
      ) : null}
    </div>
  );
}
