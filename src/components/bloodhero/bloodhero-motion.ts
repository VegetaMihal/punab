import type { Variants } from "motion/react";

/** Shared scroll-reveal variants for BloodHero marketing sections below the hero. */
export function bhRevealVariants(reducedMotion: boolean): {
  container: Variants;
  item: Variants;
} {
  return {
    container: {
      hidden: {},
      show: {
        transition: reducedMotion
          ? { staggerChildren: 0 }
          : { staggerChildren: 0.08, delayChildren: 0.05 },
      },
    },
    item: {
      hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(6px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: reducedMotion
          ? { duration: 0.25, ease: "easeOut" }
          : { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      },
    },
  };
}
