/** First focus target for keyboard users — pairs with `id="bloodhero-main"` on `<main>` in `(bloodhero)/layout.tsx`. */
export function BloodHeroSkipToMain() {
  return (
    <a
      href="#bloodhero-main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-(--bh-panel) focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-(--bh-blood-deep) focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-(--bh-blood) "
    >
      Skip to main content
    </a>
  );
}
