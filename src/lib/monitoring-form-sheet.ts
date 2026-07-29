import { google } from "googleapis";
import {
  getMonitoringSheetId,
  getMonitoringSheetsJwtClient,
  MONITORING_COL,
  MONITORING_LAST_COL,
  MONITORING_SHEET_HEADER_ROW,
  quoteMonitoringSheetTab,
} from "@/lib/monitoring-form-google";

export type MonitoringSheetRow = {
  rowIndex: number; // 1-based data row index (row 2 in sheet = rowIndex 1)
  referenceNumber: string;
  submittedAt: string;
  universityName: string;
  connection: string;
  connectionOther: string;
  programStatus: string;
  observations: string;
  observationsOther: string;
  hasAdminSupporters: string;
  supporterName: string;
  supporterPosition: string;
  supporterReasons: string;
  supporterReasonsOther: string;
  description: string;
  hasEvidence: string;
  evidenceLinks: string;
  contactOk: string;
  contactDetails: string;
  keepConfidential: string;
  score: string;
  category: string;
  status: string;
  reviewerNote: string;
};

async function getSheetsClient() {
  const jwt = getMonitoringSheetsJwtClient();
  const spreadsheetId = getMonitoringSheetId();
  if (!jwt || !spreadsheetId) {
    throw new Error("Monitoring form Google Sheets env is not configured.");
  }
  await jwt.authorize();
  return { sheets: google.sheets({ version: "v4", auth: jwt }), spreadsheetId };
}

async function ensureMonitoringHeaderRow(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string
): Promise<void> {
  const q = quoteMonitoringSheetTab();
  const headerRange = `${q}!A1:${MONITORING_LAST_COL}1`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const row = res.data.values?.[0] ?? [];
  const first = row[0];
  const needsWrite =
    row.length !== MONITORING_SHEET_HEADER_ROW.length ||
    first === undefined ||
    first === null ||
    String(first).trim() === "";
  if (!needsWrite) {
    return;
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: headerRange,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [MONITORING_SHEET_HEADER_ROW] },
  });
}

function rowErrorHint(raw: string): string {
  return raw.includes("Unable to parse range") || raw.includes("not found")
    ? ' Create a worksheet tab named "submissions" and share the spreadsheet with the service account.'
    : "";
}

export async function appendMonitoringSubmissionRow(
  row: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.length !== MONITORING_SHEET_HEADER_ROW.length) {
    return { ok: false, message: "Internal row length mismatch." };
  }
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureMonitoringHeaderRow(sheets, spreadsheetId);
    const q = quoteMonitoringSheetTab();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${q}!A:${MONITORING_LAST_COL}`,
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

function toMonitoringRow(rowIndex: number, cells: string[]): MonitoringSheetRow {
  const c = (i: number) => String(cells[i] ?? "");
  return {
    rowIndex,
    referenceNumber: c(MONITORING_COL.referenceNumber),
    submittedAt: c(MONITORING_COL.submittedAt),
    universityName: c(MONITORING_COL.universityName),
    connection: c(MONITORING_COL.connection),
    connectionOther: c(MONITORING_COL.connectionOther),
    programStatus: c(MONITORING_COL.programStatus),
    observations: c(MONITORING_COL.observations),
    observationsOther: c(MONITORING_COL.observationsOther),
    hasAdminSupporters: c(MONITORING_COL.hasAdminSupporters),
    supporterName: c(MONITORING_COL.supporterName),
    supporterPosition: c(MONITORING_COL.supporterPosition),
    supporterReasons: c(MONITORING_COL.supporterReasons),
    supporterReasonsOther: c(MONITORING_COL.supporterReasonsOther),
    description: c(MONITORING_COL.description),
    hasEvidence: c(MONITORING_COL.hasEvidence),
    evidenceLinks: c(MONITORING_COL.evidenceLinks),
    contactOk: c(MONITORING_COL.contactOk),
    contactDetails: c(MONITORING_COL.contactDetails),
    keepConfidential: c(MONITORING_COL.keepConfidential),
    score: c(MONITORING_COL.score),
    category: c(MONITORING_COL.category),
    status: c(MONITORING_COL.status),
    reviewerNote: c(MONITORING_COL.reviewerNote),
  };
}

export async function listMonitoringSubmissions(): Promise<
  { ok: true; rows: MonitoringSheetRow[] } | { ok: false; message: string }
> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureMonitoringHeaderRow(sheets, spreadsheetId);
    const q = quoteMonitoringSheetTab();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${q}!A2:${MONITORING_LAST_COL}`,
    });
    const raw = res.data.values ?? [];
    const rows: MonitoringSheetRow[] = [];
    raw.forEach((cells, i) => {
      if (!cells.some((c) => c !== undefined && c !== null && String(c).trim() !== "")) {
        return;
      }
      rows.push(toMonitoringRow(i + 1, cells as string[]));
    });
    return { ok: true, rows };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: `${raw}${rowErrorHint(raw)}` };
  }
}

export async function findMonitoringSubmissionByReference(
  referenceNumber: string
): Promise<{ ok: true; row: MonitoringSheetRow | null } | { ok: false; message: string }> {
  const list = await listMonitoringSubmissions();
  if (!list.ok) return list;
  const row = list.rows.find((r) => r.referenceNumber === referenceNumber) ?? null;
  return { ok: true, row };
}

export async function updateMonitoringSubmissionStatus(
  referenceNumber: string,
  update: { status: string; reviewerNote?: string }
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const found = await findMonitoringSubmissionByReference(referenceNumber);
    if (!found.ok) return found;
    if (!found.row) return { ok: false, message: "Submission not found." };

    const { sheets, spreadsheetId } = await getSheetsClient();
    const q = quoteMonitoringSheetTab();
    const sheetRow = found.row.rowIndex + 1; // +1 for header row

    const statusCol = String.fromCharCode(65 + MONITORING_COL.status);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${q}!${statusCol}${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[update.status]] },
    });

    if (update.reviewerNote !== undefined) {
      const noteCol = String.fromCharCode(65 + MONITORING_COL.reviewerNote);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${q}!${noteCol}${sheetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[update.reviewerNote]] },
      });
    }

    return { ok: true };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}

