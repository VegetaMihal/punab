-- BloodHero public donor registrations (separate from PUNAB member profiles).
-- Apply in Supabase SQL editor or via `supabase db push` if you use the CLI.
--
-- Prisma-only databases may not define this trigger helper (it lives in 001_mvp_schema.sql).
-- Define it here so this file can be applied standalone after `prisma migrate deploy`.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.bloodhero_donors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  blood_group text not null
    check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  district text not null,
  last_donated_date date,
  available_now boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'rejected', 'paused')),
  block_until timestamptz,
  total_successful_donations int not null default 0
    check (total_successful_donations >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bloodhero_donors_availability_ck
    check (available_now = true or last_donated_date is not null)
);

create unique index if not exists bloodhero_donors_email_unique
  on public.bloodhero_donors (lower(trim(email)));

drop trigger if exists bloodhero_donors_updated_at on public.bloodhero_donors;
create trigger bloodhero_donors_updated_at
  before update on public.bloodhero_donors
  for each row execute function public.set_updated_at();

alter table public.bloodhero_donors enable row level security;

drop policy if exists bloodhero_donors_public_insert on public.bloodhero_donors;
-- Public signup: inserts must start as pending; no elevated stats or block_until from clients.
create policy bloodhero_donors_public_insert
  on public.bloodhero_donors
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and total_successful_donations = 0
    and block_until is null
  );

drop policy if exists bloodhero_donors_no_public_select on public.bloodhero_donors;
-- No public reads (privacy + spam). Admins/service role bypass RLS for future tooling.
create policy bloodhero_donors_no_public_select
  on public.bloodhero_donors
  for select
  to anon
  using (false);

comment on table public.bloodhero_donors is 'BloodHero donor pool; public insert, admin review via service role or future policies.';

grant insert on public.bloodhero_donors to anon, authenticated;
