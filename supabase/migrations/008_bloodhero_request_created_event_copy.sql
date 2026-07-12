-- Align request_created event copy with the BloodHero submission UX.
-- Prerequisite: 007_bloodhero_tracker.sql (trigger + bloodhero_request_events).

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

update public.bloodhero_request_events
set event_message = 'Blood request submitted successfully.'
where event_type = 'request_created'
  and event_message = 'Your blood request was received and recorded.';
