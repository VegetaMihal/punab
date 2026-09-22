"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts up to `value` once in view, then re-counts from the previous value whenever
 * `value` changes later (live updates) with a brief flash. Static under reduced motion.
 */
export function BloodHeroNumberTicker({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);
  const hasEntered = useRef(false);

  useEffect(() => {
    if (reduced || !inView) return;

    const from = hasEntered.current ? prevValue.current : 0;
    const changedAfterEntry = hasEntered.current && from !== value;
    hasEntered.current = true;
    prevValue.current = value;

    const controls = animate(from, value, {
      duration: from === 0 ? 1.1 : 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });

    let flashOnTimer: number | undefined;
    let flashOffTimer: number | undefined;
    if (changedAfterEntry) {
      flashOnTimer = window.setTimeout(() => setFlash(true), 0);
      flashOffTimer = window.setTimeout(() => setFlash(false), 600);
    }

    return () => {
      controls.stop();
      if (flashOnTimer) window.clearTimeout(flashOnTimer);
      if (flashOffTimer) window.clearTimeout(flashOffTimer);
    };
  }, [inView, reduced, value]);

  return (
    <span
      ref={ref}
      className={`${className ?? ""} inline-block transition-colors duration-300 ${flash ? "text-(--bh-blood)" : ""}`}
      aria-hidden
    >
      {reduced ? value : display}
    </span>
  );
}
