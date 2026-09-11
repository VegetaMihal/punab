-- Phase 1F: audit log.

CREATE TABLE "org_audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    CONSTRAINT "org_audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "org_audit_logs_entity_type_entity_id_idx" ON "org_audit_logs"("entity_type", "entity_id");
CREATE INDEX "org_audit_logs_actor_id_idx" ON "org_audit_logs"("actor_id");
CREATE INDEX "org_audit_logs_created_at_idx" ON "org_audit_logs"("created_at");
