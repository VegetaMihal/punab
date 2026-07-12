ALTER TABLE "JulyMemorialInvitation"
ADD COLUMN IF NOT EXISTS "specialContact" TEXT;

UPDATE "JulyMemorialInvitation"
SET "specialContact" = E'+880178466162, Rafikul Islam\nVice President , PUNAB'
WHERE "specialContact" IS NULL;

ALTER TABLE "JulyMemorialInvitation"
ALTER COLUMN "specialContact" SET NOT NULL;

ALTER TABLE "JulyMemorialInvitation"
ADD COLUMN IF NOT EXISTS "pdfGeneratedAt" TIMESTAMPTZ(6);
