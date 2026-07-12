-- BloodHero donor matching: queue up to 15 eligible donors per request (no emails yet).
-- Prerequisite: bloodhero_donors (005), bloodhero_requests (006+009), bloodhero_request_events (007).
--
-- Eligible donors (schema uses status 'active' = approved for matching; not 'approved'):
--   status = 'active', same blood_group, same district (case-insensitive trim),
--   block_until is null or in the past (UTC), not already listed for this request.
-- Ranking: block_until ASC NULLS FIRST (never blocked first; then earliest past block_until =
--   longest time since that block ended), then created_at ASC for ties.
-- Only runs for request status open|matching; fulfilled/cancelled are no-ops.
-- pg_advisory_xact_lock: one match transaction at a time per request (avoids unique races).

create table if not exists public.bloodhero_request_notifications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.bloodhero_requests (id) on delete cascade,
  donor_id uuid not null references public.bloodhero_donors (id) on delete cascade,
  sent_at timestamptz,
  response_status text not null default 'pending'
    constraint bloodhero_request_notifications_response_ck
      check (response_status in ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz not null default now(),
  constraint bloodhero_request_notifications_request_donor_uq unique (request_id, donor_id)
);

create index if not exists bloodhero_request_notifications_request_id_idx
  on public.bloodhero_request_notifications (request_id);

create index if not exists bloodhero_request_notifications_donor_id_idx
  on public.bloodhero_request_notifications (donor_id);

create index if not exists bloodhero_request_notifications_pending_idx
  on public.bloodhero_request_notifications (request_id)
  where sent_at is null and response_status = 'pending';

alter table public.bloodhero_request_notifications enable row level security;

comment on table public.bloodhero_request_notifications is
  'Queued donor notifications per blood request; sent_at/response_status for future email + replies.';

-- Core engine: replace pending unsent queue, insert up to 15 ranked donors.
create or replace function public.bloodhero_run_matching_for_request(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.bloodhero_requests%rowtype;
  v_inserted int := 0;
begin
  select * into strict v_req from public.bloodhero_requests where id = p_request_id;

  if v_req.status not in ('open', 'matching') then
    return jsonb_build_object(
      'request_id', p_request_id,
      'inserted', 0,
      'skipped', true,
      'reason', 'request_status_not_matchable',
      'status', v_req.status,
      'tracking_number', v_req.tracking_number
    );
  end if;

  if trim(v_req.district) = '' then
    return jsonb_build_object(
      'request_id', p_request_id,
      'inserted', 0,
      'skipped', true,
      'reason', 'empty_request_district',
      'tracking_number', v_req.tracking_number
    );
  end if;

  perform pg_advisory_xact_lock(8420147, hashtext(p_request_id::text));

  delete from public.bloodhero_request_notifications n
  where n.request_id = p_request_id
    and n.sent_at is null
    and n.response_status = 'pending';

  with eligible as (
    select
      d.id as donor_id,
      d.block_until,
      d.created_at
    from public.bloodhero_donors d
    where d.status = 'active'
      and d.blood_group = v_req.blood_group
      and trim(d.district) <> ''
      and lower(trim(d.district)) = lower(trim(v_req.district))
      and (d.block_until is null or d.block_until <= timezone('utc', now()))
      and not exists (
        select 1
        from public.bloodhero_request_notifications n0
        where n0.request_id = p_request_id
          and n0.donor_id = d.id
      )
  ),
  ranked as (
    select donor_id
    from eligible
    order by
      block_until asc nulls first,
      created_at asc
    limit 15
  )
  insert into public.bloodhero_request_notifications (request_id, donor_id)
  select p_request_id, donor_id from ranked;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update public.bloodhero_requests
    set status = 'matching'
    where id = p_request_id
      and status = 'open';

    insert into public.bloodhero_request_events (request_id, event_type, event_message)
    select
      p_request_id,
      'matching_started',
      'Donors are being selected for your request. Notifications will go out when email is enabled.'
    where not exists (
      select 1
      from public.bloodhero_request_events e
      where e.request_id = p_request_id
        and e.event_type = 'matching_started'
    );
  end if;

  return jsonb_build_object(
    'request_id', p_request_id,
    'inserted', v_inserted,
    'tracking_number', v_req.tracking_number
  );
exception
  when no_data_found then
    return jsonb_build_object('error', 'request_not_found', 'request_id', p_request_id);
  when others then
    return jsonb_build_object('error', 'matching_failed', 'detail', sqlerrm);
end;
$$;

comment on function public.bloodhero_run_matching_for_request(uuid) is
  'Selects up to 15 eligible donors (open|matching requests only); clears pending unsent queue first; advisory-locked per request.';

-- Manual / cron / server: not granted to anon.
grant execute on function public.bloodhero_run_matching_for_request(uuid) to service_role;

-- After each new request: run matching without failing the insert if matching errors.
-- Errors surface as PostgreSQL WARNING/LOG (Supabase: Database → Logs / postgres logs), not to the client.
create or replace function public.bloodhero_requests_after_insert_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  begin
    select public.bloodhero_run_matching_for_request(new.id) into v_result;
    if coalesce(v_result->>'error', '') <> '' then
      raise warning 'bloodhero_matching: request_id=% result=%', new.id, v_result::text;
    else
      raise log 'bloodhero_matching: request_id=% inserted=%', new.id, coalesce(v_result->>'inserted', '0');
    end if;
  exception
    when others then
      raise warning 'bloodhero_matching: request_id=% exception=%', new.id, sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists bloodhero_requests_after_insert_match on public.bloodhero_requests;
create trigger bloodhero_requests_after_insert_match
  after insert on public.bloodhero_requests
  for each row execute function public.bloodhero_requests_after_insert_match();
