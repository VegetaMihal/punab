"use client";

import { motion, useReducedMotion } from "motion/react";

/** Signature ink-line flourish: draws itself in left-to-right once, above a section heading. */
export function BloodHeroAccentBar({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={`mx-auto mb-4 h-[3px] w-14 rounded-full bg-(--bh-blood) ${className}`}
      style={{ transformOrigin: "center" }}
      initial={reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={reduced ? { duration: 0.25 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
