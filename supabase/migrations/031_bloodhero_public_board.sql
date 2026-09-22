-- Public "needed now" board: PII-free view over open requests + aggregate stats.
-- Prerequisite: 006 (requests), 005 (donors), 029 (criticality).
-- Views run as owner (bypass RLS) and expose only safe columns; no requester/patient identity or contact data.
-- Rollback: drop view public.bloodhero_public_requests; drop view public.bloodhero_public_stats;
--           alter table public.bloodhero_requests drop column is_public;

alter table public.bloodhero_requests
  add column if not exists is_public boolean not null default true;

comment on column public.bloodhero_requests.is_public is
  'Admin kill-switch: false hides the request from the public board (spam / fake).';

create or replace view public.bloodhero_public_requests as
select
  r.id,
  r.blood_group,
  r.request_quantity,
  r.district,
  r.donation_location,
  r.planned_donation_at,
  r.criticality,
  r.status,
  r.created_at
from public.bloodhero_requests r
where r.is_public
  and r.status in ('open', 'matching')
  and r.planned_donation_at > now() - interval '1 day';

create or replace view public.bloodhero_public_stats as
select
  (select count(*) from public.bloodhero_donors d where d.status = 'active')::int as active_donors,
  (select count(*) from public.bloodhero_requests r
     where r.is_public and r.status in ('open', 'matching')
       and r.planned_donation_at > now() - interval '1 day')::int as open_requests,
  (select count(*) from public.bloodhero_requests r where r.status = 'fulfilled')::int as fulfilled_requests;

grant select on public.bloodhero_public_requests to anon, authenticated;
grant select on public.bloodhero_public_stats to anon, authenticated;
