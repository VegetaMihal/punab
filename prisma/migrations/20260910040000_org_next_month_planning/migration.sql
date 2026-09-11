-- Phase 1E: next-month planning, carry-forward traceability, submission validation support.

ALTER TABLE "org_activities" ADD COLUMN "source_planned_activity_id" UUID;

CREATE TABLE "org_monthly_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source_report_id" UUID NOT NULL,
    "target_year" INTEGER NOT NULL,
    "target_month" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_monthly_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_monthly_plans_source_report_id_fkey" FOREIGN KEY ("source_report_id") REFERENCES "org_monthly_reports"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "org_monthly_plans_source_report_id_key" ON "org_monthly_plans"("source_report_id");

CREATE TABLE "org_planned_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "approximate_date" TIMESTAMPTZ(6) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_planned_activities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_planned_activities_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "org_monthly_plans"("id") ON DELETE CASCADE
);
CREATE INDEX "org_planned_activities_plan_id_idx" ON "org_planned_activities"("plan_id");

CREATE TABLE "org_planned_activity_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "planned_activity_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    CONSTRAINT "org_planned_activity_assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_planned_activity_assignments_planned_activity_id_fkey" FOREIGN KEY ("planned_activity_id") REFERENCES "org_planned_activities"("id") ON DELETE CASCADE,
    CONSTRAINT "org_planned_activity_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "org_planned_activity_assignments_planned_activity_id_membe_key" ON "org_planned_activity_assignments"("planned_activity_id", "member_id");
CREATE INDEX "org_planned_activity_assignments_planned_activity_id_idx" ON "org_planned_activity_assignments"("planned_activity_id");
CREATE INDEX "org_planned_activity_assignments_member_id_idx" ON "org_planned_activity_assignments"("member_id");
