-- Reserved layer for /leadership/honorary (slug must stay `honorary`; see src/lib/leadership-constants.ts)
insert into public.leadership_layers (title, slug, description, sort_order, is_published)
values (
  'Honorary Position',
  'honorary',
  'Distinguished honorary roles and advisors.',
  100,
  false
)
on conflict (slug) do nothing;
