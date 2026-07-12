/** Fallback when DB has no row yet — keep in sync with supabase/migrations/002 seed */
export const SITE_DEFAULTS: Record<string, string> = {
  "hero.title": "Private University National Association of Bangladesh — PUNAB",
  "hero.subtitle":
    "PUNAB is the national association for private university communities—students, teachers, and alumni. Formed in the spirit of unity and sacrifice that defined Bangladesh's 2024 movement, we align institutions, strengthen student leadership, and coordinate national-level action on higher education.\n\nWe speak for private university communities across the country: one network with shared standards, open procedures, and a clear mandate to represent the sector responsibly.",
  "hero.cta_primary": "Become a Member",
  "hero.cta_secondary": "July Award 2026",
  "hero.image_url": "",
  "home.cta_title": "Join the national association",
  "home.cta_body":
    "Register, complete your membership application, and connect with students, faculty, and alumni across Bangladesh's private universities. The secretariat reviews each application.",
  "home.who_title": "Who we are",
  "home.who_body":
    "PUNAB is the national association for private university communities—students, teachers, and alumni. Formed in the spirit of unity and sacrifice that defined Bangladesh's 2024 movement, we align institutions, strengthen student leadership, and coordinate national-level action on higher education.",
  "home.who_body_2":
    "We speak for private university communities across the country: one network with shared standards, open procedures, and a clear mandate to represent the sector responsibly.",
  "home.mission_title": "Our mission",
  "home.mission_body":
    "We uphold national interests, constitutional principles, and good governance in the private university sector. PUNAB raises academic standards and accountability through advocacy, collaboration, and dialogue—equipping leaders who serve Bangladesh with discipline and integrity.",
  "home.vision_title": "Our vision",
  "home.vision_body":
    "Private universities should be centres of excellence, innovation, and civic duty. By uniting campuses and their people, PUNAB helps steer higher education toward outcomes that benefit a prosperous, just Bangladesh.",
  "home.coord_title": "Coordination and voice",
  "home.coord_body":
    "PUNAB runs chapter coordination, develops student leaders, and maintains one national channel for programmes and announcements. Events, notices, and campaigns are published here so institutions and members stay aligned—without duplicating effort campus by campus.",
  "home.coord_bullet_1": "Chapter coordination across institutions",
  "home.coord_bullet_2": "Membership review with transparent status",
  "home.coord_bullet_3": "Events, notices, and updates in one place",
  "home.featured_label": "Official updates",
  "home.featured_title": "Where to watch for news",
  "home.featured_body":
    "Time-sensitive statements and flagship programmes are announced through this site. Use Notices for documents and letters, and Events for dates and venues.",
  "footer.blurb":
    "Private University National Association of Bangladesh: the national association for students, teachers, and alumni of private universities—coordination, educational development, and leadership across the sector.",
  "footer.address": "PUNAB office, 4th Floor, Lift #5, Chillox Building, Bashundhara, Dhaka",
  "footer.email": "punabofficial@gmail.com",
  "contact.intro":
    "Organizational, partnership, membership, and media inquiries—reach the secretariat directly or use the form.",
  "contact.welcome":
    "Students, university offices, partners, and supporters are welcome. State your affiliation and purpose so the secretariat can route your message.",
  "contact.form_note": "Brief, specific subject lines help us respond faster.",
  "join.intro":
    "National membership for students, teachers, and alumni who commit to PUNAB's mandate—collaboration, leadership, and sector-wide responsibility.",
  "join.body":
    "Create an account, then submit the application below. The secretariat reviews every file and records a decision: pending, approved, or rejected. You may update details while a decision is pending.",
  "about.intro":
    "PUNAB represents students, teachers, and alumni of private universities nationwide. Rooted in the unity and sacrifice of Bangladesh's 2024 movement, the association brings those communities under one mandate: stronger collaboration, higher academic standards, and student leadership that carries weight beyond the campus gate.",
  "about.vision":
    "We want private universities recognised as centres of excellence, innovation, and social responsibility—institutions that train leaders and citizens for Bangladesh's next decades. Unity across campuses is how we get there.",
  "about.values":
    "Integrity and transparency in how we operate and communicate\nInclusion across institutions—no campus left out of the conversation\nStudent leadership backed by faculty and alumni participation\nNational responsibility: what we say and do reflects on the sector\nCollaboration and rigour in academic and organisational work",
  "about.mission":
    "Unite private university communities; defend constitutional values and good governance; and equip students, teachers, and alumni to advance education and national development with clear accountability.",
  "about.media":
    "Coverage has included DBC News, Somoy, Dhaka Post, Ekhon TV, Dainik Amader Desh, New Age, and other outlets reporting on PUNAB's work.",
  "july_award.registration_open": "true",
};

export function getSetting(map: Record<string, string>, key: string): string {
  const v = map[key];
  if (v !== undefined && v !== "") {
    return v;
  }
  return SITE_DEFAULTS[key] ?? "";
}
