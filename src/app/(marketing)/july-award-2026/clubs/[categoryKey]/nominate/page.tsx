import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { getJulyAwardCategoryByKey } from "@/lib/july-award-2026-clubs";

type Props = { params: Promise<{ categoryKey: string }> };

export async function generateMetadata({ params }: Props) {
  const { categoryKey } = await params;
  const cat = getJulyAwardCategoryByKey(categoryKey);
  const debate = categoryKey === "debate";
  return {
    title: cat ? (debate ? `${cat.name} · July Award 2026` : `Nominate · ${cat.name}`) : "Nominate · July Award 2026",
    description: cat
      ? debate
        ? `${cat.name} — July Award 2026. Register for your Debate Forum participation card after debate rounds.`
        : `Submit your club for ${cat.name} — PUNAB July Uprising Memorial Award 2026.`
      : "Club nomination · July Award 2026",
  };
}

export default async function JulyAwardNominatePage({ params }: Props) {
  const { categoryKey } = await params;
  const cat = getJulyAwardCategoryByKey(categoryKey);
  if (!cat) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={cat.name}
        description="Submissions for the July Uprising Memorial Award 2026 are now closed."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "July Award 2026", href: "/july-award-2026" },
          { label: "Club applications", href: "/july-award-2026/clubs" },
          { label: "Closed" },
        ]}
        tone="pattern"
      />

      <Section surface="white" divider={false} paddingY="section">
        <MarketingContainer>
          <div className="mx-auto max-w-2xl rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-8 py-14 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--brand-green)_14%,var(--color-surface))] text-[color:var(--brand-green)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-h3 text-[color:var(--color-text)]">Submissions are closed</h2>
            <p className="mx-auto mt-3 max-w-md text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">
              Club nominations for the July Uprising Memorial Award 2026 are no longer being accepted for{" "}
              <span className="font-semibold text-[color:var(--color-text)]">{cat.name}</span>. Thank you to every chapter that
              submitted—the jury is now reviewing entries.
            </p>
            <Button href="/july-award-2026/clubs" variant="secondary" size="md" className="mt-8">
              ← All club categories
            </Button>
          </div>
        </MarketingContainer>
      </Section>
    </>
  );
}
