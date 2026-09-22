-- BloodHero Phase 4: escalation follow-up rounds (run by /api/bloodhero/run-escalation on a cron).
-- Safe to re-run. Rollback: drop the three columns and the index.

alter table public.bloodhero_requests
  add column if not exists last_escalation_at timestamptz,
  add column if not exists escalation_count int not null default 0,
  add column if not exists escalation_paused boolean not null default false;

create index if not exists bloodhero_requests_escalation_idx
  on public.bloodhero_requests (status)
  where status in ('open', 'matching') and escalation_paused = false;

comment on column public.bloodhero_requests.escalation_count is
  'Follow-up matching rounds already run (the initial batch is not counted).';
