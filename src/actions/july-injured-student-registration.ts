"use server";

import {
  appendJulyInjuredStudentRegistrationRow,
  isJulyInjuredStudentSheetsConfigured,
} from "@/lib/july-injured-student-google-sheet";
import {
  echoJulyInjuredStudentFieldsFromFormData,
  type JulyInjuredStudentFieldValues,
} from "@/lib/july-injured-student-fields";
import { julyInjuredStudentRegistrationFormSchema } from "@/lib/validations/july-injured-student-registration";
import type { ZodError } from "zod";

export type JulyInjuredStudentRegistrationState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  fieldValues?: JulyInjuredStudentFieldValues;
};

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

export async function submitJulyInjuredStudentRegistration(
  _prev: JulyInjuredStudentRegistrationState,
  formData: FormData
): Promise<JulyInjuredStudentRegistrationState> {
  const echo = () => echoJulyInjuredStudentFieldsFromFormData(formData);

  if (!isJulyInjuredStudentSheetsConfigured()) {
    return {
      error:
        "Not configured. Set JULY_INJURED_STUDENT_GOOGLE_SHEET_ID (and optionally JULY_INJURED_STUDENT_SHEET_TAB), plus GOOGLE_SERVICE_ACCOUNT_*.",
      fieldValues: echo(),
    };
  }

  const parsed = julyInjuredStudentRegistrationFormSchema.safeParse({
    fullName: fdStr(formData, "fullName"),
    phoneNumber: fdStr(formData, "phoneNumber"),
    universityName: fdStr(formData, "universityName"),
    injuryDescription: fdStr(formData, "injuryDescription"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error), fieldValues: echo() };
  }

  const d = parsed.data;
  const row = [
    new Date().toISOString(),
    d.fullName,
    d.phoneNumber,
    d.universityName,
    d.injuryDescription,
  ];

  const sheet = await appendJulyInjuredStudentRegistrationRow(row);
  if (!sheet.ok) {
    return { error: sheet.message, fieldValues: echo() };
  }

  return { success: true };
}
