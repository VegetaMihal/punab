/** Human-facing membership ID assigned at account provisioning (AUTH-001 flow: Membership ID assigned). */
export function generateMembershipNumber(profileId: string, approvedAt: Date = new Date()): string {
  const year = approvedAt.getFullYear();
  const suffix = profileId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `PUNAB-${year}-${suffix}`;
}
