"use server";

import { cookies } from "next/headers";
import {
  findJulyParticipantByTicketId,
  markJulyParticipantCheckedIn,
} from "@/lib/july-participant-google-sheet";

const JULY_AWARD_VOLUNTEER_COOKIE = "july_award_volunteer";
/** Scope value meaning "no club restriction" — the shared master passcode. */
const ALL_CLUBS_SCOPE = "__ALL__";

function masterPasscode(): string | null {
  return process.env.JULY_AWARD_VOLUNTEER_PASSCODE?.trim() || null;
}

/** Per-club passcodes: JULY_AWARD_CLUB_PASSCODES='{"Club A":"code1","Club B":"code2"}' */
function clubPasscodes(): Record<string, string> {
  const raw = process.env.JULY_AWARD_CLUB_PASSCODES?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, string>;
  } catch {
    // assumed: malformed env value — treat as no per-club passcodes rather than crash
  }
  return {};
}

/** Matches an entered passcode against the master passcode or a club passcode. Returns the scope to store, or null. */
function matchPasscode(entered: string): string | null {
  if (masterPasscode() && entered === masterPasscode()) return ALL_CLUBS_SCOPE;
  const clubs = clubPasscodes();
  const club = Object.keys(clubs).find((name) => clubs[name] === entered);
  return club ?? null;
}

export type VolunteerPasscodeState = { error?: string };

/** Gate: volunteers enter a shared or club passcode once; sets an httpOnly cookie scoped to their club for the rest of the event. */
export async function submitJulyAwardVolunteerPasscode(
  _prev: VolunteerPasscodeState,
  formData: FormData
): Promise<VolunteerPasscodeState> {
  if (!masterPasscode() && Object.keys(clubPasscodes()).length === 0) {
    return { error: "Volunteer access is not configured. Set JULY_AWARD_VOLUNTEER_PASSCODE or JULY_AWARD_CLUB_PASSCODES." };
  }
  const entered = formData.get("passcode")?.toString().trim() ?? "";
  const scope = matchPasscode(entered);
  if (!scope) {
    return { error: "Incorrect passcode." };
  }
  const jar = await cookies();
  jar.set(JULY_AWARD_VOLUNTEER_COOKIE, scope, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 16,
    path: "/",
  });
  return {};
}

/** Returns the authenticated volunteer's club, ALL_CLUBS_SCOPE for master access, or null if unauthenticated. */
export async function getVolunteerScope(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(JULY_AWARD_VOLUNTEER_COOKIE)?.value;
  if (!value) return null;
  if (value === ALL_CLUBS_SCOPE) return masterPasscode() ? ALL_CLUBS_SCOPE : null;
  return clubPasscodes()[value] === undefined ? null : value;
}

export async function isVolunteerAuthenticated(): Promise<boolean> {
  return (await getVolunteerScope()) !== null;
}

/** Clears the volunteer cookie so a different club/master passcode can be entered. */
export async function logoutJulyAwardVolunteer(): Promise<void> {
  const jar = await cookies();
  jar.delete(JULY_AWARD_VOLUNTEER_COOKIE);
}

export type TicketLookupResult =
  | { ok: true; found: true; ticketId: string; fullName: string; universityName: string; clubName: string; phoneNumber: string; photoUrl: string; checkedInAt: string }
  | { ok: true; found: false }
  | { ok: false; error: string };

export async function lookupJulyAwardTicket(ticketId: string): Promise<TicketLookupResult> {
  const scope = await getVolunteerScope();
  if (!scope) return { ok: false, error: "Not authenticated." };
  const result = await findJulyParticipantByTicketId(ticketId);
  if (!result.ok) return { ok: false, error: result.message };
  if (!result.row) return { ok: true, found: false };
  if (scope !== ALL_CLUBS_SCOPE && result.row.clubName !== scope) {
    return { ok: false, error: `This ticket belongs to ${result.row.clubName || "another club"}, not your club.` };
  }
  return {
    ok: true,
    found: true,
    ticketId: result.row.ticketId,
    fullName: result.row.fullName,
    universityName: result.row.universityName,
    clubName: result.row.clubName,
    phoneNumber: result.row.phoneNumber,
    photoUrl: result.row.photoUrl,
    checkedInAt: result.row.checkedInAt,
  };
}

export type CheckInState = { ok?: true; checkedInAt?: string; alreadyCheckedIn?: boolean; error?: string };

export async function checkInJulyAwardTicket(
  _prev: CheckInState,
  formData: FormData
): Promise<CheckInState> {
  const scope = await getVolunteerScope();
  if (!scope) {
    return { error: "Not authenticated." };
  }
  const ticketId = formData.get("ticketId")?.toString().trim() ?? "";
  if (!ticketId) return { error: "Missing ticket id." };
  if (scope !== ALL_CLUBS_SCOPE) {
    const found = await findJulyParticipantByTicketId(ticketId);
    if (!found.ok) return { error: found.message };
    if (!found.row) return { error: "Ticket not found." };
    if (found.row.clubName !== scope) {
      return { error: `This ticket belongs to ${found.row.clubName || "another club"}, not your club.` };
    }
  }
  const result = await markJulyParticipantCheckedIn(ticketId);
  if (!result.ok) return { error: result.message };
  return { ok: true, checkedInAt: result.checkedInAt, alreadyCheckedIn: result.alreadyCheckedIn };
}
