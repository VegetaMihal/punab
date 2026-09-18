"use server";

import { assertAdminScope, assertFullAdmin } from "@/lib/auth/require-admin";
import {
  assertCanManageMembers,
  assertCanManageReporters,
  assertCanSubmitReport,
  assertReporterAccess,
  resolveForumIdForAssignment,
  resolveForumIdForReport,
  resolveForumIdForReporterAssignment,
} from "@/lib/auth/require-reporter";
import {
  changeForumStatus,
  computeFullForumEligibility,
  createForum,
  ensureStandardHierarchyScheme,
} from "@/lib/repositories/org-forums-repository";
import { addForumMembership, searchApprovedMembersNotInForum } from "@/lib/repositories/org-memberships-repository";
import { addCampusRole, removeCampusRole } from "@/lib/repositories/org-campus-repository";
import { assignReporter, revokeReporterAssignment } from "@/lib/repositories/org-reporters-repository";
import {
  assignMembersToActivity,
  cancelActivityAssignment,
  createActivity,
  reopenReport,
  setActivityStatus,
  submitReport,
} from "@/lib/repositories/org-reports-repository";
import { approveRecommendation, setActivityMemberResult, setRecommendation } from "@/lib/repositories/org-scoring-repository";
import { addPlannedActivity, getOrCreatePlan } from "@/lib/repositories/org-plans-repository";
import { prisma } from "@/lib/db/prisma";
import { getNextYearMonth } from "@/lib/org/org-clock";
import { upsertSiteSettings } from "@/lib/repositories/site-settings-repository";
import {
  addCampusRoleSchema,
  addForumMembershipSchema,
  addPlannedActivitySchema,
  assignReporterSchema,
  changeForumStatusSchema,
  createActivitySchema,
  createForumSchema,
  ORG_SETTING_KEYS,
  reopenReportSchema,
  setActivityResultSchema,
  setActivityStatusSchema,
  setRecommendationSchema,
} from "@/lib/validations/org";
import { revalidatePath } from "next/cache";

export type OrgActionState = { error?: string; success?: boolean };

/** One-time convenience: seeds §7.1's Standard Forum Levels scheme if it doesn't exist yet. */
export async function seedStandardHierarchyScheme() {
  try {
    await assertFullAdmin();
    await ensureStandardHierarchyScheme();
    revalidatePath("/portal/admin/forums");
    revalidatePath("/portal/admin/forums/new");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function createForumAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = createForumSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    forumType: formData.get("forumType"),
    hierarchySchemeId: formData.get("hierarchySchemeId"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      error: f.name?.[0] ?? f.slug?.[0] ?? f.forumType?.[0] ?? f.hierarchySchemeId?.[0] ?? parsed.error.message,
    };
  }

  try {
    await createForum({
      name: parsed.data.name,
      slug: parsed.data.slug,
      forum_type: parsed.data.forumType,
      hierarchy_scheme_id: parsed.data.hierarchySchemeId,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create Forum" };
  }

  revalidatePath("/portal/admin/forums");
  return { success: true };
}

/**
 * FORUM-002/FORUM-003/BR-004: status change always requires explicit human approval and is
 * blocked toward "full" unless every qualification check currently passes.
 */
export async function setForumStatusAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  let approvedBy: string;
  try {
    const ctx = await assertFullAdmin();
    approvedBy = ctx.user.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = changeForumStatusSchema.safeParse({
    forumId: formData.get("forumId"),
    newStatus: formData.get("newStatus"),
    notes: formData.get("notes")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  let qualificationSnapshot: unknown = null;
  if (parsed.data.newStatus === "full") {
    const eligibility = await computeFullForumEligibility(parsed.data.forumId);
    qualificationSnapshot = eligibility.checks;
    if (!eligibility.eligible) {
      return { error: "Forum does not currently meet all Full Forum qualification checks." };
    }
  }

  await changeForumStatus({
    forumId: parsed.data.forumId,
    newStatus: parsed.data.newStatus,
    approvedBy,
    notes: parsed.data.notes ?? null,
    qualificationSnapshot,
  });

  revalidatePath("/portal/admin/forums", "layout");
  return { success: true };
}

/** Type-to-search for the member combobox — scoped to a Forum so thousands of members never hit the browser at once. */
export async function searchForumMemberCandidatesAction(forumId: string, query: string) {
  try {
    await assertCanManageMembers(forumId);
  } catch {
    return [];
  }
  if (query.trim().length < 2) return [];
  return searchApprovedMembersNotInForum(forumId, query.trim());
}

export async function addForumMembershipAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = addForumMembershipSchema.safeParse({
    forumId: formData.get("forumId"),
    memberId: formData.get("memberId"),
    designationLevelId: formData.get("designationLevelId"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { error: f.memberId?.[0] ?? f.designationLevelId?.[0] ?? parsed.error.message };
  }

  let userId: string;
  try {
    const ctx = await assertCanManageMembers(parsed.data.forumId);
    userId = ctx.userId;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const result = await addForumMembership({
    forumId: parsed.data.forumId,
    memberId: parsed.data.memberId,
    designationLevelId: parsed.data.designationLevelId,
    addedBy: userId,
  });
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/portal/admin/forums", "layout");
  revalidatePath("/portal/reporter/members", "layout");
  return { success: true };
}

export async function assignReporterAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = assignReporterSchema.safeParse({
    forumId: formData.get("forumId"),
    memberId: formData.get("memberId"),
    reporterType: formData.get("reporterType"),
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  let authorizedBy: string;
  try {
    const ctx = await assertCanManageReporters(parsed.data.forumId, parsed.data.reporterType);
    authorizedBy = ctx.userId;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const result = await assignReporter({ ...parsed.data, authorizedBy });
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/portal/admin/forums", "layout");
  revalidatePath("/portal/reporter", "layout");
  return { success: true };
}

export async function revokeReporterAction(assignmentId: string) {
  try {
    const { forumId, reporterType } = await resolveForumIdForReporterAssignment(assignmentId);
    const ctx = await assertCanManageReporters(forumId, reporterType);
    await revokeReporterAssignment(assignmentId, ctx.userId);
    revalidatePath("/portal/admin/forums", "layout");
    revalidatePath("/portal/reporter", "layout");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

/** REPORT-006/007: creates the activity and, in the same step, its member assignments (one row per member). */
export async function createActivityAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = createActivitySchema.safeParse({
    reportId: formData.get("reportId"),
    name: formData.get("name"),
    description: formData.get("description")?.toString() || undefined,
    isPlanned: formData.get("isPlanned"),
    plannedDate: formData.get("plannedDate")?.toString() || undefined,
    actualDate: formData.get("actualDate")?.toString() || undefined,
    status: formData.get("status"),
    memberIds: formData.getAll("memberIds").map(String),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { error: f.name?.[0] ?? f.status?.[0] ?? parsed.error.message };
  }

  let userId: string;
  try {
    const forumId = await resolveForumIdForReport(parsed.data.reportId);
    const ctx = await assertReporterAccess(forumId);
    userId = ctx.userId;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const activity = await createActivity({
      reportId: parsed.data.reportId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      isPlanned: parsed.data.isPlanned === "true",
      plannedDate: parsed.data.plannedDate ? new Date(parsed.data.plannedDate) : null,
      actualDate: parsed.data.actualDate ? new Date(parsed.data.actualDate) : null,
      status: parsed.data.status,
      createdBy: userId,
    });

    if (parsed.data.memberIds.length > 0) {
      await assignMembersToActivity({
        activityId: activity.id,
        reportId: parsed.data.reportId,
        memberIds: parsed.data.memberIds,
        assignedBy: userId,
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create activity" };
  }

  revalidatePath("/portal/admin/forums", "layout");
  return { success: true };
}

export async function setActivityStatusAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = setActivityStatusSchema.safeParse({
    activityId: formData.get("activityId"),
    reportId: formData.get("reportId"),
    status: formData.get("status"),
    actualDate: formData.get("actualDate")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  let userId: string;
  try {
    const forumId = await resolveForumIdForReport(parsed.data.reportId);
    const ctx = await assertReporterAccess(forumId);
    userId = ctx.userId;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    await setActivityStatus({
      activityId: parsed.data.activityId,
      reportId: parsed.data.reportId,
      status: parsed.data.status,
      actualDate: parsed.data.actualDate ? new Date(parsed.data.actualDate) : null,
      updatedBy: userId,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update activity" };
  }

  revalidatePath("/portal/admin/forums", "layout");
  return { success: true };
}

export async function cancelActivityAssignmentAction(assignmentId: string, reportId: string) {
  try {
    const forumId = await resolveForumIdForReport(reportId);
    await assertReporterAccess(forumId);
    await cancelActivityAssignment(assignmentId, reportId);
    revalidatePath("/portal/admin/forums", "layout");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

/** REP-005: only the Primary Reporter (or full admin) can final-submit by default. */
export async function submitReportAction(reportId: string) {
  try {
    const forumId = await resolveForumIdForReport(reportId);
    const ctx = await assertCanSubmitReport(forumId);
    await submitReport(reportId, ctx.userId);
    revalidatePath("/portal/admin/forums", "layout");
    revalidatePath("/portal/reporter", "layout");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not submit report" };
  }
}

export async function reopenReportAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  let reopenedBy: string;
  try {
    const ctx = await assertAdminScope("org_portal");
    reopenedBy = ctx.user.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = reopenReportSchema.safeParse({
    reportId: formData.get("reportId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.reason?.[0] ?? parsed.error.message };
  }

  try {
    await reopenReport({ reportId: parsed.data.reportId, reopenedBy, reason: parsed.data.reason });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not reopen report" };
  }

  revalidatePath("/portal/admin/forums", "layout");
  return { success: true };
}

/** ACT-001/BR-010: sets the individual result for one assigned member and recalculates their monthly score. */
export async function setActivityResultAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = setActivityResultSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    resultType: formData.get("resultType"),
    comment: formData.get("comment")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  let userId: string;
  try {
    const forumId = await resolveForumIdForAssignment(parsed.data.assignmentId);
    const ctx = await assertReporterAccess(forumId);
    userId = ctx.userId;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const result = await setActivityMemberResult({
    assignmentId: parsed.data.assignmentId,
    resultType: parsed.data.resultType,
    comment: parsed.data.comment ?? null,
    evaluatedBy: userId,
  });
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/portal/admin/forums", "layout");
  return { success: true };
}

/** PERF-001/PERF-002: sets a member's monthly Reporter Recommendation score and recalculates their monthly score. */
export async function setRecommendationAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = setRecommendationSchema.safeParse({
    reportId: formData.get("reportId"),
    memberId: formData.get("memberId"),
    score: formData.get("score"),
    comment: formData.get("comment")?.toString() || undefined,
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { error: f.score?.[0] ?? parsed.error.message };
  }

  let userId: string;
  try {
    const forumId = await resolveForumIdForReport(parsed.data.reportId);
    const ctx = await assertReporterAccess(forumId);
    userId = ctx.userId;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const result = await setRecommendation({
    reportId: parsed.data.reportId,
    memberId: parsed.data.memberId,
    score: parsed.data.score,
    comment: parsed.data.comment ?? null,
    reporterId: userId,
  });
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/portal/admin/forums", "layout");
  return { success: true };
}

/** CAMPUS-001/002: adds a campus committee role (Member/Associate/Representative) to a Full Forum. */
export async function addCampusRoleAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  let userId: string;
  try {
    const ctx = await assertFullAdmin();
    userId = ctx.user.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = addCampusRoleSchema.safeParse({
    forumId: formData.get("forumId"),
    campusId: formData.get("campusId"),
    memberId: formData.get("memberId"),
    campusLevel: formData.get("campusLevel"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { error: f.campusId?.[0] ?? f.memberId?.[0] ?? f.campusLevel?.[0] ?? parsed.error.message };
  }

  const result = await addCampusRole({ ...parsed.data, addedBy: userId });
  if (!result.ok) {
    return { error: result.reason };
  }

  revalidatePath("/portal/admin/forums", "layout");
  return { success: true };
}

export async function removeCampusRoleAction(id: string) {
  try {
    const ctx = await assertFullAdmin();
    await removeCampusRole(id, ctx.user.id);
    revalidatePath("/portal/admin/forums", "layout");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

/** PERF-003: a higher officer clears a self-scored recommendation before it counts toward the final score. */
export async function approveRecommendationAction(reportId: string, memberId: string) {
  try {
    const ctx = await assertFullAdmin();
    await approveRecommendation({ reportId, memberId, approvedBy: ctx.user.id });
    revalidatePath("/portal/admin/forums", "layout");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

/** §24: configurable settings — timezone, promotion cycle, scoring weights/thresholds, etc. */
export async function updateOrgSettingsAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  try {
    await assertFullAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const entries: Record<string, string> = {};
  for (const key of ORG_SETTING_KEYS) {
    const value = formData.get(key);
    if (value !== null) entries[key] = value.toString();
  }

  await upsertSiteSettings(entries);
  revalidatePath("/portal/admin/settings");
  return { success: true };
}

/** PLAN-001/PLAN-002: adds one item to the current report's next-month plan (auto-carried forward next month). */
export async function addPlannedActivityAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const parsed = addPlannedActivitySchema.safeParse({
    reportId: formData.get("reportId"),
    name: formData.get("name"),
    approximateDate: formData.get("approximateDate"),
    description: formData.get("description")?.toString() || undefined,
    memberIds: formData.getAll("memberIds").map(String),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { error: f.name?.[0] ?? f.approximateDate?.[0] ?? parsed.error.message };
  }

  try {
    const forumId = await resolveForumIdForReport(parsed.data.reportId);
    await assertReporterAccess(forumId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const report = await prisma.orgMonthlyReport.findUniqueOrThrow({ where: { id: parsed.data.reportId } });
    const target = getNextYearMonth(report.year, report.month);
    const plan = await getOrCreatePlan(parsed.data.reportId, target.year, target.month);
    await addPlannedActivity({
      planId: plan.id,
      name: parsed.data.name,
      approximateDate: new Date(parsed.data.approximateDate),
      description: parsed.data.description ?? null,
      memberIds: parsed.data.memberIds,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not add planned activity" };
  }

  revalidatePath("/portal/admin/forums", "layout");
  return { success: true };
}
