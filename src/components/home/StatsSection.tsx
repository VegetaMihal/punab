"use client";

import { useEffect, useRef, useState } from "react";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

type Props = {
  chapters: number;
  events: number;
  successfulEvents: number;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function AnimatedNumber({ value, active }: { value: number; active: boolean }) {
  const [display, setDisplay] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!active || reduced) return;
    let start: number | null = null;
    const duration = 900;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(Math.round(value * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active, value, reduced]);

  if (!active) {
    return <span className="tabular-nums">0</span>;
  }
  if (reduced) {
    return <span className="tabular-nums">{value}</span>;
  }
  return <span className="tabular-nums">{display}</span>;
}

export function StatsSection({ chapters, events, successfulEvents }: Props) {
  const items = [
    {
      label: "University Chapters",
      value: chapters,
      icon: (
        <svg className="mx-auto h-8 w-8 text-[color:var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: "Upcoming Events",
      value: events,
      icon: (
        <svg className="mx-auto h-8 w-8 text-[color:var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Successful Events",
      value: successfulEvents,
      icon: (
        <svg className="mx-auto h-8 w-8 text-[color:var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const allZero = chapters === 0 && events === 0 && successfulEvents === 0;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || seen) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [seen]);

  return (
    <Section surface="white" divider paddingY="section">
      <MarketingContainer>
        <Reveal>
          <h2 className="text-center text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
            At a glance
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-3xl font-black leading-tight text-[color:var(--color-text)] md:text-5xl">
            {allZero
              ? "Live figures from the PUNAB platform."
              : "Momentum, chapters, events, and community reach."}
          </p>
        </Reveal>
        <div ref={wrapRef} className="mt-12 grid gap-0 overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-md)] md:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.label} staggerIndex={index}>
              <div className="border-b border-[color:var(--color-border)] px-6 py-8 text-center motion-safe:transition-colors motion-safe:duration-[var(--transition-base)] hover:bg-[color:var(--color-surface-2)] md:border-b-0 md:border-r md:last:border-r-0">
                <div className="mb-4">{item.icon}</div>
                <p className="text-5xl font-black tabular-nums text-[color:var(--color-brand)] md:text-6xl">
                  <AnimatedNumber value={item.value} active={seen} />
                </p>
                <p className="mt-3 text-small font-bold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </MarketingContainer>
    </Section>
  );
}
