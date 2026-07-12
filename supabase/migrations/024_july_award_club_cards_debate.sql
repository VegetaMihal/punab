-- Rollback:
-- alter table public.july_award_club_cards drop column if exists category_key;
-- alter table public.july_award_club_cards drop column if exists partner_label;

alter table public.july_award_club_cards
  add column if not exists category_key text,
  add column if not exists partner_label text;

create index if not exists july_award_club_cards_category_idx
  on public.july_award_club_cards (category_key)
  where category_key is not null;
