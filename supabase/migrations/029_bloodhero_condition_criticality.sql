-- BloodHero Phase 4: voice/condition fields + criticality on requests.
-- condition_voice_transcript was already read/written by the admin request actions without a migration.
-- Safe to re-run. Rollback: drop the six columns below.

alter table public.bloodhero_requests
  add column if not exists condition_voice_transcript text,
  add column if not exists condition_summary text,
  add column if not exists condition_input_type text not null default 'text',
  add column if not exists criticality text not null default 'normal',
  add column if not exists criticality_source text not null default 'rules',
  add column if not exists criticality_overridden_by uuid references auth.users (id) on delete set null;

alter table public.bloodhero_requests
  drop constraint if exists bloodhero_requests_condition_input_type_ck,
  add constraint bloodhero_requests_condition_input_type_ck
    check (condition_input_type in ('text', 'voice')),
  drop constraint if exists bloodhero_requests_criticality_ck,
  add constraint bloodhero_requests_criticality_ck
    check (criticality in ('normal', 'urgent', 'critical')),
  drop constraint if exists bloodhero_requests_criticality_source_ck,
  add constraint bloodhero_requests_criticality_source_ck
    check (criticality_source in ('rules', 'ai', 'admin'));

comment on column public.bloodhero_requests.criticality is
  'normal | urgent | critical. Drives escalation cadence (see src/lib/bloodhero/escalation-config.ts).';
comment on column public.bloodhero_requests.criticality_source is
  'rules = keyword/time classifier, ai = Groq upgrade, admin = manual override.';
