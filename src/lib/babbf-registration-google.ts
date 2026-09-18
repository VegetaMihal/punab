import { JWT } from "google-auth-library";

function getJwtClient(scopes: string[]): JWT | null {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!client_email || !private_key) {
    return null;
  }
  return new JWT({ email: client_email, key: private_key, scopes });
}

export function getBabbfSheetsJwtClient(): JWT | null {
  return getJwtClient(["https://www.googleapis.com/auth/spreadsheets"]);
}

export function getBabbfSheetId(): string | null {
  const id = process.env.BABBF_REGISTRATION_SHEET_ID?.trim();
  return id || null;
}

export function isBabbfGoogleConfigured(): boolean {
  return Boolean(getBabbfSheetsJwtClient() && getBabbfSheetId());
}

export const BABBF_SHEET_TAB = "registrations";

export const BABBF_SHEET_HEADER_ROW: string[] = [
  "Reference Number",
  "Submitted at (UTC)",
  "Full Name",
  "Phone",
  "Email",
  "University Name",
  "Department",
  "Gender",
  "Weight Category",
  "Blood Group",
  "Photo URL",
  "Amount",
  "Payment Method",
  "Transaction ID",
  "Payment Screenshot URL",
  "Status",
  "Reviewer Note",
];

export const BABBF_COL = {
  referenceNumber: 0,
  submittedAt: 1,
  fullName: 2,
  phone: 3,
  email: 4,
  universityName: 5,
  department: 6,
  gender: 7,
  weightCategory: 8,
  bloodGroup: 9,
  photoUrl: 10,
  amount: 11,
  paymentMethod: 12,
  transactionId: 13,
  paymentScreenshotUrl: 14,
  status: 15,
  reviewerNote: 16,
} as const;

export function sheetColumnLetter(zeroBasedIndex: number): string {
  let n = zeroBasedIndex + 1;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export const BABBF_LAST_COL = sheetColumnLetter(BABBF_SHEET_HEADER_ROW.length - 1);

export function quoteBabbfSheetTab(): string {
  return `'${BABBF_SHEET_TAB.replace(/'/g, "''")}'`;
}
