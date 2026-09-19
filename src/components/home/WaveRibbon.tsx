/** Curly section edge: `to` fills below the curve, a crimson line rides it. Only the line animates (see `.wave-line`). */
const FILL = "M0,114 C 240,34 480,154 720,114 C 960,74 1200,194 1440,114 L1440,200 L0,200 Z";
const LINE = "M0,102 C 240,22 480,142 720,102 C 960,62 1200,182 1440,102";

export function WaveRibbon({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ backgroundColor: from }} aria-hidden>
      <svg className="block h-14 w-full sm:h-20" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d={FILL} fill={to} />
        <path
          className="wave-line"
          d={LINE}
          pathLength={1}
          fill="none"
          stroke="#c41e3a"
          strokeWidth={24}
          strokeDasharray={1}
        />
      </svg>
    </div>
  );
}
