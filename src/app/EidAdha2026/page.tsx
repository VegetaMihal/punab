import type { Metadata } from "next";
import { EidAdha2026CardGenerator } from "@/components/marketing/EidAdha2026CardGenerator";

export const metadata: Metadata = {
  title: "Eid-ul-Adha 2026 Card Generator — PUNAB",
  description:
    "Create a personalised Eid-ul-Adha 2026 greeting card from PUNAB. Upload your portrait, enter your name and designation, then download a high-resolution PNG card.",
};

export default function EidAdha2026Page() {
  return <EidAdha2026CardGenerator />;
}
