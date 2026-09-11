import { z } from "zod";

export const ORG_SETTING_KEYS = [
  "org.timezone",
  "org.temp_password_expiry_hours",
  "org.promotion_cycle_months",
  "org.full_forum_min_age_months",
  "org.full_forum_min_moderator_plus",
  "org.max_secondary_reporters",
  "org.campus_representative_required_before_forum_member",
  "org.score.completed",
  "org.score.partial_obstacle",
  "org.score.absent_approved",
  "org.score.absent_unapproved",
  "org.activity_weight",
  "org.recommendation_weight",
  "org.low_recommendation_comment_threshold",
  "org.allow_no_activities_planned",
] as const;

export const createForumSchema = z.object({
  name: z.string().min(2, "Enter a Forum name"),
  slug: z
    .string()
    .min(2, "Enter a slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  forumType: z.enum(["standard", "external"]),
  hierarchySchemeId: z.string().uuid("Select a hierarchy scheme"),
});

export const changeForumStatusSchema = z.object({
  forumId: z.string().uuid(),
  newStatus: z.enum(["incomplete", "full"]),
  notes: z.string().optional(),
});

export const addForumMembershipSchema = z.object({
  forumId: z.string().uuid(),
  memberId: z.string().uuid("Select a member"),
  designationLevelId: z.string().uuid("Select a designation"),
});

export const assignReporterSchema = z.object({
  forumId: z.string().uuid(),
  memberId: z.string().uuid("Select a member"),
  reporterType: z.enum(["primary", "secondary"]),
});

export const createActivitySchema = z.object({
  reportId: z.string().uuid(),
  name: z.string().min(2, "Enter an activity name"),
  description: z.string().optional(),
  isPlanned: z.enum(["true", "false"]),
  plannedDate: z.string().optional(),
  actualDate: z.string().optional(),
  status: z.enum(["planned", "completed", "partially_completed", "not_completed", "rescheduled", "cancelled"]),
  memberIds: z.array(z.string().uuid()).default([]),
});

export const setActivityStatusSchema = z.object({
  activityId: z.string().uuid(),
  reportId: z.string().uuid(),
  status: z.enum(["planned", "completed", "partially_completed", "not_completed", "rescheduled", "cancelled"]),
  actualDate: z.string().optional(),
});

export const reopenReportSchema = z.object({
  reportId: z.string().uuid(),
  reason: z.string().min(3, "Reason is required to reopen a submitted report"),
});

export const setActivityResultSchema = z.object({
  assignmentId: z.string().uuid(),
  resultType: z.enum(["completed", "partial_obstacle", "absent_approved", "absent_unapproved", "cancelled"]),
  comment: z.string().optional(),
});

export const setRecommendationSchema = z.object({
  reportId: z.string().uuid(),
  memberId: z.string().uuid(),
  score: z.coerce.number().int().min(0).max(100),
  comment: z.string().optional(),
});

export const applyForPromotionSchema = z.object({
  forumId: z.string().uuid(),
});

export const decidePromotionSchema = z.object({
  applicationId: z.string().uuid(),
  notes: z.string().optional(),
});

export const addCampusRoleSchema = z.object({
  forumId: z.string().uuid(),
  campusId: z.string().uuid("Select a campus"),
  memberId: z.string().uuid("Select a member"),
  campusLevel: z.enum(["member", "associate", "representative"]),
});

export const addPlannedActivitySchema = z.object({
  reportId: z.string().uuid(),
  name: z.string().min(2, "Enter an activity name"),
  approximateDate: z.string().min(1, "Enter an approximate date"),
  description: z.string().optional(),
  memberIds: z.array(z.string().uuid()).default([]),
});

export type CreateForumInput = z.infer<typeof createForumSchema>;
export type ChangeForumStatusInput = z.infer<typeof changeForumStatusSchema>;
export type AddForumMembershipInput = z.infer<typeof addForumMembershipSchema>;
export type AssignReporterInput = z.infer<typeof assignReporterSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type SetActivityResultInput = z.infer<typeof setActivityResultSchema>;
export type SetRecommendationInput = z.infer<typeof setRecommendationSchema>;
