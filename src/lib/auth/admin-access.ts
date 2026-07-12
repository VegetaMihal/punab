import type { AdminScope, Profile } from "@/types/database";

export type AdminAccess = {
  canAccessAdmin: boolean;
  isFullAdmin: boolean;
  canManageAccess: boolean;
  canInvitations: boolean;
  canCertificates: boolean;
  canJulyAwardCards: boolean;
  canJulyAwardParticipants: boolean;
  scopes: AdminScope[];
};

const ADMIN_SCOPES = new Set<AdminScope>(["invitations", "certificates", "july_award_cards", "july_award_participants"]);

function parseScopes(raw: readonly string[] | null | undefined): AdminScope[] {
  if (!raw?.length) return [];
  return raw.filter((s): s is AdminScope => ADMIN_SCOPES.has(s as AdminScope));
}

export function resolveAdminAccess(profile: {
  role: Profile["role"] | string;
  admin_scopes?: readonly string[] | AdminScope[] | null;
}): AdminAccess {
  if (profile.role?.toLowerCase() !== "admin") {
    return {
      canAccessAdmin: false,
      isFullAdmin: false,
      canManageAccess: false,
      canInvitations: false,
      canCertificates: false,
      canJulyAwardCards: false,
      canJulyAwardParticipants: false,
      scopes: [],
    };
  }
  const scopes = parseScopes(profile.admin_scopes);
  const isFullAdmin = scopes.length === 0;
  return {
    canAccessAdmin: true,
    isFullAdmin,
    canManageAccess: isFullAdmin,
    canInvitations: isFullAdmin || scopes.includes("invitations"),
    canCertificates: isFullAdmin || scopes.includes("certificates"),
    canJulyAwardCards: isFullAdmin || scopes.includes("july_award_cards"),
    canJulyAwardParticipants: isFullAdmin || scopes.includes("july_award_participants"),
    scopes,
  };
}

export function defaultAdminHome(access: AdminAccess): string {
  if (access.canInvitations) return "/admin/invitations";
  if (access.canJulyAwardCards) return "/admin/july-award/participation-cards";
  if (access.canCertificates) return "/admin/certificates";
  return "/dashboard";
}

export function canAccessAdminPath(access: AdminAccess, pathname: string): boolean {
  if (!access.canAccessAdmin) return false;
  if (access.isFullAdmin) return true;
  if (pathname === "/admin" || pathname === "/admin/") return true;
  if (pathname.startsWith("/admin/invitations") || pathname.startsWith("/api/admin/invitations")) {
    return access.canInvitations;
  }
  if (pathname.startsWith("/admin/july-award")) {
    return access.canJulyAwardCards;
  }
  if (pathname.startsWith("/admin/certificates") || pathname.startsWith("/api/admin/certificates")) {
    return access.canCertificates;
  }
  return false;
}

export function navLinksForAdminAccess(access: AdminAccess): { href: string; label: string }[] {
  const all = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/site-content", label: "Site content" },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/gallery", label: "Archive" },
    { href: "/admin/members", label: "Members" },
    { href: "/admin/notices", label: "Notices" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/leadership", label: "Executive leadership" },
    { href: "/admin/leadership/layers", label: "Leadership layers" },
    { href: "/admin/leadership/honorary", label: "Honorary Position" },
    { href: "/admin/chapters", label: "Chapters" },
    { href: "/admin/forums", label: "Forums" },
    { href: "/admin/universities", label: "Universities" },
    { href: "/admin/bloodhero", label: "BloodHero" },
    { href: "/admin/certificates", label: "Certificates" },
    { href: "/admin/invitations", label: "Invitations" },
    { href: "/admin/july-award/participation-cards", label: "July Award cards" },
    { href: "/admin/july-award/participants", label: "July Award participants" },
    { href: "/admin/july-award/trends", label: "July Award trends" },
    { href: "/admin/access", label: "Admin access" },
  ];
  if (access.isFullAdmin) return all;
  const links: { href: string; label: string }[] = [];
  if (access.canInvitations) {
    links.push({ href: "/admin/invitations", label: "Invitations" });
  }
  if (access.canJulyAwardCards) {
    links.push({ href: "/admin/july-award/participation-cards", label: "July Award cards" });
    links.push({ href: "/admin/july-award/participants", label: "July Award participants" });
    links.push({ href: "/admin/july-award/trends", label: "July Award trends" });
  }
  if (access.canCertificates) links.push({ href: "/admin/certificates", label: "Certificates" });
  return links;
}
