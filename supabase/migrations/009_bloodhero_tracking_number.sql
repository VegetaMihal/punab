-- BloodHero: public tracking number per request (BH-UTCYEAR-NNNNNN) + tracker RPC by number.
-- Replaces email-based bloodhero_tracker_requests(text). Apply after 006 and 007.
--
-- Format: BH-2026-000001
--   BH      = BloodHero prefix (readable in email/SMS)
--   2026    = UTC calendar year at insert time (orientation for humans)
--   000001  = zero-padded global sequence (unique, stable; not reset yearly)
--
-- Numbers are assigned only in the database (BEFORE INSERT trigger) so clients cannot pick or collide.

create sequence if not exists public.bloodhero_tracking_number_seq;

alter table public.bloodhero_requests
  add column if not exists tracking_number text;

create or replace function public.bloodhero_requests_set_tracking_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.tracking_number :=
    'BH-' ||
    to_char((timezone('utc', now()))::date, 'YYYY') || '-' ||
    lpad(nextval('public.bloodhero_tracking_number_seq')::text, 6, '0');
  return new;
end;
$$;

drop trigger if exists bloodhero_requests_set_tracking_number on public.bloodhero_requests;
create trigger bloodhero_requests_set_tracking_number
  before insert on public.bloodhero_requests
  for each row execute function public.bloodhero_requests_set_tracking_number();

-- Existing rows: assign numbers in created_at order (one row per nextval).
do $$
declare
  r record;
begin
  for r in
    select id, created_at
    from public.bloodhero_requests
    where tracking_number is null
    order by created_at asc
  loop
    update public.bloodhero_requests br
    set tracking_number =
      'BH-' ||
      to_char((timezone('utc', r.created_at))::date, 'YYYY') || '-' ||
      lpad(nextval('public.bloodhero_tracking_number_seq')::text, 6, '0')
    where br.id = r.id;
  end loop;
end;
$$;

alter table public.bloodhero_requests
  alter column tracking_number set not null;

create unique index if not exists bloodhero_requests_tracking_number_key
  on public.bloodhero_requests (tracking_number);

select setval(
  'public.bloodhero_tracking_number_seq',
  coalesce(
    (
      select max(cast(right(tracking_number, 6) as bigint))
      from public.bloodhero_requests
      where tracking_number ~ '^BH-[0-9]{4}-[0-9]{6}$'
    ),
    1
  )
);

comment on column public.bloodhero_requests.tracking_number is
  'Public tracking code (BH-YYYY-NNNNNN); generated on insert; safe to send by email.';

-- Insert + return row for anon (RLS blocks SELECT on bloodhero_requests; plain insert().select() fails).
create or replace function public.bloodhero_insert_request_public(
  p_requester_name text,
  p_requester_email text,
  p_requester_phone text,
  p_patient_name text,
  p_patient_condition text,
  p_donation_location text,
  p_district text,
  p_blood_group text,
  p_planned_donation_at timestamptz,
  p_request_quantity int,
  p_status text
)
returns public.bloodhero_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.bloodhero_requests;
begin
  if p_status is distinct from 'open' then
    raise exception 'invalid bloodhero request: status must be open';
  end if;
  if p_request_quantity is null or p_request_quantity < 1 or p_request_quantity > 100 then
    raise exception 'invalid bloodhero request: quantity';
  end if;
  if p_blood_group not in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') then
    raise exception 'invalid bloodhero request: blood group';
  end if;

  insert into public.bloodhero_requests (
    requester_name,
    requester_email,
    requester_phone,
    patient_name,
    patient_condition,
    donation_location,
    district,
    blood_group,
    planned_donation_at,
    request_quantity,
    status
  ) values (
    trim(p_requester_name),
    lower(trim(p_requester_email)),
    trim(p_requester_phone),
    trim(p_patient_name),
    nullif(trim(p_patient_condition), ''),
    trim(p_donation_location),
    trim(p_district),
    p_blood_group,
    p_planned_donation_at,
    p_request_quantity,
    p_status
  )
  returning * into r;

  return r;
end;
$$;

grant execute on function public.bloodhero_insert_request_public(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  int,
  text
) to anon, authenticated;

-- Retire email-scoped lookup (one email could map to many requests).
revoke execute on function public.bloodhero_tracker_requests(text) from anon, authenticated;
drop function if exists public.bloodhero_tracker_requests(text);

create or replace function public.bloodhero_tracker_by_tracking_number(p_tracking_number text)
returns setof public.bloodhero_requests
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from public.bloodhero_requests r
  where upper(trim(r.tracking_number)) = upper(trim(p_tracking_number))
  limit 1;
$$;

grant execute on function public.bloodhero_tracker_by_tracking_number(text) to anon, authenticated;
