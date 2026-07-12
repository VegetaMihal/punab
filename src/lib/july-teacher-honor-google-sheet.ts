import { JWT } from "google-auth-library";
import { google } from "googleapis";

/** Default worksheet tab in the teacher-honor spreadsheet (override with JULY_TEACHER_HONOR_SHEET_TAB). */
export const JULY_TEACHER_HONOR_DEFAULT_TAB = "nominations";

export const JULY_TEACHER_HONOR_SHEET_HEADER_ROW: string[] = [
  "Submitted at (UTC)",
  "Nominator full name",
  "Nominator email",
  "Nominator phone",
  "Nominator university",
  "Teacher full name",
  "Teacher designation",
  "Teacher university",
  "Department / subject",
  "Teacher phone",
  "Teacher email",
  "Teacher social link",
  "Nomination narrative",
  "Supporting file URL",
  "Reference links (news / social / public)",
];

function sheetLastColumnLetter(): string {
  let n = JULY_TEACHER_HONOR_SHEET_HEADER_ROW.length;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

const LAST_COL = sheetLastColumnLetter();

function quoteSheetTab(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'`;
}

function getJwtClient(): JWT | null {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!client_email || !private_key) {
    return null;
  }
  return new JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getJulyTeacherHonorSpreadsheetId(): string | null {
  const id = process.env.JULY_TEACHER_HONOR_GOOGLE_SHEET_ID?.trim();
  return id || null;
}

export function getJulyTeacherHonorSheetTab(): string {
  return process.env.JULY_TEACHER_HONOR_SHEET_TAB?.trim() || JULY_TEACHER_HONOR_DEFAULT_TAB;
}

export function isJulyTeacherHonorSheetsConfigured(): boolean {
  return Boolean(getJwtClient() && getJulyTeacherHonorSpreadsheetId());
}

function headerRangeA1(): string {
  return `A1:${LAST_COL}1`;
}

async function getSheetsClient() {
  const jwt = getJwtClient();
  const spreadsheetId = getJulyTeacherHonorSpreadsheetId();
  if (!jwt || !spreadsheetId) {
    throw new Error("July Teacher Honor Google Sheets env is not configured.");
  }
  await jwt.authorize();
  return { sheets: google.sheets({ version: "v4", auth: jwt }), spreadsheetId };
}

async function ensureHeaderRow(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabKey: string
): Promise<void> {
  const q = quoteSheetTab(tabKey);
  const range = `${q}!${headerRangeA1()}`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const row = res.data.values?.[0] ?? [];
  const H = JULY_TEACHER_HONOR_SHEET_HEADER_ROW;
  const first = row[0];
  const needsWrite =
    row.length !== H.length ||
    first === undefined ||
    first === null ||
    String(first).trim() === "";
  if (!needsWrite) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [JULY_TEACHER_HONOR_SHEET_HEADER_ROW] },
  });
}

export function julyTeacherHonorSheetHeaderRangeA1(): string {
  return headerRangeA1();
}

export async function appendJulyTeacherHonorNominationRow(
  row: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.length !== JULY_TEACHER_HONOR_SHEET_HEADER_ROW.length) {
    return { ok: false, message: "Internal row length mismatch." };
  }
  const tabKey = getJulyTeacherHonorSheetTab();
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureHeaderRow(sheets, spreadsheetId, tabKey);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${quoteSheetTab(tabKey)}!A:${LAST_COL}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
    return { ok: true };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    const hint =
      raw.includes("Unable to parse range") || raw.includes("not found")
        ? ` Create a worksheet tab named "${tabKey}" and share the spreadsheet with the service account (Editor).`
        : "";
    return { ok: false, message: `${raw}${hint}` };
  }
}
