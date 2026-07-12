-- BloodHero Phase 3: location fields + distance-aware matching.
-- Safe to run on environments where some columns already exist.

alter table if exists public.bloodhero_donors
  add column if not exists center_point_address text,
  add column if not exists center_point_lat double precision,
  add column if not exists center_point_lng double precision,
  add column if not exists district_or_area text;

alter table if exists public.bloodhero_requests
  add column if not exists donation_location_address text,
  add column if not exists donation_location_lat double precision,
  add column if not exists donation_location_lng double precision;

create index if not exists bloodhero_donors_center_point_lat_lng_idx
  on public.bloodhero_donors (center_point_lat, center_point_lng);

create index if not exists bloodhero_requests_donation_location_lat_lng_idx
  on public.bloodhero_requests (donation_location_lat, donation_location_lng);

comment on column public.bloodhero_donors.center_point_address is
  'Primary donation-point address used for geocoding and distance ranking.';
comment on column public.bloodhero_donors.center_point_lat is
  'Latitude for donor center donation point.';
comment on column public.bloodhero_donors.center_point_lng is
  'Longitude for donor center donation point.';
comment on column public.bloodhero_donors.district_or_area is
  'Optional district/area label for filtering and admin views.';

comment on column public.bloodhero_requests.donation_location_address is
  'Normalized donation location address for matching.';
comment on column public.bloodhero_requests.donation_location_lat is
  'Latitude of donation location.';
comment on column public.bloodhero_requests.donation_location_lng is
  'Longitude of donation location.';
