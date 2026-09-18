import { google } from "googleapis";
import {
  getBabbfSheetId,
  getBabbfSheetsJwtClient,
  BABBF_COL,
  BABBF_LAST_COL,
  BABBF_SHEET_HEADER_ROW,
  quoteBabbfSheetTab,
  sheetColumnLetter,
} from "@/lib/babbf-registration-google";

export type BabbfRegistrationRow = {
  rowIndex: number; // 1-based data row index (row 2 in sheet = rowIndex 1)
  referenceNumber: string;
  submittedAt: string;
  fullName: string;
  phone: string;
  email: string;
  universityName: string;
  department: string;
  gender: string;
  weightCategory: string;
  bloodGroup: string;
  photoUrl: string;
  amount: string;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshotUrl: string;
  status: string;
  reviewerNote: string;
  cells: string[];
};

async function getSheetsClient() {
  const jwt = getBabbfSheetsJwtClient();
  const spreadsheetId = getBabbfSheetId();
  if (!jwt || !spreadsheetId) {
    throw new Error("BABBF registration Google Sheets env is not configured.");
  }
  await jwt.authorize();
  return { sheets: google.sheets({ version: "v4", auth: jwt }), spreadsheetId };
}

async function ensureBabbfHeaderRow(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string): Promise<void> {
  const q = quoteBabbfSheetTab();
  const headerRange = `${q}!A1:${BABBF_LAST_COL}1`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const row = res.data.values?.[0] ?? [];
  const first = row[0];
  const needsWrite =
    row.length !== BABBF_SHEET_HEADER_ROW.length || first === undefined || first === null || String(first).trim() === "";
  if (!needsWrite) {
    return;
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: headerRange,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [BABBF_SHEET_HEADER_ROW] },
  });
}

function rowErrorHint(raw: string): string {
  return raw.includes("Unable to parse range") || raw.includes("not found")
    ? ' Create a worksheet tab named "registrations" and share the spreadsheet with the service account.'
    : "";
}

export async function appendBabbfRegistrationRow(row: string[]): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.length !== BABBF_SHEET_HEADER_ROW.length) {
    return { ok: false, message: "Internal row length mismatch." };
  }
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureBabbfHeaderRow(sheets, spreadsheetId);
    const q = quoteBabbfSheetTab();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${q}!A:${BABBF_LAST_COL}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
    return { ok: true };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: `${raw}${rowErrorHint(raw)}` };
  }
}

function toBabbfRow(rowIndex: number, cells: string[]): BabbfRegistrationRow {
  const c = (i: number) => String(cells[i] ?? "");
  return {
    rowIndex,
    referenceNumber: c(BABBF_COL.referenceNumber),
    submittedAt: c(BABBF_COL.submittedAt),
    fullName: c(BABBF_COL.fullName),
    phone: c(BABBF_COL.phone),
    email: c(BABBF_COL.email),
    universityName: c(BABBF_COL.universityName),
    department: c(BABBF_COL.department),
    gender: c(BABBF_COL.gender),
    weightCategory: c(BABBF_COL.weightCategory),
    bloodGroup: c(BABBF_COL.bloodGroup),
    photoUrl: c(BABBF_COL.photoUrl),
    amount: c(BABBF_COL.amount),
    paymentMethod: c(BABBF_COL.paymentMethod),
    transactionId: c(BABBF_COL.transactionId),
    paymentScreenshotUrl: c(BABBF_COL.paymentScreenshotUrl),
    status: c(BABBF_COL.status),
    reviewerNote: c(BABBF_COL.reviewerNote),
    cells,
  };
}

export async function listBabbfRegistrations(): Promise<
  { ok: true; rows: BabbfRegistrationRow[] } | { ok: false; message: string }
> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureBabbfHeaderRow(sheets, spreadsheetId);
    const q = quoteBabbfSheetTab();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${q}!A2:${BABBF_LAST_COL}`,
    });
    const raw = res.data.values ?? [];
    const rows: BabbfRegistrationRow[] = [];
    raw.forEach((cells, i) => {
      if (!cells.some((c) => c !== undefined && c !== null && String(c).trim() !== "")) {
        return;
      }
      rows.push(toBabbfRow(i + 1, cells as string[]));
    });
    return { ok: true, rows };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: `${raw}${rowErrorHint(raw)}` };
  }
}

export async function findBabbfRegistrationByReference(
  referenceNumber: string
): Promise<{ ok: true; row: BabbfRegistrationRow | null } | { ok: false; message: string }> {
  const list = await listBabbfRegistrations();
  if (!list.ok) return list;
  const row = list.rows.find((r) => r.referenceNumber === referenceNumber) ?? null;
  return { ok: true, row };
}

export async function findBabbfRegistrationByEmail(
  email: string
): Promise<{ ok: true; row: BabbfRegistrationRow | null } | { ok: false; message: string }> {
  const list = await listBabbfRegistrations();
  if (!list.ok) return list;
  const target = email.trim().toLowerCase();
  const row = list.rows.find((r) => r.email.trim().toLowerCase() === target) ?? null;
  return { ok: true, row };
}

export async function updateBabbfRegistrationStatus(
  referenceNumber: string,
  update: { status: string; reviewerNote?: string }
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const found = await findBabbfRegistrationByReference(referenceNumber);
    if (!found.ok) return found;
    if (!found.row) return { ok: false, message: "Registration not found." };

    const { sheets, spreadsheetId } = await getSheetsClient();
    const q = quoteBabbfSheetTab();
    const sheetRow = found.row.rowIndex + 1; // +1 for header row

    const writes: { col: number; value: string }[] = [{ col: BABBF_COL.status, value: update.status }];
    if (update.reviewerNote !== undefined) writes.push({ col: BABBF_COL.reviewerNote, value: update.reviewerNote });

    for (const w of writes) {
      const colLetter = sheetColumnLetter(w.col);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${q}!${colLetter}${sheetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[w.value]] },
      });
    }

    return { ok: true };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}
