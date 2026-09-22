"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/** Subtle scroll-linked depth on one element. Disabled entirely under reduced motion. */
export function BloodHeroParallax({ children, range = 24 }: { children: ReactNode; range?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-range, range]);

  if (reduced) return <div ref={ref}>{children}</div>;
  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}
