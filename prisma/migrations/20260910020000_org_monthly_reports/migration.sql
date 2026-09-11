-- Phase 1C: monthly reports, activities, activity assignments.

CREATE TABLE "org_monthly_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "submitted_at" TIMESTAMPTZ(6),
    "primary_reporter_id" UUID,
    "reopened_by" UUID,
    "reopened_at" TIMESTAMPTZ(6),
    "reopen_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_monthly_reports_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_monthly_reports_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "org_forums"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "org_monthly_reports_forum_id_year_month_key" ON "org_monthly_reports"("forum_id", "year", "month");
CREATE INDEX "org_monthly_reports_forum_id_idx" ON "org_monthly_reports"("forum_id");

CREATE TABLE "org_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "monthly_report_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_planned" BOOLEAN NOT NULL DEFAULT false,
    "planned_date" TIMESTAMPTZ(6),
    "actual_date" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'planned',
    "evidence_url" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_activities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_activities_monthly_report_id_fkey" FOREIGN KEY ("monthly_report_id") REFERENCES "org_monthly_reports"("id") ON DELETE CASCADE
);
CREATE INDEX "org_activities_monthly_report_id_idx" ON "org_activities"("monthly_report_id");

CREATE TABLE "org_activity_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "assignment_status" TEXT NOT NULL DEFAULT 'assigned',
    CONSTRAINT "org_activity_assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_activity_assignments_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "org_activities"("id") ON DELETE CASCADE,
    CONSTRAINT "org_activity_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "org_activity_assignments_activity_id_member_id_key" ON "org_activity_assignments"("activity_id", "member_id");
CREATE INDEX "org_activity_assignments_activity_id_idx" ON "org_activity_assignments"("activity_id");
CREATE INDEX "org_activity_assignments_member_id_idx" ON "org_activity_assignments"("member_id");
