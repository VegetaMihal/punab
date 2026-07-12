/** First focus target for keyboard users — pairs with `id="bloodhero-main"` on `<main>` in `(bloodhero)/layout.tsx`. */
export function BloodHeroSkipToMain() {
  return (
    <a
      href="#bloodhero-main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-red-800 focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-red-600 dark:focus:bg-zinc-900 dark:focus:text-red-200"
    >
      Skip to main content
    </a>
  );
}
