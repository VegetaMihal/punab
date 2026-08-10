-- Fix: bloodhero_request_notifications and bloodhero_request_events had RLS enabled
-- (010, 007) but no policy was ever added, so admin select always returned 0 rows
-- (silent, no error). bloodhero_donors/bloodhero_requests got this in 015; these two
-- tables were missed. Rollback: drop the two policies below.

create policy bloodhero_request_notifications_bh_admin_select
  on public.bloodhero_request_notifications
  for select
  to authenticated
  using (public.is_bloodhero_admin());

create policy bloodhero_request_events_bh_admin_select
  on public.bloodhero_request_events
  for select
  to authenticated
  using (public.is_bloodhero_admin());
