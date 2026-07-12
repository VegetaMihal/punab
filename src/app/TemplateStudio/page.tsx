import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PUNAB Card Studio",
  description: "Design and download premium social cards for PUNAB.",
};

export default function TemplateStudioPage() {
  return (
    <iframe
      src="/punab-card-studio.html"
      title="PUNAB Card Studio"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
      allowFullScreen
    />
  );
}
