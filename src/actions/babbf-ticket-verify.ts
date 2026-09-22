"use server";

import { cookies } from "next/headers";
import { findBabbfRegistrationByReference, markBabbfCheckedIn } from "@/lib/babbf-registration-sheet";
import { BABBF_EVENT_TYPE_LABEL, type BabbfEventType } from "@/lib/validations/babbf-registration";

const BABBF_VOLUNTEER_COOKIE = "babbf_volunteer";

function masterPasscode(): string | null {
  return process.env.BABBF_VOLUNTEER_PASSCODE?.trim() || null;
}

export type VolunteerPasscodeState = { error?: string };

/** Gate: volunteers enter the shared event passcode once; sets an httpOnly cookie scoped for the rest of the event. */
export async function submitBabbfVolunteerPasscode(
  _prev: VolunteerPasscodeState,
  formData: FormData
): Promise<VolunteerPasscodeState> {
  const master = masterPasscode();
  if (!master) {
    return { error: "Volunteer access is not configured. Set BABBF_VOLUNTEER_PASSCODE." };
  }
  const entered = formData.get("passcode")?.toString().trim() ?? "";
  if (entered !== master) {
    return { error: "Incorrect passcode." };
  }
  const jar = await cookies();
  jar.set(BABBF_VOLUNTEER_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 16,
    path: "/",
  });
  return {};
}

export async function isBabbfVolunteerAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(BABBF_VOLUNTEER_COOKIE)?.value === "1";
}

export async function logoutBabbfVolunteer(): Promise<void> {
  const jar = await cookies();
  jar.delete(BABBF_VOLUNTEER_COOKIE);
}

export type BabbfTicketLookupResult =
  | {
      ok: true;
      found: true;
      referenceNumber: string;
      fullName: string;
      eventTypeLabel: string;
      universityName: string;
      category: string;
      status: string;
      photoUrl: string;
      checkedInAt: string;
      checkedInVia: string;
    }
  | { ok: true; found: false }
  | { ok: false; error: string };

export async function lookupBabbfTicket(referenceNumber: string): Promise<BabbfTicketLookupResult> {
  const authed = await isBabbfVolunteerAuthenticated();
  if (!authed) return { ok: false, error: "Not authenticated." };

  const result = await findBabbfRegistrationByReference(referenceNumber);
  if (!result.ok) return { ok: false, error: result.message };
  if (!result.row || !result.sheetEventType) return { ok: true, found: false };

  return {
    ok: true,
    found: true,
    referenceNumber: result.row.referenceNumber,
    fullName: result.row.fullName,
    eventTypeLabel: BABBF_EVENT_TYPE_LABEL[result.sheetEventType as BabbfEventType],
    universityName: result.row.universityName,
    category: result.row.category,
    status: result.row.status,
    photoUrl: result.row.photoUrl,
    checkedInAt: result.row.checkedInAt,
    checkedInVia: result.row.checkedInVia,
  };
}

export type CheckInState = {
  ok?: true;
  checkedInAt?: string;
  alreadyCheckedIn?: boolean;
  error?: string;
};

export async function checkInBabbfTicket(_prev: CheckInState, formData: FormData): Promise<CheckInState> {
  const authed = await isBabbfVolunteerAuthenticated();
  if (!authed) return { error: "Not authenticated." };

  const referenceNumber = formData.get("referenceNumber")?.toString().trim() ?? "";
  if (!referenceNumber) return { error: "Missing reference number." };

  const result = await markBabbfCheckedIn(referenceNumber, "Volunteer scan");
  if (!result.ok) return { error: result.message };
  return { ok: true, checkedInAt: result.checkedInAt, alreadyCheckedIn: result.alreadyCheckedIn };
}
