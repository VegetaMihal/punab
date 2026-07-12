import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PUNAB_MEMBERSHIP_GOOGLE_FORM_URL } from "@/lib/punab-external-urls";

/** Fixed in code — not CMS/DB. */
const HERO_EYEBROW = "Country's largest private university–based organization.";
const HERO_CTA_SECONDARY_LABEL = "July Awards 2026";

export type HeroContent = {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  imageUrl?: string;
};

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative flex min-h-[calc(100dvh-5rem)] flex-col justify-center overflow-hidden bg-[color:color-mix(in_srgb,var(--color-brand)_88%,black)]">
      {content.imageUrl ? (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={content.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            quality={90}
            priority
          />
          <div className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--color-brand)_78%,transparent)]" />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_82%_20%,color-mix(in_srgb,var(--brand-green)_48%,transparent)_0%,transparent_62%),radial-gradient(70%_65%_at_10%_85%,color-mix(in_srgb,var(--color-brand)_55%,black)_0%,transparent_68%),linear-gradient(135deg,color-mix(in_srgb,var(--color-brand)_82%,black)_0%,color-mix(in_srgb,var(--brand-green)_54%,var(--color-brand))_100%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(color-mix(in_srgb,var(--color-surface)_45%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-surface)_45%,transparent)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden />
      <MarketingContainer className="relative z-[1] flex flex-1 flex-col justify-center py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[color:color-mix(in_srgb,var(--color-surface)_42%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface)_10%,transparent)] px-5 py-2 text-small font-semibold text-[color:var(--color-surface)] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rotate-45 bg-[color:color-mix(in_srgb,var(--brand-green)_70%,white)]" aria-hidden />
            {HERO_EYEBROW}
          </p>
          <h1 className="mt-7 text-balance text-6xl font-black leading-[0.96] tracking-tight text-[color:color-mix(in_srgb,var(--color-surface)_82%,white)] sm:text-7xl lg:text-8xl">
            {content.title}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl whitespace-pre-line text-lg font-semibold leading-relaxed text-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] sm:text-xl">
            {content.subtitle}
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              href={PUNAB_MEMBERSHIP_GOOGLE_FORM_URL}
              prefetch={false}
              target="_blank"
              rel="noopener noreferrer"
              variant="inverse"
              size="lg"
              className="w-full text-[color:color-mix(in_srgb,var(--color-brand)_78%,black)] sm:w-auto"
            >
              {content.ctaPrimary}
            </Button>
            <Button href="/july-award-2026" variant="heroPulseRed" size="lg" className="w-full sm:w-auto">
              {HERO_CTA_SECONDARY_LABEL}
            </Button>
          </div>
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
