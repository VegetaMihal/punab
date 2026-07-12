-- Refine BloodHero matching eligibility + event trail.
-- - Treat 'active' as the canonical approved status; also accept legacy 'approved' if present.
-- - Add explicit events for matching start and donor selection count.

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

  insert into public.bloodhero_request_events (request_id, event_type, event_message, metadata)
  values (
    p_request_id,
    'donor_matching_started',
    'Donor matching started for this request.',
    jsonb_build_object('request_id', p_request_id)
  );

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
    where d.status in ('active', 'approved')
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
  end if;

  insert into public.bloodhero_request_events (request_id, event_type, event_message, metadata)
  values (
    p_request_id,
    'donors_selected_for_notification',
    format('%s donors selected for notification.', v_inserted),
    jsonb_build_object('selected_count', v_inserted)
  );

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
  'Selects up to 15 eligible donors (active/approved) and records matching events; advisory-locked per request.';
