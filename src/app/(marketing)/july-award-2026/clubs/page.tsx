import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { JULY_AWARD_CLUB_CATEGORIES } from "@/lib/july-award-2026-clubs";

export const metadata = {
  title: "Club applications · July Award 2026",
  description:
    "Choose your lane—from debate to social welfare and pharmacy—and submit evidence-backed applications for PUNAB’s July Uprising Memorial Award 2026.",
};

export default function JulyAward2026ClubsPage() {
  return (
    <>
      <PageHeader
        title="Pick the lane that matches your club"
        description="Ten parallel forms—one per excellence category. Read the lane, gather proof, submit once per category (maximum two categories for the same club)."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "July Award 2026", href: "/july-award-2026" },
          { label: "Club applications" },
        ]}
        tone="pattern"
      />

      <Section surface="white" divider={false} paddingY="section">
        <MarketingContainer>
          <p className="mb-10 max-w-3xl text-[1.0625rem] leading-relaxed text-[color:var(--color-text-muted)]">
            If your club lives in more than one lane—say welfare <em className="not-italic">and</em> pharmacy, or welfare{" "}
            <em className="not-italic">and</em> debate—submit twice. Jurists read each file
            on its own merits.
          </p>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {JULY_AWARD_CLUB_CATEGORIES.map((c, i) => (
              <li key={c.key}>
                <Reveal staggerIndex={i % 6}>
                  <Card variant="elevated" className="flex h-full flex-col border border-[color:var(--color-border)] p-6">
                    <p className="text-small font-semibold uppercase tracking-wide text-[color:var(--brand-green)]">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="text-h3 mt-2 text-[color:var(--color-text)]">{c.name}</h3>
                    <p className="mt-3 flex-1 text-[1.02rem] leading-relaxed text-[color:var(--color-text-muted)]">{c.blurb}</p>
                    <Button
                      href={c.formHref}
                      prefetch={false}
                      variant="primary"
                      size="lg"
                      className="mt-6 w-full"
                      target={c.formHref.startsWith("http") ? "_blank" : undefined}
                      rel={c.formHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {c.key === "debate" ? "How this award works " : "Submit for this category"}
                    </Button>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ul>
        </MarketingContainer>
      </Section>
    </>
  );
}
