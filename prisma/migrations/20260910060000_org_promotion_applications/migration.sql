-- Phase 2 (first slice): promotion applications.

CREATE TABLE "org_promotion_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "forum_id" UUID NOT NULL,
    "current_designation_level_id" UUID NOT NULL,
    "target_designation_level_id" UUID NOT NULL,
    "eligibility_snapshot" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "decided_by" UUID,
    "decided_at" TIMESTAMPTZ(6),
    "decision_notes" TEXT,
    CONSTRAINT "org_promotion_applications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_promotion_applications_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "org_promotion_applications_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "org_forums"("id") ON DELETE CASCADE
);
CREATE INDEX "org_promotion_applications_member_id_idx" ON "org_promotion_applications"("member_id");
CREATE INDEX "org_promotion_applications_forum_id_idx" ON "org_promotion_applications"("forum_id");
CREATE INDEX "org_promotion_applications_status_idx" ON "org_promotion_applications"("status");
