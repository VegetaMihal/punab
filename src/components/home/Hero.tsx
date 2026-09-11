import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { HeroSlider } from "@/components/home/HeroSlider";

/** Fixed in code — not CMS/DB. */
const HERO_EYEBROW = "Country's largest private university–based organization.";
const HERO_CTA_SECONDARY_LABEL = "July Monitoring Form";

export type HeroContent = {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  images: string[];
};

export function Hero({ content }: { content: HeroContent }) {
  const hasPhoto = content.images.length > 0;
  return (
    <section className="relative flex min-h-[calc(100dvh-5rem)] flex-col justify-center overflow-hidden bg-[color:color-mix(in_srgb,var(--color-brand)_88%,black)]">
      {hasPhoto ? (
        <HeroSlider images={content.images} />
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_82%_20%,color-mix(in_srgb,var(--brand-green)_48%,transparent)_0%,transparent_62%),radial-gradient(70%_65%_at_10%_85%,color-mix(in_srgb,var(--color-brand)_55%,black)_0%,transparent_68%),linear-gradient(135deg,color-mix(in_srgb,var(--color-brand)_82%,black)_0%,color-mix(in_srgb,var(--brand-green)_54%,var(--color-brand))_100%)]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(color-mix(in_srgb,var(--color-surface)_45%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-surface)_45%,transparent)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden />
        </>
      )}
      <MarketingContainer
        className={
          hasPhoto
            ? "relative z-[1] flex flex-1 flex-col justify-start pt-1 pb-10 sm:pt-2 sm:pb-14 lg:pt-3 lg:pb-16"
            : "relative z-[1] flex flex-1 flex-col justify-center py-16 sm:py-20 lg:py-24"
        }
      >
        <div
          className={
            hasPhoto
              ? "mx-auto max-w-2xl text-center [text-shadow:0_2px_20px_rgba(0,0,0,0.7)]"
              : "mx-auto max-w-4xl text-center"
          }
        >
          <p className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[color:color-mix(in_srgb,var(--color-surface)_42%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface)_10%,transparent)] px-4 py-1.5 text-xs font-semibold text-[color:var(--color-surface)] backdrop-blur-sm sm:text-small">
            <span className="h-1.5 w-1.5 rotate-45 bg-[color:color-mix(in_srgb,var(--brand-green)_70%,white)]" aria-hidden />
            {HERO_EYEBROW}
          </p>
          <h1
            className={
              hasPhoto
                ? "mt-4 text-balance text-3xl font-black leading-[1.05] tracking-tight text-[color:color-mix(in_srgb,var(--color-surface)_82%,white)] sm:text-4xl lg:text-5xl"
                : "mt-7 text-balance text-6xl font-black leading-[0.96] tracking-tight text-[color:color-mix(in_srgb,var(--color-surface)_82%,white)] sm:text-7xl lg:text-8xl"
            }
          >
            {content.title}
          </h1>
          <p
            className={
              hasPhoto
                ? "mx-auto mt-4 max-w-2xl whitespace-pre-line text-sm font-semibold leading-relaxed text-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] sm:text-base"
                : "mx-auto mt-8 max-w-2xl whitespace-pre-line text-lg font-semibold leading-relaxed text-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] sm:text-xl"
            }
          >
            {content.subtitle}
          </p>
          {!hasPhoto && (
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                href="/register"
                variant="inverse"
                size="lg"
                className="w-full text-[color:color-mix(in_srgb,var(--color-brand)_78%,black)] sm:w-auto"
              >
                {content.ctaPrimary}
              </Button>
              <Button href="/monitoring-form" variant="heroPulseRed" size="lg" className="w-full sm:w-auto">
                {HERO_CTA_SECONDARY_LABEL}
              </Button>
            </div>
          )}
        </div>
      </MarketingContainer>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden">
        <svg
          className="absolute bottom-0 left-0 h-full w-full"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,120 C 240,40 480,200 720,120 C 960,40 1200,200 1440,120 L1440,200 L0,200 Z"
            fill="var(--color-surface)"
          />
        </svg>
      </div>
    </section>
  );
}
