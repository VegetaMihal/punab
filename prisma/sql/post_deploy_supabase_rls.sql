-- After `prisma migrate deploy` on Supabase, apply Row Level Security and helper functions
-- from your existing `supabase/migrations` folder (e.g. 001_mvp_schema.sql RLS section +
-- 004_fix_is_admin_rls_recursion.sql). Prisma migrations create tables only; RLS remains optional
-- when all server access uses the Postgres role from DATABASE_URL (typically bypasses RLS).

-- Certificate module tables are created by Prisma migrations in the public schema.
-- Enable RLS so PostgREST-exposed tables are never unintentionally open.
ALTER TABLE IF EXISTS public."CertificateTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Certificate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."CertificateEmailLog" ENABLE ROW LEVEL SECURITY;

-- Public verification page may need to read active templates.
DROP POLICY IF EXISTS certificate_template_public_read_active ON public."CertificateTemplate";
CREATE POLICY certificate_template_public_read_active
ON public."CertificateTemplate"
FOR SELECT
TO anon, authenticated
USING ("isActive" = true);

-- Public verification should only expose non-sensitive, publicly valid certificates.
DROP POLICY IF EXISTS certificate_public_verify_read ON public."Certificate";
CREATE POLICY certificate_public_verify_read
ON public."Certificate"
FOR SELECT
TO anon, authenticated
USING ("status" IN ('ISSUED', 'EMAILED'));

-- Email logs should not be exposed through PostgREST clients.
DROP POLICY IF EXISTS certificate_email_log_no_public_access ON public."CertificateEmailLog";
CREATE POLICY certificate_email_log_no_public_access
ON public."CertificateEmailLog"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- July Award club cards: server actions use service_role; block PostgREST public access.
ALTER TABLE IF EXISTS public.july_award_club_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS july_award_club_cards_no_public_access ON public.july_award_club_cards;
CREATE POLICY july_award_club_cards_no_public_access
ON public.july_award_club_cards
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
