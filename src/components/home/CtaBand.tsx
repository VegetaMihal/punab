import { Button } from "@/components/ui/Button";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PUNAB_MEMBERSHIP_GOOGLE_FORM_URL } from "@/lib/punab-external-urls";

export type CtaBandContent = {
  title: string;
  body: string;
};

export function CtaBand({ content }: { content: CtaBandContent }) {
  return (
    <section className="border-y border-[color:color-mix(in_srgb,var(--color-brand)_35%,transparent)] bg-[color:var(--color-brand)] py-16 text-[color:var(--color-surface)] md:py-20">
      <MarketingContainer className="text-center">
        <h2 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-[color:var(--color-surface)] sm:text-4xl lg:text-5xl">
          {content.title}
        </h2>
        <p className="text-body mx-auto mt-4 max-w-2xl text-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)]">
          {content.body}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Button
            href={PUNAB_MEMBERSHIP_GOOGLE_FORM_URL}
            prefetch={false}
            target="_blank"
            rel="noopener noreferrer"
            variant="inverse"
            size="lg"
            className="w-full sm:w-auto"
          >
            Become a Member
          </Button>
          <Button href="/contact" variant="inverseOutline" size="lg" className="w-full sm:w-auto">
            Contact us
          </Button>
        </div>
      </MarketingContainer>
    </section>
  );
}
