-- BloodHero: auto-confirm match on first donor accept.
-- First donor to accept wins the request; request becomes fulfilled immediately.
-- Prerequisite: bloodhero_apply_donor_response (013), bloodhero_requests.matched_* columns (032).

create or replace function public.bloodhero_apply_donor_response(
  p_notification_id uuid,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_donor_id uuid;
  v_request_id uuid;
  v_interval interval;
  v_new_block timestamptz;
  v_matched boolean := false;
begin
  v_donor_id := null;
  if p_action is null
    or p_action not in ('accept', 'block_1m', 'block_2m', 'block_3m') then
    return jsonb_build_object('error', 'invalid_action');
  end if;

  update public.bloodhero_request_notifications n
  set
    response_status = case
      when p_action = 'accept' then 'accepted'::text
      else 'declined'::text
    end,
    responded_at = timezone('utc', now()),
    response_action = p_action
  where n.id = p_notification_id
    and n.response_status = 'pending'
  returning n.donor_id, n.request_id into v_donor_id, v_request_id;

  if v_donor_id is null then
    return jsonb_build_object('error', 'not_pending_or_missing');
  end if;

  if p_action <> 'accept' then
    v_interval := case p_action
      when 'block_1m' then interval '1 month'
      when 'block_2m' then interval '2 months'
      when 'block_3m' then interval '3 months'
    end;
    v_new_block := timezone('utc', now()) + v_interval;

    update public.bloodhero_donors d
    set block_until = greatest(
      v_new_block,
      coalesce(d.block_until, '-infinity'::timestamptz)
    )
    where d.id = v_donor_id;
  else
    -- First accepted donor wins the request; guarded so a second, near-simultaneous
    -- accept cannot overwrite an already-confirmed match.
    update public.bloodhero_requests r
    set
      status = 'fulfilled',
      matched_notification_id = p_notification_id,
      matched_at = timezone('utc', now())
    where r.id = v_request_id
      and r.matched_notification_id is null
    returning true into v_matched;

    if v_matched then
      insert into public.bloodhero_request_events (request_id, event_type, event_message, metadata)
      values (
        v_request_id,
        'match_confirmed',
        'Auto-confirmed: first donor to accept was matched.',
        jsonb_build_object('notification_id', p_notification_id, 'donor_id', v_donor_id, 'source', 'auto')
      );
    end if;
  end if;

  return jsonb_build_object(
    'ok', true,
    'notification_id', p_notification_id,
    'action', p_action,
    'auto_matched', coalesce(v_matched, false)
  );
end;
$$;

comment on function public.bloodhero_apply_donor_response(uuid, text) is
  'Records donor response; on accept, auto-confirms request as fulfilled for the first donor to accept.';
