-- Phase 1B: Forum records, hierarchy schemes, campus roles, reporter assignments, history.

CREATE TABLE "org_hierarchy_schemes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_hierarchy_schemes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "org_hierarchy_schemes_name_key" ON "org_hierarchy_schemes"("name");

CREATE TABLE "org_designation_levels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scheme_id" UUID NOT NULL,
    "level_code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "numeric_rank" INTEGER NOT NULL,
    "multiplicity" TEXT NOT NULL DEFAULT 'multiple',
    "min_duration_months" INTEGER,
    CONSTRAINT "org_designation_levels_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_designation_levels_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "org_hierarchy_schemes"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "org_designation_levels_scheme_id_level_code_key" ON "org_designation_levels"("scheme_id", "level_code");
CREATE UNIQUE INDEX "org_designation_levels_scheme_id_numeric_rank_key" ON "org_designation_levels"("scheme_id", "numeric_rank");
CREATE INDEX "org_designation_levels_scheme_id_idx" ON "org_designation_levels"("scheme_id");

CREATE TABLE "org_forums" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "forum_type" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'incomplete',
    "hierarchy_scheme_id" UUID NOT NULL,
    "effective_start_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "full_recognition_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_forums_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_forums_hierarchy_scheme_id_fkey" FOREIGN KEY ("hierarchy_scheme_id") REFERENCES "org_hierarchy_schemes"("id")
);
CREATE UNIQUE INDEX "org_forums_slug_key" ON "org_forums"("slug");
CREATE INDEX "org_forums_hierarchy_scheme_id_idx" ON "org_forums"("hierarchy_scheme_id");

CREATE TABLE "org_forum_memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "designation_level_id" UUID NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "end_date" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_forum_memberships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_forum_memberships_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "org_forums"("id") ON DELETE CASCADE,
    CONSTRAINT "org_forum_memberships_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "org_forum_memberships_designation_level_id_fkey" FOREIGN KEY ("designation_level_id") REFERENCES "org_designation_levels"("id")
);
CREATE INDEX "org_forum_memberships_forum_id_idx" ON "org_forum_memberships"("forum_id");
CREATE INDEX "org_forum_memberships_member_id_idx" ON "org_forum_memberships"("member_id");
CREATE INDEX "org_forum_memberships_designation_level_id_idx" ON "org_forum_memberships"("designation_level_id");

CREATE TABLE "org_campus_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_id" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "campus_level" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "end_date" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_campus_roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_campus_roles_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "org_forums"("id") ON DELETE CASCADE,
    CONSTRAINT "org_campus_roles_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "universities"("id"),
    CONSTRAINT "org_campus_roles_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE
);
CREATE INDEX "org_campus_roles_forum_id_idx" ON "org_campus_roles"("forum_id");
CREATE INDEX "org_campus_roles_campus_id_idx" ON "org_campus_roles"("campus_id");
CREATE INDEX "org_campus_roles_member_id_idx" ON "org_campus_roles"("member_id");

-- CAMPUS-002: only one ACTIVE Representative per Forum per campus. Partial unique index —
-- past/ended representatives don't block a new one, only a concurrently active one does.
CREATE UNIQUE INDEX "org_campus_roles_active_rep_unique"
    ON "org_campus_roles"("forum_id", "campus_id")
    WHERE "campus_level" = 'representative' AND "is_active" = true;

CREATE TABLE "org_reporter_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "reporter_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "authorized_by" UUID,
    "start_date" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "end_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_reporter_assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_reporter_assignments_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "org_forums"("id") ON DELETE CASCADE,
    CONSTRAINT "org_reporter_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE
);
CREATE INDEX "org_reporter_assignments_forum_id_idx" ON "org_reporter_assignments"("forum_id");
CREATE INDEX "org_reporter_assignments_member_id_idx" ON "org_reporter_assignments"("member_id");

-- REP-002/REP-004: at most one ACTIVE secondary reporter per forum by default (configurable count
-- is enforced in application code against org.max_secondary_reporters; this guards the common case).
CREATE UNIQUE INDEX "org_reporter_assignments_active_primary_unique"
    ON "org_reporter_assignments"("forum_id")
    WHERE "reporter_type" = 'primary' AND "is_active" = true;

CREATE TABLE "org_forum_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forum_id" UUID NOT NULL,
    "old_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "effective_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "approved_by" UUID,
    "notes" TEXT,
    "qualification_snapshot" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_forum_status_history_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_forum_status_history_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "org_forums"("id") ON DELETE CASCADE
);
CREATE INDEX "org_forum_status_history_forum_id_idx" ON "org_forum_status_history"("forum_id");

CREATE TABLE "org_designation_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "forum_id" UUID,
    "old_designation_level_id" UUID,
    "new_designation_level_id" UUID,
    "effective_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "approved_by" UUID,
    "application_reference" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_designation_history_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_designation_history_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "profiles"("id") ON DELETE CASCADE
);
CREATE INDEX "org_designation_history_member_id_idx" ON "org_designation_history"("member_id");
CREATE INDEX "org_designation_history_forum_id_idx" ON "org_designation_history"("forum_id");
