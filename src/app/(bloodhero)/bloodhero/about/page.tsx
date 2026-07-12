import type { Metadata } from "next";
import { BloodHeroComingSoon, BloodHeroPageHero, BloodHeroPageSection } from "@/components/bloodhero";

export const metadata: Metadata = {
  title: "About BloodHero",
  description:
    "Learn how BloodHero fits into PUNAB’s mission: fast, dignified blood coordination for communities across Bangladesh.",
};

export default function BloodHeroAboutPage() {
  return (
    <>
      <BloodHeroPageHero
        title="About BloodHero"
        description="BloodHero is a dedicated coordination layer: it connects people who can give with people who need help, under the umbrella of PUNAB’s national student and alumni network."
      />
      <BloodHeroPageSection>
        <div className="space-y-5 text-zinc-700 dark:text-zinc-300">
          <p className="leading-relaxed">
            This page will expand with mission, safety principles, partner hospitals, and how to get involved
            beyond donating blood. For now, the product shell focuses on clear navigation and trustworthy copy.
          </p>
          <BloodHeroComingSoon />
        </div>
      </BloodHeroPageSection>
    </>
  );
}
