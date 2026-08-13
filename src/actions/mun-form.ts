"use server";

import { randomBytes } from "node:crypto";
import type { ZodError } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { uploadMunDocumentFile } from "@/lib/mun-form-storage";
import { isMunGoogleConfigured } from "@/lib/mun-form-google";
import { sendMunApplicationNotifyEmail } from "@/lib/mun-form-notify-email";
import {
  appendMunApplicationRow,
  findMunApplicationByReference,
  updateMunApplicationStatus,
} from "@/lib/mun-form-sheet";
import { munFormSchema, MUN_REGISTRATION_FEE_BDT, MUN_STATUSES, type MunStatus } from "@/lib/validations/mun-form";

export type SubmitMunFormState = {
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

function fdBool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function fdList(formData: FormData, key: string): string[] {
  return formData.getAll(key).map((v) => v.toString());
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
  "certificateName",
  "dob",
  "gender",
  "nationality",
  "idNumber",
  "presentAddress",
  "permanentAddress",
  "mobile",
  "whatsapp",
  "email",
  "facebookLink",
  "institutionName",
  "department",
  "currentYear",
  "studentId",
  "educationLevel",
  "educationLevelOther",
  "firstCommittee",
  "secondCommittee",
  "thirdCommittee",
  "firstCountry",
  "secondCountry",
  "thirdCountry",
  "hasPriorMun",
  "totalConferences",
  "previousExperience",
  "wasLeadership",
  "leadershipDetails",
  "areasOfInterestOther",
  "emergencyContactName",
  "emergencyRelationship",
  "emergencyMobile",
  "emergencyAltMobile",
  "emergencyAddress",
  "dietaryRestrictions",
  "dietaryDetails",
  "accessibilityNeeds",
  "accessibilityDetails",
  "medicalRequirements",
  "medicalDetails",
  "foodPreference",
  "needsAccommodation",
  "fromOutsideDhaka",
  "departureDistrict",
  "arrivalDateTime",
  "departureDateTime",
  "travelNotes",
  "paymentMethod",
  "amountPaid",
  "paymentDate",
  "transactionId",
  "paymentSenderInfo",
  "paymentAccountHolderName",
  "paymentBankName",
  "paymentDepositSlipRef",
  "paymentAdditionalInfo",
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
    const candidate = `MUN-2026-${suffix}`;
    const existing = await findMunApplicationByReference(candidate);
    if (existing.ok && !existing.row) {
      return candidate;
    }
  }
  return `MUN-2026-${Date.now().toString(36).toUpperCase()}`;
}

const DOCUMENT_FIELDS = [
  { formKey: "photoFile", kind: "photo" as const, stagedKey: "photoUrl", required: true },
  { formKey: "studentIdFile", kind: "student_id" as const, stagedKey: "studentIdDocUrl", required: true },
  { formKey: "nationalIdFile", kind: "national_id" as const, stagedKey: "nationalIdOrPassportUrl", required: false },
  { formKey: "passportFile", kind: "passport" as const, stagedKey: "passportCopyUrl", required: false },
  { formKey: "paymentProofFile", kind: "payment_proof" as const, stagedKey: "paymentProofUrl", required: false },
];

export async function submitMunForm(
  _prev: SubmitMunFormState,
  formData: FormData
): Promise<SubmitMunFormState> {
  const echo = () => echoFields(formData);

  if (!isMunGoogleConfigured()) {
    return {
      error:
        "MUN application form is not configured. Set MUN_FORM_GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
      fieldValues: echo(),
    };
  }

  const stagedField = formData.get("stagedDocumentUrls");
  const staged: Record<string, string> =
    typeof stagedField === "string" && stagedField ? JSON.parse(stagedField) : {};

  const parsed = munFormSchema.safeParse({
    fullName: fdStr(formData, "fullName"),
    certificateName: fdStr(formData, "certificateName"),
    dob: fdStr(formData, "dob"),
    gender: fdStr(formData, "gender"),
    nationality: fdStr(formData, "nationality"),
    idNumber: fdStr(formData, "idNumber"),
    presentAddress: fdStr(formData, "presentAddress"),
    permanentAddress: fdStr(formData, "permanentAddress"),
    mobile: fdStr(formData, "mobile"),
    whatsapp: fdStr(formData, "whatsapp"),
    email: fdStr(formData, "email"),
    facebookLink: fdStr(formData, "facebookLink"),
    institutionName: fdStr(formData, "institutionName"),
    department: fdStr(formData, "department"),
    currentYear: fdStr(formData, "currentYear"),
    studentId: fdStr(formData, "studentId"),
    educationLevel: fdStr(formData, "educationLevel"),
    educationLevelOther: fdStr(formData, "educationLevelOther"),
    firstCommittee: fdStr(formData, "firstCommittee"),
    secondCommittee: fdStr(formData, "secondCommittee"),
    thirdCommittee: fdStr(formData, "thirdCommittee"),
    firstCountry: fdStr(formData, "firstCountry"),
    secondCountry: fdStr(formData, "secondCountry"),
    thirdCountry: fdStr(formData, "thirdCountry"),
    hasPriorMun: fdStr(formData, "hasPriorMun"),
    totalConferences: fdStr(formData, "totalConferences"),
    previousExperience: fdStr(formData, "previousExperience"),
    wasLeadership: fdStr(formData, "wasLeadership"),
    leadershipDetails: fdStr(formData, "leadershipDetails"),
    areasOfInterest: fdList(formData, "areasOfInterest"),
    areasOfInterestOther: fdStr(formData, "areasOfInterestOther"),
    emergencyContactName: fdStr(formData, "emergencyContactName"),
    emergencyRelationship: fdStr(formData, "emergencyRelationship"),
    emergencyMobile: fdStr(formData, "emergencyMobile"),
    emergencyAltMobile: fdStr(formData, "emergencyAltMobile"),
    emergencyAddress: fdStr(formData, "emergencyAddress"),
    dietaryRestrictions: fdStr(formData, "dietaryRestrictions"),
    dietaryDetails: fdStr(formData, "dietaryDetails"),
    accessibilityNeeds: fdStr(formData, "accessibilityNeeds"),
    accessibilityDetails: fdStr(formData, "accessibilityDetails"),
    medicalRequirements: fdStr(formData, "medicalRequirements"),
    medicalDetails: fdStr(formData, "medicalDetails"),
    foodPreference: fdStr(formData, "foodPreference"),
    needsAccommodation: fdStr(formData, "needsAccommodation"),
    fromOutsideDhaka: fdStr(formData, "fromOutsideDhaka"),
    departureDistrict: fdStr(formData, "departureDistrict"),
    arrivalDateTime: fdStr(formData, "arrivalDateTime"),
    departureDateTime: fdStr(formData, "departureDateTime"),
    travelNotes: fdStr(formData, "travelNotes"),
    paymentMethod: fdStr(formData, "paymentMethod"),
    amountPaid: fdStr(formData, "amountPaid"),
    paymentDate: fdStr(formData, "paymentDate"),
    transactionId: fdStr(formData, "transactionId"),
    paymentSenderInfo: fdStr(formData, "paymentSenderInfo"),
    paymentAccountHolderName: fdStr(formData, "paymentAccountHolderName"),
    paymentBankName: fdStr(formData, "paymentBankName"),
    paymentDepositSlipRef: fdStr(formData, "paymentDepositSlipRef"),
    paymentAdditionalInfo: fdStr(formData, "paymentAdditionalInfo"),
    declarationAccepted: fdBool(formData, "declarationAccepted") || undefined,
    codeOfConductAccepted: fdBool(formData, "codeOfConductAccepted") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error), fieldValues: echo(), stagedDocumentUrls: staged };
  }
  const d = parsed.data;

  const referenceNumber = await generateUniqueReferenceNumber();

  const docUrls: Record<string, string> = { ...staged };
  for (const doc of DOCUMENT_FIELDS) {
    if (docUrls[doc.stagedKey]) continue;
    const fileField = formData.get(doc.formKey);
    const file = fileField instanceof File && fileField.size > 0 ? fileField : null;
    if (!file) {
      if (doc.required) {
        return {
          fieldErrors: { [doc.formKey]: "This document is required." },
          fieldValues: echo(),
          stagedDocumentUrls: docUrls,
        };
      }
      continue;
    }
    const up = await uploadMunDocumentFile(file, referenceNumber, doc.kind);
    if (!up.ok) {
      return { error: up.message, fieldValues: echo(), stagedDocumentUrls: docUrls };
    }
    docUrls[doc.stagedKey] = up.url;
  }

  const row = [
    referenceNumber,
    new Date().toISOString(),
    d.fullName,
    d.certificateName,
    d.dob,
    d.gender,
    d.nationality,
    d.idNumber,
    d.presentAddress,
    d.permanentAddress,
    d.mobile,
    d.whatsapp,
    d.email,
    d.facebookLink,
    d.institutionName,
    d.department,
    d.currentYear,
    d.studentId,
    d.educationLevel,
    d.educationLevelOther,
    d.firstCommittee,
    d.secondCommittee,
    d.thirdCommittee,
    d.firstCountry,
    d.secondCountry,
    d.thirdCountry,
    d.hasPriorMun,
    d.totalConferences,
    d.previousExperience,
    d.wasLeadership,
    d.leadershipDetails,
    d.areasOfInterest.join(", "),
    d.areasOfInterestOther,
    d.emergencyContactName,
    d.emergencyRelationship,
    d.emergencyMobile,
    d.emergencyAltMobile,
    d.emergencyAddress,
    d.dietaryRestrictions,
    d.dietaryDetails,
    d.accessibilityNeeds,
    d.accessibilityDetails,
    d.medicalRequirements,
    d.medicalDetails,
    d.foodPreference,
    d.needsAccommodation,
    d.fromOutsideDhaka,
    d.departureDistrict,
    d.arrivalDateTime,
    d.departureDateTime,
    d.travelNotes,
    docUrls.photoUrl ?? "",
    docUrls.studentIdDocUrl ?? "",
    docUrls.nationalIdOrPassportUrl ?? "",
    docUrls.passportCopyUrl ?? "",
    String(MUN_REGISTRATION_FEE_BDT),
    d.paymentMethod,
    d.amountPaid,
    d.paymentDate,
    d.transactionId,
    d.paymentSenderInfo,
    d.paymentAccountHolderName,
    d.paymentBankName,
    d.paymentDepositSlipRef,
    docUrls.paymentProofUrl ?? "",
    d.paymentAdditionalInfo,
    "Payment Pending",
    "",
  ];

  const sheet = await appendMunApplicationRow(row);
  if (!sheet.ok) {
    return { error: sheet.message, fieldValues: echo(), stagedDocumentUrls: docUrls };
  }

  void sendMunApplicationNotifyEmail({
    referenceNumber,
    fullName: d.fullName,
    email: d.email,
    institutionName: d.institutionName,
    status: "Payment Pending",
  });

  return { success: true, referenceNumber };
}

export type UpdateMunStatusState = { success?: boolean; error?: string };

export async function updateMunApplicationStatusAction(
  referenceNumber: string,
  status: MunStatus,
  reviewerNote?: string
): Promise<UpdateMunStatusState> {
  await assertAdminScope("mun_form");

  if (!MUN_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  const res = await updateMunApplicationStatus(referenceNumber, { status, reviewerNote });
  if (!res.ok) {
    return { error: res.message };
  }
  return { success: true };
}
