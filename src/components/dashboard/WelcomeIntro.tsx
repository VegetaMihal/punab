"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { dismissWelcomeIntro } from "@/actions/auth";

const STEPS = (firstName: string) => [
  {
    eyebrow: "Welcome to PUNAB",
    title: `Welcome, ${firstName} 👋`,
    body: "You're now part of the national community for private university students, teachers, and alumni across Bangladesh.",
  },
  {
    eyebrow: "Your dashboard",
    title: "One place for everything",
    body: "Your profile, applications, and PUNAB updates all live here — nothing to chase down elsewhere.",
  },
  {
    eyebrow: "Let's get started",
    title: "You're all set",
    body: "Step into your dashboard and start exploring what PUNAB has for you.",
  },
];

export function WelcomeIntro({ fullName, photoUrl }: { fullName: string; photoUrl: string | null }) {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);
  const firstName = fullName.split(" ")[0];
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
      <div className="relative w-full max-w-lg text-center">
        <button
          type="button"
          onClick={close}
          className="absolute -top-14 right-0 text-sm font-medium text-white/70 hover:text-white"
        >
          Skip
        </button>

        {photoUrl ? (
          <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <Image src={photoUrl} alt={fullName} fill className="object-cover" sizes="80px" priority />
          </div>
        ) : (
          <Image
            src="/branding/punab-logo-v2.png"
            alt="PUNAB"
            width={72}
            height={72}
            className="mx-auto h-16 w-16 rounded-xl bg-white p-1.5 shadow-lg"
            priority
          />
        )}
        <p className="mt-3 text-sm font-semibold text-white/90">{fullName}</p>

        <div key={step} className="animate-[welcomeFadeIn_0.6s_ease-out] mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
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
