"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

const SHOW_AFTER_PX = 360;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Back to top"
      title="Back to top"
      className={cn(
        "fixed z-[80] flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] border border-[color:color-mix(in_srgb,var(--color-brand)_88%,black)] bg-[color:var(--color-brand)] text-[color:var(--color-surface)] shadow-[var(--shadow-brand)] motion-safe:transition-[opacity,transform,box-shadow,background-color] motion-safe:duration-[var(--transition-base)]",
        "hover:bg-[color:var(--color-brand-dark)]",
        "focus-visible:outline focus-visible:ring-2 focus-visible:ring-[color:var(--color-surface)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-brand)]",
        "dark:border-[color:color-mix(in_srgb,var(--color-brand)_70%,white)] dark:bg-[color:var(--color-brand)] dark:text-[color:var(--color-surface)] dark:hover:bg-[color:var(--color-brand-dark)]",
        "bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] md:right-6",
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
