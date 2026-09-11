"use client";

import { useEffect, useState } from "react";
import { dismissWelcomeIntro } from "@/actions/auth";

const STEPS = (firstName: string) => [
  { eyebrow: "Welcome to PUNAB", title: `Hey ${firstName} 👋`, body: "Your membership is confirmed — glad to have you." },
  { eyebrow: "Your dashboard", title: "Everything, one place", body: "Track your profile, applications, and updates from here." },
  { eyebrow: "Let's go", title: "You're all set", body: "Explore the dashboard whenever you're ready." },
];

export function WelcomeIntro({ firstName }: { firstName: string }) {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);
  const steps = STEPS(firstName);

  function close() {
    if (closing) return;
    setClosing(true);
    dismissWelcomeIntro();
    setTimeout(() => setVisible(false), 400);
  }

  useEffect(() => {
    if (step >= steps.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), 2600);
    return () => clearTimeout(t);
  }, [step, steps.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const current = steps[step];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-brand)] p-6 transition-opacity duration-400 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_20%,color-mix(in_srgb,var(--brand-green)_45%,transparent)_0%,transparent_65%)]" aria-hidden />

      <div className="relative w-full max-w-lg text-center">
        <button
          type="button"
          onClick={close}
          className="absolute -top-14 right-0 text-sm font-medium text-white/70 hover:text-white"
        >
          Skip
        </button>

        <div key={step} className="animate-[welcomeFadeIn_0.6s_ease-out]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:color-mix(in_srgb,var(--brand-green)_75%,white)]">
            {current.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">{current.title}</h1>
          <p className="mx-auto mt-4 max-w-sm text-base font-medium text-white/85">{current.body}</p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step ? "w-8 bg-white" : i < step ? "w-1.5 bg-white/70" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>

        {step === steps.length - 1 && (
          <button
            type="button"
            onClick={close}
            className="animate-[welcomeFadeIn_0.6s_ease-out] mt-8 rounded-full bg-white px-8 py-3 text-sm font-bold text-[color:var(--color-brand)]"
          >
            Go to dashboard
          </button>
        )}
      </div>

      <style>{`
        @keyframes welcomeFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
