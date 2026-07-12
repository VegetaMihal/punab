/** Supabase table `july_award_club_cards` — club card registry (logo in Storage). */
export type JulyAwardClubCardRow = {
  id: string;
  club_name: string;
  university_name: string;
  logo_url: string;
  category_key: string | null;
  partner_label: string | null;
  created_at: string;
};

/** Supabase table `bloodhero_donors` — insert via `registerBloodHeroDonor` server action. */
export type BloodHeroDonorRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  blood_group: string;
  district: string;
  center_point_address: string | null;
  center_point_lat: number | null;
  center_point_lng: number | null;
  district_or_area: string | null;
  last_donated_date: string | null;
  available_now: boolean;
  status: "pending" | "active" | "rejected" | "paused";
  block_until: string | null;
  total_successful_donations: number;
  created_at: string;
  updated_at: string;
};

/** Supabase table `bloodhero_request_notifications` — matching queue; email + donor responses. */
export type BloodHeroRequestNotificationRow = {
  id: string;
  request_id: string;
  donor_id: string;
  sent_at: string | null;
  responded_at: string | null;
  response_status: "pending" | "accepted" | "declined" | "expired";
  /** Set when donor confirms via signed link (accept | block_1m | block_2m | block_3m). */
  response_action: "accept" | "block_1m" | "block_2m" | "block_3m" | null;
  created_at: string;
};

/** Supabase table `bloodhero_requests` — insert via `submitBloodHeroRequest` server action. */
export type BloodHeroRequestRow = {
  id: string;
  tracking_number: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  patient_name: string;
  patient_condition: string | null;
  donation_location: string;
  donation_location_address: string | null;
  donation_location_lat: number | null;
  donation_location_lng: number | null;
  district: string;
  blood_group: string;
  planned_donation_at: string;
  request_quantity: number;
  status: "open" | "matching" | "fulfilled" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type MembershipStatus = "pending" | "approved" | "rejected";
export type ProfileRole = "admin" | "member";
export type AdminScope = "invitations" | "certificates" | "july_award_cards" | "july_award_participants";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: ProfileRole;
  admin_scopes: AdminScope[];
  membership_status: MembershipStatus;
  phone: string | null;
  university_id: string | null;
  university_other: string | null;
  department: string | null;
  student_id: string | null;
  session: string | null;
  district: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type University = {
  id: string;
  name: string;
  slug: string | null;
  district: string | null;
  created_at: string;
  updated_at: string;
};

export type Chapter = {
  id: string;
  university_id: string | null;
  title: string;
  description: string | null;
  contact_email: string | null;
  member_count: number;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type LeadershipMember = {
  id: string;
  layer_id: string | null;
  name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type LeadershipLayer = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Forum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ForumLabel = {
  id: string;
  forum_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ForumMember = {
  id: string;
  forum_id: string;
  label_id: string | null;
  name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Notice = {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  body: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  location: string | null;
  banner_url: string | null;
  post_url: string | null;
  start_at: string;
  end_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryAlbum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  sort_order: number;
  featured_on_home: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryImage = {
  id: string;
  album_id: string;
  storage_path: string;
  public_url: string;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
  is_featured: boolean;
  is_cover: boolean;
  created_at: string;
  updated_at: string;
};

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CertificateStatus = "DRAFT" | "ISSUED" | "EMAILED" | "REVOKED" | "ARCHIVED";

export type CertificateType =
  | "Participation"
  | "Volunteer"
  | "Leadership"
  | "Membership"
  | "Achievement"
  | "Appreciation"
  | "Club Recognition"
  | "BloodHero"
  | "Training Completion"
  | "Guest Speaker"
  | "Judge"
  | "Campus Ambassador"
  | "Special Recognition"
  | "Competition Winner"
  | "Project Contribution";

export type Certificate = {
  id: string;
  certificateNumber: string;
  certificateTitle: string;
  certificateType: string;
  recipientName: string;
  recipientEmail: string | null;
  universityName: string | null;
  eventName: string | null;
  role: string | null;
  achievement: string | null;
  timePeriod: string | null;
  reason: string;
  issueDate: string;
  templateId: string | null;
  pdfUrl: string | null;
  verificationUrl: string | null;
  status: CertificateStatus;
  signatoryName1: string | null;
  signatoryDesignation1: string | null;
  signatoryName2: string | null;
  signatoryDesignation2: string | null;
  signatorySignature1Url: string | null;
  signatorySignature2Url: string | null;
  customFields: unknown;
  emailSentAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CertificateTemplate = {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  htmlContent: string;
  cssContent: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CertificateEmailLog = {
  id: string;
  certificateId: string;
  recipientEmail: string;
  subject: string | null;
  status: string;
  sentAt: string;
};

export type JulyMemorialInvitationResponseStatus = "CONFIRMED" | "MAYBE" | "NO";

export type JulyMemorialInvitation = {
  id: string;
  templateSlug: string;
  recipientName: string;
  recipientDesignation: string;
  recipientInstitution: string;
  contactPerson: string;
  specialContact: string;
  isChiefGuest: boolean;
  responseStatus: JulyMemorialInvitationResponseStatus;
  pdfGeneratedAt: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};
