import type { Metadata } from "next";
import { BloodHeroDonorForm } from "@/components/bloodhero/BloodHeroDonorForm";
import { BloodHeroPageHero, BloodHeroPageSection } from "@/components/bloodhero";

export const metadata: Metadata = {
  title: "Become a Donor",
  description:
    "Register as a BloodHero donor, share your blood group and district, and get matched when help is needed nearby.",
};

export default function BloodHeroDonorPage() {
  return (
    <>
      <BloodHeroPageHero
        title="Become a Donor"
        description="Register once with your contact details, blood group, and area. There is no login—your registration is reviewed before you can be matched to urgent requests."
      />
      <BloodHeroPageSection>
        <BloodHeroDonorForm />
      </BloodHeroPageSection>
    </>
  );
}
