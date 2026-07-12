-- BloodHero admin setting: donor auto approval (new registrations only).
-- Uses key/value JSON model so additional BloodHero-only settings can be added without schema churn.

create table if not exists public.bloodhero_settings (
  key text primary key,
  value_json jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.bloodhero_settings is
  'BloodHero module settings (key/value JSON), separate from main PUNAB settings.';

create or replace function public.bloodhero_settings_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bloodhero_settings_set_updated_at_trg on public.bloodhero_settings;
create trigger bloodhero_settings_set_updated_at_trg
  before update on public.bloodhero_settings
  for each row execute function public.bloodhero_settings_set_updated_at();

insert into public.bloodhero_settings (key, value_json)
values ('donor_auto_approval', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;

alter table public.bloodhero_settings enable row level security;

drop policy if exists bloodhero_settings_select_admin on public.bloodhero_settings;
create policy bloodhero_settings_select_admin
  on public.bloodhero_settings
  for select
  to authenticated
  using (public.is_bloodhero_admin());

drop policy if exists bloodhero_settings_insert_admin on public.bloodhero_settings;
create policy bloodhero_settings_insert_admin
  on public.bloodhero_settings
  for insert
  to authenticated
  with check (public.is_bloodhero_admin());

drop policy if exists bloodhero_settings_update_admin on public.bloodhero_settings;
create policy bloodhero_settings_update_admin
  on public.bloodhero_settings
  for update
  to authenticated
  using (public.is_bloodhero_admin())
  with check (public.is_bloodhero_admin());

grant select, insert, update on public.bloodhero_settings to authenticated;

create or replace function public.bloodhero_donor_auto_approval_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (s.value_json ->> 'enabled')::boolean
     from public.bloodhero_settings s
     where s.key = 'donor_auto_approval'
     limit 1),
    false
  );
$$;

grant execute on function public.bloodhero_donor_auto_approval_enabled() to anon, authenticated;

create or replace function public.bloodhero_register_donor(
  p_full_name text,
  p_email text,
  p_phone text,
  p_blood_group text,
  p_district text,
  p_last_donated_date date,
  p_available_now boolean
)
returns table (
  donor_id uuid,
  donor_status text,
  donor_email text,
  donor_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  v_status := case
    when public.bloodhero_donor_auto_approval_enabled() then 'active'
    else 'pending'
  end;

  return query
  insert into public.bloodhero_donors (
    full_name,
    email,
    phone,
    blood_group,
    district,
    last_donated_date,
    available_now,
    status,
    block_until,
    total_successful_donations
  )
  values (
    p_full_name,
    p_email,
    p_phone,
    p_blood_group,
    p_district,
    p_last_donated_date,
    p_available_now,
    v_status,
    null,
    0
  )
  returning id, status, email, full_name;
end;
$$;

grant execute on function public.bloodhero_register_donor(
  text, text, text, text, text, date, boolean
) to anon, authenticated;
