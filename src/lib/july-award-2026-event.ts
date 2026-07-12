/**
 * Canonical when/where for July Uprising Memorial Award 2026.
 * Import wherever date, time, venue, or maps links are shown.
 */
/** Programme window (24h clock) — order-of-day slots are laid out across this span. */
export const JULY_AWARD_2026_DAY_CLOCK = {
  start: "15:00",
  end: "19:00",
} as const;

export const JULY_AWARD_2026_EVENT_DETAILS = {
  dateLabel: "Monday, 13 July 2026",
  dateShortLabel: "13 July 2026",
  /** Appreciation Partner card footer VENUE column. */
  participationCardVenueShortLabel: "National Museum · Dhaka",
  timeLabel: `${JULY_AWARD_2026_DAY_CLOCK.start}\u2013${JULY_AWARD_2026_DAY_CLOCK.end}`,
  venueLabel: "Shahid Zia Auditorium, Bangladesh National Museum",
  cityLabel: "Dhaka, Bangladesh",
  audienceLabel: "~1,500 Attendees",
  durationLabel: "4 hours",
} as const;

/** Save-the-date map card: two display lines (match venue / area copy on the programme page). */
export const JULY_AWARD_2026_VENUE_CALLOUT = {
  primary: "Shahid Zia Auditorium",
  secondary: "Bangladesh National Museum · Shahbag, Dhaka",
} as const;

/** Official Google Maps short link for the pinned venue location. */
export const JULY_AWARD_2026_VENUE_MAP_SHARE_URL =
  "https://maps.app.goo.gl/s44WrKAKM3oPeKmQ7" as const;

/** Place string for embed + iframe title (resolved from share link target). */
export const JULY_AWARD_2026_VENUE_MAP_SEARCH_QUERY =
  "Bangladesh National Museum, Shahbagh Rd, Dhaka 1000";

export function julyAward2026VenueMapEmbedUrl(): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(JULY_AWARD_2026_VENUE_MAP_SEARCH_QUERY)}&z=18&hl=en&output=embed`;
}

export function julyAward2026VenueMapOpenUrl(): string {
  return JULY_AWARD_2026_VENUE_MAP_SHARE_URL;
}

export function julyAward2026MapIframeTitle(): string {
  return `Interactive map: ${JULY_AWARD_2026_VENUE_MAP_SEARCH_QUERY}`;
}

/** Hero kicker line after “Memorial programme · …” */
export function julyAward2026HeroCityTag(): string {
  const city = JULY_AWARD_2026_EVENT_DETAILS.cityLabel.split(",")[0]?.trim() ?? "Dhaka";
  return city;
}

/** Appreciation Partner card generator — footer DATE / VENUE ledger. */
export function julyAward2026ParticipationCardLedger(): {
  dateLabel: string;
  venueLabel: string;
} {
  const d = JULY_AWARD_2026_EVENT_DETAILS;
  return { dateLabel: d.dateShortLabel, venueLabel: d.participationCardVenueShortLabel };
}

/** Events index featured card: date + time on one line. */
export function julyAward2026EventsSignatureDateLine(): string {
  const d = JULY_AWARD_2026_EVENT_DETAILS;
  return `${d.dateLabel} · ${d.timeLabel}`;
}

/** Events index featured card: venue + city on one line. */
export function julyAward2026EventsSignatureLocationLine(): string {
  const d = JULY_AWARD_2026_EVENT_DETAILS;
  return `${d.venueLabel} · ${d.cityLabel}`;
}

function clockToMinutes(clock: string): number {
  const [h, m] = clock.split(":").map((x) => Number.parseInt(x, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function minutesToClock(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Minute offsets from `JULY_AWARD_2026_DAY_CLOCK.start` (same block lengths as the legacy 0:00–4:00 plan). */
const JULY_AWARD_2026_PROGRAM_OFFSETS: readonly {
  startMin: number;
  endMin: number;
  title: string;
  description: string;
}[] = [
  { startMin: 0, endMin: 15, title: "Arrival & registration", description: "Guests settle; quiet visuals carry the tone before words begin." },
  { startMin: 15, endMin: 25, title: "Opening", description: "Welcome, national anthem, and a short film that roots us in why we are here." },
  { startMin: 25, endMin: 50, title: "Memorial tribute", description: "Shaheed families from private universities—gifts, flowers, and a few restrained speeches." },
  { startMin: 50, endMin: 80, title: "Injured students", description: "Crests and moments at the mic for students who still carry July on their bodies." },
  { startMin: 80, endMin: 105, title: "Teachers' honour", description: "Twenty faculty members receive crest and certificate for standing beside students in 2024." },
  { startMin: 105, endMin: 130, title: "Guests", description: "Invited speakers—three to five minutes each—bridging memory and responsibility." },
  { startMin: 130, endMin: 185, title: "Club excellence awards", description: "Ten categories; thirty clubs named—winner, first runner-up, second runner-up." },
  { startMin: 185, endMin: 205, title: "Culture", description: "Three cultural clubs—the strongest submissions—perform songs that belong to July." },
  { startMin: 205, endMin: 215, title: "Volunteers", description: "The people behind badges and cables step forward for thanks." },
  { startMin: 215, endMin: 240, title: "Closing", description: "Vote of thanks, one photograph with everyone who can fit, then press and departures." },
];

export type JulyAward2026ProgramRow = { time: string; title: string; description: string };

/** Order-of-the-day rows with clock times aligned to `JULY_AWARD_2026_DAY_CLOCK`. */
export function julyAward2026ProgramScheduleRows(): JulyAward2026ProgramRow[] {
  const base = clockToMinutes(JULY_AWARD_2026_DAY_CLOCK.start);
  return JULY_AWARD_2026_PROGRAM_OFFSETS.map((row) => ({
    time: `${minutesToClock(base + row.startMin)}–${minutesToClock(base + row.endMin)}`,
    title: row.title,
    description: row.description,
  }));
}

/** Section blurb for the programme timeline (ties copy to the published window). */
export function julyAward2026ProgramScheduleIntro(): string {
  const w = JULY_AWARD_2026_EVENT_DETAILS.timeLabel;
  return `Arrival through closing—memorial first, honours in the middle, culture before thank-yous. Clock times span the published ${w} window; exact pacing follows stage discipline on the day.`;
}
