import {
  BloodHeroBenefits,
  BloodHeroCtaStrip,
  BloodHeroHeroSection,
  BloodHeroHowItWorks,
  BloodHeroPostHeroUtility,
  BloodHeroWhyMatters,
} from "@/components/bloodhero";
import { EmojiCursorTrail } from "@/components/marketing/EmojiCursorTrail";

/** Live blood-need strip is cached for 60s. */
export const revalidate = 60;

/**
 * BloodHero landing — standalone module (no PUNAB marketing chrome).
 * Header, footer, and nav are provided by `(bloodhero)/layout.tsx`.
 */
export default function BloodHeroPage() {
  return (
    <>
      <EmojiCursorTrail emoji="🩸" />
      <BloodHeroHeroSection />
      <BloodHeroPostHeroUtility />
      <BloodHeroHowItWorks />
      <BloodHeroWhyMatters />
      <BloodHeroBenefits />
      <BloodHeroCtaStrip />
    </>
  );
}
