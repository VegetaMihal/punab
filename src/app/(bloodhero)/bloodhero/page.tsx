import {
  BloodHeroBenefits,
  BloodHeroBloodGroups,
  BloodHeroCtaStrip,
  BloodHeroHeroSection,
  BloodHeroHowItWorks,
  BloodHeroPostHeroUtility,
  BloodHeroWhyMatters,
} from "@/components/bloodhero";

/**
 * BloodHero landing — standalone module (no PUNAB marketing chrome).
 * Header, footer, and nav are provided by `(bloodhero)/layout.tsx`.
 */
export default function BloodHeroPage() {
  return (
    <>
      <BloodHeroHeroSection />
      <BloodHeroPostHeroUtility />
      <BloodHeroHowItWorks />
      <BloodHeroWhyMatters />
      <BloodHeroBenefits />
      <BloodHeroBloodGroups />
      <BloodHeroCtaStrip />
    </>
  );
}
