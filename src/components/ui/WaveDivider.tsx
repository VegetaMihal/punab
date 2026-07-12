type WaveSurface = "white" | "muted" | "transparent" | "brand";

const fillClass: Record<WaveSurface, string> = {
  white: "fill-[color:var(--color-surface)]",
  muted: "fill-[color:var(--color-surface-2)]",
  transparent: "fill-[color:var(--color-bg)]",
  brand: "fill-[color:var(--color-brand)]",
};

const bgClass: Record<WaveSurface, string> = {
  white: "bg-[color:var(--color-surface)]",
  muted: "bg-[color:var(--color-surface-2)]",
  transparent: "bg-[color:var(--color-bg)]",
  brand: "bg-[color:var(--color-brand)]",
};

export function WaveDivider({ from, to }: { from: WaveSurface; to: WaveSurface }) {
  return (
    <div className={`pointer-events-none h-12 overflow-hidden md:h-16 ${bgClass[from]}`} aria-hidden>
      <svg className="h-full w-full" viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path
          className={fillClass[to]}
          d="M0,84 C 180,20 360,144 540,84 C 720,24 900,144 1080,84 C 1260,24 1360,58 1440,34 L1440,160 L0,160 Z"
        />
      </svg>
    </div>
  );
}
