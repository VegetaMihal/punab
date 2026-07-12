"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type Variant = "up" | "scale" | "blur" | "left" | "right";

type Props = {
  children: ReactNode;
  className?: string;
  /** Extra delay for staggered grids (ms). */
  staggerIndex?: number;
  /** Animation style. Default "up". */
  variant?: Variant;
};

export function Reveal({ children, className, staggerIndex = 0, variant = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const delayMs = staggerIndex * 90;

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { root: null, rootMargin: "0px 0px -15% 0px", threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  const style = {
    "--reveal-delay": `${delayMs}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-variant={variant}
      className={cn("reveal-base", visible && "reveal-visible", className)}
      style={style}
    >
      {children}
    </div>
  );
}
