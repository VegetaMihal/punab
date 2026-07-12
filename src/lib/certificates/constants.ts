import type { CertificateType } from "@/types/database";

export const CERTIFICATE_TYPES: readonly CertificateType[] = [
  "Participation",
  "Volunteer",
  "Leadership",
  "Membership",
  "Achievement",
  "Appreciation",
  "Club Recognition",
  "BloodHero",
  "Training Completion",
  "Guest Speaker",
  "Judge",
  "Campus Ambassador",
  "Special Recognition",
  "Competition Winner",
  "Project Contribution",
];

export const CERTIFICATE_PUBLIC_VERIFY_BASE = "https://punab.com/certificate/verify";
export const CERTIFICATE_STORAGE_BUCKET = "site-assets";
