-- Leadership layers/groups for dynamic multi-section leadership page

create table if not exists public.leadership_layers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger leadership_layers_updated_at
  before update on public.leadership_layers
  for each row execute function public.set_updated_at();

alter table public.leadership_members
  add column if not exists layer_id uuid references public.leadership_layers (id) on delete set null;

alter table public.leadership_members
  add column if not exists is_published boolean not null default false;

alter table public.leadership_members
  add column if not exists sort_order int not null default 0;

create index if not exists leadership_layers_sort_idx
  on public.leadership_layers (is_published, sort_order);

create index if not exists leadership_members_layer_sort_idx
  on public.leadership_members (layer_id, is_published, sort_order);

-- Backward compatibility:
-- create a default layer and attach legacy leadership members to it.
insert into public.leadership_layers (title, slug, description, sort_order, is_published)
values ('Leadership', 'leadership', 'Default leadership layer migrated from existing records.', 0, true)
on conflict (slug) do nothing;

update public.leadership_members
set layer_id = (select id from public.leadership_layers where slug = 'leadership')
where layer_id is null;

-- RLS
alter table public.leadership_layers enable row level security;

create policy "Leadership layers published read"
  on public.leadership_layers for select
  using (is_published = true or public.is_admin());

create policy "Leadership layers admin insert"
  on public.leadership_layers for insert
  with check (public.is_admin());

create policy "Leadership layers admin update"
  on public.leadership_layers for update
  using (public.is_admin());

create policy "Leadership layers admin delete"
  on public.leadership_layers for delete
  using (public.is_admin());
