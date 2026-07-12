/** Reserved `leadership_layers.slug` for the public honorary position page. */
export const HONORARY_LEADERSHIP_LAYER_SLUG = "honorary";

/** Public page heading; legacy DB title “Honorary leadership” maps here. */
export const HONORARY_POSITION_PAGE_TITLE = "Honorary Position";

export function isHonoraryLeadershipSlug(slug: string): boolean {
  return slug === HONORARY_LEADERSHIP_LAYER_SLUG;
}

/** Title shown on /leadership/honorary; normalizes old “Honorary leadership” rows. */
export function honoraryPublicPageTitle(stored: string | undefined | null): string {
  const s = stored?.trim() ?? "";
  if (!s || /^honorary leadership$/i.test(s) || /^honorary position$/i.test(s)) return HONORARY_POSITION_PAGE_TITLE;
  return s;
}
