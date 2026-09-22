import { SmartBackLink } from "@/components/ui/SmartBackLink";

type Props = {
  title: string;
  description?: string;
  /** Subtle back link to landing — not a nav bar; improves inner-page orientation. */
  showHomeLink?: boolean;
};

/** Standard top block for inner BloodHero pages — edit via props from each `page.tsx`. */
export function BloodHeroPageHero({ title, description, showHomeLink = true }: Props) {
  return (
    <div className="border-b-2 border-(--bh-line) py-10 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        {showHomeLink ? (
          <SmartBackLink
            fallbackHref="/bloodhero"
            className="mb-4 inline-block text-sm font-medium text-(--bh-ink-soft) underline-offset-4 hover:text-(--bh-ink) hover:underline"
          >
            ← BloodHero home
          </SmartBackLink>
        ) : null}
        <h1 className="bh-display text-4xl font-bold text-(--bh-ink) sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-(--bh-ink-soft)">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
