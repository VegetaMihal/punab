import { JWT } from "google-auth-library";
import { google } from "googleapis";

export const JULY_INJURED_STUDENT_DEFAULT_TAB = "registrations";

export const JULY_INJURED_STUDENT_SHEET_HEADER_ROW: string[] = [
  "Submitted at (UTC)",
  "Full name",
  "Phone",
  "University name",
  "Injury / condition (brief)",
];

function sheetLastColumnLetter(): string {
  let n = JULY_INJURED_STUDENT_SHEET_HEADER_ROW.length;
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
  if (!client_email || !private_key) return null;
  return new JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getJulyInjuredStudentSpreadsheetId(): string | null {
  const id = process.env.JULY_INJURED_STUDENT_GOOGLE_SHEET_ID?.trim();
  return id || null;
}

export function getJulyInjuredStudentSheetTab(): string {
  return process.env.JULY_INJURED_STUDENT_SHEET_TAB?.trim() || JULY_INJURED_STUDENT_DEFAULT_TAB;
}

export function isJulyInjuredStudentSheetsConfigured(): boolean {
  return Boolean(getJwtClient() && getJulyInjuredStudentSpreadsheetId());
}

function headerRangeA1(): string {
  return `A1:${LAST_COL}1`;
}

async function getSheetsClient() {
  const jwt = getJwtClient();
  const spreadsheetId = getJulyInjuredStudentSpreadsheetId();
  if (!jwt || !spreadsheetId) {
    throw new Error("Injured student Google Sheets env is not configured.");
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
  const H = JULY_INJURED_STUDENT_SHEET_HEADER_ROW;
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
    requestBody: { values: [JULY_INJURED_STUDENT_SHEET_HEADER_ROW] },
  });
}

export function julyInjuredStudentSheetHeaderRangeA1(): string {
  return headerRangeA1();
}

export async function appendJulyInjuredStudentRegistrationRow(
  row: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.length !== JULY_INJURED_STUDENT_SHEET_HEADER_ROW.length) {
    return { ok: false, message: "Internal row length mismatch." };
  }
  const tabKey = getJulyInjuredStudentSheetTab();
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
        ? ` Create tab "${tabKey}" or run npm run july-injured-student:setup-sheet. Share the sheet with the service account (Editor).`
        : "";
    return { ok: false, message: `${raw}${hint}` };
  }
}
