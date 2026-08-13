import { JWT } from "google-auth-library";

function getJwtClient(scopes: string[]): JWT | null {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!client_email || !private_key) {
    return null;
  }
  return new JWT({ email: client_email, key: private_key, scopes });
}

export function getMunSheetsJwtClient(): JWT | null {
  return getJwtClient(["https://www.googleapis.com/auth/spreadsheets"]);
}

export function getMunSheetId(): string | null {
  const id = process.env.MUN_FORM_GOOGLE_SHEET_ID?.trim();
  return id || null;
}

export function isMunGoogleConfigured(): boolean {
  return Boolean(getMunSheetsJwtClient() && getMunSheetId());
}

export const MUN_SHEET_TAB = "applications";

export const MUN_SHEET_HEADER_ROW: string[] = [
  "Reference Number",
  "Submitted at (UTC)",
  "Full Name",
  "Certificate Name",
  "Date of Birth",
  "Gender",
  "Nationality",
  "ID Number",
  "Present Address",
  "Permanent Address",
  "Mobile",
  "WhatsApp",
  "Email",
  "Facebook Link",
  "Institution Name",
  "Department",
  "Current Year",
  "Student ID",
  "Education Level",
  "Education Level Other",
  "First Committee Preference",
  "Second Committee Preference",
  "Third Committee Preference",
  "First Country Preference",
  "Second Country Preference",
  "Third Country Preference",
  "Has Prior MUN",
  "Total Conferences",
  "Previous Experience",
  "Was Leadership",
  "Leadership Details",
  "Areas Of Interest",
  "Areas Of Interest Other",
  "Emergency Contact Name",
  "Emergency Relationship",
  "Emergency Mobile",
  "Emergency Alt Mobile",
  "Emergency Address",
  "Dietary Restrictions",
  "Dietary Details",
  "Accessibility Needs",
  "Accessibility Details",
  "Medical Requirements",
  "Medical Details",
  "Food Preference",
  "Needs Accommodation",
  "From Outside Dhaka",
  "Departure District",
  "Arrival DateTime",
  "Departure DateTime",
  "Travel Notes",
  "Referred By",
  "Photo URL",
  "Student ID Doc URL",
  "National ID Or Passport URL",
  "Passport Copy URL",
  "Amount",
  "Payment Method",
  "Amount Paid",
  "Payment Date",
  "Transaction ID",
  "Payment Sender Info",
  "Payment Account Holder Name",
  "Payment Bank Name",
  "Payment Deposit Slip Ref",
  "Payment Proof URL",
  "Payment Additional Info",
  "Status",
  "Reviewer Note",
];

export const MUN_COL = {
  referenceNumber: 0,
  submittedAt: 1,
  fullName: 2,
  certificateName: 3,
  dob: 4,
  gender: 5,
  nationality: 6,
  idNumber: 7,
  presentAddress: 8,
  permanentAddress: 9,
  mobile: 10,
  whatsapp: 11,
  email: 12,
  facebookLink: 13,
  institutionName: 14,
  department: 15,
  currentYear: 16,
  studentId: 17,
  educationLevel: 18,
  educationLevelOther: 19,
  firstCommittee: 20,
  secondCommittee: 21,
  thirdCommittee: 22,
  firstCountry: 23,
  secondCountry: 24,
  thirdCountry: 25,
  hasPriorMun: 26,
  totalConferences: 27,
  previousExperience: 28,
  wasLeadership: 29,
  leadershipDetails: 30,
  areasOfInterest: 31,
  areasOfInterestOther: 32,
  emergencyContactName: 33,
  emergencyRelationship: 34,
  emergencyMobile: 35,
  emergencyAltMobile: 36,
  emergencyAddress: 37,
  dietaryRestrictions: 38,
  dietaryDetails: 39,
  accessibilityNeeds: 40,
  accessibilityDetails: 41,
  medicalRequirements: 42,
  medicalDetails: 43,
  foodPreference: 44,
  needsAccommodation: 45,
  fromOutsideDhaka: 46,
  departureDistrict: 47,
  arrivalDateTime: 48,
  departureDateTime: 49,
  travelNotes: 50,
  referredBy: 51,
  photoUrl: 52,
  studentIdDocUrl: 53,
  nationalIdOrPassportUrl: 54,
  passportCopyUrl: 55,
  amount: 56,
  paymentMethod: 57,
  amountPaid: 58,
  paymentDate: 59,
  transactionId: 60,
  paymentSenderInfo: 61,
  paymentAccountHolderName: 62,
  paymentBankName: 63,
  paymentDepositSlipRef: 64,
  paymentProofUrl: 65,
  paymentAdditionalInfo: 66,
  status: 67,
  reviewerNote: 68,
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

export const MUN_LAST_COL = sheetColumnLetter(MUN_SHEET_HEADER_ROW.length - 1);

export function quoteMunSheetTab(): string {
  return `'${MUN_SHEET_TAB.replace(/'/g, "''")}'`;
}
