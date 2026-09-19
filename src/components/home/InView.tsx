"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variant = "wipe" | "paste" | "grow" | "rise" | "ribbon";

/** Scroll-triggered entrance. Content stays visible until JS arms it, and reduced-motion users never see it hidden. */
export function InView({
  children,
  variant,
  delay = 0,
  className,
}: {
  children: ReactNode;
  variant: Variant;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "in">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (variant !== "ribbon" && el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState("armed");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState("in");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [variant]);

  return (
    <div
      ref={ref}
      className={className}
      data-motion={variant}
      data-armed={state !== "idle" ? "true" : undefined}
      data-in={state === "in" ? "true" : undefined}
      style={{ "--m-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
