"use server";

import { cookies } from "next/headers";
import {
  findJulyParticipantByTicketId,
  markJulyParticipantCheckedIn,
} from "@/lib/july-participant-google-sheet";

const JULY_AWARD_VOLUNTEER_COOKIE = "july_award_volunteer";

function requiredPasscode(): string | null {
  return process.env.JULY_AWARD_VOLUNTEER_PASSCODE?.trim() || null;
}

export type VolunteerPasscodeState = { error?: string };

/** Gate: volunteers enter a shared passcode once; sets an httpOnly cookie for the rest of the event. */
export async function submitJulyAwardVolunteerPasscode(
  _prev: VolunteerPasscodeState,
  formData: FormData
): Promise<VolunteerPasscodeState> {
  const expected = requiredPasscode();
  if (!expected) {
    return { error: "Volunteer access is not configured. Set JULY_AWARD_VOLUNTEER_PASSCODE." };
  }
  const entered = formData.get("passcode")?.toString().trim() ?? "";
  if (entered !== expected) {
    return { error: "Incorrect passcode." };
  }
  const jar = await cookies();
  jar.set(JULY_AWARD_VOLUNTEER_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 16,
    path: "/",
  });
  return {};
}

export async function isVolunteerAuthenticated(): Promise<boolean> {
  const expected = requiredPasscode();
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(JULY_AWARD_VOLUNTEER_COOKIE)?.value === expected;
}

export type TicketLookupResult =
  | { ok: true; found: true; ticketId: string; fullName: string; universityName: string; clubName: string; phoneNumber: string; photoUrl: string; checkedInAt: string }
  | { ok: true; found: false }
  | { ok: false; error: string };

export async function lookupJulyAwardTicket(ticketId: string): Promise<TicketLookupResult> {
  const result = await findJulyParticipantByTicketId(ticketId);
  if (!result.ok) return { ok: false, error: result.message };
  if (!result.row) return { ok: true, found: false };
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
  if (!(await isVolunteerAuthenticated())) {
    return { error: "Not authenticated." };
  }
  const ticketId = formData.get("ticketId")?.toString().trim() ?? "";
  if (!ticketId) return { error: "Missing ticket id." };
  const result = await markJulyParticipantCheckedIn(ticketId);
  if (!result.ok) return { error: result.message };
  return { ok: true, checkedInAt: result.checkedInAt, alreadyCheckedIn: result.alreadyCheckedIn };
}
