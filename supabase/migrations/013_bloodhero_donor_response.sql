-- BloodHero: donor response audit columns + apply RPC (service_role only).
-- Prerequisite: bloodhero_request_notifications (010).

alter table public.bloodhero_request_notifications
  add column if not exists responded_at timestamptz,
  add column if not exists response_action text;

alter table public.bloodhero_request_notifications
  drop constraint if exists bloodhero_request_notifications_response_action_ck;

alter table public.bloodhero_request_notifications
  add constraint bloodhero_request_notifications_response_action_ck
  check (
    response_action is null
    or response_action in ('accept', 'block_1m', 'block_2m', 'block_3m')
  );

comment on column public.bloodhero_request_notifications.responded_at is
  'When the donor confirmed a response via the signed link flow.';

comment on column public.bloodhero_request_notifications.response_action is
  'Donor choice: accept, or self-block 1/2/3 months (stored as declined + block_until on donor).';

-- Apply a donor choice for one notification row (idempotent: only while pending).
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
  v_interval interval;
  v_new_block timestamptz;
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
  returning n.donor_id into v_donor_id;

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
  end if;

  return jsonb_build_object(
    'ok', true,
    'notification_id', p_notification_id,
    'action', p_action
  );
end;
$$;

comment on function public.bloodhero_apply_donor_response(uuid, text) is
  'Records donor response; blocks extend donor.block_until without shortening an existing future block.';

grant execute on function public.bloodhero_apply_donor_response(uuid, text) to service_role;
