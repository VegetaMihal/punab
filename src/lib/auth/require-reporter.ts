import { prisma } from "@/lib/db/prisma";
import { assertAdmin } from "@/lib/auth/require-admin";
import type { AdminAuthContext } from "@/lib/auth/require-admin";

/**
 * SRD role mapping for Forum-level access (see require-admin.ts for org-portal admin roles):
 *  - Forum Convenor   → member with `forum_convenor` designation on a Full Forum; auto-assigned
 *                       fixed Primary OrgReporterAssignment (see org-forums-repository.ts changeForumStatus)
 *  - Secondary Reporter → member with an active OrgReporterAssignment (reporter_type "secondary"),
 *                       authorized by the Primary Reporter; cannot final-submit unless
 *                       org.secondary_can_submit is enabled (see assertCanSubmitReport)
 *  - Forum/Campus Member → no OrgReporterAssignment; read-only access to own data only
 */
export type ReporterAuthContext = { userId: string; isAdmin: boolean };

/**
 * RBAC-002: a Reporter may manage only the Forum(s) they hold an active reporter assignment for.
 * Full admin bypasses the scope check; anyone else must have an active primary/secondary assignment.
 */
export async function assertReporterAccess(forumId: string): Promise<ReporterAuthContext> {
  let adminCtx: AdminAuthContext | null = null;
  try {
    adminCtx = await assertAdmin();
    if (adminCtx.access.isFullAdmin) {
      return { userId: adminCtx.user.id, isAdmin: true };
    }
  } catch {
    /* not an admin at all — fall through to reporter-scope check */
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = adminCtx ? adminCtx.supabase : await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const assignment = await prisma.orgReporterAssignment.findFirst({
    where: { forum_id: forumId, member_id: user.id, is_active: true },
  });
  if (!assignment) {
    throw new Error("Forbidden: not an active reporter for this Forum");
  }
  return { userId: user.id, isAdmin: false };
}

/**
 * RBAC-003: gate for viewing a Forum's report (members' scores/recommendations/comments).
 * Allows: full admin, an org_portal-scoped admin, or an active reporter (primary/secondary) for
 * this Forum. Call this from any component/page that renders member-level report data — do not
 * rely on the caller route alone to have checked access.
 */
export async function assertReportViewAccess(forumId: string): Promise<ReporterAuthContext> {
  try {
    return await assertReporterAccess(forumId);
  } catch {
    const { assertAdminScope } = await import("@/lib/auth/require-admin");
    const ctx = await assertAdminScope("org_portal");
    return { userId: ctx.user.id, isAdmin: true };
  }
}

/**
 * Who may assign/revoke a Forum's Reporters:
 *  - full admin, or org_portal-scoped admin (Central Forum Mgmt Secretary / Authorized Central
 *    Committee Officer) — any reporterType.
 *  - the Forum's own active Primary Reporter (Convenor on a Full Forum, or an org_portal admin
 *    acting as Primary on an Incomplete Forum) — "secondary" only; the max_secondary_reporters
 *    cap in assignReporter still enforces the count.
 */
export async function assertCanManageReporters(
  forumId: string,
  reporterType: "primary" | "secondary"
): Promise<ReporterAuthContext> {
  try {
    const { assertAdminScope } = await import("@/lib/auth/require-admin");
    const ctx = await assertAdminScope("org_portal");
    return { userId: ctx.user.id, isAdmin: true };
  } catch {
    /* not a full/org_portal admin — fall through to Primary Reporter self-service */
  }

  if (reporterType !== "secondary") {
    throw new Error("Forbidden: only Central Forum Management can assign a Primary Reporter");
  }
  const ctx = await assertReporterAccess(forumId);
  const primary = await prisma.orgReporterAssignment.findFirst({
    where: { forum_id: forumId, reporter_type: "primary", is_active: true },
  });
  if (primary?.member_id !== ctx.userId) {
    throw new Error("Forbidden: only the Primary Reporter may authorize a Secondary Reporter");
  }
  return ctx;
}

/**
 * Who may add/appoint members to a Forum: full/org_portal admin, or that Forum's own active
 * Primary Reporter (Convenor on a Full Forum, Secretary on an Incomplete one).
 */
export async function assertCanManageMembers(forumId: string): Promise<ReporterAuthContext> {
  try {
    const { assertAdminScope } = await import("@/lib/auth/require-admin");
    const ctx = await assertAdminScope("org_portal");
    return { userId: ctx.user.id, isAdmin: true };
  } catch {
    /* not a full/org_portal admin — fall through to Primary Reporter self-service */
  }

  const ctx = await assertReporterAccess(forumId);
  const primary = await prisma.orgReporterAssignment.findFirst({
    where: { forum_id: forumId, reporter_type: "primary", is_active: true },
  });
  if (primary?.member_id !== ctx.userId) {
    throw new Error("Forbidden: only the Forum's Primary Reporter may add members");
  }
  return ctx;
}

export async function resolveForumIdForReporterAssignment(
  assignmentId: string
): Promise<{ forumId: string; reporterType: "primary" | "secondary" }> {
  const assignment = await prisma.orgReporterAssignment.findUniqueOrThrow({
    where: { id: assignmentId },
    select: { forum_id: true, reporter_type: true },
  });
  return { forumId: assignment.forum_id, reporterType: assignment.reporter_type as "primary" | "secondary" };
}

/** REP-005: only the Primary Reporter (or full admin) may final-submit, unless explicitly configured otherwise. */
export async function assertCanSubmitReport(forumId: string): Promise<ReporterAuthContext> {
  const ctx = await assertReporterAccess(forumId);
  if (ctx.isAdmin) return ctx;

  const settings = await prisma.siteSetting.findUnique({ where: { key: "org.secondary_can_submit" } });
  if (settings?.value === "true") return ctx;

  const primary = await prisma.orgReporterAssignment.findFirst({
    where: { forum_id: forumId, reporter_type: "primary", is_active: true },
  });
  if (primary?.member_id !== ctx.userId) {
    throw new Error("Forbidden: only the Primary Reporter can submit this report");
  }
  return ctx;
}

export async function resolveForumIdForReport(reportId: string): Promise<string> {
  const report = await prisma.orgMonthlyReport.findUniqueOrThrow({ where: { id: reportId }, select: { forum_id: true } });
  return report.forum_id;
}

export async function resolveForumIdForAssignment(assignmentId: string): Promise<string> {
  const assignment = await prisma.orgActivityAssignment.findUniqueOrThrow({
    where: { id: assignmentId },
    select: { activity: { select: { report: { select: { forum_id: true } } } } },
  });
  return assignment.activity.report.forum_id;
}
