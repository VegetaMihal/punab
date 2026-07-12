-- PUNAB MVP schema + seed
-- Paste this file into Supabase SQL editor on a clean project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  district text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'member' check (role in ('admin', 'member')),
  membership_status text not null default 'pending' check (membership_status in ('pending', 'approved', 'rejected')),
  phone text,
  university_id uuid references public.universities(id) on delete set null,
  university_other text,
  department text,
  student_id text,
  session text,
  district text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SECURITY DEFINER: must read profiles without re-entering RLS on profiles (avoids
-- "stack depth limit exceeded" when policies use is_admin()).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references public.universities(id) on delete set null,
  title text not null,
  description text,
  contact_email text,
  member_count int not null default 0,
  image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leadership_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  bio text,
  photo_url text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  excerpt text,
  body text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  location text,
  banner_url text,
  start_at timestamptz not null,
  end_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  featured_on_home boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  caption text,
  alt_text text,
  sort_order int not null default 0,
  is_featured boolean not null default false,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists universities_updated_at on public.universities;
create trigger universities_updated_at before update on public.universities for each row execute function public.set_updated_at();
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists chapters_updated_at on public.chapters;
create trigger chapters_updated_at before update on public.chapters for each row execute function public.set_updated_at();
drop trigger if exists leadership_members_updated_at on public.leadership_members;
create trigger leadership_members_updated_at before update on public.leadership_members for each row execute function public.set_updated_at();
drop trigger if exists notices_updated_at on public.notices;
create trigger notices_updated_at before update on public.notices for each row execute function public.set_updated_at();
drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
drop trigger if exists gallery_albums_updated_at on public.gallery_albums;
create trigger gallery_albums_updated_at before update on public.gallery_albums for each row execute function public.set_updated_at();
drop trigger if exists gallery_images_updated_at on public.gallery_images;
create trigger gallery_images_updated_at before update on public.gallery_images for each row execute function public.set_updated_at();
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

alter table public.universities enable row level security;
alter table public.profiles enable row level security;
alter table public.chapters enable row level security;
alter table public.leadership_members enable row level security;
alter table public.notices enable row level security;
alter table public.events enable row level security;
alter table public.site_settings enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;

drop policy if exists "universities public read" on public.universities;
create policy "universities public read" on public.universities for select using (true);
drop policy if exists "universities admin write" on public.universities;
create policy "universities admin write" on public.universities for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "profiles own read or admin" on public.profiles;
create policy "profiles own read or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles own insert or admin" on public.profiles;
create policy "profiles own insert or admin" on public.profiles for insert with check (id = auth.uid() or public.is_admin());
drop policy if exists "profiles own update or admin" on public.profiles;
create policy "profiles own update or admin" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists "profiles admin delete" on public.profiles;
create policy "profiles admin delete" on public.profiles for delete using (public.is_admin());

drop policy if exists "chapters published read" on public.chapters;
create policy "chapters published read" on public.chapters for select using (is_published = true or public.is_admin());
drop policy if exists "chapters admin write" on public.chapters;
create policy "chapters admin write" on public.chapters for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leadership published read" on public.leadership_members;
create policy "leadership published read" on public.leadership_members for select using (is_published = true or public.is_admin());
drop policy if exists "leadership admin write" on public.leadership_members;
create policy "leadership admin write" on public.leadership_members for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "notices published read" on public.notices;
create policy "notices published read" on public.notices for select using (is_published = true or public.is_admin());
drop policy if exists "notices admin write" on public.notices;
create policy "notices admin write" on public.notices for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "events published read" on public.events;
create policy "events published read" on public.events for select using (is_published = true or public.is_admin());
drop policy if exists "events admin write" on public.events;
create policy "events admin write" on public.events for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "site settings public read" on public.site_settings;
create policy "site settings public read" on public.site_settings for select using (true);
drop policy if exists "site settings admin write" on public.site_settings;
create policy "site settings admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gallery albums published read" on public.gallery_albums;
create policy "gallery albums published read" on public.gallery_albums for select using (is_published = true or public.is_admin());
drop policy if exists "gallery albums admin write" on public.gallery_albums;
create policy "gallery albums admin write" on public.gallery_albums for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gallery images visible read" on public.gallery_images;
create policy "gallery images visible read" on public.gallery_images for select using (
  public.is_admin()
  or exists (
    select 1
    from public.gallery_albums a
    where a.id = album_id and a.is_published = true
  )
);
drop policy if exists "gallery images admin write" on public.gallery_images;
create policy "gallery images admin write" on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());

insert into public.universities (name, slug, district) values
  ('North South University', 'north-south-university', 'Dhaka'),
  ('BRAC University', 'brac-university', 'Dhaka'),
  ('Independent University, Bangladesh', 'independent-university-bangladesh', 'Dhaka')
on conflict (name) do nothing;

insert into public.chapters (university_id, title, description, contact_email, member_count, is_published)
select u.id, 'NSU Chapter', 'Campus chapter for NSU members.', 'nsu@punab.org', 120, true
from public.universities u where u.slug = 'north-south-university'
on conflict do nothing;

insert into public.chapters (university_id, title, description, contact_email, member_count, is_published)
select u.id, 'BRACU Chapter', 'Campus chapter for BRAC University members.', 'bracu@punab.org', 95, true
from public.universities u where u.slug = 'brac-university'
on conflict do nothing;

insert into public.leadership_members (name, position, bio, sort_order, is_published) values
  ('Ahsan Rahman', 'President', 'Leads national coordination and policy engagement.', 1, true),
  ('Nabila Islam', 'General Secretary', 'Coordinates chapter communication and programs.', 2, true),
  ('Farhan Kabir', 'Organizing Secretary', 'Supports membership growth and events.', 3, true)
on conflict do nothing;

insert into public.notices (title, slug, excerpt, body, is_published, published_at) values
  ('Official Committee Circular 2026', 'official-committee-circular-2026', 'Circular regarding chapter reporting process.', 'All chapters must submit monthly reports by the 5th of each month.', true, now() - interval '7 days'),
  ('Membership Verification Window', 'membership-verification-window', 'Verification process and document checklist.', 'Members are requested to verify profile and university details this month.', true, now() - interval '2 days')
on conflict (slug) do nothing;

insert into public.events (title, slug, description, location, start_at, end_at, is_published) values
  ('National Student Leadership Forum', 'national-student-leadership-forum', 'Discussion on student leadership and coordination.', 'Dhaka', now() + interval '14 days', now() + interval '14 days 4 hours', true),
  ('Chapter Coordination Workshop', 'chapter-coordination-workshop', 'Operations workshop for chapter representatives.', 'Online', now() + interval '21 days', now() + interval '21 days 2 hours', true)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('hero.title', 'Private University National Association of Bangladesh'),
  ('hero.subtitle', 'A national platform for private university communities.'),
  ('footer.address', 'PUNAB office, Bashundhara, Dhaka'),
  ('footer.email', 'punabofficial@gmail.com'),
  ('about.intro', 'PUNAB unites students, teachers, and alumni across private universities.'),
  ('contact.intro', 'Reach the secretariat for organizational and partnership communication.')
on conflict (key) do update set value = excluded.value;

insert into public.gallery_albums (title, slug, description, is_published, sort_order, featured_on_home)
values ('National Activities', 'national-activities', 'Photos from national PUNAB programs.', true, 1, true)
on conflict (slug) do nothing;

insert into public.gallery_images (album_id, storage_path, public_url, caption, alt_text, sort_order, is_featured, is_cover)
select a.id, 'seed/national-1.jpg', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop', 'Opening session', 'Opening session at PUNAB event', 1, true, true
from public.gallery_albums a where a.slug = 'national-activities'
on conflict do nothing;

insert into public.gallery_images (album_id, storage_path, public_url, caption, alt_text, sort_order, is_featured, is_cover)
select a.id, 'seed/national-2.jpg', 'https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=1200&auto=format&fit=crop', 'Panel discussion', 'Panel discussion with student leaders', 2, true, false
from public.gallery_albums a where a.slug = 'national-activities'
on conflict do nothing;

insert into public.gallery_images (album_id, storage_path, public_url, caption, alt_text, sort_order, is_featured, is_cover)
select a.id, 'seed/national-3.jpg', 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=1200&auto=format&fit=crop', 'Networking segment', 'Participants networking at event venue', 3, false, false
from public.gallery_albums a where a.slug = 'national-activities'
on conflict do nothing;
