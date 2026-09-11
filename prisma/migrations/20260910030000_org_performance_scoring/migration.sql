-- Phase 1D: per-member activity results, monthly recommendations, monthly/overall performance.

CREATE TABLE "org_activity_member_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "result_type" TEXT NOT NULL,
    "score" INTEGER,
    "comment" TEXT,
    "evaluated_by" UUID,
    "evaluated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_activity_member_results_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_activity_member_results_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "org_activity_assignments"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "org_activity_member_results_assignment_id_key" ON "org_activity_member_results"("assignment_id");

CREATE TABLE "org_monthly_recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "reporter_id" UUID NOT NULL,
    "needs_approval" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_monthly_recommendations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_monthly_recommendations_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "org_monthly_reports"("id") ON DELETE CASCADE,
    CONSTRAINT "org_monthly_recommendations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "org_monthly_recommendations_report_id_member_id_key" ON "org_monthly_recommendations"("report_id", "member_id");
CREATE INDEX "org_monthly_recommendations_report_id_idx" ON "org_monthly_recommendations"("report_id");
CREATE INDEX "org_monthly_recommendations_member_id_idx" ON "org_monthly_recommendations"("member_id");

CREATE TABLE "org_monthly_performance_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "forum_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "activity_average" DOUBLE PRECISION,
    "recommendation_score" INTEGER,
    "final_score" DOUBLE PRECISION,
    "calc_version" TEXT NOT NULL DEFAULT 'v1',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_monthly_performance_scores_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_monthly_performance_scores_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "org_monthly_performance_scores_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "org_forums"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "org_monthly_performance_scores_member_id_forum_id_year_mon_key" ON "org_monthly_performance_scores"("member_id", "forum_id", "year", "month");
CREATE INDEX "org_monthly_performance_scores_member_id_idx" ON "org_monthly_performance_scores"("member_id");
CREATE INDEX "org_monthly_performance_scores_forum_id_idx" ON "org_monthly_performance_scores"("forum_id");
