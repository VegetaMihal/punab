import { google } from "googleapis";
import {
  getMunSheetId,
  getMunSheetsJwtClient,
  MUN_COL,
  MUN_LAST_COL,
  MUN_SHEET_HEADER_ROW,
  quoteMunSheetTab,
  sheetColumnLetter,
} from "@/lib/mun-form-google";

export type MunApplicationRow = {
  rowIndex: number; // 1-based data row index (row 2 in sheet = rowIndex 1)
  referenceNumber: string;
  submittedAt: string;
  fullName: string;
  certificateName: string;
  email: string;
  mobile: string;
  institutionName: string;
  photoUrl: string;
  studentIdDocUrl: string;
  nationalIdOrPassportUrl: string;
  passportCopyUrl: string;
  amount: string;
  paymentMethod: string;
  amountPaid: string;
  paymentDate: string;
  transactionId: string;
  paymentSenderInfo: string;
  paymentAccountHolderName: string;
  paymentBankName: string;
  paymentProofUrl: string;
  paymentAdditionalInfo: string;
  status: string;
  reviewerNote: string;
  cells: string[];
};

async function getSheetsClient() {
  const jwt = getMunSheetsJwtClient();
  const spreadsheetId = getMunSheetId();
  if (!jwt || !spreadsheetId) {
    throw new Error("MUN form Google Sheets env is not configured.");
  }
  await jwt.authorize();
  return { sheets: google.sheets({ version: "v4", auth: jwt }), spreadsheetId };
}

async function ensureMunHeaderRow(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string): Promise<void> {
  const q = quoteMunSheetTab();
  const headerRange = `${q}!A1:${MUN_LAST_COL}1`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const row = res.data.values?.[0] ?? [];
  const first = row[0];
  const needsWrite =
    row.length !== MUN_SHEET_HEADER_ROW.length || first === undefined || first === null || String(first).trim() === "";
  if (!needsWrite) {
    return;
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: headerRange,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [MUN_SHEET_HEADER_ROW] },
  });
}

function rowErrorHint(raw: string): string {
  return raw.includes("Unable to parse range") || raw.includes("not found")
    ? ' Create a worksheet tab named "applications" and share the spreadsheet with the service account.'
    : "";
}

export async function appendMunApplicationRow(row: string[]): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.length !== MUN_SHEET_HEADER_ROW.length) {
    return { ok: false, message: "Internal row length mismatch." };
  }
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureMunHeaderRow(sheets, spreadsheetId);
    const q = quoteMunSheetTab();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${q}!A:${MUN_LAST_COL}`,
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

function toMunRow(rowIndex: number, cells: string[]): MunApplicationRow {
  const c = (i: number) => String(cells[i] ?? "");
  return {
    rowIndex,
    referenceNumber: c(MUN_COL.referenceNumber),
    submittedAt: c(MUN_COL.submittedAt),
    fullName: c(MUN_COL.fullName),
    certificateName: c(MUN_COL.certificateName),
    email: c(MUN_COL.email),
    mobile: c(MUN_COL.mobile),
    institutionName: c(MUN_COL.institutionName),
    photoUrl: c(MUN_COL.photoUrl),
    studentIdDocUrl: c(MUN_COL.studentIdDocUrl),
    nationalIdOrPassportUrl: c(MUN_COL.nationalIdOrPassportUrl),
    passportCopyUrl: c(MUN_COL.passportCopyUrl),
    amount: c(MUN_COL.amount),
    paymentMethod: c(MUN_COL.paymentMethod),
    amountPaid: c(MUN_COL.amountPaid),
    paymentDate: c(MUN_COL.paymentDate),
    transactionId: c(MUN_COL.transactionId),
    paymentSenderInfo: c(MUN_COL.paymentSenderInfo),
    paymentAccountHolderName: c(MUN_COL.paymentAccountHolderName),
    paymentBankName: c(MUN_COL.paymentBankName),
    paymentProofUrl: c(MUN_COL.paymentProofUrl),
    paymentAdditionalInfo: c(MUN_COL.paymentAdditionalInfo),
    status: c(MUN_COL.status),
    reviewerNote: c(MUN_COL.reviewerNote),
    cells,
  };
}

export async function listMunApplications(): Promise<
  { ok: true; rows: MunApplicationRow[] } | { ok: false; message: string }
> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureMunHeaderRow(sheets, spreadsheetId);
    const q = quoteMunSheetTab();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${q}!A2:${MUN_LAST_COL}`,
    });
    const raw = res.data.values ?? [];
    const rows: MunApplicationRow[] = [];
    raw.forEach((cells, i) => {
      if (!cells.some((c) => c !== undefined && c !== null && String(c).trim() !== "")) {
        return;
      }
      rows.push(toMunRow(i + 1, cells as string[]));
    });
    return { ok: true, rows };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: `${raw}${rowErrorHint(raw)}` };
  }
}

export async function findMunApplicationByReference(
  referenceNumber: string
): Promise<{ ok: true; row: MunApplicationRow | null } | { ok: false; message: string }> {
  const list = await listMunApplications();
  if (!list.ok) return list;
  const row = list.rows.find((r) => r.referenceNumber === referenceNumber) ?? null;
  return { ok: true, row };
}

export async function updateMunApplicationStatus(
  referenceNumber: string,
  update: { status: string; reviewerNote?: string }
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const found = await findMunApplicationByReference(referenceNumber);
    if (!found.ok) return found;
    if (!found.row) return { ok: false, message: "Application not found." };

    const { sheets, spreadsheetId } = await getSheetsClient();
    const q = quoteMunSheetTab();
    const sheetRow = found.row.rowIndex + 1; // +1 for header row

    const writes: { col: number; value: string }[] = [{ col: MUN_COL.status, value: update.status }];
    if (update.reviewerNote !== undefined) writes.push({ col: MUN_COL.reviewerNote, value: update.reviewerNote });

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
