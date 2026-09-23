import { JWT } from "google-auth-library";

export function getBabbfSheetsJwtClient(): JWT | null {
  const client_email = process.env.BABBF_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const private_key = process.env.BABBF_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!client_email || !private_key) {
    return null;
  }
  return new JWT({ email: client_email, key: private_key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
}

export function getBabbfSheetId(): string | null {
  const id = process.env.BABBF_REGISTRATION_SHEET_ID?.trim();
  return id || null;
}

export function isBabbfGoogleConfigured(): boolean {
  return Boolean(getBabbfSheetsJwtClient() && getBabbfSheetId());
}

export const BABBF_SHEET_TABS = {
  armwrestling: "armwrestling_registrations",
  bodybuilding: "bodybuilding_registrations",
} as const;
export type BabbfSheetEventType = keyof typeof BABBF_SHEET_TABS;

export const BABBF_SHEET_HEADER_ROW: string[] = [
  "Reference Number",
  "Submitted at (UTC)",
  "Full Name",
  "Phone",
  "Email",
  "University Name",
  "Department",
  "Gender",
  "Event Type",
  "Category",
  "Blood Group",
  "Photo URL",
  "Amount",
  "Payment Method",
  "Transaction ID",
  "Payment Screenshot URL",
  "Status",
  "Reviewer Note",
  "Student Category",
  "Student ID / NID",
  "Right Hand Confirmed",
  "Declaration Accepted",
  "Payment Sender Number",
  "Checked In At",
  "Checked In Via",
  "Bodybuilding Class",
  "Denim Jeans Model Fitness",
  "Physique Class",
  "Junior Men's Physique Class",
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
  eventType: 8,
  category: 9,
  bloodGroup: 10,
  photoUrl: 11,
  amount: 12,
  paymentMethod: 13,
  transactionId: 14,
  paymentScreenshotUrl: 15,
  status: 16,
  reviewerNote: 17,
  studentCategory: 18,
  studentIdOrNid: 19,
  rightHandConfirmed: 20,
  declarationAccepted: 21,
  paymentSenderNumber: 22,
  checkedInAt: 23,
  checkedInVia: 24,
  bodybuildingClass: 25,
  denimJeansOptIn: 26,
  physiqueClass: 27,
  juniorPhysiqueClass: 28,
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

export function quoteBabbfSheetTab(eventType: BabbfSheetEventType): string {
  return `'${BABBF_SHEET_TABS[eventType].replace(/'/g, "''")}'`;
}
