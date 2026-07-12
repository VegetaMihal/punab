-- Rollback: restore is_bloodhero_admin() from 016 (PUNAB admin without scope check).
-- Scoped PUNAB admins (non-empty admin_scopes) must not get BloodHero via profiles.role alone.

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
          and coalesce(cardinality(p.admin_scopes), 0) = 0
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
  'BloodHero admin: PUNAB full admin (role=admin, empty admin_scopes) OR active bloodhero_admin_access email match.';
