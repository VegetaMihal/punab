-- BloodHero public tracker: request events + RPC reads (lookup by tracking number lives in 009).
-- Prerequisite: bloodhero_requests (006), public.set_updated_at if you add triggers on events later.

create table if not exists public.bloodhero_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.bloodhero_requests(id) on delete cascade,
  event_type text not null,
  event_message text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bloodhero_request_events_request_created_idx
  on public.bloodhero_request_events (request_id, created_at);

alter table public.bloodhero_request_events enable row level security;

-- No direct anon DML/SELECT; access via SECURITY DEFINER RPCs below.

comment on table public.bloodhero_request_events is
  'Audit-style timeline for bloodhero_requests; inserted by triggers and future admin/matching jobs.';

-- Log first event when a request is submitted (existing submit flow).
create or replace function public.bloodhero_requests_after_insert_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.bloodhero_request_events (request_id, event_type, event_message)
  values (
    new.id,
    'request_created',
    'Blood request submitted successfully.'
  );
  return new;
end;
$$;

drop trigger if exists bloodhero_requests_after_insert_log on public.bloodhero_requests;
create trigger bloodhero_requests_after_insert_log
  after insert on public.bloodhero_requests
  for each row execute function public.bloodhero_requests_after_insert_log();

-- Backfill for requests created before this migration.
insert into public.bloodhero_request_events (request_id, event_type, event_message, created_at)
select
  r.id,
  'request_created',
  'Blood request submitted successfully.',
  r.created_at
from public.bloodhero_requests r
where not exists (
  select 1 from public.bloodhero_request_events e where e.request_id = r.id
);

-- Lookup requests for a single normalized email only (no table-wide anon SELECT).
create or replace function public.bloodhero_tracker_requests(p_email text)
returns setof public.bloodhero_requests
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from public.bloodhero_requests r
  where lower(trim(r.requester_email)) = lower(trim(p_email))
  order by r.created_at desc;
$$;

create or replace function public.bloodhero_tracker_events(p_request_ids uuid[])
returns setof public.bloodhero_request_events
language sql
stable
security definer
set search_path = public
as $$
  select e.*
  from public.bloodhero_request_events e
  where p_request_ids is not null
    and cardinality(p_request_ids) > 0
    and e.request_id = any (p_request_ids)
  order by e.created_at asc;
$$;

grant execute on function public.bloodhero_tracker_requests(text) to anon, authenticated;
grant execute on function public.bloodhero_tracker_events(uuid[]) to anon, authenticated;
