-- Rollback: drop table public.july_award_club_cards;

-- Minimal club card data for participation cards (logo in Storage; metadata here).
-- Full nomination fields live in Google Sheets only.

create table if not exists public.july_award_club_cards (
  id uuid primary key default gen_random_uuid(),
  club_name text not null,
  university_name text not null,
  logo_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists july_award_club_cards_lookup_idx
  on public.july_award_club_cards (
    lower(trim(club_name)),
    lower(trim(university_name))
  );

alter table public.july_award_club_cards enable row level security;
