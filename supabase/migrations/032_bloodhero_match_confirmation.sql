-- BloodHero: formal match confirmation (Phase 6).
-- Admin picks one accepted notification per request and closes the match.
-- Prerequisite: bloodhero_requests (006), bloodhero_request_notifications (010, 013).

alter table public.bloodhero_requests
  add column if not exists matched_notification_id uuid references public.bloodhero_request_notifications(id),
  add column if not exists matched_at timestamptz;

comment on column public.bloodhero_requests.matched_notification_id is
  'Notification row (donor) admin confirmed as the donor who will/did give blood for this request.';

comment on column public.bloodhero_requests.matched_at is
  'When admin confirmed the match. Cleared if request is reopened.';
