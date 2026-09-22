-- BloodHero: donation completion + certificate issuance (Phase 6).
-- Prerequisite: bloodhero_requests.matched_* (032), bloodhero_donors (005).

alter table public.bloodhero_requests
  add column if not exists donation_confirmed_at timestamptz,
  add column if not exists donation_confirmed_by uuid references auth.users(id);

comment on column public.bloodhero_requests.donation_confirmed_at is
  'When admin confirmed the matched donor actually donated.';

comment on column public.bloodhero_requests.donation_confirmed_by is
  'Admin user who confirmed the donation.';

create table if not exists public.bloodhero_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text not null unique,
  request_id uuid not null references public.bloodhero_requests(id) on delete cascade,
  donor_id uuid not null references public.bloodhero_donors(id) on delete cascade,
  issued_at timestamptz not null default timezone('utc', now()),
  issued_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.bloodhero_certificates is
  'One certificate per confirmed donation; certificate_number is the public verification key.';

create unique index if not exists bloodhero_certificates_request_id_key
  on public.bloodhero_certificates(request_id);

create index if not exists bloodhero_certificates_donor_id_idx
  on public.bloodhero_certificates(donor_id);

alter table public.bloodhero_certificates enable row level security;

drop policy if exists bloodhero_certificates_public_verify on public.bloodhero_certificates;
create policy bloodhero_certificates_public_verify
  on public.bloodhero_certificates
  for select
  to anon, authenticated
  using (true);

drop policy if exists bloodhero_certificates_admin_write on public.bloodhero_certificates;
create policy bloodhero_certificates_admin_write
  on public.bloodhero_certificates
  for all
  to authenticated
  using (public.is_bloodhero_admin())
  with check (public.is_bloodhero_admin());
