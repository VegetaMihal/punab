-- Lightweight audit trail for BloodHero transactional emails (coordinators only).

create table if not exists public.bloodhero_email_events (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.bloodhero_donors (id) on delete set null,
  email_type text not null,
  recipient text not null,
  status text not null,
  error_message text,
  created_at timestamptz not null default now(),
  constraint bloodhero_email_events_status_ck
    check (status in ('success', 'failed'))
);

comment on table public.bloodhero_email_events is
  'BloodHero email outcomes; readable by BloodHero/PUNAB admins via RLS. Not for public access.';

create index if not exists bloodhero_email_events_donor_id_idx
  on public.bloodhero_email_events (donor_id);

create index if not exists bloodhero_email_events_created_at_idx
  on public.bloodhero_email_events (created_at desc);

alter table public.bloodhero_email_events enable row level security;

drop policy if exists bloodhero_email_events_insert on public.bloodhero_email_events;
create policy bloodhero_email_events_insert
  on public.bloodhero_email_events
  for insert
  to authenticated
  with check (public.is_bloodhero_admin());

drop policy if exists bloodhero_email_events_select on public.bloodhero_email_events;
create policy bloodhero_email_events_select
  on public.bloodhero_email_events
  for select
  to authenticated
  using (public.is_bloodhero_admin());

grant insert, select on public.bloodhero_email_events to authenticated;
