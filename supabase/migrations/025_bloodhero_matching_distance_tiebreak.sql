-- BloodHero matching: rank donors by distance to the request's donation point, matching the
-- eligibility rule already used by the app-level manual "rerun matching" path
-- (src/lib/bloodhero/matching.ts): district is no longer a hard filter here, only a ranking
-- fallback when coordinates are missing on either side. Before this migration, the DB trigger
-- (auto-match on request insert, 011) enforced strict same-district match while the admin
-- "rerun matching" button used distance-first/district-optional — the two paths disagreed.
-- Coordinates are populated by geocode-on-submit (021_bloodhero_location_phase3, wired in
-- src/actions/bloodhero-donor.ts + bloodhero-request.ts).
-- Rollback: re-apply 019_bloodhero_matching_admin_event_refine.sql to restore strict district
-- matching (prior behavior).
--
-- Eligibility: same blood group, active/approved, not blocked, not already notified for this
-- request. District is NOT required. Ranking:
--   1) block_until asc nulls first (never-blocked donors first — not present in the JS path,
--      kept here as an existing fairness refinement, not part of the district consistency fix)
--   2) has distance (both donor + request coords present) before no-distance
--   3) distance to request donation point asc (when present)
--   4) among no-distance donors: same-district match first
--   5) created_at asc (tie-break)
-- Distance = plain haversine in km; no extension required.

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
      d.created_at,
      case
        when d.center_point_lat is null or d.center_point_lng is null
          or v_req.donation_location_lat is null or v_req.donation_location_lng is null
        then null
        else (
          6371 * acos(
            least(1.0, greatest(-1.0,
              cos(radians(v_req.donation_location_lat)) * cos(radians(d.center_point_lat))
                * cos(radians(d.center_point_lng) - radians(v_req.donation_location_lng))
              + sin(radians(v_req.donation_location_lat)) * sin(radians(d.center_point_lat))
            ))
          )
        )
      end as distance_km,
      (
        trim(coalesce(d.district, '')) <> ''
        and trim(coalesce(v_req.district, '')) <> ''
        and lower(trim(d.district)) = lower(trim(v_req.district))
      ) as district_match
    from public.bloodhero_donors d
    where d.status in ('active', 'approved')
      and d.blood_group = v_req.blood_group
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
      (distance_km is null) asc,
      distance_km asc nulls last,
      district_match desc,
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
  'Selects up to 15 eligible donors (active/approved, same blood group, not blocked), ranked by cooldown then distance to donation point (district as fallback when coords missing) then signup order; advisory-locked per request.';
