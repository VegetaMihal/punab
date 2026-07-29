import { JWT } from "google-auth-library";

function getJwtClient(scopes: string[]): JWT | null {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!client_email || !private_key) {
    return null;
  }
  return new JWT({ email: client_email, key: private_key, scopes });
}

export function getMonitoringSheetsJwtClient(): JWT | null {
  return getJwtClient(["https://www.googleapis.com/auth/spreadsheets"]);
}

export function getMonitoringSheetId(): string | null {
  const id = process.env.MONITORING_FORM_GOOGLE_SHEET_ID?.trim();
  return id || null;
}

export function isMonitoringGoogleConfigured(): boolean {
  return Boolean(getMonitoringSheetsJwtClient() && getMonitoringSheetId());
}

export const MONITORING_SHEET_TAB = "submissions";

export const MONITORING_SHEET_HEADER_ROW: string[] = [
  "Reference Number",
  "Submitted at (UTC)",
  "University name",
  "Connection",
  "Connection other",
  "July status",
  "Observations",
  "Observations other",
  "Admin/trustee supporters",
  "Supporter name",
  "Supporter position",
  "Supporter reasons",
  "Supporter reasons other",
  "Description",
  "Has evidence",
  "Evidence links",
  "Contact OK",
  "Contact details",
  "Keep confidential",
  "Score",
  "Category",
  "Status",
  "Reviewer note",
];

export const MONITORING_COL = {
  referenceNumber: 0,
  submittedAt: 1,
  universityName: 2,
  connection: 3,
  connectionOther: 4,
  programStatus: 5,
  observations: 6,
  observationsOther: 7,
  hasAdminSupporters: 8,
  supporterName: 9,
  supporterPosition: 10,
  supporterReasons: 11,
  supporterReasonsOther: 12,
  description: 13,
  hasEvidence: 14,
  evidenceLinks: 15,
  contactOk: 16,
  contactDetails: 17,
  keepConfidential: 18,
  score: 19,
  category: 20,
  status: 21,
  reviewerNote: 22,
} as const;

function sheetLastColumnLetter(): string {
  let n = MONITORING_SHEET_HEADER_ROW.length;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export const MONITORING_LAST_COL = sheetLastColumnLetter();

export function quoteMonitoringSheetTab(): string {
  return `'${MONITORING_SHEET_TAB.replace(/'/g, "''")}'`;
}
