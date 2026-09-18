"use client";

import { useEffect, useRef } from "react";

type Particle = {
  el: HTMLSpanElement;
  x: number;
  y: number;
  vy: number;
  life: number;
};

/** Spawns fading emoji particles that follow the pointer. Mount once per page. */
export function EmojiCursorTrail({ emoji = "💪" }: { emoji?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const particles: Particle[] = [];
    let lastSpawn = 0;

    function spawn(x: number, y: number) {
      const el = document.createElement("span");
      el.textContent = emoji;
      el.style.position = "fixed";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.fontSize = "1.1rem";
      el.style.pointerEvents = "none";
      el.style.zIndex = "9999";
      el.style.transform = "translate(-50%, -50%)";
      el.style.willChange = "transform, opacity";
      container?.appendChild(el);
      particles.push({ el, x, y, vy: -0.6 - Math.random() * 0.4, life: 1 });
    }

    function handlePointerMove(e: PointerEvent) {
      const now = performance.now();
      if (now - lastSpawn < 150) {
        return;
      }
      lastSpawn = now;
      spawn(e.clientX, e.clientY);
    }

    let raf = 0;
    function tick() {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= 0.02;
        p.y += p.vy;
        if (p.life <= 0) {
          p.el.remove();
          particles.splice(i, 1);
          continue;
        }
        p.el.style.top = `${p.y}px`;
        p.el.style.opacity = String(p.life);
        p.el.style.transform = `translate(-50%, -50%) scale(${0.6 + p.life * 0.6})`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", handlePointerMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(raf);
      particles.forEach((p) => p.el.remove());
    };
  }, [emoji]);

  return <div ref={containerRef} aria-hidden="true" />;
}
