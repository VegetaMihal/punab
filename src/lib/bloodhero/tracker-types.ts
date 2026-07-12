/** Shapes returned by `bloodhero_tracker_*` RPCs (matches `bloodhero_requests` / `bloodhero_request_events`). */

export type BloodHeroTrackerRequestRow = {
  id: string;
  tracking_number: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  patient_name: string;
  patient_condition: string | null;
  donation_location: string;
  district: string;
  blood_group: string;
  planned_donation_at: string;
  request_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type BloodHeroTrackerEventRow = {
  id: string;
  request_id: string;
  event_type: string;
  event_message: string | null;
  metadata: unknown;
  created_at: string;
};
