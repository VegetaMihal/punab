"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const JULY_AWARD_PREFIX = "/july-award-2026";
const MAX_PARTICLES = 96;
const SPAWN_MS_SPARKLE = 20;
const SPAWN_MS_BLOOD = 34;
const MIN_MOVE_SPARKLE = 2;
const MIN_MOVE_BLOOD = 3;

type CursorMode = "sparkle" | "blood";

function isJulyAwardPath(pathname: string | null) {
  if (!pathname) return false;
  return pathname === JULY_AWARD_PREFIX || pathname.startsWith(`${JULY_AWARD_PREFIX}/`);
}

function trimParticles(root: HTMLDivElement) {
  while (root.childElementCount >= MAX_PARTICLES) {
    root.firstElementChild?.remove();
  }
}

function spawnSparkle(
  root: HTMLDivElement,
  x: number,
  y: number,
  variant: "red" | "green" | "dual",
) {
  trimParticles(root);

  const el = document.createElement("div");
  el.className = `brand-cursor-sparkle brand-cursor-sparkle--${variant}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  const dx = (Math.random() - 0.5) * 36;
  const dy = (Math.random() - 0.5) * 36;
  el.style.setProperty("--drift-x", `${dx}px`);
  el.style.setProperty("--drift-y", `${dy}px`);
  el.style.setProperty("--twirl", `${(Math.random() - 0.5) * 2}turn`);

  const onEnd = () => {
    el.removeEventListener("animationend", onEnd);
    el.remove();
  };
  el.addEventListener("animationend", onEnd);

  root.appendChild(el);
}

function spawnBloodDrop(root: HTMLDivElement, x: number, y: number) {
  trimParticles(root);

  const el = document.createElement("div");
  el.className = "brand-cursor-blood";
  if (Math.random() < 0.38) el.classList.add("brand-cursor-blood--sm");
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 16}px`);
  el.style.setProperty("--fall-y", `${32 + Math.random() * 56}px`);
  el.style.animationDuration = `${0.52 + Math.random() * 0.38}s`;

  const onEnd = () => {
    el.removeEventListener("animationend", onEnd);
    el.remove();
  };
  el.addEventListener("animationend", onEnd);

  root.appendChild(el);
}

export function BrandCursor() {
  const pathname = usePathname();
  const mode: CursorMode = isJulyAwardPath(pathname) ? "blood" : "sparkle";

  const rootRef = useRef<HTMLDivElement>(null);
  const lastSpawn = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastClientRef = useRef({ x: -1, y: -1 });
  const variantCycle = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      root?.classList.add("hidden");
      return;
    }

    root?.classList.remove("hidden");

    const spawnMs = mode === "blood" ? SPAWN_MS_BLOOD : SPAWN_MS_SPARKLE;
    const minMove = mode === "blood" ? MIN_MOVE_BLOOD : MIN_MOVE_SPARKLE;

    const spawn = (x: number, y: number, force: boolean) => {
      const layer = rootRef.current;
      if (!layer) return;

      const now = performance.now();
      const dist = Math.hypot(x - lastPos.current.x, y - lastPos.current.y);
      if (!force && now - lastSpawn.current < spawnMs && dist < minMove) return;
      lastSpawn.current = now;
      lastPos.current = { x, y };

      if (mode === "blood") {
        spawnBloodDrop(layer, x, y);
        if (Math.random() < 0.32) {
          spawnBloodDrop(layer, x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 10);
        }
        return;
      }

      const n = variantCycle.current % 3;
      variantCycle.current += 1;
      const ox = (Math.random() - 0.5) * 10;
      const oy = (Math.random() - 0.5) * 10;

      if (n === 0) spawnSparkle(layer, x + ox, y + oy, "dual");
      else if (n === 1) spawnSparkle(layer, x + ox * 0.6, y + oy * 0.6, "red");
      else spawnSparkle(layer, x + ox * 0.6, y + oy * 0.6, "green");

      if (Math.random() < 0.52) {
        const bx = x + (Math.random() - 0.5) * 16;
        const by = y + (Math.random() - 0.5) * 16;
        const r = Math.random();
        spawnSparkle(layer, bx, by, r < 0.34 ? "dual" : r < 0.67 ? "red" : "green");
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      lastClientRef.current = { x: e.clientX, y: e.clientY };
      spawn(e.clientX, e.clientY, false);
    };

    /** Touch/stylus: first contact often has no prior move — show effects immediately. */
    const onPointerDown = (e: PointerEvent) => {
      lastClientRef.current = { x: e.clientX, y: e.clientY };
      if (e.pointerType === "mouse") return;
      spawn(e.clientX, e.clientY, true);
    };

    const onWheel = (e: WheelEvent) => {
      lastClientRef.current = { x: e.clientX, y: e.clientY };
      spawn(e.clientX, e.clientY, false);
    };

    const onScroll = () => {
      const c = lastClientRef.current;
      const x = c.x >= 0 ? c.x : window.innerWidth * 0.5;
      const y = c.y >= 0 ? c.y : window.innerHeight * 0.36;
      spawn(x, y, false);
    };

    const leave = () => {
      rootRef.current?.replaceChildren();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    const vv = window.visualViewport;
    vv?.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll, { capture: true });
      vv?.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("mouseleave", leave);
      root?.replaceChildren();
      root?.classList.add("hidden");
    };
  }, [mode]);

  return (
    <div
      ref={rootRef}
      className="brand-cursor-root pointer-events-none fixed inset-0 z-10050 hidden overflow-hidden"
      aria-hidden
    />
  );
}
