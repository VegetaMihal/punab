-- Unified BloodHero admin access:
-- 1) PUNAB full admins: public.profiles.role = 'admin' (same as main /admin).
-- 2) BloodHero-only: public.bloodhero_admin_access (active row matching auth.users.email).
-- Replaces public.bloodhero_admins (user_id-only). Bootstrap: admin@punab.test as BH-only grant.

create table if not exists public.bloodhero_admin_access (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists bloodhero_admin_access_email_lower_uidx
  on public.bloodhero_admin_access (lower(trim(email)));

comment on table public.bloodhero_admin_access is
  'BloodHero-only admin grants by email. Does not grant PUNAB /admin. PUNAB admins use profiles.role = admin.';

alter table public.bloodhero_admin_access enable row level security;

-- No client policies: grants managed in SQL Editor / service role only.

-- Migrate legacy user_id allow-list → email rows (skip if 014 was never applied)
do $$
begin
  if to_regclass('public.bloodhero_admins') is not null then
    insert into public.bloodhero_admin_access (email, user_id, is_active, created_at)
    select lower(trim(u.email::text)), b.user_id, true, b.created_at
    from public.bloodhero_admins b
    join auth.users u on u.id = b.user_id
    where u.email is not null
      and not exists (
        select 1
        from public.bloodhero_admin_access a
        where lower(trim(a.email)) = lower(trim(u.email::text))
      );
  end if;
end $$;

-- Bootstrap known coordinator email (BH-only path if not already a PUNAB admin)
insert into public.bloodhero_admin_access (email, is_active)
select 'admin@punab.test', true
where not exists (
  select 1 from public.bloodhero_admin_access
  where lower(trim(email)) = lower(trim('admin@punab.test'))
);

-- Single security definer used by RLS, RPC, and PostgREST checks
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
  'BloodHero admin UI: true if PUNAB profiles.role=admin OR active bloodhero_admin_access row for session email.';

grant execute on function public.is_bloodhero_admin() to authenticated;

-- Donor RPC: same gate as UI
create or replace function public.bloodhero_admin_review_donor(p_donor_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if not public.is_bloodhero_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.bloodhero_donors
  set status = case when p_approve then 'active' else 'rejected' end
  where id = p_donor_id
    and status = 'pending';

  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'Donor not found or already reviewed.'
      using errcode = 'P0001';
  end if;
end;
$$;

drop table if exists public.bloodhero_admins cascade;
