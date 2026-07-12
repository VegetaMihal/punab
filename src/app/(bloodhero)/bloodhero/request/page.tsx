import type { Metadata } from "next";
import { BloodHeroPageHero, BloodHeroPageSection, BloodHeroRequestForm } from "@/components/bloodhero";

export const metadata: Metadata = {
  title: "Request Blood",
  description:
    "Submit an urgent blood request through BloodHero—district, blood group, and hospital context.",
};

export default function BloodHeroRequestPage() {
  return (
    <>
      <BloodHeroPageHero
        title="Request Blood"
        description="Tell us who needs help, where, and when. No login—your request is stored for coordinators. Matching and tracking will build on this next."
      />
      <BloodHeroPageSection>
        <BloodHeroRequestForm />
      </BloodHeroPageSection>
    </>
  );
}
