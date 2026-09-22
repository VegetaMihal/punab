import { google } from "googleapis";
import {
  getBabbfSheetId,
  getBabbfSheetsJwtClient,
  BABBF_COL,
  BABBF_LAST_COL,
  BABBF_SHEET_HEADER_ROW,
  BABBF_SHEET_TABS,
  quoteBabbfSheetTab,
  sheetColumnLetter,
  type BabbfSheetEventType,
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
  eventType: string;
  category: string;
  bloodGroup: string;
  photoUrl: string;
  amount: string;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshotUrl: string;
  status: string;
  reviewerNote: string;
  studentCategory: string;
  studentIdOrNid: string;
  rightHandConfirmed: string;
  declarationAccepted: string;
  paymentSenderNumber: string;
  checkedInAt: string;
  checkedInVia: string;
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

async function ensureBabbfSheetTab(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  eventType: BabbfSheetEventType
): Promise<void> {
  const tabName = BABBF_SHEET_TABS[eventType];
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = (meta.data.sheets ?? []).some((s) => s.properties?.title === tabName);
  if (exists) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
  });
}

async function ensureBabbfHeaderRow(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  eventType: BabbfSheetEventType
): Promise<void> {
  await ensureBabbfSheetTab(sheets, spreadsheetId, eventType);
  const q = quoteBabbfSheetTab(eventType);
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

function rowErrorHint(raw: string, eventType: BabbfSheetEventType): string {
  return raw.includes("Unable to parse range") || raw.includes("not found")
    ? ` Create a worksheet tab named "${BABBF_SHEET_TABS[eventType]}" and share the spreadsheet with the service account.`
    : "";
}

/** Tries the append directly — no pre-flight read calls — and only pays for a tab/header check
 * (and retries once) if that first append actually fails. Keeps the common case (tab already
 * exists) down to a single Sheets API call instead of 3. */
export async function appendBabbfRegistrationRow(
  eventType: BabbfSheetEventType,
  row: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.length !== BABBF_SHEET_HEADER_ROW.length) {
    return { ok: false, message: "Internal row length mismatch." };
  }
  const q = quoteBabbfSheetTab(eventType);
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${q}!A:${BABBF_LAST_COL}`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] },
      });
      return { ok: true };
    } catch {
      // First-ever write for this tab (or header missing) — set it up, then retry once.
      await ensureBabbfHeaderRow(sheets, spreadsheetId, eventType);
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${q}!A:${BABBF_LAST_COL}`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] },
      });
      return { ok: true };
    }
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: `${raw}${rowErrorHint(raw, eventType)}` };
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
    eventType: c(BABBF_COL.eventType),
    category: c(BABBF_COL.category),
    bloodGroup: c(BABBF_COL.bloodGroup),
    photoUrl: c(BABBF_COL.photoUrl),
    amount: c(BABBF_COL.amount),
    paymentMethod: c(BABBF_COL.paymentMethod),
    transactionId: c(BABBF_COL.transactionId),
    paymentScreenshotUrl: c(BABBF_COL.paymentScreenshotUrl),
    status: c(BABBF_COL.status),
    reviewerNote: c(BABBF_COL.reviewerNote),
    studentCategory: c(BABBF_COL.studentCategory),
    studentIdOrNid: c(BABBF_COL.studentIdOrNid),
    rightHandConfirmed: c(BABBF_COL.rightHandConfirmed),
    declarationAccepted: c(BABBF_COL.declarationAccepted),
    paymentSenderNumber: c(BABBF_COL.paymentSenderNumber),
    checkedInAt: c(BABBF_COL.checkedInAt),
    checkedInVia: c(BABBF_COL.checkedInVia),
    cells,
  };
}

function rowsFromValues(values: string[][] | undefined | null): BabbfRegistrationRow[] {
  const raw = values ?? [];
  const rows: BabbfRegistrationRow[] = [];
  raw.forEach((cells, i) => {
    if (!cells.some((c) => c !== undefined && c !== null && String(c).trim() !== "")) {
      return;
    }
    rows.push(toBabbfRow(i + 1, cells));
  });
  return rows;
}

/** Single read call (no header/tab existence check — that only matters on first-ever write) so repeated
 * page loads don't burn the Sheets API "read requests per minute" quota. */
export async function listBabbfRegistrations(
  eventType: BabbfSheetEventType
): Promise<{ ok: true; rows: BabbfRegistrationRow[] } | { ok: false; message: string }> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const q = quoteBabbfSheetTab(eventType);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${q}!A2:${BABBF_LAST_COL}`,
    });
    return { ok: true, rows: rowsFromValues(res.data.values as string[][] | undefined) };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: `${raw}${rowErrorHint(raw, eventType)}` };
  }
}

const ALL_EVENT_TYPES = Object.keys(BABBF_SHEET_TABS) as BabbfSheetEventType[];

/** Fetches both event tabs in a single Sheets API call (values.batchGet counts as one read request
 * regardless of range count) — use this instead of looping listBabbfRegistrations per event type. */
export async function batchListBabbfRegistrations(): Promise<
  { ok: true; rowsByEventType: Record<BabbfSheetEventType, BabbfRegistrationRow[]> } | { ok: false; message: string }
> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const ranges = ALL_EVENT_TYPES.map((eventType) => `${quoteBabbfSheetTab(eventType)}!A2:${BABBF_LAST_COL}`);
    const res = await sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges });
    const valueRanges = res.data.valueRanges ?? [];
    const rowsByEventType = {} as Record<BabbfSheetEventType, BabbfRegistrationRow[]>;
    ALL_EVENT_TYPES.forEach((eventType, i) => {
      rowsByEventType[eventType] = rowsFromValues(valueRanges[i]?.values as string[][] | undefined);
    });
    return { ok: true, rowsByEventType };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}

export async function findBabbfRegistrationByReference(
  referenceNumber: string
): Promise<
  { ok: true; row: (BabbfRegistrationRow & { eventType: string }) | null; sheetEventType: BabbfSheetEventType | null }
  | { ok: false; message: string }
> {
  const batch = await batchListBabbfRegistrations();
  if (!batch.ok) return batch;
  for (const eventType of ALL_EVENT_TYPES) {
    const row = batch.rowsByEventType[eventType].find((r) => r.referenceNumber === referenceNumber);
    if (row) {
      return { ok: true, row, sheetEventType: eventType };
    }
  }
  return { ok: true, row: null, sheetEventType: null };
}

export async function findBabbfRegistrationByEmail(
  eventType: BabbfSheetEventType,
  email: string
): Promise<{ ok: true; row: BabbfRegistrationRow | null } | { ok: false; message: string }> {
  const list = await listBabbfRegistrations(eventType);
  if (!list.ok) return list;
  const target = email.trim().toLowerCase();
  const row = list.rows.find((r) => r.email.trim().toLowerCase() === target) ?? null;
  return { ok: true, row };
}

export async function updateBabbfRegistrationStatus(
  referenceNumber: string,
  update: { status: string; reviewerNote?: string }
): Promise<
  { ok: true; row: BabbfRegistrationRow; sheetEventType: BabbfSheetEventType } | { ok: false; message: string }
> {
  try {
    const found = await findBabbfRegistrationByReference(referenceNumber);
    if (!found.ok) return found;
    if (!found.row || !found.sheetEventType) return { ok: false, message: "Registration not found." };

    const { sheets, spreadsheetId } = await getSheetsClient();
    const q = quoteBabbfSheetTab(found.sheetEventType);
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

    return { ok: true, row: found.row, sheetEventType: found.sheetEventType };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}

export async function markBabbfCheckedIn(
  referenceNumber: string,
  via: string
): Promise<
  | { ok: true; row: BabbfRegistrationRow; sheetEventType: BabbfSheetEventType; alreadyCheckedIn: boolean; checkedInAt: string }
  | { ok: false; message: string }
> {
  try {
    const found = await findBabbfRegistrationByReference(referenceNumber);
    if (!found.ok) return found;
    if (!found.row || !found.sheetEventType) return { ok: false, message: "Registration not found." };

    if (found.row.checkedInAt) {
      return {
        ok: true,
        row: found.row,
        sheetEventType: found.sheetEventType,
        alreadyCheckedIn: true,
        checkedInAt: found.row.checkedInAt,
      };
    }

    const { sheets, spreadsheetId } = await getSheetsClient();
    const q = quoteBabbfSheetTab(found.sheetEventType);
    const sheetRow = found.row.rowIndex + 1;
    const checkedInAt = new Date().toISOString();

    const writes: { col: number; value: string }[] = [
      { col: BABBF_COL.checkedInAt, value: checkedInAt },
      { col: BABBF_COL.checkedInVia, value: via },
    ];
    for (const w of writes) {
      const colLetter = sheetColumnLetter(w.col);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${q}!${colLetter}${sheetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[w.value]] },
      });
    }

    return { ok: true, row: found.row, sheetEventType: found.sheetEventType, alreadyCheckedIn: false, checkedInAt };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}

/** Clears a check-in (admin correction — e.g. scanned by mistake). */
export async function markBabbfCheckedOut(
  referenceNumber: string
): Promise<{ ok: true; row: BabbfRegistrationRow; sheetEventType: BabbfSheetEventType } | { ok: false; message: string }> {
  try {
    const found = await findBabbfRegistrationByReference(referenceNumber);
    if (!found.ok) return found;
    if (!found.row || !found.sheetEventType) return { ok: false, message: "Registration not found." };

    const { sheets, spreadsheetId } = await getSheetsClient();
    const q = quoteBabbfSheetTab(found.sheetEventType);
    const sheetRow = found.row.rowIndex + 1;

    const writes: { col: number; value: string }[] = [
      { col: BABBF_COL.checkedInAt, value: "" },
      { col: BABBF_COL.checkedInVia, value: "" },
    ];
    for (const w of writes) {
      const colLetter = sheetColumnLetter(w.col);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${q}!${colLetter}${sheetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[w.value]] },
      });
    }

    return { ok: true, row: found.row, sheetEventType: found.sheetEventType };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}
