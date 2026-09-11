-- AUTH-001..005: admin-provisioned member accounts with temporary password + forced first login.
ALTER TABLE "profiles"
  ADD COLUMN "account_status" TEXT NOT NULL DEFAULT 'pending_activation',
  ADD COLUMN "first_login_required" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "temp_password_expires_at" TIMESTAMPTZ,
  ADD COLUMN "membership_number" TEXT;

CREATE UNIQUE INDEX "profiles_membership_number_key" ON "profiles"("membership_number");

-- Existing rows already have real passwords set by self-signup; treat them as active.
UPDATE "profiles" SET "account_status" = 'active' WHERE "membership_status" = 'approved';
