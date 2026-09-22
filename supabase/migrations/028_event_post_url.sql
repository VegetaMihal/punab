-- Rollback: alter table public.events drop column if exists post_url;

alter table public.events add column if not exists post_url text;
