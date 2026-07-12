-- BloodHero module administrators (legacy user-id allow-list).
-- Superseded for new installs by 016_bloodhero_admin_unified_access.sql (PUNAB admin OR bloodhero_admin_access by email).
-- If you run 014 then 016, 016 migrates rows from this table and drops it.

create table if not exists public.bloodhero_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.bloodhero_admins is 'BloodHero admin UI only; not used for PUNAB /admin.';

alter table public.bloodhero_admins enable row level security;

drop policy if exists bloodhero_admins_select_self on public.bloodhero_admins;
create policy bloodhero_admins_select_self
  on public.bloodhero_admins
  for select
  to authenticated
  using (user_id = auth.uid());

-- No insert/update/delete for anon or authenticated — add rows via SQL Editor (service role) or a future secure tool.
