"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import {
  getOrCreateJulyAwardAppreciationPartner,
  isJulyAwardSheetsConfigured,
} from "@/lib/july-award-google-sheet";
import {
  isJulyAwardDebateClubCard,
  JULY_AWARD_DEBATE_PARTNER_LABEL,
} from "@/lib/marketing/july-award-debate";
import { fallbackJulyAwardPartnerNo } from "@/lib/marketing/july-award-partner-number";
import { getJulyAwardClubCardById, updateJulyAwardClubCard } from "@/lib/repositories/july-award-club-card";
import { purgeJulyAwardClubCard } from "@/lib/repositories/july-award-club-purge";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { ensureSupabasePublicObjectUrl, getGalleryBucket, sanitizeStorageFileName } from "@/lib/storage";

const MAX_CLUB_LOGO_BYTES = 10 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function assertJulyAwardCardsAdmin() {
  try {
    await assertAdminScope("july_award_cards");
  } catch {
    return { ok: false as const, error: "You do not have permission to manage July Award cards." };
  }
  return { ok: true as const };
}

async function uploadAdminClubLogo(file: File): Promise<{ url?: string; error?: string }> {
  if (file.size > MAX_CLUB_LOGO_BYTES) {
    return { error: "Logo must be 10 MB or smaller." };
  }
  const type = (file.type || "application/octet-stream").toLowerCase();
  if (!ALLOWED_LOGO_TYPES.has(type)) {
    return { error: "Logo must be JPEG, PNG, WebP, or GIF." };
  }
  try {
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const safe = sanitizeStorageFileName(file.name);
    const path = `july-award-2026/admin/logo/${Date.now()}-${safe}`;
    const { error: upErr } = await storage.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: type,
      cacheControl: "31536000",
    });
    if (upErr) {
      return { error: upErr.message };
    }
    const { data: pub } = storage.storage.from(bucket).getPublicUrl(path);
    return { url: ensureSupabasePublicObjectUrl(pub.publicUrl) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Logo upload failed." };
  }
}

function revalidateParticipationCardsAdmin() {
  revalidatePath("/admin/july-award/participation-cards");
}

const loadSchema = z.object({
  id: z.string().uuid("Invalid entry id."),
});

export type LoadJulyAwardParticipationCardAdminState =
  | {
      ok: true;
      clubName: string;
      universityName: string;
      logoUrl: string;
      partnerNo: string;
    }
  | { ok: false; error: string };

export async function loadJulyAwardParticipationCardForAdmin(
  input: unknown
): Promise<LoadJulyAwardParticipationCardAdminState> {
  const auth = await assertJulyAwardCardsAdmin();
  if (!auth.ok) {
    return auth;
  }

  const parsed = loadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors[0] ?? "Invalid input." };
  }

  const row = await getJulyAwardClubCardById(parsed.data.id);
  if (!row) {
    return { ok: false, error: "Club entry not found." };
  }

  const clubName = row.club_name.trim();
  const universityName = row.university_name.trim();

  if (isJulyAwardDebateClubCard(row)) {
    return {
      ok: true,
      clubName,
      universityName,
      logoUrl: ensureSupabasePublicObjectUrl(row.logo_url.trim()),
      partnerNo: row.partner_label?.trim() || JULY_AWARD_DEBATE_PARTNER_LABEL,
    };
  }

  let partnerNo = fallbackJulyAwardPartnerNo(clubName, universityName);

  if (isJulyAwardSheetsConfigured()) {
    const partnerRes = await getOrCreateJulyAwardAppreciationPartner(clubName, universityName);
    if (!partnerRes.ok) {
      return { ok: false, error: partnerRes.message };
    }
    partnerNo = partnerRes.partnerNo;
  }

  return {
    ok: true,
    clubName,
    universityName,
    logoUrl: ensureSupabasePublicObjectUrl(row.logo_url.trim()),
    partnerNo,
  };
}

const deleteSchema = z.object({
  id: z.string().uuid("Invalid entry id."),
});

export type DeleteJulyAwardClubCardAdminState = { ok: true } | { ok: false; error: string };

export async function deleteJulyAwardClubCardAdmin(
  input: unknown
): Promise<DeleteJulyAwardClubCardAdminState> {
  const auth = await assertJulyAwardCardsAdmin();
  if (!auth.ok) {
    return auth;
  }

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors[0] ?? "Invalid input." };
  }

  const existing = await getJulyAwardClubCardById(parsed.data.id);
  if (!existing) {
    return { ok: false, error: "Club entry not found." };
  }

  const res = await purgeJulyAwardClubCard({
    id: parsed.data.id,
    clubName: existing.club_name,
    universityName: existing.university_name,
    logoUrl: existing.logo_url,
  });
  if (!res.ok) {
    return { ok: false, error: res.message };
  }

  revalidateParticipationCardsAdmin();
  return { ok: true };
}

const updateFieldsSchema = z.object({
  id: z.string().uuid("Invalid entry id."),
  clubName: z.string().trim().min(1, "Club name is required."),
  universityName: z.string().trim().min(1, "University name is required."),
});

export type UpdateJulyAwardClubCardAdminState = { ok: true } | { ok: false; error: string };

export async function updateJulyAwardClubCardAdmin(
  _prev: UpdateJulyAwardClubCardAdminState | undefined,
  formData: FormData
): Promise<UpdateJulyAwardClubCardAdminState> {
  void _prev;
  const auth = await assertJulyAwardCardsAdmin();
  if (!auth.ok) {
    return auth;
  }

  const parsed = updateFieldsSchema.safeParse({
    id: formData.get("id")?.toString(),
    clubName: formData.get("clubName")?.toString(),
    universityName: formData.get("universityName")?.toString(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors[0] ?? "Invalid input." };
  }

  const existing = await getJulyAwardClubCardById(parsed.data.id);
  if (!existing) {
    return { ok: false, error: "Club entry not found." };
  }

  let logoUrl = ensureSupabasePublicObjectUrl(existing.logo_url.trim());
  const logoFile = formData.get("logoFile");
  if (logoFile instanceof File && logoFile.size > 0) {
    const up = await uploadAdminClubLogo(logoFile);
    if (up.error) {
      return { ok: false, error: up.error };
    }
    logoUrl = up.url ?? logoUrl;
  }

  const res = await updateJulyAwardClubCard({
    id: parsed.data.id,
    clubName: parsed.data.clubName,
    universityName: parsed.data.universityName,
    logoUrl,
  });
  if (!res.ok) {
    return { ok: false, error: res.message };
  }

  revalidateParticipationCardsAdmin();
  return { ok: true };
}
