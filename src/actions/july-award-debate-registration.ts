"use server";

import {
  JULY_AWARD_DEBATE_CATEGORY_KEY,
  JULY_AWARD_DEBATE_PARTNER_LABEL,
} from "@/lib/marketing/july-award-debate";
import type { JulyAwardParticipationPrefill } from "@/lib/marketing/july-award-participation-prefill";
import {
  getJulyAwardUploadFile,
  julyAwardLogoContentType,
  validateJulyAwardLogoFileServer,
} from "@/lib/marketing/july-award-nomination-upload";
import { insertJulyAwardClubCard } from "@/lib/repositories/july-award-club-card";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { ensureSupabasePublicObjectUrl, getGalleryBucket, sanitizeStorageFileName } from "@/lib/storage";
import { z } from "zod";

const debateRegistrationSchema = z.object({
  clubName: z.string().trim().min(1, "Club name is required"),
  universityName: z.string().trim().min(1, "University name is required"),
});

export type JulyAwardDebateRegistrationState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  fieldValues?: { clubName: string; universityName: string };
  participationPrefill?: JulyAwardParticipationPrefill;
};

async function uploadDebateClubLogo(file: File): Promise<{ url?: string; error?: string }> {
  const validation = await validateJulyAwardLogoFileServer(file);
  if (validation) {
    return { error: validation };
  }
  try {
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const safe = sanitizeStorageFileName(file.name);
    const path = `july-award-2026/${JULY_AWARD_DEBATE_CATEGORY_KEY}/logo/${Date.now()}-${safe}`;
    const { error: upErr } = await storage.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: julyAwardLogoContentType(file),
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

export async function submitJulyAwardDebateRegistration(
  _prev: JulyAwardDebateRegistrationState,
  formData: FormData
): Promise<JulyAwardDebateRegistrationState> {
  const fieldValues = {
    clubName: formData.get("clubName")?.toString() ?? "",
    universityName: formData.get("universityName")?.toString() ?? "",
  };

  const logoFile = getJulyAwardUploadFile(formData, "clubLogoFile");
  if (!logoFile) {
    return {
      fieldErrors: { clubLogoFile: "Club logo is required (image, max 10 MB)." },
      fieldValues,
    };
  }

  const parsed = debateRegistrationSchema.safeParse(fieldValues);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors, fieldValues };
  }

  const logoUp = await uploadDebateClubLogo(logoFile);
  if (logoUp.error) {
    return { fieldErrors: { clubLogoFile: logoUp.error }, fieldValues };
  }

  const clubCard = await insertJulyAwardClubCard({
    clubName: parsed.data.clubName,
    universityName: parsed.data.universityName,
    logoUrl: logoUp.url ?? "",
    categoryKey: JULY_AWARD_DEBATE_CATEGORY_KEY,
    partnerLabel: JULY_AWARD_DEBATE_PARTNER_LABEL,
  });
  if (!clubCard.ok) {
    const missingTable = /july_award_club_cards|schema cache/i.test(clubCard.message);
    if (!missingTable) {
      return { error: clubCard.message, fieldValues };
    }
  }

  return {
    success: true,
    participationPrefill: {
      clubName: parsed.data.clubName,
      universityName: parsed.data.universityName,
      logoUrl: logoUp.url ?? "",
      partnerNo: JULY_AWARD_DEBATE_PARTNER_LABEL,
      debateForum: true,
    },
  };
}
