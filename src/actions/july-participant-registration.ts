"use server";

import {
  appendJulyParticipantRegistrationRow,
  isJulyParticipantEmailRegistered,
  isJulyParticipantSheetsConfigured,
} from "@/lib/july-participant-google-sheet";
import {
  echoJulyParticipantFieldsFromFormData,
  type JulyParticipantFieldValues,
} from "@/lib/july-participant-fields";
import { julyParticipantRegistrationFormSchema } from "@/lib/validations/july-participant-registration";
import {
  getJulyAwardUploadFile,
  julyAwardLogoContentType,
  validateJulyAwardLogoFileServer,
} from "@/lib/marketing/july-award-nomination-upload";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { ensureSupabasePublicObjectUrl, getGalleryBucket, sanitizeStorageFileName } from "@/lib/storage";
import { buildJulyAwardTicketUrl, generateJulyAwardTicketId } from "@/lib/july-award-2026-ticket";
import { generateJulyAwardTicketQrCodePngBuffer } from "@/lib/july-award-2026-ticket-qr";
import { sendJulyAwardParticipantTicketEmail } from "@/lib/marketing/july-award-participant-ticket-email";
import type { ZodError } from "zod";

export type JulyParticipantRegistrationState = {
  success?: boolean;
  duplicateEmail?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  fieldValues?: JulyParticipantFieldValues;
  photoUrl?: string;
};

const GENERIC_ENTRY_ERROR = "There's a mistake in your entry. Please correct it and apply again.";

function fdStr(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

function flattenFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path[0];
    if (typeof k === "string" && !out[k]) out[k] = i.message;
  }
  return out;
}

async function uploadJulyParticipantPhoto(file: File): Promise<{ url?: string; error?: string }> {
  try {
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const safe = sanitizeStorageFileName(file.name);
    const path = `july-award-2026/participants/${Date.now()}-${safe}`;
    const { error: upErr } = await storage.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: julyAwardLogoContentType(file),
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
    return { error: e instanceof Error ? e.message : "Photo upload failed." };
  }
}

export async function submitJulyParticipantRegistration(
  _prev: JulyParticipantRegistrationState,
  formData: FormData
): Promise<JulyParticipantRegistrationState> {
  try {
    return await submitJulyParticipantRegistrationInner(formData);
  } catch (e) {
    console.error("[july-participant-registration] unexpected failure", e);
    return { error: GENERIC_ENTRY_ERROR, fieldValues: echoJulyParticipantFieldsFromFormData(formData) };
  }
}

async function submitJulyParticipantRegistrationInner(
  formData: FormData
): Promise<JulyParticipantRegistrationState> {
  const echo = () => echoJulyParticipantFieldsFromFormData(formData);

  if (!isJulyParticipantSheetsConfigured()) {
    console.error("[july-participant-registration] Sheets env not configured");
    return { error: GENERIC_ENTRY_ERROR, fieldValues: echo() };
  }

  const withClub = fdStr(formData, "withClub");
  const parsed = julyParticipantRegistrationFormSchema.safeParse({
    fullName: fdStr(formData, "fullName"),
    phoneNumber: fdStr(formData, "phoneNumber"),
    email: fdStr(formData, "email"),
    universityName: fdStr(formData, "universityName"),
    // when not in a club, force "other" mode so the clubName refine is skipped
    clubMode: withClub === "no" ? "other" : (fdStr(formData, "clubMode") === "other" ? "other" : "select"),
    clubName: withClub === "no" ? "" : fdStr(formData, "clubName"),
    departmentOrRole: fdStr(formData, "departmentOrRole"),
    martyrsPledge: fdStr(formData, "martyrsPledge"),
    donatesBlood: fdStr(formData, "donatesBlood"),
    bloodGroup: fdStr(formData, "bloodGroup"),
    attendanceConfirm: fdStr(formData, "attendanceConfirm"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error), fieldValues: echo() };
  }

  const alreadyRegistered = await isJulyParticipantEmailRegistered(parsed.data.email);
  if (alreadyRegistered) {
    return { duplicateEmail: true };
  }

  const photoFile = getJulyAwardUploadFile(formData, "photo");
  if (!photoFile) {
    return { fieldErrors: { photo: "Required" }, fieldValues: echo() };
  }
  const photoErr = await validateJulyAwardLogoFileServer(photoFile);
  if (photoErr) {
    return { fieldErrors: { photo: photoErr }, fieldValues: echo() };
  }
  const uploaded = await uploadJulyParticipantPhoto(photoFile);
  if (!uploaded.url) {
    console.error("[july-participant-registration] photo upload failed", uploaded.error);
    return { error: GENERIC_ENTRY_ERROR, fieldValues: echo() };
  }

  const d = parsed.data;
  const ticketId = generateJulyAwardTicketId();
  const row = [
    new Date().toISOString(),
    d.fullName,
    d.phoneNumber,
    d.email,
    d.universityName,
    d.clubName,
    d.departmentOrRole,
    uploaded.url,
    ticketId,
    "",
    "Yes",
    d.donatesBlood === "yes" ? "Yes" : "No",
    d.donatesBlood === "yes" ? d.bloodGroup : "",
    "Yes",
    "",
  ];

  const sheet = await appendJulyParticipantRegistrationRow(row);
  if (!sheet.ok) {
    console.error("[july-participant-registration] sheet append failed", sheet.message);
    return { error: GENERIC_ENTRY_ERROR, fieldValues: echo() };
  }

  const ticketUrl = buildJulyAwardTicketUrl(ticketId);
  try {
    const qrCodePngBuffer = await generateJulyAwardTicketQrCodePngBuffer(ticketUrl);
    await sendJulyAwardParticipantTicketEmail({
      recipientEmail: d.email,
      fullName: d.fullName,
      universityName: d.universityName,
      clubName: d.clubName,
      phoneNumber: d.phoneNumber,
      ticketId,
      ticketUrl,
      qrCodePngBuffer,
    });
  } catch (e) {
    // Registration + sheet row are already saved — a ticket email failure (rate limit, timeout under
    // load) must not fail the whole submission. Admin can resend the QR manually via /admin/july-award.
    console.error("[july-participant-registration] ticket email failed", e);
  }

  return { success: true, photoUrl: uploaded.url };
}
