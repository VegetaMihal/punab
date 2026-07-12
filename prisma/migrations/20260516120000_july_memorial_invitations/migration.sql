CREATE TABLE IF NOT EXISTS "JulyMemorialInvitation" (
  "id" TEXT NOT NULL,
  "templateSlug" TEXT NOT NULL DEFAULT 'july-memorial-award',
  "recipientName" TEXT NOT NULL,
  "recipientDesignation" TEXT NOT NULL DEFAULT '',
  "recipientInstitution" TEXT NOT NULL,
  "contactPerson" TEXT NOT NULL,
  "responseStatus" TEXT NOT NULL DEFAULT 'MAYBE',
  "createdById" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JulyMemorialInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "JulyMemorialInvitation_templateSlug_recipientName_recipientInstitution_key"
  ON "JulyMemorialInvitation"("templateSlug", "recipientName", "recipientInstitution");

CREATE INDEX IF NOT EXISTS "JulyMemorialInvitation_responseStatus_idx"
  ON "JulyMemorialInvitation"("responseStatus");
