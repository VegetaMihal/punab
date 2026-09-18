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

-- July Memorial invitations: server actions use service_role/DATABASE_URL role; block PostgREST public access.
ALTER TABLE IF EXISTS public."JulyMemorialInvitation" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS july_memorial_invitation_no_public_access ON public."JulyMemorialInvitation";
CREATE POLICY july_memorial_invitation_no_public_access
ON public."JulyMemorialInvitation"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- ⚠️ affects auth/RLS — test role checks.
-- Org Portal (Forum management/reporting/performance, RBAC-003 backstop): all access to these
-- tables goes through app-layer checks (require-admin.ts / require-reporter.ts) using the
-- DATABASE_URL Postgres role, which bypasses RLS. These policies exist only to make sure a
-- PostgREST/Supabase-client request (anon or authenticated key) can never read member scores,
-- recommendations, or reporter/membership rows directly — same "server-only" pattern as
-- july_award_club_cards / JulyMemorialInvitation above.
ALTER TABLE IF EXISTS public.org_hierarchy_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_designation_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_forum_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_campus_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_reporter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_monthly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_planned_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_activity_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_activity_member_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_monthly_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_monthly_performance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.org_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_hierarchy_schemes_no_public_access ON public.org_hierarchy_schemes;
CREATE POLICY org_hierarchy_schemes_no_public_access ON public.org_hierarchy_schemes FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_designation_levels_no_public_access ON public.org_designation_levels;
CREATE POLICY org_designation_levels_no_public_access ON public.org_designation_levels FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_forums_no_public_access ON public.org_forums;
CREATE POLICY org_forums_no_public_access ON public.org_forums FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_forum_memberships_no_public_access ON public.org_forum_memberships;
CREATE POLICY org_forum_memberships_no_public_access ON public.org_forum_memberships FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_campus_roles_no_public_access ON public.org_campus_roles;
CREATE POLICY org_campus_roles_no_public_access ON public.org_campus_roles FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_reporter_assignments_no_public_access ON public.org_reporter_assignments;
CREATE POLICY org_reporter_assignments_no_public_access ON public.org_reporter_assignments FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_monthly_reports_no_public_access ON public.org_monthly_reports;
CREATE POLICY org_monthly_reports_no_public_access ON public.org_monthly_reports FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_activities_no_public_access ON public.org_activities;
CREATE POLICY org_activities_no_public_access ON public.org_activities FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_monthly_plans_no_public_access ON public.org_monthly_plans;
CREATE POLICY org_monthly_plans_no_public_access ON public.org_monthly_plans FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_planned_activities_no_public_access ON public.org_planned_activities;
CREATE POLICY org_planned_activities_no_public_access ON public.org_planned_activities FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_activity_assignments_no_public_access ON public.org_activity_assignments;
CREATE POLICY org_activity_assignments_no_public_access ON public.org_activity_assignments FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_activity_member_results_no_public_access ON public.org_activity_member_results;
CREATE POLICY org_activity_member_results_no_public_access ON public.org_activity_member_results FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_monthly_recommendations_no_public_access ON public.org_monthly_recommendations;
CREATE POLICY org_monthly_recommendations_no_public_access ON public.org_monthly_recommendations FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_monthly_performance_scores_no_public_access ON public.org_monthly_performance_scores;
CREATE POLICY org_monthly_performance_scores_no_public_access ON public.org_monthly_performance_scores FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS org_audit_log_no_public_access ON public.org_audit_log;
CREATE POLICY org_audit_log_no_public_access ON public.org_audit_log FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
