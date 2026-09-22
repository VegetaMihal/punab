/**
 * The BloodHero figure: one ink-line stick person holding a blood drop.
 * Pure SVG + CSS (see bloodhero.css). Decorative; the bubble text carries the meaning.
 */
export function BloodHeroFigure({ message }: { message: string }) {
  return (
    <div className="flex items-end gap-2">
      <svg
        viewBox="0 0 120 170"
        width="120"
        height="170"
        aria-hidden
        className="h-36 w-auto shrink-0 overflow-visible sm:h-44"
      >
        <ellipse className="bh-fig-shadow" cx="60" cy="162" rx="26" ry="4" fill="var(--bh-ink)" opacity="0.18" />
        <g
          className="bh-fig-body"
          fill="none"
          stroke="var(--bh-ink)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="60" cy="34" r="12" fill="var(--bh-bg)" />
          <path d="M55 33h.01M65 33h.01" strokeWidth="3.5" />
          <path d="M55 39q5 4 10 0" strokeWidth="2.5" />
          <path d="M60 46v52" />
          <path d="M60 98 44 154M60 98l16 56" />
          <path d="M60 60 38 82" />
          <g className="bh-fig-arm">
            <path d="M60 60l26-20" />
            <g className="bh-fig-drop">
              <path
                d="M86 12c7 9 12 14 12 21a12 12 0 0 1-24 0c0-7 5-12 12-21z"
                fill="var(--bh-blood)"
                stroke="var(--bh-ink)"
                strokeWidth="3"
              />
              <path d="M81 33a5 5 0 0 0 4 5" stroke="var(--bh-on-blood)" strokeWidth="2.5" opacity="0.8" />
            </g>
          </g>
        </g>
      </svg>
      <p
        className="bh-bubble bh-display mb-16 max-w-[13rem] rounded-2xl rounded-bl-sm border-2 border-(--bh-ink) bg-(--bh-panel) px-4 py-3 text-lg font-bold leading-snug text-(--bh-ink) sm:mb-20 sm:max-w-[15rem] sm:text-xl"
        role="status"
      >
        {message}
      </p>
    </div>
  );
}
