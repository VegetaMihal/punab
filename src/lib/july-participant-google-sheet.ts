import { JWT } from "google-auth-library";
import { google } from "googleapis";

export const JULY_PARTICIPANT_DEFAULT_TAB = "registrations";

export const JULY_PARTICIPANT_SHEET_HEADER_ROW: string[] = [
  "Submitted at (UTC)",
  "Full name",
  "Phone",
  "Email",
  "University name",
  "Club name",
  "Department / role",
  "Photo URL",
  "Ticket ID",
  "Checked in at (UTC)",
  "Martyrs pledge",
  "Donates blood",
  "Blood group",
  "Attendance confirmed",
];

function sheetLastColumnLetter(): string {
  let n = JULY_PARTICIPANT_SHEET_HEADER_ROW.length;
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

export function getJulyParticipantSpreadsheetId(): string | null {
  const id = process.env.JULY_PARTICIPANT_GOOGLE_SHEET_ID?.trim();
  return id || null;
}

export function getJulyParticipantSheetTab(): string {
  return process.env.JULY_PARTICIPANT_SHEET_TAB?.trim() || JULY_PARTICIPANT_DEFAULT_TAB;
}

export function isJulyParticipantSheetsConfigured(): boolean {
  return Boolean(getJwtClient() && getJulyParticipantSpreadsheetId());
}

function headerRangeA1(): string {
  return `A1:${LAST_COL}1`;
}

async function getSheetsClient() {
  const jwt = getJwtClient();
  const spreadsheetId = getJulyParticipantSpreadsheetId();
  if (!jwt || !spreadsheetId) {
    throw new Error("Participant Google Sheets env is not configured.");
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
  const H = JULY_PARTICIPANT_SHEET_HEADER_ROW;
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
    requestBody: { values: [JULY_PARTICIPANT_SHEET_HEADER_ROW] },
  });
}

export function julyParticipantSheetHeaderRangeA1(): string {
  return headerRangeA1();
}

export async function appendJulyParticipantRegistrationRow(
  row: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.length !== JULY_PARTICIPANT_SHEET_HEADER_ROW.length) {
    return { ok: false, message: "Internal row length mismatch." };
  }
  const tabKey = getJulyParticipantSheetTab();
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureHeaderRow(sheets, spreadsheetId, tabKey);
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${quoteSheetTab(tabKey)}!A:${LAST_COL}`,
    });
    const nextRow = (existing.data.values?.length ?? 1) + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quoteSheetTab(tabKey)}!A${nextRow}:${LAST_COL}${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
    return { ok: true };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    const hint =
      raw.includes("Unable to parse range") || raw.includes("not found")
        ? ` Create tab "${tabKey}" or run npm run july-participant:setup-sheet. Share the sheet with the service account (Editor).`
        : "";
    return { ok: false, message: `${raw}${hint}` };
  }
}

export type JulyParticipantRegistrationRow = {
  submittedAt: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  universityName: string;
  clubName: string;
  departmentOrRole: string;
  photoUrl: string;
  ticketId: string;
  checkedInAt: string;
  martyrsPledge: string;
  donatesBlood: string;
  bloodGroup: string;
  attendanceConfirm: string;
};

function mapJulyParticipantRow(row: unknown[]): JulyParticipantRegistrationRow {
  return {
    submittedAt: String(row[0] ?? ""),
    fullName: String(row[1] ?? ""),
    phoneNumber: String(row[2] ?? ""),
    email: String(row[3] ?? ""),
    universityName: String(row[4] ?? ""),
    clubName: String(row[5] ?? ""),
    departmentOrRole: String(row[6] ?? ""),
    photoUrl: String(row[7] ?? ""),
    ticketId: String(row[8] ?? ""),
    checkedInAt: String(row[9] ?? ""),
    martyrsPledge: String(row[10] ?? ""),
    donatesBlood: String(row[11] ?? ""),
    bloodGroup: String(row[12] ?? ""),
    attendanceConfirm: String(row[13] ?? ""),
  };
}

const EMAIL_COL = 3;

/** Returns true if an email is already in the sheet (case-insensitive). */
export async function isJulyParticipantEmailRegistered(email: string): Promise<boolean> {
  const tabKey = getJulyParticipantSheetTab();
  const key = email.trim().toLowerCase();
  if (!key) return false;
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${quoteSheetTab(tabKey)}!A2:${LAST_COL}`,
    });
    const rows = res.data.values ?? [];
    return rows.some((row) => String(row[EMAIL_COL] ?? "").trim().toLowerCase() === key);
  } catch {
    return false;
  }
}

/** All participant rows for admin listing (newest first). */
export async function listJulyParticipantRegistrationRows(): Promise<
  { ok: true; rows: JulyParticipantRegistrationRow[] } | { ok: false; message: string }
> {
  const tabKey = getJulyParticipantSheetTab();
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureHeaderRow(sheets, spreadsheetId, tabKey);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${quoteSheetTab(tabKey)}!A2:${LAST_COL}`,
    });
    const rows = (res.data.values ?? [])
      .filter((row) => row.some((c) => c !== undefined && c !== null && String(c).trim() !== ""))
      .map(mapJulyParticipantRow)
      .reverse();
    return { ok: true, rows };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}

const TICKET_ID_COL = 8;
const CHECKED_IN_COL = 9;

function checkedInColLetter(): string {
  let n = CHECKED_IN_COL + 1;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Looks up one participant by ticket id (case-insensitive). Returns the row plus its 1-based sheet row index for check-in updates. */
export async function findJulyParticipantByTicketId(
  ticketId: string
): Promise<
  | { ok: true; row: JulyParticipantRegistrationRow; sheetRowIndex: number }
  | { ok: true; row: null; sheetRowIndex: null }
  | { ok: false; message: string }
> {
  const tabKey = getJulyParticipantSheetTab();
  const key = ticketId.trim().toLowerCase();
  if (!key) return { ok: true, row: null, sheetRowIndex: null };
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureHeaderRow(sheets, spreadsheetId, tabKey);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${quoteSheetTab(tabKey)}!A2:${LAST_COL}`,
    });
    const rows = res.data.values ?? [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i] ?? [];
      if (String(row[TICKET_ID_COL] ?? "").trim().toLowerCase() !== key) continue;
      return {
        ok: true,
        sheetRowIndex: i + 2,
        row: mapJulyParticipantRow(row),
      };
    }
    return { ok: true, row: null, sheetRowIndex: null };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}

/** Stamps the check-in column for a ticket's row. No-ops (returns already-set value) if already checked in. */
export async function markJulyParticipantCheckedIn(
  ticketId: string
): Promise<{ ok: true; checkedInAt: string; alreadyCheckedIn: boolean } | { ok: false; message: string }> {
  const found = await findJulyParticipantByTicketId(ticketId);
  if (!found.ok) return found;
  if (!found.row || !found.sheetRowIndex) {
    return { ok: false, message: "Ticket not found." };
  }
  if (found.row.checkedInAt) {
    return { ok: true, checkedInAt: found.row.checkedInAt, alreadyCheckedIn: true };
  }
  const tabKey = getJulyParticipantSheetTab();
  const checkedInAt = new Date().toISOString();
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const col = checkedInColLetter();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quoteSheetTab(tabKey)}!${col}${found.sheetRowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[checkedInAt]] },
    });
    return { ok: true, checkedInAt, alreadyCheckedIn: false };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}
