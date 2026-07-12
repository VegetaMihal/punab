/**
 * BloodHero URL + label registry — single source for footer and in-content CTAs.
 * Not used for a header nav: keep top chrome minimal; import these in footers, heroes, and strips only.
 */

/** Primary flows — hero, footer quick row, bottom strip (compact). */
export const bloodHeroMainActionLinks = [
  { href: "/bloodhero/donor", label: "Become a Donor" },
  { href: "/bloodhero/request", label: "Request Blood" },
  { href: "/bloodhero/track", label: "Track Request" },
] as const;

/** Home + main actions — module wayfinding in footer (muted). */
export const bloodHeroFooterQuickLinks = [
  { href: "/bloodhero", label: "Home" },
  ...bloodHeroMainActionLinks,
] as const;

/** Lower-priority pages — footer + optional in-page strip. */
export const bloodHeroFooterSecondaryLinks = [
  { href: "/bloodhero/certificates", label: "Certificates" },
  { href: "/bloodhero/about", label: "About" },
] as const;

/** Full list for sitemaps, tests, or future use. */
export const bloodHeroNav = [
  ...bloodHeroFooterQuickLinks,
  ...bloodHeroFooterSecondaryLinks,
] as const;
