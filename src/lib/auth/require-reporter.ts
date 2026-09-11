import { prisma } from "@/lib/db/prisma";
import { assertAdmin } from "@/lib/auth/require-admin";
import type { AdminAuthContext } from "@/lib/auth/require-admin";

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
