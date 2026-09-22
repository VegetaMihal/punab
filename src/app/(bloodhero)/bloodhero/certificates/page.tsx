import type { Metadata } from "next";
import { BloodHeroPageHero, BloodHeroPageSection } from "@/components/bloodhero";
import { BloodHeroCertificateVerify } from "@/components/bloodhero/BloodHeroCertificateVerify";

export const metadata: Metadata = {
  title: "Certificates",
  description: "Verify a BloodHero donation certificate by its certificate number.",
};

export default function BloodHeroCertificatesPage() {
  return (
    <>
      <BloodHeroPageHero
        title="Certificates"
        description="Enter a certificate number to verify a BloodHero donation. Certificates are issued once a confirmed match's donation is recorded."
      />
      <BloodHeroPageSection>
        <div className="space-y-5">
          <BloodHeroCertificateVerify />
        </div>
      </BloodHeroPageSection>
    </>
  );
}
