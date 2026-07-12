-- Scoped PUNAB admin: empty admin_scopes + role=admin = full access; non-empty = invitations and/or certificates only.
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "admin_scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
