-- PUNAB v1 — Run in Supabase SQL Editor after creating the project.
-- Order: run as a single script. Adjust if tables already exist.

-- ---------------------------------------------------------------------------
-- Extensions (gen_random_uuid is available in pgcrypto; enabled by default on Supabase)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Universities & chapters
-- ---------------------------------------------------------------------------
create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  district text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references public.universities (id) on delete set null,
  title text not null,
  description text,
  contact_email text,
  member_count int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles (linked to auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'member' check (role in ('admin', 'member')),
  membership_status text not null default 'pending'
    check (membership_status in ('pending', 'approved', 'rejected')),
  phone text,
  university_id uuid references public.universities (id) on delete set null,
  university_other text,
  department text,
  student_id text,
  session text,
  district text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_membership_status_idx on public.profiles (membership_status);
create index profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Leadership, notices, events
-- ---------------------------------------------------------------------------
create table public.leadership_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  bio text,
  photo_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  excerpt text,
  body text not null default '',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notices_published_idx on public.notices (is_published, published_at desc);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_start_idx on public.events (start_at desc);

-- ---------------------------------------------------------------------------
-- Triggers: updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger universities_updated_at
  before update on public.universities
  for each row execute function public.set_updated_at();

create trigger chapters_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger leadership_members_updated_at
  before update on public.leadership_members
  for each row execute function public.set_updated_at();

create trigger notices_updated_at
  before update on public.notices
  for each row execute function public.set_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New auth user → profile row
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, membership_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'member',
    'pending'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Prevent non-admins from changing role / membership_status
-- ---------------------------------------------------------------------------
create or replace function public.enforce_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) into is_admin;

  if not is_admin then
    new.role := old.role;
    new.membership_status := old.membership_status;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileged
  before update on public.profiles
  for each row execute function public.enforce_profile_privileged_fields();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.universities enable row level security;
alter table public.chapters enable row level security;
alter table public.profiles enable row level security;
alter table public.leadership_members enable row level security;
alter table public.notices enable row level security;
alter table public.events enable row level security;

-- Helper: is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Universities
create policy "Universities are viewable by everyone"
  on public.universities for select
  using (true);

create policy "Universities admin insert"
  on public.universities for insert
  with check (public.is_admin());

create policy "Universities admin update"
  on public.universities for update
  using (public.is_admin());

create policy "Universities admin delete"
  on public.universities for delete
  using (public.is_admin());

-- Chapters
create policy "Published chapters viewable by everyone"
  on public.chapters for select
  using (is_published = true or public.is_admin());

create policy "Chapters admin insert"
  on public.chapters for insert
  with check (public.is_admin());

create policy "Chapters admin update"
  on public.chapters for update
  using (public.is_admin());

create policy "Chapters admin delete"
  on public.chapters for delete
  using (public.is_admin());

-- Profiles
create policy "Profiles select own or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Profiles update own or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- Notices
create policy "Notices published viewable"
  on public.notices for select
  using (is_published = true or public.is_admin());

create policy "Notices admin write"
  on public.notices for insert
  with check (public.is_admin());

create policy "Notices admin update"
  on public.notices for update
  using (public.is_admin());

create policy "Notices admin delete"
  on public.notices for delete
  using (public.is_admin());

-- Events
create policy "Events published viewable"
  on public.events for select
  using (is_published = true or public.is_admin());

create policy "Events admin write"
  on public.events for insert
  with check (public.is_admin());

create policy "Events admin update"
  on public.events for update
  using (public.is_admin());

create policy "Events admin delete"
  on public.events for delete
  using (public.is_admin());

-- Leadership
create policy "Leadership published viewable"
  on public.leadership_members for select
  using (is_published = true or public.is_admin());

create policy "Leadership admin write"
  on public.leadership_members for insert
  with check (public.is_admin());

create policy "Leadership admin update"
  on public.leadership_members for update
  using (public.is_admin());

create policy "Leadership admin delete"
  on public.leadership_members for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: member photos (public bucket)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do nothing;

create policy "Member photos public read"
  on storage.objects for select
  using (bucket_id = 'member-photos');

create policy "Users upload own member photo"
  on storage.objects for insert
  with check (
    bucket_id = 'member-photos'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  );

create policy "Users update own member photo"
  on storage.objects for update
  using (
    bucket_id = 'member-photos'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  );

create policy "Users delete own member photo"
  on storage.objects for delete
  using (
    bucket_id = 'member-photos'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  );

create policy "Admin full access member photos"
  on storage.objects for all
  using (bucket_id = 'member-photos' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed placeholder universities (optional)
-- ---------------------------------------------------------------------------
insert into public.universities (name, slug, district) values
  ('University of Dhaka', 'du', 'Dhaka'),
  ('Bangladesh University of Engineering and Technology', 'buet', 'Dhaka'),
  ('University of Chittagong', 'cu', 'Chittagong')
on conflict (slug) do nothing;

-- Supabase grants default privileges on public tables; RLS enforces access.

-- ---------------------------------------------------------------------------
-- BloodHero: NOT included in this file. Run supabase/migrations/005_bloodhero_donors.sql
-- (then 006–013 in order) in the SQL Editor — see SETUP.md.
-- ---------------------------------------------------------------------------
