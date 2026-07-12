-- Add optional uploaded signature images for PDF rendering.

ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "signatorySignature1Url" TEXT;
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "signatorySignature2Url" TEXT;
