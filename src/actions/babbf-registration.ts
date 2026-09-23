"use server";

import { randomBytes } from "node:crypto";
import type { ZodError } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { uploadBabbfDocumentFile } from "@/lib/babbf-registration-storage";
import { isBabbfGoogleConfigured } from "@/lib/babbf-registration-google";
import { sendBabbfConfirmationEmail, sendBabbfRegistrationNotifyEmail } from "@/lib/babbf-registration-notify-email";
import { buildBabbfTicketUrl, generateBabbfTicketQrCodePngBuffer } from "@/lib/babbf-registration-ticket";
import {
  appendBabbfRegistrationRow,
  findBabbfRegistrationByEmail,
  findBabbfRegistrationByReference,
  markBabbfCheckedIn,
  markBabbfCheckedOut,
  updateBabbfRegistrationStatus,
} from "@/lib/babbf-registration-sheet";
import {
  babbfRegistrationSchema,
  BABBF_EVENT_TYPE_LABEL,
  BABBF_REGISTRATION_FEE_BDT,
  BABBF_STATUSES,
  type BabbfStatus,
} from "@/lib/validations/babbf-registration";
import type { BabbfSheetEventType } from "@/lib/babbf-registration-google";

export type SubmitBabbfRegistrationState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  fieldValues?: Record<string, string>;
  referenceNumber?: string;
  stagedDocumentUrls?: Record<string, string>;
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

const TEXT_FIELD_KEYS = [
  "fullName",
  "phone",
  "email",
  "universityName",
  "department",
  "gender",
  "eventType",
  "studentCategory",
  "studentIdOrNid",
  "category",
  "bodybuildingClass",
  "physiqueClass",
  "juniorPhysiqueClass",
  "denimClass",
  "rightHandConfirmed",
  "declarationAccepted",
  "bloodGroup",
  "paymentMethod",
  "paymentSenderNumber",
  "transactionId",
] as const;

function echoFields(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of TEXT_FIELD_KEYS) {
    out[key] = fdStr(formData, key);
  }
  return out;
}

async function generateUniqueReferenceNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
    const candidate = `BABBF-2026-${suffix}`;
    const existing = await findBabbfRegistrationByReference(candidate);
    if (existing.ok && !existing.row) {
      return candidate;
    }
  }
  return `BABBF-2026-${Date.now().toString(36).toUpperCase()}`;
}

const DOCUMENT_FIELDS = [
  { formKey: "photoFile", kind: "photo" as const, stagedKey: "photoUrl", required: true },
  { formKey: "paymentProofFile", kind: "payment_proof" as const, stagedKey: "paymentScreenshotUrl", required: true },
];

export async function submitBabbfRegistration(
  _prev: SubmitBabbfRegistrationState,
  formData: FormData
): Promise<SubmitBabbfRegistrationState> {
  const echo = () => echoFields(formData);

  if (!isBabbfGoogleConfigured()) {
    return {
      error:
        "BABBF registration form is not configured. Set BABBF_REGISTRATION_SHEET_ID, BABBF_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL, and BABBF_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
      fieldValues: echo(),
    };
  }

  const rawEventType: BabbfSheetEventType = fdStr(formData, "eventType") === "bodybuilding" ? "bodybuilding" : "armwrestling";

  const email = fdStr(formData, "email").trim();
  if (email) {
    const dup = await findBabbfRegistrationByEmail(rawEventType, email);
    if (dup.ok && dup.row) {
      return {
        error: "This email address has already been registered for this event.",
        fieldValues: echo(),
      };
    }
  }

  const stagedField = formData.get("stagedDocumentUrls");
  const staged: Record<string, string> =
    typeof stagedField === "string" && stagedField ? JSON.parse(stagedField) : {};
  const referenceHint = formData.get("referenceHint")?.toString() || `BABBF-2026-DRAFT-${Date.now().toString(36).toUpperCase()}`;

  // Upload any newly selected documents before validation so a validation error on another
  // field never loses a file the user already picked (file inputs get cleared by the browser
  // after any form submission, success or not).
  const docUrls: Record<string, string> = { ...staged };
  const docErrors: Record<string, string> = {};
  for (const doc of DOCUMENT_FIELDS) {
    if (docUrls[doc.stagedKey]) continue;
    const fileField = formData.get(doc.formKey);
    const file = fileField instanceof File && fileField.size > 0 ? fileField : null;
    if (!file) continue;
    const up = await uploadBabbfDocumentFile(file, referenceHint, doc.kind);
    if (!up.ok) {
      docErrors[doc.formKey] = up.message;
      continue;
    }
    docUrls[doc.stagedKey] = up.url;
  }

  const parsed = babbfRegistrationSchema.safeParse({
    fullName: fdStr(formData, "fullName"),
    phone: fdStr(formData, "phone"),
    email: fdStr(formData, "email"),
    universityName: fdStr(formData, "universityName"),
    department: fdStr(formData, "department"),
    gender: fdStr(formData, "gender"),
    eventType: fdStr(formData, "eventType"),
    studentCategory: fdStr(formData, "studentCategory"),
    studentIdOrNid: fdStr(formData, "studentIdOrNid"),
    category: fdStr(formData, "category"),
    bodybuildingClass: fdStr(formData, "bodybuildingClass"),
    physiqueClass: fdStr(formData, "physiqueClass"),
    juniorPhysiqueClass: fdStr(formData, "juniorPhysiqueClass"),
    denimClass: fdStr(formData, "denimClass"),
    rightHandConfirmed: fdStr(formData, "rightHandConfirmed") === "true" ? "true" : "false",
    declarationAccepted: fdStr(formData, "declarationAccepted") === "true" ? "true" : "false",
    bloodGroup: fdStr(formData, "bloodGroup"),
    paymentMethod: fdStr(formData, "paymentMethod"),
    paymentSenderNumber: fdStr(formData, "paymentSenderNumber"),
    transactionId: fdStr(formData, "transactionId"),
  });

  for (const doc of DOCUMENT_FIELDS) {
    if (doc.required && !docUrls[doc.stagedKey] && !docErrors[doc.formKey]) {
      docErrors[doc.formKey] = "This document is required.";
    }
  }

  if (!parsed.success || Object.keys(docErrors).length > 0) {
    const fieldErrors = parsed.success ? {} : flattenFieldErrors(parsed.error);
    return {
      fieldErrors: { ...fieldErrors, ...docErrors },
      fieldValues: echo(),
      stagedDocumentUrls: docUrls,
    };
  }
  const d = parsed.data;

  const referenceNumber = await generateUniqueReferenceNumber();

  const row = [
    referenceNumber,
    new Date().toISOString(),
    d.fullName,
    d.phone,
    d.email,
    d.universityName,
    d.department,
    d.gender,
    d.eventType,
    d.category,
    d.bloodGroup,
    docUrls.photoUrl ?? "",
    String(BABBF_REGISTRATION_FEE_BDT),
    d.paymentMethod,
    d.transactionId,
    docUrls.paymentScreenshotUrl ?? "",
    "Payment Pending",
    "",
    d.studentCategory,
    d.studentIdOrNid,
    d.rightHandConfirmed,
    d.declarationAccepted,
    d.paymentSenderNumber,
    "",
    "",
    d.bodybuildingClass,
    d.denimClass,
    d.physiqueClass,
    d.juniorPhysiqueClass,
  ];

  const sheet = await appendBabbfRegistrationRow(d.eventType as BabbfSheetEventType, row);
  if (!sheet.ok) {
    return { error: sheet.message, fieldValues: echo(), stagedDocumentUrls: docUrls };
  }

  void sendBabbfRegistrationNotifyEmail({
    referenceNumber,
    fullName: d.fullName,
    email: d.email,
    universityName: d.universityName,
    status: "Payment Pending",
  });

  return { success: true, referenceNumber };
}

export type UpdateBabbfStatusState = {
  success?: boolean;
  error?: string;
  emailSent?: boolean;
  emailError?: string;
};

export async function updateBabbfRegistrationStatusAction(
  referenceNumber: string,
  status: BabbfStatus,
  reviewerNote?: string
): Promise<UpdateBabbfStatusState> {
  await assertAdminScope("babbf_registrations");

  if (!BABBF_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  const res = await updateBabbfRegistrationStatus(referenceNumber, { status, reviewerNote });
  if (!res.ok) {
    return { error: res.message };
  }

  if (status !== "Confirmed") {
    return { success: true };
  }

  const ticketUrl = buildBabbfTicketUrl(res.row.referenceNumber);
  const qrCodePngBuffer = await generateBabbfTicketQrCodePngBuffer(ticketUrl);

  const mail = await sendBabbfConfirmationEmail({
    referenceNumber: res.row.referenceNumber,
    fullName: res.row.fullName,
    email: res.row.email,
    eventTypeLabel: BABBF_EVENT_TYPE_LABEL[res.sheetEventType],
    ticketUrl,
    qrCodePngBuffer,
  });
  if (!mail.ok) {
    return { success: true, emailSent: false, emailError: mail.reason };
  }
  return { success: true, emailSent: true };
}

export type BabbfCheckInState = {
  success?: boolean;
  error?: string;
  checkedInAt?: string;
  alreadyCheckedIn?: boolean;
};

/** Admin-side manual check-in (separate from the volunteer QR-scan flow, for corrections/no-QR cases). */
export async function adminCheckInBabbfRegistrationAction(referenceNumber: string): Promise<BabbfCheckInState> {
  await assertAdminScope("babbf_registrations");
  const res = await markBabbfCheckedIn(referenceNumber, "Admin manual check-in");
  if (!res.ok) {
    return { error: res.message };
  }
  return { success: true, checkedInAt: res.checkedInAt, alreadyCheckedIn: res.alreadyCheckedIn };
}

/** Clears a check-in — for corrections (e.g. scanned/marked by mistake). */
export async function adminCheckOutBabbfRegistrationAction(referenceNumber: string): Promise<BabbfCheckInState> {
  await assertAdminScope("babbf_registrations");
  const res = await markBabbfCheckedOut(referenceNumber);
  if (!res.ok) {
    return { error: res.message };
  }
  return { success: true };
}
