import Image from "next/image";
import Link from "next/link";
import { HeroPhotoSlider } from "@/components/home/HeroPhotoSlider";
import { PUNAB_LOGO_SRC } from "@/components/layout/logo";
import { MarketingContainer } from "@/components/ui/MarketingContainer";

/** Fixed in code — not CMS/DB. */
const HERO_CTA_SECONDARY_LABEL = "July Monitoring Form";
/** Motto from the PUNAB logo: UNITY · MOBILIZING · PROGRESS */
const HERO_WALL_WORDS = ["Unity", "Mobilizing", "Progress"];

export type HeroContent = {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  images: string[];
};

export function Hero({ content }: { content: HeroContent }) {
  const hasPhoto = content.images.length > 0;
  return (
    <section className={`wall overflow-hidden ${hasPhoto ? "" : "flex min-h-[calc(100dvh-5rem)] flex-col justify-center"}`}>
      {hasPhoto && (
        <div className="relative h-[34svh] min-h-[240px] overflow-hidden bg-[#0f3b2e] sm:h-[46svh] sm:min-h-[380px]">
          <HeroPhotoSlider images={content.images} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-24" aria-hidden>
            <svg className="absolute bottom-0 h-full w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
              <path d="M0,114 C 240,34 480,154 720,114 C 960,74 1200,194 1440,114 L1440,200 L0,200 Z" fill="#0f3b2e" />
              <path
                className="wave-line wave-line-load"
                d="M0,102 C 240,22 480,142 720,102 C 960,62 1200,182 1440,102"
                pathLength={1}
                fill="none"
                stroke="#c41e3a"
                strokeWidth={24}
                strokeDasharray={1}
              />
            </svg>
          </div>
        </div>
      )}
      <MarketingContainer
        className={
          hasPhoto
            ? "relative z-[1] pb-14 pt-2 sm:pt-4"
            : "relative z-[1] grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8 lg:py-20"
        }
      >
        <div className={hasPhoto ? "grid items-center gap-x-12 gap-y-2 lg:grid-cols-[1.3fr_1fr]" : undefined}>
          <h1 className="contents">
            <span className="block">
              <span
                className="wall-brush wall-in-wipe block text-[clamp(3rem,11vw,5.25rem)] leading-[1.08] tracking-normal text-[color:var(--wall-chalk)]"
              >
                {HERO_WALL_WORDS.map((w) => (
                  <span key={w} className="block">
                    {w}
                  </span>
                ))}
              </span>
            </span>
          </h1>
          <div className="wall-in-rise" style={{ "--m-delay": "700ms" } as React.CSSProperties}>
            <p className="wall-text max-w-xl text-balance text-xl font-extrabold uppercase leading-snug tracking-[0.04em] text-[color:var(--wall-chalk)] sm:text-2xl">
              {content.title}
            </p>
            <p className="wall-text mt-4 max-w-[62ch] whitespace-pre-line text-lg leading-relaxed text-[color:var(--wall-chalk-dim)]">
              {content.subtitle}
            </p>
            <div className="mt-7 flex flex-col items-start gap-x-6 gap-y-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/register" className="wall-btn w-full whitespace-nowrap sm:w-auto">
                {content.ctaPrimary}
              </Link>
              <Link href="/monitoring-form" className="wall-link">
                {HERO_CTA_SECONDARY_LABEL}
              </Link>
            </div>
          </div>
        </div>
        {!hasPhoto && (
          <div className="wall-sheet mx-auto w-full max-w-xs rotate-2 p-3 pb-10 sm:max-w-sm lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
              <Image
                src={PUNAB_LOGO_SRC}
                alt=""
                fill
                priority
                className="object-contain p-8"
                sizes="(max-width: 1024px) 80vw, 30vw"
              />
            </div>
          </div>
        )}
      </MarketingContainer>
    </section>
  );
}
