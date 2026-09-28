-- ⚠️ affects auth/RLS — test role checks
--
-- Scoped PUNAB admins (profiles.admin_scopes non-empty) could reach BloodHero donor and request
-- data regardless of their granted scopes: is_bloodhero_admin() only checked profiles.role = 'admin'.
-- Because this one security-definer function backs RLS, the RPC and PostgREST alike, a Content
-- Editor or Members Manager passed every BloodHero check. Now a PUNAB admin needs either empty
-- admin_scopes (full admin) or the 'bloodhero' scope. Standalone bloodhero_admin_access rows are
-- unaffected.
--
-- ROLLBACK:
--   create or replace function public.is_bloodhero_admin()
--   returns boolean language sql stable security definer set search_path = public as $$
--     select
--       auth.uid() is not null
--       and (
--         exists (
--           select 1 from public.profiles p
--           where p.id = auth.uid() and p.role = 'admin'
--         )
--         or exists (
--           select 1 from public.bloodhero_admin_access a
--           join auth.users u on u.id = auth.uid()
--           where a.is_active and lower(trim(a.email)) = lower(trim(u.email::text))
--         )
--       );
--   $$;
--   grant execute on function public.is_bloodhero_admin() to authenticated;

create or replace function public.is_bloodhero_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
          and (
            -- empty admin_scopes = full admin (same convention as src/lib/auth/admin-access.ts)
            cardinality(coalesce(p.admin_scopes, '{}'::text[])) = 0
            or 'bloodhero' = any(coalesce(p.admin_scopes, '{}'::text[]))
          )
      )
      or exists (
        select 1
        from public.bloodhero_admin_access a
        join auth.users u on u.id = auth.uid()
        where a.is_active
          and lower(trim(a.email)) = lower(trim(u.email::text))
      )
    );
$$;

comment on function public.is_bloodhero_admin() is
  'BloodHero admin UI: true if PUNAB full admin (empty admin_scopes) or admin holding the bloodhero scope, OR an active bloodhero_admin_access row for the session email.';

grant execute on function public.is_bloodhero_admin() to authenticated;
