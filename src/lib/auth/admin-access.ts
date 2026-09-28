/**
 * THE source of truth for admin sections. Adding a row here is all it takes: the sidebar link,
 * the grantable checkbox under Admin access → Custom, the `AdminScope` type, the Zod enum, the
 * stored-scope allowlist and the route gate are all derived from this array.
 *
 * Order here = order shown in the sidebar. `scope: undefined` means full-admin only (not grantable).
 * Two rows may share a scope when one action backs both — "leadership" covers /admin/leadership
 * and /admin/leadership/honorary, which go through the same upsertLeadership action.
 *
 * New section checklist: add the row, then gate its Server Actions with assertAdminScope("<scope>").
 */
export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Overview", scope: undefined },
  { href: "/admin/site-content", label: "Site content", scope: "site_content" },
  { href: "/admin/pages", label: "Pages", scope: "pages" },
  { href: "/admin/gallery", label: "Archive", scope: "archive" },
  { href: "/admin/members", label: "Members", scope: "members" },
  { href: "/admin/notices", label: "Notices", scope: "notices" },
  { href: "/admin/events", label: "Events", scope: "events" },
  { href: "/admin/leadership", label: "Executive leadership", scope: "leadership" },
  { href: "/admin/leadership/layers", label: "Leadership layers", scope: "leadership_layers" },
  { href: "/admin/leadership/honorary", label: "Honorary Position", scope: "leadership" },
  { href: "/admin/chapters", label: "Chapters", scope: "chapters" },
  { href: "/admin/forums", label: "Forums", scope: "forums" },
  { href: "/admin/universities", label: "Universities", scope: "universities" },
  { href: "/admin/bloodhero", label: "BloodHero", scope: "bloodhero" },
  { href: "/admin/certificates", label: "Certificates", scope: "certificates" },
  { href: "/admin/invitations", label: "Invitations", scope: "invitations" },
  { href: "/admin/july-award/participation-cards", label: "July Award cards", scope: "july_award_cards" },
  { href: "/admin/july-award/participants", label: "July Award participants", scope: "july_award_participants" },
  { href: "/admin/july-award/trends", label: "July Award trends", scope: "july_award_trends" },
  { href: "/admin/monitoring-form", label: "Monitoring form", scope: "monitoring_form" },
  { href: "/admin/mun-form", label: "IMUN applications", scope: "mun_form" },
  { href: "/admin/babbf-registrations", label: "BABBF Championship registrations", scope: "babbf_registrations" },
  { href: "/admin/access", label: "Admin access", scope: undefined },
] as const;

/** Derived from ADMIN_NAV_ITEMS — a new sidebar row with a `scope` becomes a valid scope automatically. */
export type AdminNavScope = Extract<(typeof ADMIN_NAV_ITEMS)[number], { scope: string }>["scope"];

// Not a sidebar section: the Org Portal (/portal/admin) grant for Central Committee Officers.
export type AdminScope = AdminNavScope | "org_portal";

/** Every scope a sidebar section exposes — the checkbox list under Admin access → Custom. */
export const GRANTABLE_ADMIN_SCOPES: AdminNavScope[] = ADMIN_NAV_ITEMS.map((i) => i.scope).filter(
  (s): s is AdminNavScope => s !== undefined
);

/**
 * Grantable role presets — bundles of scopes with a name, so granting access at scale means
 * picking one preset instead of checking 20 boxes per admin. "Custom" (no preset) still allows
 * picking individual scopes for one-off cases.
 */
export const ADMIN_ROLES: { key: string; label: string; description: string; scopes: AdminScope[] }[] = [
  {
    key: "content_editor",
    label: "Content Editor",
    description: "Site content, pages, archive, notices, events",
    scopes: ["site_content", "pages", "archive", "notices", "events"],
  },
  {
    key: "org_structure_manager",
    label: "Org Structure Manager",
    description: "Leadership, leadership layers, chapters, forums, universities",
    scopes: ["leadership", "leadership_layers", "chapters", "forums", "universities"],
  },
  {
    key: "registrations_officer",
    label: "Registrations Officer",
    description: "Invitations, certificates, monitoring form, IMUN, BABBF registrations",
    scopes: ["invitations", "certificates", "monitoring_form", "mun_form", "babbf_registrations"],
  },
  {
    key: "july_award_manager",
    label: "July Award Manager",
    description: "July Award cards, participants, trends",
    scopes: ["july_award_cards", "july_award_participants", "july_award_trends"],
  },
  {
    key: "members_manager",
    label: "Members Manager",
    description: "Member approvals",
    scopes: ["members"],
  },
  {
    key: "bloodhero_manager",
    label: "BloodHero Manager",
    description: "BloodHero admin section",
    scopes: ["bloodhero"],
  },
];

/** Exact-set match (ignoring org_portal, granted separately) — null when scopes don't match any preset. */
export function matchAdminRole(scopes: AdminScope[]): (typeof ADMIN_ROLES)[number] | null {
  const set = new Set<AdminScope>(scopes.filter((s) => s !== "org_portal"));
  return (
    ADMIN_ROLES.find((role) => role.scopes.length === set.size && role.scopes.every((s) => set.has(s))) ?? null
  );
}

export type AdminAccess = {
  canAccessAdmin: boolean;
  isFullAdmin: boolean;
  canManageAccess: boolean;
  scopes: AdminScope[];
  hasScope: (scope: AdminScope) => boolean;
};

const ADMIN_SCOPES = new Set<AdminScope>([...GRANTABLE_ADMIN_SCOPES, "org_portal"]);

/**
 * The ONLY place raw `admin_scopes` strings become `AdminScope[]`. Never re-implement this filter:
 * a stale local copy silently drops newer scopes, and a scoped admin whose scopes all get dropped
 * reads back as `admin_scopes: []`, which means full admin.
 */
export function parseAdminScopes(raw: readonly string[] | null | undefined): AdminScope[] {
  if (!raw?.length) return [];
  return raw.filter((s): s is AdminScope => ADMIN_SCOPES.has(s as AdminScope));
}

export function resolveAdminAccess(profile: {
  role: string;
  admin_scopes?: readonly string[] | AdminScope[] | null;
}): AdminAccess {
  if (profile.role?.toLowerCase() !== "admin") {
    return {
      canAccessAdmin: false,
      isFullAdmin: false,
      canManageAccess: false,
      scopes: [],
      hasScope: () => false,
    };
  }
  const scopes = parseAdminScopes(profile.admin_scopes);
  const isFullAdmin = scopes.length === 0;
  return {
    canAccessAdmin: true,
    isFullAdmin,
    canManageAccess: isFullAdmin,
    scopes,
    hasScope: (scope) => isFullAdmin || scopes.includes(scope),
  };
}

export function defaultAdminHome(access: AdminAccess): string {
  const first = ADMIN_NAV_ITEMS.find((i) => i.scope && access.hasScope(i.scope));
  return first ? first.href : "/dashboard";
}

export function canAccessAdminPath(access: AdminAccess, pathname: string): boolean {
  if (!access.canAccessAdmin) return false;
  if (access.isFullAdmin) return true;
  if (pathname === "/admin" || pathname === "/admin/") return true;
  // longest-href-first so subpaths (e.g. /admin/leadership/honorary) match before their parent.
  const item = [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => pathname.startsWith(i.href));
  if (!item?.scope) return false;
  return access.hasScope(item.scope);
}

export function navLinksForAdminAccess(access: AdminAccess): { href: string; label: string }[] {
  if (access.isFullAdmin) {
    return ADMIN_NAV_ITEMS.filter((i) => i.href !== "/admin").map(({ href, label }) => ({ href, label }));
  }
  return ADMIN_NAV_ITEMS.filter((i) => i.scope && access.hasScope(i.scope)).map(({ href, label }) => ({
    href,
    label,
  }));
}
