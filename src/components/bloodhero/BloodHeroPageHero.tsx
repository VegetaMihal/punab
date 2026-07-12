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
    <div className="border-b border-red-100/80 bg-gradient-to-b from-white to-red-50/30 py-12 dark:border-red-950/30 dark:from-zinc-950 dark:to-red-950/10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        {showHomeLink ? (
          <SmartBackLink
            fallbackHref="/bloodhero"
            className="mb-4 inline-block text-sm font-medium text-zinc-500 underline-offset-4 transition hover:text-red-700 hover:underline dark:text-zinc-400 dark:hover:text-red-400"
          >
            ← BloodHero home
          </SmartBackLink>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
