import { prisma } from "@/lib/db/prisma";
import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";
import { writeAuditLog } from "@/lib/repositories/org-audit-repository";
import { assignReporter } from "@/lib/repositories/org-reporters-repository";

/** §7.1 Standard Forum Levels — seeded once, reused by every "standard" forum. */
const STANDARD_SCHEME_NAME = "Standard Forum Pipeline";
const STANDARD_LEVELS = [
  { level_code: "forum_member", label: "Forum Member", numeric_rank: 1, multiplicity: "multiple" },
  { level_code: "executive_member", label: "Executive Member", numeric_rank: 2, multiplicity: "multiple" },
  { level_code: "moderator", label: "Moderator", numeric_rank: 3, multiplicity: "multiple" },
  { level_code: "deputy_secretary", label: "Deputy Secretary", numeric_rank: 4, multiplicity: "multiple" },
  { level_code: "forum_secretary", label: "Forum Secretary", numeric_rank: 5, multiplicity: "single" },
  { level_code: "forum_convenor", label: "Forum Convenor", numeric_rank: 6, multiplicity: "single" },
] as const;

/** Idempotent: returns the existing standard scheme if already seeded. */
export async function ensureStandardHierarchyScheme(): Promise<string> {
  const existing = await prisma.orgHierarchyScheme.findUnique({ where: { name: STANDARD_SCHEME_NAME } });
  if (existing) return existing.id;

  const scheme = await prisma.orgHierarchyScheme.create({
    data: {
      name: STANDARD_SCHEME_NAME,
      description: "Campus Member -> ... -> Forum Convenor pipeline used by all standard Forums.",
      levels: { create: STANDARD_LEVELS.map((l) => ({ ...l })) },
    },
  });
  return scheme.id;
}

export async function listHierarchySchemes() {
  return prisma.orgHierarchyScheme.findMany({
    include: { levels: { orderBy: { numeric_rank: "asc" } }, _count: { select: { forums: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createHierarchyScheme(input: {
  name: string;
  description: string | null;
  levels: { level_code: string; label: string; numeric_rank: number; multiplicity: "single" | "multiple" }[];
}) {
  return prisma.orgHierarchyScheme.create({
    data: {
      name: input.name,
      description: input.description,
      levels: { create: input.levels },
    },
  });
}

export async function listForums() {
  return prisma.orgForum.findMany({
    include: {
      scheme: true,
      _count: { select: { memberships: true, campus_roles: true } },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function getForumBySlug(slug: string) {
  return prisma.orgForum.findUnique({
    where: { slug },
    include: {
      scheme: { include: { levels: { orderBy: { numeric_rank: "asc" } } } },
      memberships: {
        where: { is_active: true },
        include: { member: { select: { id: true, full_name: true, email: true } }, designation: true },
        orderBy: { designation: { numeric_rank: "desc" } },
      },
      reporter_assignments: {
        where: { is_active: true },
        include: { member: { select: { id: true, full_name: true, email: true } } },
      },
      status_history: { orderBy: { effective_at: "desc" } },
    },
  });
}

export async function createForum(input: {
  name: string;
  slug: string;
  forum_type: string;
  hierarchy_scheme_id: string;
}) {
  const forum = await prisma.orgForum.create({ data: input });
  // FORUM-005: even the initial state gets a history row so the audit trail has no gaps.
  await prisma.orgForumStatusHistory.create({
    data: {
      forum_id: forum.id,
      old_status: "none",
      new_status: "incomplete",
      notes: "Forum created.",
    },
  });
  return forum;
}

export type FullForumEligibility = {
  eligible: boolean;
  checks: {
    minAge: { pass: boolean; label: string };
    leadership: { pass: boolean; label: string };
    activeLeadershipTeam: { pass: boolean; label: string; count: number; required: number };
    monthlyReports: { pass: boolean; label: string };
  };
};

/** FORUM-002/5.2: eligibility check only — never mutates status. Monthly-report compliance is
 * stubbed pass=true with a note until Phase 1C (monthly reporting) exists to evaluate it. */
export async function computeFullForumEligibility(forumId: string): Promise<FullForumEligibility> {
  const forum = await prisma.orgForum.findUniqueOrThrow({
    where: { id: forumId },
    include: { memberships: { where: { is_active: true }, include: { designation: true } } },
  });

  const settings = await getSiteSettingsMap();
  const minAgeMonths = Number.parseInt(settings["org.full_forum_min_age_months"], 10) || 4;
  const minModeratorPlus = Number.parseInt(settings["org.full_forum_min_moderator_plus"], 10) || 5;

  const ageMonths =
    (Date.now() - forum.effective_start_at.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
  const minAge = {
    pass: ageMonths >= minAgeMonths,
    label: `Forum age: ${ageMonths.toFixed(1)} / ${minAgeMonths} months`,
  };

  const secretaryFilled = forum.memberships.some((m) => m.designation.level_code === "forum_secretary");
  const convenorFilled = forum.memberships.some((m) => m.designation.level_code === "forum_convenor");
  const leadership = {
    pass: secretaryFilled || convenorFilled,
    label:
      secretaryFilled || convenorFilled
        ? "Forum Secretary or Convenor filled"
        : "Forum Secretary and Convenor both vacant",
  };

  const moderatorPlusCount = forum.memberships.filter((m) => m.designation.numeric_rank >= 3).length;
  const activeLeadershipTeam = {
    pass: moderatorPlusCount >= minModeratorPlus,
    label: `${moderatorPlusCount} / ${minModeratorPlus} active Moderator+ members`,
    count: moderatorPlusCount,
    required: minModeratorPlus,
  };

  const monthlyReports = {
    pass: true,
    label: "Not yet evaluable — monthly reporting module not built (Phase 1C)",
  };

  return {
    eligible: minAge.pass && leadership.pass && activeLeadershipTeam.pass && monthlyReports.pass,
    checks: { minAge, leadership, activeLeadershipTeam, monthlyReports },
  };
}

/** FORUM-002/BR-004: status change always requires an explicit human approver, even if eligible. */
export async function changeForumStatus(input: {
  forumId: string;
  newStatus: "incomplete" | "full";
  approvedBy: string;
  notes: string | null;
  qualificationSnapshot: unknown;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const forum = await tx.orgForum.findUniqueOrThrow({ where: { id: input.forumId } });
    await tx.orgForum.update({
      where: { id: input.forumId },
      data: {
        status: input.newStatus,
        full_recognition_at: input.newStatus === "full" ? new Date() : forum.full_recognition_at,
      },
    });
    await tx.orgForumStatusHistory.create({
      data: {
        forum_id: input.forumId,
        old_status: forum.status,
        new_status: input.newStatus,
        approved_by: input.approvedBy,
        notes: input.notes,
        qualification_snapshot: input.qualificationSnapshot as object | undefined,
      },
    });
  });

  await writeAuditLog({
    actorId: input.approvedBy,
    action: "forum_status_change",
    entityType: "org_forum",
    entityId: input.forumId,
    newValue: { status: input.newStatus, notes: input.notes },
  });

  // REP-003/BR-006: once a Forum is Full, its active Convenor becomes the fixed Primary Reporter.
  if (input.newStatus === "full") {
    const convenorMembership = await prisma.orgForumMembership.findFirst({
      where: { forum_id: input.forumId, is_active: true, designation: { level_code: "forum_convenor" } },
    });
    if (convenorMembership) {
      await assignReporter({
        forumId: input.forumId,
        memberId: convenorMembership.member_id,
        reporterType: "primary",
        authorizedBy: input.approvedBy,
      });
    }
  }
}
