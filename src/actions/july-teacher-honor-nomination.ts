"use server";

import {
  appendJulyTeacherHonorNominationRow,
  isJulyTeacherHonorSheetsConfigured,
} from "@/lib/july-teacher-honor-google-sheet";
import {
  echoJulyTeacherHonorFieldsFromFormData,
  type JulyTeacherHonorNominationFieldValues,
} from "@/lib/july-teacher-honor-nomination-fields";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { ensureSupabasePublicObjectUrl, getGalleryBucket, sanitizeStorageFileName } from "@/lib/storage";
import {
  julyTeacherHonorNominationFormSchema,
  joinReferenceLinksForSheet,
} from "@/lib/validations/july-teacher-honor-nomination";
import type { ZodError } from "zod";

const MAX_SUPPORTING_BYTES = 10 * 1024 * 1024;
const ALLOWED_SUPPORTING_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/webm",
]);

export type JulyTeacherHonorNominationState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  fieldValues?: JulyTeacherHonorNominationFieldValues;
};

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

async function uploadSupportingFile(file: File): Promise<{ url?: string; error?: string }> {
  if (file.size > MAX_SUPPORTING_BYTES) {
    return { error: "Supporting file must be 10 MB or smaller." };
  }
  const type = (file.type || "application/octet-stream").toLowerCase();
  if (!ALLOWED_SUPPORTING_TYPES.has(type)) {
    return {
      error: "Supporting file must be an image, PDF, or MP4/WebM video.",
    };
  }
  try {
    const storage = createServiceRoleSupabase();
    const bucket = getGalleryBucket();
    const safe = sanitizeStorageFileName(file.name);
    const path = `july-teacher-honor-2026/${Date.now()}-${safe}`;
    const { error: upErr } = await storage.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: type,
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

export async function submitJulyTeacherHonorNomination(
  _prev: JulyTeacherHonorNominationState,
  formData: FormData
): Promise<JulyTeacherHonorNominationState> {
  const echo = () => echoJulyTeacherHonorFieldsFromFormData(formData);

  if (!isJulyTeacherHonorSheetsConfigured()) {
    return {
      error:
        "Teacher honor nominations are not configured. Set JULY_TEACHER_HONOR_GOOGLE_SHEET_ID (and optionally JULY_TEACHER_HONOR_SHEET_TAB), plus GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
      fieldValues: echo(),
    };
  }

  const supporting = formData.get("supportingFile");
  const supportingFile =
    supporting instanceof File && supporting.size > 0 ? supporting : null;

  const parsed = julyTeacherHonorNominationFormSchema.safeParse({
    nominatorFullName: fdStr(formData, "nominatorFullName"),
    nominatorEmail: fdStr(formData, "nominatorEmail"),
    nominatorPhone: fdStr(formData, "nominatorPhone"),
    nominatorUniversity: fdStr(formData, "nominatorUniversity"),
    teacherFullName: fdStr(formData, "teacherFullName"),
    teacherDesignation: fdStr(formData, "teacherDesignation"),
    teacherUniversityName: fdStr(formData, "teacherUniversityName"),
    departmentSubject: fdStr(formData, "departmentSubject"),
    teacherPhone: fdStr(formData, "teacherPhone"),
    teacherEmail: fdStr(formData, "teacherEmail"),
    teacherSocialLink: fdStr(formData, "teacherSocialLink"),
    nominationNarrative: fdStr(formData, "nominationNarrative"),
    referenceLinks: fdStr(formData, "referenceLinks"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error), fieldValues: echo() };
  }

  let supportingUrl = "";
  if (supportingFile) {
    const up = await uploadSupportingFile(supportingFile);
    if (up.error) {
      return { error: up.error, fieldValues: echo() };
    }
    supportingUrl = up.url ?? "";
  }

  const d = parsed.data;
  const row = [
    new Date().toISOString(),
    d.nominatorFullName,
    d.nominatorEmail,
    d.nominatorPhone,
    d.nominatorUniversity,
    d.teacherFullName,
    d.teacherDesignation,
    d.teacherUniversityName,
    d.departmentSubject,
    d.teacherPhone,
    d.teacherEmail,
    d.teacherSocialLink,
    d.nominationNarrative,
    supportingUrl,
    joinReferenceLinksForSheet(d.referenceLinks),
  ];

  const sheet = await appendJulyTeacherHonorNominationRow(row);
  if (!sheet.ok) {
    return { error: sheet.message, fieldValues: echo() };
  }

  return { success: true };
}
