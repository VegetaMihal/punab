"use server";

import {
  appendJulyAwardNominationRow,
  getOrCreateJulyAwardAppreciationPartner,
  isJulyAwardSheetsConfigured,
} from "@/lib/july-award-google-sheet";
import { fallbackJulyAwardPartnerNo } from "@/lib/marketing/july-award-partner-number";
import { getJulyAwardCategoryByKey, isValidJulyAwardCategoryKey } from "@/lib/july-award-2026-clubs";
import { sendJulyAwardNominationNotifyEmail } from "@/lib/marketing/july-award-nomination-notify-email";
import {
  type JulyAwardNominationStagedUploads,
  stagedUploadsFromFormData,
} from "@/lib/marketing/july-award-nomination-staging";
import { insertJulyAwardClubCard } from "@/lib/repositories/july-award-club-card";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { ensureSupabasePublicObjectUrl, getGalleryBucket, sanitizeStorageFileName } from "@/lib/storage";
import {
  echoJulyAwardNominationFieldsFromFormData,
  type JulyAwardNominationFieldValues,
} from "@/lib/july-award-nomination-fields";
import type { JulyAwardParticipationPrefill } from "@/lib/marketing/july-award-participation-prefill";
import {
  hasJulyAwardSupportingDocument,
  julyAwardNominationFormSchema,
  JULY_AWARD_FACULTY_ROLE_LABEL,
  JULY_AWARD_SUPPORTING_DOCUMENTS_REQUIRED_MSG,
  joinDriveLinksForSheet,
} from "@/lib/validations/july-award-nomination";
import {
  julyAwardLogoContentType,
  validateJulyAwardLogoFile,
  validateJulyAwardPdfFile,
} from "@/lib/marketing/july-award-nomination-upload";
import type { ZodError } from "zod";

export type JulyAwardNominationState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  fieldValues?: JulyAwardNominationFieldValues;
  /** URLs already uploaded before a later step failed — client resubmits without re-picking files. */
  stagedUploads?: JulyAwardNominationStagedUploads;
  participationPrefill?: JulyAwardParticipationPrefill;
};

function failureState(
  base: Omit<JulyAwardNominationState, "stagedUploads">,
  staged?: JulyAwardNominationStagedUploads
): JulyAwardNominationState {
  if (!staged?.logoUrl && !staged?.supportingPdfUrl) {
    return base;
  }
  return { ...base, stagedUploads: staged };
}

function fdStr(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

function flattenFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path[0];
    if (typeof k === "string" && !out[k]) {
      out[k] = i.message;
    }
  }
  return out;
}

async function uploadJulyAwardFile(params: {
  categoryKey: string;
  subfolder: "logo" | "supporting-pdf";
  file: File;
  contentType: string;
}): Promise<{ url?: string; error?: string }> {
  try {
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const safe = sanitizeStorageFileName(params.file.name);
    const path = `july-award-2026/${params.categoryKey}/${params.subfolder}/${Date.now()}-${safe}`;
    const { error: upErr } = await storage.storage.from(bucket).upload(path, params.file, {
      upsert: false,
      contentType: params.contentType,
      cacheControl: "31536000",
    });
    if (upErr) {
      const msg = upErr.message.toLowerCase().includes("bucket not found")
        ? `Storage bucket "${bucket}" not found in Supabase.`
        : upErr.message;
      return { error: msg };
    }
    const { data: pub } = storage.storage.from(bucket).getPublicUrl(path);
    return { url: ensureSupabasePublicObjectUrl(pub.publicUrl) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}

export async function submitJulyAwardNomination(
  categoryKey: string,
  _prev: JulyAwardNominationState,
  formData: FormData
): Promise<JulyAwardNominationState> {
  const echo = () => echoJulyAwardNominationFieldsFromFormData(formData);

  if (!isValidJulyAwardCategoryKey(categoryKey)) {
    return { error: "Invalid category.", fieldValues: echo() };
  }
  if (!isJulyAwardSheetsConfigured()) {
    return {
      error:
        "Nominations are not configured. Set JULY_AWARD_GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
      fieldValues: echo(),
    };
  }

  const staged = stagedUploadsFromFormData(formData);

  const logoField = formData.get("clubLogoFile");
  const logoFile = logoField instanceof File && logoField.size > 0 ? logoField : null;
  const stagedLogoUrl = staged.logoUrl ?? null;

  const pdfField = formData.get("supportingPdf");
  const supportingPdf = pdfField instanceof File && pdfField.size > 0 ? pdfField : null;
  const stagedPdfUrl = staged.supportingPdfUrl ?? null;

  if (!logoFile && !stagedLogoUrl) {
    return failureState(
      {
        fieldErrors: {
          clubLogoFile: "Club logo is required. Upload a JPEG, PNG, WebP, or GIF (max 10 MB).",
        },
        fieldValues: echo(),
      },
      staged
    );
  }

  const parsed = julyAwardNominationFormSchema.safeParse({
    clubName: fdStr(formData, "clubName"),
    universityName: fdStr(formData, "universityName"),
    clubSocialLink: fdStr(formData, "clubSocialLink"),
    yearEstablished: fdStr(formData, "yearEstablished"),
    communicationEmail: fdStr(formData, "communicationEmail"),
    mobileNumber: fdStr(formData, "mobileNumber"),
    activeMembersApprox: fdStr(formData, "activeMembersApprox"),
    eventsLast12Months: fdStr(formData, "eventsLast12Months"),
    presidentName: fdStr(formData, "presidentName"),
    facultyRole: fdStr(formData, "facultyRole"),
    facultyContactName: fdStr(formData, "facultyContactName"),
    facultyContactMobile: fdStr(formData, "facultyContactMobile"),
    supportingDriveLinks: fdStr(formData, "supportingDriveLinks"),
  });

  if (!parsed.success) {
    return failureState(
      { fieldErrors: flattenFieldErrors(parsed.error), fieldValues: echo() },
      staged
    );
  }

  const hasPdf = Boolean(supportingPdf || stagedPdfUrl);
  if (!hasJulyAwardSupportingDocument(parsed.data.supportingDriveLinks, hasPdf)) {
    return failureState(
      {
        fieldErrors: {
          supportingDriveLinks: JULY_AWARD_SUPPORTING_DOCUMENTS_REQUIRED_MSG,
          supportingPdf: JULY_AWARD_SUPPORTING_DOCUMENTS_REQUIRED_MSG,
        },
        fieldValues: echo(),
      },
      staged
    );
  }

  const driveCell = joinDriveLinksForSheet(parsed.data.supportingDriveLinks);

  let logoUrl = stagedLogoUrl ?? "";
  if (logoFile) {
    const logoValidation = validateJulyAwardLogoFile(logoFile);
    if (logoValidation) {
      return failureState(
        { fieldErrors: { clubLogoFile: logoValidation }, fieldValues: echo() },
        staged
      );
    }
    const logoUp = await uploadJulyAwardFile({
      categoryKey,
      subfolder: "logo",
      file: logoFile,
      contentType: julyAwardLogoContentType(logoFile),
    });
    if (logoUp.error) {
      return failureState(
        { fieldErrors: { clubLogoFile: logoUp.error }, fieldValues: echo() },
        staged
      );
    }
    logoUrl = logoUp.url ?? "";
  }

  const uploadsAfterLogo: JulyAwardNominationStagedUploads = { logoUrl, supportingPdfUrl: stagedPdfUrl ?? undefined };

  let pdfUrl = stagedPdfUrl ?? "";
  if (supportingPdf) {
    const pdfValidation = validateJulyAwardPdfFile(supportingPdf);
    if (pdfValidation) {
      return failureState(
        { fieldErrors: { supportingPdf: pdfValidation }, fieldValues: echo() },
        uploadsAfterLogo
      );
    }
    const pdfUp = await uploadJulyAwardFile({
      categoryKey,
      subfolder: "supporting-pdf",
      file: supportingPdf,
      contentType: "application/pdf",
    });
    if (pdfUp.error) {
      return failureState(
        { fieldErrors: { supportingPdf: pdfUp.error }, fieldValues: echo() },
        uploadsAfterLogo
      );
    }
    pdfUrl = pdfUp.url ?? "";
  }

  const uploadsAfterFiles: JulyAwardNominationStagedUploads = {
    logoUrl,
    supportingPdfUrl: pdfUrl || undefined,
  };

  const d = parsed.data;

  const clubCard = await insertJulyAwardClubCard({
    clubName: d.clubName,
    universityName: d.universityName,
    logoUrl,
  });
  if (!clubCard.ok) {
    const missingTable =
      /july_award_club_cards|schema cache/i.test(clubCard.message);
    if (!missingTable) {
      return failureState({ error: clubCard.message, fieldValues: echo() }, uploadsAfterFiles);
    }
    // assumed: run supabase/migrations/023_july_award_club_cards.sql — nomination still saves via Storage + Sheets
  }

  const row = [
    new Date().toISOString(),
    d.clubName,
    d.universityName,
    d.clubSocialLink,
    logoUrl,
    d.mobileNumber,
    d.yearEstablished ?? "",
    d.communicationEmail,
    d.activeMembersApprox ?? "",
    d.eventsLast12Months,
    d.presidentName ?? "",
    JULY_AWARD_FACULTY_ROLE_LABEL[d.facultyRole],
    d.facultyContactName,
    d.facultyContactMobile,
    driveCell,
    pdfUrl,
  ];

  const sheet = await appendJulyAwardNominationRow(categoryKey, row);
  if (!sheet.ok) {
    return failureState({ error: sheet.message, fieldValues: echo() }, uploadsAfterFiles);
  }

  let partnerNo = fallbackJulyAwardPartnerNo(d.clubName, d.universityName);
  if (isJulyAwardSheetsConfigured()) {
    const partnerRes = await getOrCreateJulyAwardAppreciationPartner(d.clubName, d.universityName);
    if (!partnerRes.ok) {
      return failureState({ error: partnerRes.message, fieldValues: echo() }, uploadsAfterFiles);
    }
    partnerNo = partnerRes.partnerNo;
  }

  const category = getJulyAwardCategoryByKey(categoryKey);
  void sendJulyAwardNominationNotifyEmail({
    categoryKey,
    categoryName: category?.name ?? categoryKey,
    partnerNo,
    submittedAtIso: row[0] as string,
    clubName: d.clubName,
    universityName: d.universityName,
    clubSocialLink: d.clubSocialLink,
    logoUrl,
    mobileNumber: d.mobileNumber,
    yearEstablished: d.yearEstablished,
    communicationEmail: d.communicationEmail,
    activeMembersApprox: d.activeMembersApprox,
    eventsLast12Months: d.eventsLast12Months,
    presidentName: d.presidentName,
    facultyRoleLabel: JULY_AWARD_FACULTY_ROLE_LABEL[d.facultyRole],
    facultyContactName: d.facultyContactName,
    facultyContactMobile: d.facultyContactMobile,
    supportingDriveLinks: driveCell,
    supportingPdfUrl: pdfUrl,
  });

  return {
    success: true,
    participationPrefill: {
      clubName: d.clubName,
      universityName: d.universityName,
      logoUrl,
      partnerNo,
    },
  };
}
