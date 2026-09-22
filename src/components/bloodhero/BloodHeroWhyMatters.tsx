"use client";

import { motion, useReducedMotion } from "motion/react";
import { BloodHeroAccentBar } from "./BloodHeroAccentBar";

/** Emotional / mission copy — edit paragraph text here. */
export function BloodHeroWhyMatters() {
  const reduced = useReducedMotion();

  return (
    <section className="border-b border-(--bh-line) bg-(--bh-panel) py-16">
      <motion.div
        className="mx-auto max-w-3xl px-4 text-center sm:px-6"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={reduced ? { duration: 0.25, ease: "easeOut" } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <BloodHeroAccentBar />
        <h2 className="bh-display text-2xl font-bold tracking-tight text-(--bh-ink) sm:text-3xl">Why BloodHero matters</h2>
        <p className="mt-6 text-base leading-relaxed text-(--bh-ink-soft) sm:text-lg">
          Every donation is a second chance&mdash;often for a stranger&apos;s parent, child, or friend. BloodHero
          exists to shrink the gap between{" "}
          <strong className="font-bold text-(--bh-blood-deep)">&ldquo;someone needs blood&rdquo;</strong>{" "}
          and <strong className="font-bold text-(--bh-blood-deep)">&ldquo;someone answered.&rdquo;</strong>
        </p>
        <p className="mt-5 text-sm leading-relaxed text-(--bh-ink-soft)">
          No public login wall for those asking for help. Short forms, clear steps, and respectful follow-up—so
          families can focus on the person in the bed, not the bureaucracy.
        </p>
      </motion.div>
    </section>
  );
}
