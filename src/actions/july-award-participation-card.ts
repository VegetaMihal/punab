"use server";

import { z } from "zod";
import { fallbackJulyAwardPartnerNo } from "@/lib/marketing/july-award-partner-number";
import {
  getOrCreateJulyAwardAppreciationPartner,
  isJulyAwardSheetsConfigured,
} from "@/lib/july-award-google-sheet";
import { findJulyAwardClubCardByClubAndUniversity } from "@/lib/repositories/july-award-club-card";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";

const allocateSchema = z.object({
  clubName: z.string().trim().min(1, "Club name is required"),
  universityName: z.string().trim().min(1, "University name is required"),
});

const lookupSchema = z.object({
  clubName: z.string().trim().min(1),
  universityName: z.string().trim().min(1),
});

export type AllocatePartnerNoState =
  | { ok: true; partnerNo: string }
  | { ok: false; error: string };

export async function allocateJulyAwardPartnerNo(
  input: unknown
): Promise<AllocatePartnerNoState> {
  const parsed = allocateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors[0] ?? "Invalid input." };
  }

  const { clubName, universityName } = parsed.data;

  if (!isJulyAwardSheetsConfigured()) {
    return {
      ok: true,
      partnerNo: fallbackJulyAwardPartnerNo(clubName, universityName),
    };
  }

  const res = await getOrCreateJulyAwardAppreciationPartner(clubName, universityName);
  if (!res.ok) {
    return { ok: false, error: res.message };
  }

  return { ok: true, partnerNo: res.partnerNo };
}

export type LookupJulyAwardClubCardState =
  | { ok: true; found: false }
  | {
      ok: true;
      found: true;
      clubName: string;
      universityName: string;
      logoUrl: string;
    }
  | { ok: false; error: string };

/** Public participation card: load saved club row when names match a nomination. */
export async function lookupJulyAwardClubCardForParticipation(
  input: unknown
): Promise<LookupJulyAwardClubCardState> {
  const parsed = lookupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }

  const row = await findJulyAwardClubCardByClubAndUniversity(
    parsed.data.clubName,
    parsed.data.universityName
  );
  if (!row) {
    return { ok: true, found: false };
  }

  return {
    ok: true,
    found: true,
    clubName: row.club_name.trim(),
    universityName: row.university_name.trim(),
    logoUrl: ensureSupabasePublicObjectUrl(row.logo_url.trim()),
  };
}
