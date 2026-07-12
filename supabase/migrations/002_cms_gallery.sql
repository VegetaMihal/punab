-- PUNAB CMS + Gallery — run after base schema.sql
-- Adds: site_settings, pages, gallery_albums, gallery_images; extends events/chapters; storage buckets + RLS

-- ---------------------------------------------------------------------------
-- Site settings (key → value text blocks)
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS gallery_albums_updated_at ON public.gallery_albums;
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Editable pages (optional full pages / blog)
-- ---------------------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  meta_description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

create index if not exists pages_slug_idx on public.pages (slug);
create index if not exists pages_published_idx on public.pages (is_published);

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------
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

create trigger gallery_albums_updated_at
  before update on public.gallery_albums
  for each row execute function public.set_updated_at();

create index if not exists gallery_albums_published_idx on public.gallery_albums (is_published, sort_order);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums (id) on delete cascade,
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
DROP TRIGGER IF EXISTS gallery_images_updated_at ON public.gallery_images;
create trigger gallery_images_updated_at
  before update on public.gallery_images
  for each row execute function public.set_updated_at();

create index if not exists gallery_images_album_idx on public.gallery_images (album_id, sort_order);

-- ---------------------------------------------------------------------------
-- Extend events & chapters for media
-- ---------------------------------------------------------------------------
alter table public.events add column if not exists banner_url text;
alter table public.chapters add column if not exists image_url text;

-- ---------------------------------------------------------------------------
-- RLS: site_settings — public read (marketing copy only; no secrets in this table)
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;

create policy "Site settings public read"
  on public.site_settings for select
  using (true);

create policy "Site settings admin write"
  on public.site_settings for insert
  with check (public.is_admin());

create policy "Site settings admin update"
  on public.site_settings for update
  using (public.is_admin());

create policy "Site settings admin delete"
  on public.site_settings for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RLS: pages
-- ---------------------------------------------------------------------------
alter table public.pages enable row level security;

create policy "Pages published read"
  on public.pages for select
  using (is_published = true or public.is_admin());

create policy "Pages admin insert"
  on public.pages for insert
  with check (public.is_admin());

create policy "Pages admin update"
  on public.pages for update
  using (public.is_admin());

create policy "Pages admin delete"
  on public.pages for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RLS: gallery
-- ---------------------------------------------------------------------------
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;

create policy "Gallery albums published read"
  on public.gallery_albums for select
  using (is_published = true or public.is_admin());

create policy "Gallery albums admin write"
  on public.gallery_albums for insert
  with check (public.is_admin());

create policy "Gallery albums admin update"
  on public.gallery_albums for update
  using (public.is_admin());

create policy "Gallery albums admin delete"
  on public.gallery_albums for delete
  using (public.is_admin());

create policy "Gallery images read if album visible"
  on public.gallery_images for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.gallery_albums a
      where a.id = album_id and a.is_published = true
    )
  );

create policy "Gallery images admin insert"
  on public.gallery_images for insert
  with check (public.is_admin());

create policy "Gallery images admin update"
  on public.gallery_images for update
  using (public.is_admin());

create policy "Gallery images admin delete"
  on public.gallery_images for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('gallery', 'gallery', true),
  ('event-banners', 'event-banners', true),
  ('chapter-images', 'chapter-images', true),
  ('site-assets', 'site-assets', true),
  ('leadership-photos', 'leadership-photos', true)
on conflict (id) do nothing;

-- Gallery: admin uploads under {album_id}/
create policy "Gallery public read"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Gallery admin insert"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "Gallery admin update"
  on storage.objects for update
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "Gallery admin delete"
  on storage.objects for delete
  using (bucket_id = 'gallery' and public.is_admin());

-- Event banners
create policy "Event banners public read"
  on storage.objects for select
  using (bucket_id = 'event-banners');

create policy "Event banners admin insert"
  on storage.objects for insert
  with check (bucket_id = 'event-banners' and public.is_admin());

create policy "Event banners admin update"
  on storage.objects for update
  using (bucket_id = 'event-banners' and public.is_admin())
  with check (bucket_id = 'event-banners' and public.is_admin());

create policy "Event banners admin delete"
  on storage.objects for delete
  using (bucket_id = 'event-banners' and public.is_admin());

-- Chapter images
create policy "Chapter images public read"
  on storage.objects for select
  using (bucket_id = 'chapter-images');

create policy "Chapter images admin insert"
  on storage.objects for insert
  with check (bucket_id = 'chapter-images' and public.is_admin());

create policy "Chapter images admin update"
  on storage.objects for update
  using (bucket_id = 'chapter-images' and public.is_admin())
  with check (bucket_id = 'chapter-images' and public.is_admin());

create policy "Chapter images admin delete"
  on storage.objects for delete
  using (bucket_id = 'chapter-images' and public.is_admin());

-- Site assets (hero, etc.)
create policy "Site assets public read"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "Site assets admin insert"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_admin());

create policy "Site assets admin update"
  on storage.objects for update
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

create policy "Site assets admin delete"
  on storage.objects for delete
  using (bucket_id = 'site-assets' and public.is_admin());

-- Leadership photos (admin-managed; public read)
create policy "Leadership photos public read"
  on storage.objects for select
  using (bucket_id = 'leadership-photos');

create policy "Leadership photos admin insert"
  on storage.objects for insert
  with check (bucket_id = 'leadership-photos' and public.is_admin());

create policy "Leadership photos admin update"
  on storage.objects for update
  using (bucket_id = 'leadership-photos' and public.is_admin())
  with check (bucket_id = 'leadership-photos' and public.is_admin());

create policy "Leadership photos admin delete"
  on storage.objects for delete
  using (bucket_id = 'leadership-photos' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed default site copy (safe to re-run)
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('hero.title', 'Private University National Association of Bangladesh — PUNAB'),
  ('hero.subtitle', E'PUNAB is the national association for private university communities—students, teachers, and alumni. Formed in the spirit of unity and sacrifice that defined Bangladesh''s 2024 movement, we align institutions, strengthen student leadership, and coordinate national-level action on higher education.\n\nWe speak for private university communities across the country: one network with shared standards, open procedures, and a clear mandate to represent the sector responsibly.'),
  ('hero.cta_primary', 'Become a Member'),
  ('hero.cta_secondary', 'Who we are'),
  ('hero.image_url', ''),
  ('home.cta_title', 'Join the national association'),
  ('home.cta_body', 'Register, complete your membership application, and connect with students, faculty, and alumni across Bangladesh''s private universities. The secretariat reviews each application.'),
  ('home.who_title', 'Who we are'),
  ('home.who_body', 'PUNAB is the national association for private university communities—students, teachers, and alumni. Formed in the spirit of unity and sacrifice that defined Bangladesh''s 2024 movement, we align institutions, strengthen student leadership, and coordinate national-level action on higher education.'),
  ('home.who_body_2', 'We speak for private university communities across the country: one network with shared standards, open procedures, and a clear mandate to represent the sector responsibly.'),
  ('home.mission_title', 'Our mission'),
  ('home.mission_body', 'We uphold national interests, constitutional principles, and good governance in the private university sector. PUNAB raises academic standards and accountability through advocacy, collaboration, and dialogue—equipping leaders who serve Bangladesh with discipline and integrity.'),
  ('home.vision_title', 'Our vision'),
  ('home.vision_body', 'Private universities should be centres of excellence, innovation, and civic duty. By uniting campuses and their people, PUNAB helps steer higher education toward outcomes that benefit a prosperous, just Bangladesh.'),
  ('home.coord_title', 'Coordination and voice'),
  ('home.coord_body', 'PUNAB runs chapter coordination, develops student leaders, and maintains one national channel for programmes and announcements. Events, notices, and campaigns are published here so institutions and members stay aligned—without duplicating effort campus by campus.'),
  ('home.coord_bullet_1', 'Chapter coordination across institutions'),
  ('home.coord_bullet_2', 'Membership review with transparent status'),
  ('home.coord_bullet_3', 'Events, notices, and updates in one place'),
  ('home.featured_label', 'Official updates'),
  ('home.featured_title', 'Where to watch for news'),
  ('home.featured_body', 'Time-sensitive statements and flagship programmes are announced through this site. Use Notices for documents and letters, and Events for dates and venues.'),
  ('footer.blurb', 'Private University National Association of Bangladesh: the national association for students, teachers, and alumni of private universities—coordination, educational development, and leadership across the sector.'),
  ('footer.address', 'PUNAB office, 4th Floor, Lift #5, Chillox Building, Bashundhara, Dhaka'),
  ('footer.email', 'punabofficial@gmail.com'),
  ('contact.intro', 'Organizational, partnership, membership, and media inquiries—reach the secretariat directly or use the form.'),
  ('contact.welcome', 'Students, university offices, partners, and supporters are welcome. State your affiliation and purpose so the secretariat can route your message.'),
  ('contact.form_note', 'Brief, specific subject lines help us respond faster.'),
  ('join.intro', 'National membership for students, teachers, and alumni who commit to PUNAB''s mandate—collaboration, leadership, and sector-wide responsibility.'),
  ('join.body', 'Create an account, then submit the application below. The secretariat reviews every file and records a decision: pending, approved, or rejected. You may update details while a decision is pending.'),
  ('about.intro', 'PUNAB represents students, teachers, and alumni of private universities nationwide. Rooted in the unity and sacrifice of Bangladesh''s 2024 movement, the association brings those communities under one mandate: stronger collaboration, higher academic standards, and student leadership that carries weight beyond the campus gate.'),
  ('about.vision', 'We want private universities recognised as centres of excellence, innovation, and social responsibility—institutions that train leaders and citizens for Bangladesh''s next decades. Unity across campuses is how we get there.'),
  ('about.values', 'Integrity and transparency in how we operate and communicate\nInclusion across institutions—no campus left out of the conversation\nStudent leadership backed by faculty and alumni participation\nNational responsibility: what we say and do reflects on the sector\nCollaboration and rigour in academic and organisational work'),
  ('about.mission', 'Unite private university communities; defend constitutional values and good governance; and equip students, teachers, and alumni to advance education and national development with clear accountability.'),
  ('about.media', 'Coverage has included DBC News, Somoy, Dhaka Post, Ekhon TV, Dainik Amader Desh, New Age, and other outlets reporting on PUNAB''s work.')
on conflict (key) do nothing;
