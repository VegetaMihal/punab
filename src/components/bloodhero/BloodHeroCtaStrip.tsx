"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { bloodHeroMainActionLinks } from "@/components/bloodhero/bloodhero-nav";
import { bhRevealVariants } from "./bloodhero-motion";

/** Closing reminder — compact chips so we do not repeat the full hero button row. */
export function BloodHeroCtaStrip() {
  const reduced = useReducedMotion();
  const v = bhRevealVariants(Boolean(reduced));

  return (
    <section className="bg-(--bh-ink) py-10 text-(--bh-bg) sm:py-12">
      <motion.div
        className="mx-auto max-w-5xl px-4 sm:px-6"
        variants={v.container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.p variants={v.item} className="text-center text-base font-semibold sm:text-lg">
          Ready when you are—same steps, any time.
        </motion.p>
        <nav
          aria-label="BloodHero main actions"
          className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3"
        >
          {bloodHeroMainActionLinks.map((item) => (
            <motion.div key={item.href} variants={v.item}>
              <Link
                href={item.href}
                className="inline-flex min-h-11 w-full items-center justify-center bh-focus rounded-xl border-2 border-(--bh-bg) px-5 text-sm font-bold text-(--bh-bg) transition-colors duration-150 hover:bg-(--bh-bg) hover:text-(--bh-ink) sm:w-auto"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>
    </section>
  );
}
