-- Refresh homepage hero copy for databases that already ran 002 (seed used ON CONFLICT DO NOTHING).
insert into public.site_settings (key, value) values
  ('hero.title', 'Private University National Association of Bangladesh — PUNAB'),
  ('hero.subtitle', E'PUNAB is the national association for private university communities—students, teachers, and alumni. Formed in the spirit of unity and sacrifice that defined Bangladesh''s 2024 movement, we align institutions, strengthen student leadership, and coordinate national-level action on higher education.\n\nWe speak for private university communities across the country: one network with shared standards, open procedures, and a clear mandate to represent the sector responsibly.'),
  ('hero.cta_primary', 'Become a Member'),
  ('hero.cta_secondary', 'Who we are')
on conflict (key) do update set value = excluded.value, updated_at = now();
