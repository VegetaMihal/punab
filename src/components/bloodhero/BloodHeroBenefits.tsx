"use client";

import { motion, useReducedMotion } from "motion/react";
import { bhRevealVariants } from "./bloodhero-motion";
import { BloodHeroAccentBar } from "./BloodHeroAccentBar";

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const benefits = [
  "No account needed for public users requesting blood",
  "Smart donor matching by district and blood group",
  "Secure email action links—no password to remember in a crisis",
  "Donation tracking from request to closure",
  "Certificates for successful donations (coming with full launch)",
] as const;

/** Benefits list — edit `benefits` above. */
export function BloodHeroBenefits() {
  const reduced = useReducedMotion();
  const v = bhRevealVariants(Boolean(reduced));

  return (
    <section className="border-b border-(--bh-line) bg-(--bh-panel) py-16 ">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <BloodHeroAccentBar />
        <h2 className="bh-display text-center text-2xl font-bold tracking-tight text-(--bh-ink) sm:text-3xl">
          Built for trust
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-(--bh-ink-soft) ">
          Simple on the outside, careful on the inside—so help arrives faster.
        </p>
        <motion.ul
          className="mx-auto mt-12 max-w-2xl space-y-4"
          variants={v.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {benefits.map((line) => (
            <motion.li
              key={line}
              variants={v.item}
              className="flex gap-3 rounded-xl border border-(--bh-line) bg-(--bh-panel) px-4 py-3 "
            >
              <CheckGlyph className="mt-0.5 h-5 w-5 shrink-0 text-(--bh-ink)" />
              <span className="text-sm leading-relaxed text-(--bh-ink-soft) ">{line}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
