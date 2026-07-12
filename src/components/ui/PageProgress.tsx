"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const progressKey = `${pathname}?${search.toString()}`;
  const [loading, setLoading] = useState(false);
  const startedAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      hideTimer.current = null;
      fallbackTimer.current = null;
    }

    function showLoading() {
      clearTimers();
      startedAt.current = Date.now();
      setLoading(true);
      fallbackTimer.current = setTimeout(() => setLoading(false), 4000);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target || anchor.hasAttribute("download")) return;

      const next = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      const samePage = next.pathname === current.pathname && next.search === current.search;
      if (next.origin !== current.origin || samePage) return;

      showLoading();
    }

    window.addEventListener("popstate", showLoading);
    document.addEventListener("click", handleClick, true);
    return () => {
      clearTimers();
      window.removeEventListener("popstate", showLoading);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);

    const elapsed = Date.now() - startedAt.current;
    const delay = Math.max(220 - elapsed, 0);
    hideTimer.current = setTimeout(() => setLoading(false), delay);
  }, [loading, progressKey]);

  return (
    <>
      <div
        className="pointer-events-none fixed left-0 top-0 z-[200] h-[3px] w-full overflow-hidden"
        style={{ background: "color-mix(in srgb, var(--color-brand) 14%, transparent)" }}
        aria-hidden
      >
        <div key={progressKey} className="page-progress-bar h-full w-full origin-left" />
      </div>
      {loading ? (
        <div
          className="page-loading-screen pointer-events-none fixed inset-0 z-[190] flex items-center justify-center overflow-hidden px-6"
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <div className="relative z-10 flex w-full max-w-[460px] flex-col items-center text-center">
            <span className="page-loading-logo grid h-24 w-24 place-items-center rounded-full bg-[color:var(--color-surface)] text-[2rem] font-black tracking-[-0.03em] text-[color:var(--color-brand)] shadow-[0_24px_70px_rgba(var(--color-brand-rgb),0.24)]">
              P
            </span>
            <span className="mt-8 text-xs font-bold uppercase tracking-[0.4em] text-[color:var(--color-brand)]">
              PUNAB
            </span>
            <span className="mt-3 text-3xl font-black leading-tight text-[color:var(--color-text)] sm:text-4xl">
              Loading page
            </span>
            <span className="mt-4 h-1.5 w-full max-w-[260px] overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--color-brand)_12%,white)]">
              <span className="page-loading-line block h-full w-full rounded-full bg-[color:var(--color-brand)]" />
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
