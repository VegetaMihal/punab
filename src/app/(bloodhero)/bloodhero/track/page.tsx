import type { Metadata } from "next";
import { BloodHeroPageHero, BloodHeroPageSection, BloodHeroTrackerPanel } from "@/components/bloodhero";

export const metadata: Metadata = {
  title: "Track Request",
  description:
    "Look up your BloodHero blood request with the tracking number from your submission confirmation—no login required.",
};

export default function BloodHeroTrackPage() {
  return (
    <>
      <BloodHeroPageHero
        title="Track Request"
        description="Enter the tracking number from your confirmation screen to see that request and a simple status timeline."
      />
      <BloodHeroPageSection>
        <BloodHeroTrackerPanel />
      </BloodHeroPageSection>
    </>
  );
}
