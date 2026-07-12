import type { Metadata } from "next";
import { BloodHeroComingSoon, BloodHeroPageHero, BloodHeroPageSection } from "@/components/bloodhero";

export const metadata: Metadata = {
  title: "Certificates",
  description:
    "Download or verify BloodHero participation certificates for donors and partners when issuance is available.",
};

export default function BloodHeroCertificatesPage() {
  return (
    <>
      <BloodHeroPageHero
        title="Certificates"
        description="Recognize donors and partners with clear, verifiable certificates. This area will list eligible certificates and safe download or verification paths."
      />
      <BloodHeroPageSection>
        <div className="space-y-5 text-zinc-700 dark:text-zinc-300">
          <p className="leading-relaxed">
            Implementation will tie into completed donations or approved programs—design and policy are still
            being aligned with PUNAB and medical partners.
          </p>
          <BloodHeroComingSoon />
        </div>
      </BloodHeroPageSection>
    </>
  );
}
