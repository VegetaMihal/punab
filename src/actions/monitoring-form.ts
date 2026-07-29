"use server";

import { randomBytes } from "node:crypto";
import type { ZodError } from "zod";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { uploadMonitoringEvidenceFile } from "@/lib/monitoring-form-drive";
import { isMonitoringGoogleConfigured } from "@/lib/monitoring-form-google";
import { sendMonitoringSubmissionNotifyEmail } from "@/lib/monitoring-form-notify-email";
import {
  appendMonitoringSubmissionRow,
  findMonitoringSubmissionByReference,
  updateMonitoringSubmissionStatus,
} from "@/lib/monitoring-form-sheet";
import { categoryFromScore, computeMonitoringScore, MONITORING_CATEGORY_LABEL } from "@/lib/monitoring-score";
import { monitoringFormSchema, MONITORING_STATUSES, type MonitoringStatus } from "@/lib/validations/monitoring-form";

export type SubmitMonitoringFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  fieldValues?: Record<string, string>;
  referenceNumber?: string;
  stagedEvidenceUrls?: string[];
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

function echoFields(formData: FormData): Record<string, string> {
  return {
    universityName: fdStr(formData, "universityName"),
    connection: fdStr(formData, "connection"),
    connectionOther: fdStr(formData, "connectionOther"),
    programStatus: fdStr(formData, "programStatus"),
    observationsOther: fdStr(formData, "observationsOther"),
    hasAdminSupporters: fdStr(formData, "hasAdminSupporters"),
    supporterName: fdStr(formData, "supporterName"),
    supporterPosition: fdStr(formData, "supporterPosition"),
    supporterReasonsOther: fdStr(formData, "supporterReasonsOther"),
    description: fdStr(formData, "description"),
    hasEvidence: fdStr(formData, "hasEvidence"),
    evidenceLinkNote: fdStr(formData, "evidenceLinkNote"),
    contactDetails: fdStr(formData, "contactDetails"),
  };
}

async function generateUniqueReferenceNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
    const candidate = `PMF-2026-${suffix}`;
    const existing = await findMonitoringSubmissionByReference(candidate);
    if (existing.ok && !existing.row) {
      return candidate;
    }
  }
  return `PMF-2026-${Date.now().toString(36).toUpperCase()}`;
}

export async function submitMonitoringForm(
  _prev: SubmitMonitoringFormState,
  formData: FormData
): Promise<SubmitMonitoringFormState> {
  const echo = () => echoFields(formData);

  if (!isMonitoringGoogleConfigured()) {
    return {
      error:
        "Monitoring form is not configured. Set MONITORING_FORM_GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
      fieldValues: echo(),
    };
  }

  const stagedEvidenceUrlsField = formData.get("stagedEvidenceUrls");
  const stagedEvidenceUrls =
    typeof stagedEvidenceUrlsField === "string" && stagedEvidenceUrlsField
      ? (JSON.parse(stagedEvidenceUrlsField) as string[])
      : [];

  const parsed = monitoringFormSchema.safeParse({
    universityName: fdStr(formData, "universityName"),
    connection: fdStr(formData, "connection"),
    connectionOther: fdStr(formData, "connectionOther"),
    programStatus: fdStr(formData, "programStatus"),
    observations: fdList(formData, "observations"),
    observationsOther: fdStr(formData, "observationsOther"),
    hasAdminSupporters: fdStr(formData, "hasAdminSupporters"),
    supporterName: fdStr(formData, "supporterName"),
    supporterPosition: fdStr(formData, "supporterPosition"),
    supporterReasons: fdList(formData, "supporterReasons"),
    supporterReasonsOther: fdStr(formData, "supporterReasonsOther"),
    description: fdStr(formData, "description"),
    hasEvidence: fdStr(formData, "hasEvidence"),
    evidenceLinkNote: fdStr(formData, "evidenceLinkNote"),
    contactOk: fdBool(formData, "contactOk"),
    contactDetails: fdStr(formData, "contactDetails"),
    keepConfidential: formData.has("keepConfidential") ? fdBool(formData, "keepConfidential") : true,
    declarationAccepted: fdBool(formData, "declarationAccepted") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error), fieldValues: echo(), stagedEvidenceUrls };
  }
  const d = parsed.data;

  const referenceNumber = await generateUniqueReferenceNumber();

  const evidenceFiles = formData.getAll("evidenceFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const evidenceUrls: string[] = [...stagedEvidenceUrls];
  if (d.hasEvidence !== "no" && evidenceFiles.length > 0) {
    for (const file of evidenceFiles) {
      const up = await uploadMonitoringEvidenceFile(file, referenceNumber);
      if (!up.ok) {
        return {
          error: up.message,
          fieldValues: echo(),
          stagedEvidenceUrls: evidenceUrls,
        };
      }
      evidenceUrls.push(up.url);
    }
  }

  const score = computeMonitoringScore(d.observations);
  const category = categoryFromScore(score);

  const row = [
    referenceNumber,
    new Date().toISOString(),
    d.universityName,
    d.connection,
    d.connectionOther,
    d.programStatus,
    d.observations.join(", "),
    d.observationsOther,
    d.hasAdminSupporters,
    d.supporterName,
    d.supporterPosition,
    d.supporterReasons.join(", "),
    d.supporterReasonsOther,
    d.description,
    d.hasEvidence,
    [...evidenceUrls, d.evidenceLinkNote].filter(Boolean).join(" | "),
    d.contactOk ? "Yes" : "No",
    d.contactOk ? d.contactDetails : "",
    d.keepConfidential ? "Yes" : "No",
    String(score),
    category,
    "New",
    "",
  ];

  const sheet = await appendMonitoringSubmissionRow(row);
  if (!sheet.ok) {
    return { error: sheet.message, fieldValues: echo(), stagedEvidenceUrls: evidenceUrls };
  }

  void sendMonitoringSubmissionNotifyEmail({
    referenceNumber,
    universityName: d.universityName,
    category: MONITORING_CATEGORY_LABEL[category],
    score,
  });

  return { success: true, referenceNumber };
}

export type UpdateMonitoringStatusState = { success?: boolean; error?: string };

export async function updateMonitoringSubmissionStatusAction(
  referenceNumber: string,
  status: MonitoringStatus,
  reviewerNote?: string
): Promise<UpdateMonitoringStatusState> {
  await assertAdminScope("monitoring_form");

  if (!MONITORING_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  const res = await updateMonitoringSubmissionStatus(referenceNumber, { status, reviewerNote });
  if (!res.ok) {
    return { error: res.message };
  }
  return { success: true };
}
