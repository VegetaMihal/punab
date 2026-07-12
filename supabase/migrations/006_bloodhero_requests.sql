-- BloodHero public blood requests (separate from donors and PUNAB profiles).
-- Prerequisite: public.set_updated_at() from 001_mvp_schema.sql

create table if not exists public.bloodhero_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  requester_phone text not null,
  patient_name text not null,
  patient_condition text,
  donation_location text not null,
  district text not null,
  blood_group text not null
    constraint bloodhero_requests_blood_group_ck
      check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  planned_donation_at timestamptz not null,
  request_quantity int not null default 1
    constraint bloodhero_requests_quantity_ck
      check (request_quantity >= 1 and request_quantity <= 100),
  status text not null default 'open'
    constraint bloodhero_requests_status_ck
      check (status in ('open', 'matching', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists bloodhero_requests_updated_at on public.bloodhero_requests;
create trigger bloodhero_requests_updated_at
  before update on public.bloodhero_requests
  for each row execute function public.set_updated_at();

alter table public.bloodhero_requests enable row level security;

drop policy if exists bloodhero_requests_public_insert on public.bloodhero_requests;
create policy bloodhero_requests_public_insert
  on public.bloodhero_requests
  for insert
  to anon, authenticated
  with check (
    status = 'open'
    and request_quantity >= 1
    and request_quantity <= 100
  );

drop policy if exists bloodhero_requests_no_public_select on public.bloodhero_requests;
create policy bloodhero_requests_no_public_select
  on public.bloodhero_requests
  for select
  to anon
  using (false);

comment on table public.bloodhero_requests is
  'BloodHero urgent blood requests; public insert, coordinator matching later.';

grant insert on public.bloodhero_requests to anon, authenticated;
