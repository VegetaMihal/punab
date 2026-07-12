import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { JULY_AWARD_CLUB_CATEGORIES } from "@/lib/july-award-2026-clubs";
import { formatJulyAwardPartnerNo } from "@/lib/marketing/july-award-partner-number";

/** Former category tab keys → current key (setup script renames or removes legacy tabs). */
export const JULY_AWARD_LEGACY_SHEET_TAB_RENAMES: Record<string, string> = {
  "blood-health": "pharmacy-health",
};

/** Header row written to row 1 of each category tab when empty or column count changes. */
export const JULY_AWARD_SHEET_HEADER_ROW: string[] = [
  "Submitted at (UTC)",
  "Club name",
  "University name",
  "Club social link",
  "Club logo URL",
  "Mobile number",
  "Year established",
  "Email for communication",
  "Active members (approx)",
  "Events last 12 months",
  "President name",
  "Faculty role (teacher, convener, or advisor)",
  "Faculty contact name",
  "Faculty contact mobile",
  "Supporting Google Drive link(s)",
  "Supporting PDF URL",
];

const MAX_NOMINATIONS_PER_TAB = 10;

function sheetLastColumnLetter(): string {
  let n = JULY_AWARD_SHEET_HEADER_ROW.length;
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

export function getJulyAwardSpreadsheetId(): string | null {
  const id = process.env.JULY_AWARD_GOOGLE_SHEET_ID?.trim();
  return id || null;
}

export function isJulyAwardSheetsConfigured(): boolean {
  return Boolean(getJwtClient() && getJulyAwardSpreadsheetId());
}

/** e.g. `A1:P1` for use in Sheets API ranges. */
export function julyAwardSheetHeaderRangeA1(): string {
  return `A1:${LAST_COL}1`;
}

async function getSheetsClient() {
  const jwt = getJwtClient();
  const spreadsheetId = getJulyAwardSpreadsheetId();
  if (!jwt || !spreadsheetId) {
    throw new Error("July Award Google Sheets env is not configured.");
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
  const headerRange = `${q}!${julyAwardSheetHeaderRangeA1()}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });
  const row = res.data.values?.[0] ?? [];
  const H = JULY_AWARD_SHEET_HEADER_ROW;
  const first = row[0];
  const needsWrite =
    row.length !== H.length ||
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
    requestBody: { values: [JULY_AWARD_SHEET_HEADER_ROW] },
  });
}

async function countDataRows(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabKey: string
): Promise<number> {
  const q = quoteSheetTab(tabKey);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${q}!A2:${LAST_COL}`,
  });
  const rows = res.data.values ?? [];
  let n = 0;
  for (const row of rows) {
    if (row.some((c) => c !== undefined && c !== null && String(c).trim() !== "")) {
      n += 1;
    }
  }
  return n;
}

/**
 * Appends one nomination row to the tab named exactly `categoryTabKey`.
 * Enforces {@link MAX_NOMINATIONS_PER_TAB} data rows (excluding header).
 */
export async function appendJulyAwardNominationRow(
  categoryTabKey: string,
  row: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.length !== JULY_AWARD_SHEET_HEADER_ROW.length) {
    return { ok: false, message: "Internal row length mismatch." };
  }
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureHeaderRow(sheets, spreadsheetId, categoryTabKey);
    const count = await countDataRows(sheets, spreadsheetId, categoryTabKey);
    if (count >= MAX_NOMINATIONS_PER_TAB) {
      return {
        ok: false,
        message: "This category has reached the maximum number of nominations.",
      };
    }
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${quoteSheetTab(categoryTabKey)}!A:${LAST_COL}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
    return { ok: true };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    const hint =
      raw.includes("Unable to parse range") || raw.includes("not found")
        ? " Create a worksheet tab whose name matches this category key exactly, and share the spreadsheet with the service account."
        : "";
    return { ok: false, message: `${raw}${hint}` };
  }
}

export const JULY_AWARD_APPRECIATION_PARTNERS_TAB = "appreciation-partners";

export const JULY_AWARD_APPRECIATION_PARTNER_HEADER_ROW: string[] = [
  "Submitted at (UTC)",
  "Club name",
  "University name",
  "Partner N°",
];

async function ensureAppreciationPartnersTab(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string
): Promise<void> {
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(title)",
  });
  const titles = new Set(
    (data.sheets ?? []).map((s) => s.properties?.title).filter((t): t is string => Boolean(t))
  );
  if (!titles.has(JULY_AWARD_APPRECIATION_PARTNERS_TAB)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: { properties: { title: JULY_AWARD_APPRECIATION_PARTNERS_TAB } },
          },
        ],
      },
    });
  }
  const q = quoteSheetTab(JULY_AWARD_APPRECIATION_PARTNERS_TAB);
  const headerRange = `${q}!A1:D1`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const row = res.data.values?.[0] ?? [];
  if (row.length === 0 || String(row[0] ?? "").trim() === "") {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [JULY_AWARD_APPRECIATION_PARTNER_HEADER_ROW] },
    });
  }
}

async function countAppreciationPartnerRows(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string
): Promise<number> {
  await ensureAppreciationPartnersTab(sheets, spreadsheetId);
  const q = quoteSheetTab(JULY_AWARD_APPRECIATION_PARTNERS_TAB);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${q}!A2:D`,
  });
  const rows = res.data.values ?? [];
  let n = 0;
  for (const row of rows) {
    if (row.some((c) => c !== undefined && c !== null && String(c).trim() !== "")) {
      n += 1;
    }
  }
  return n;
}

/**
 * Registers a participation card and returns the next partner number (AP-2026-####).
 * Requires worksheet tab `appreciation-partners` on the July Award spreadsheet.
 */
export async function registerJulyAwardAppreciationPartner(
  clubName: string,
  universityName: string,
  partnerNo: string
): Promise<{ ok: true; partnerNo: string } | { ok: false; message: string }> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureAppreciationPartnersTab(sheets, spreadsheetId);
    const q = quoteSheetTab(JULY_AWARD_APPRECIATION_PARTNERS_TAB);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${q}!A:D`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[new Date().toISOString(), clubName, universityName, partnerNo]],
      },
    });
    return { ok: true, partnerNo };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    const hint =
      raw.includes("Unable to parse range") || raw.includes("not found")
        ? ` Create worksheet tab "${JULY_AWARD_APPRECIATION_PARTNERS_TAB}" and share the spreadsheet with the service account.`
        : "";
    return { ok: false, message: `${raw}${hint}` };
  }
}

/** Next sequential partner number from row count (before append). */
export async function nextJulyAwardAppreciationPartnerSequence(): Promise<
  { ok: true; sequence: number } | { ok: false; message: string }
> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const count = await countAppreciationPartnerRows(sheets, spreadsheetId);
    return { ok: true, sequence: count + 1 };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}

function appreciationPartnerLookupKey(clubName: string, universityName: string): string {
  return `${clubName.trim().toLowerCase()}|${universityName.trim().toLowerCase()}`;
}

/** Returns stored partner N° for this club + university, if already registered. */
export async function findJulyAwardAppreciationPartnerNo(
  clubName: string,
  universityName: string
): Promise<{ ok: true; partnerNo: string | null } | { ok: false; message: string }> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await ensureAppreciationPartnersTab(sheets, spreadsheetId);
    const q = quoteSheetTab(JULY_AWARD_APPRECIATION_PARTNERS_TAB);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${q}!A2:D`,
    });
    const key = appreciationPartnerLookupKey(clubName, universityName);
    const rows = res.data.values ?? [];
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const row = rows[i] ?? [];
      const rowClub = String(row[1] ?? "").trim();
      const rowUni = String(row[2] ?? "").trim();
      const rowNo = String(row[3] ?? "").trim();
      if (!rowClub || !rowUni || !rowNo) continue;
      if (appreciationPartnerLookupKey(rowClub, rowUni) === key) {
        return { ok: true, partnerNo: rowNo };
      }
    }
    return { ok: true, partnerNo: null };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}

/**
 * One partner N° per club + university: returns existing or allocates the next sequential number and appends a row.
 */
export async function getOrCreateJulyAwardAppreciationPartner(
  clubName: string,
  universityName: string
): Promise<
  { ok: true; partnerNo: string; created: boolean } | { ok: false; message: string }
> {
  const existing = await findJulyAwardAppreciationPartnerNo(clubName, universityName);
  if (!existing.ok) {
    return existing;
  }
  if (existing.partnerNo) {
    return { ok: true, partnerNo: existing.partnerNo, created: false };
  }

  const seqRes = await nextJulyAwardAppreciationPartnerSequence();
  if (!seqRes.ok) {
    return seqRes;
  }

  const partnerNo = formatJulyAwardPartnerNo(seqRes.sequence);
  const reg = await registerJulyAwardAppreciationPartner(clubName, universityName, partnerNo);
  if (!reg.ok) {
    return reg;
  }
  return { ok: true, partnerNo: reg.partnerNo, created: true };
}

const NOMINATION_CLUB_COL = 1;
const NOMINATION_UNI_COL = 2;
const NOMINATION_LOGO_COL = 4;
const NOMINATION_PDF_COL = 15;
const PARTNER_CLUB_COL = 1;
const PARTNER_UNI_COL = 2;

type SheetRowDelete = { sheetId: number; rowIndex: number };

function nominationLookupKey(clubName: string, universityName: string): string {
  return `${clubName.trim().toLowerCase()}|${universityName.trim().toLowerCase()}`;
}

function collectUrl(assetUrls: Set<string>, value: unknown) {
  const url = String(value ?? "").trim();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    assetUrls.add(url);
  }
}

async function listSpreadsheetSheets(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string
): Promise<{ sheetId: number; title: string }[]> {
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });
  const out: { sheetId: number; title: string }[] = [];
  for (const sheet of data.sheets ?? []) {
    const sheetId = sheet.properties?.sheetId;
    const title = sheet.properties?.title;
    if (sheetId == null || !title) continue;
    out.push({ sheetId, title });
  }
  return out;
}

function julyAwardNominationTabTitles(): Set<string> {
  const titles = new Set<string>(JULY_AWARD_CLUB_CATEGORIES.map((c) => c.key));
  for (const legacy of Object.keys(JULY_AWARD_LEGACY_SHEET_TAB_RENAMES)) {
    titles.add(legacy);
  }
  return titles;
}

async function findSheetRowDeletes(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  clubName: string,
  universityName: string
): Promise<{ deletes: SheetRowDelete[]; assetUrls: string[] }> {
  const key = nominationLookupKey(clubName, universityName);
  const deletes: SheetRowDelete[] = [];
  const assetUrls = new Set<string>();
  const nominationTabs = julyAwardNominationTabTitles();
  const allSheets = await listSpreadsheetSheets(sheets, spreadsheetId);

  for (const { sheetId, title } of allSheets) {
    const q = quoteSheetTab(title);
    if (title === JULY_AWARD_APPRECIATION_PARTNERS_TAB) {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${q}!A2:D`,
      });
      const rows = res.data.values ?? [];
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] ?? [];
        const rowClub = String(row[PARTNER_CLUB_COL] ?? "").trim();
        const rowUni = String(row[PARTNER_UNI_COL] ?? "").trim();
        if (!rowClub || !rowUni) continue;
        if (nominationLookupKey(rowClub, rowUni) === key) {
          deletes.push({ sheetId, rowIndex: i + 1 });
        }
      }
      continue;
    }

    if (!nominationTabs.has(title)) {
      continue;
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${q}!A2:${LAST_COL}`,
    });
    const rows = res.data.values ?? [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i] ?? [];
      if (!row.some((c) => c !== undefined && c !== null && String(c).trim() !== "")) {
        continue;
      }
      const rowClub = String(row[NOMINATION_CLUB_COL] ?? "").trim();
      const rowUni = String(row[NOMINATION_UNI_COL] ?? "").trim();
      if (!rowClub || !rowUni) continue;
      if (nominationLookupKey(rowClub, rowUni) !== key) continue;
      deletes.push({ sheetId, rowIndex: i + 1 });
      collectUrl(assetUrls, row[NOMINATION_LOGO_COL]);
      collectUrl(assetUrls, row[NOMINATION_PDF_COL]);
    }
  }

  return { deletes, assetUrls: [...assetUrls] };
}

async function applySheetRowDeletes(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  deletes: SheetRowDelete[]
): Promise<void> {
  if (deletes.length === 0) return;
  const sorted = [...deletes].sort((a, b) => {
    if (a.sheetId !== b.sheetId) return a.sheetId - b.sheetId;
    return b.rowIndex - a.rowIndex;
  });
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: sorted.map((d) => ({
        deleteDimension: {
          range: {
            sheetId: d.sheetId,
            dimension: "ROWS",
            startIndex: d.rowIndex,
            endIndex: d.rowIndex + 1,
          },
        },
      })),
    },
  });
}

/**
 * Removes nomination + appreciation-partner rows for this club/university from all worksheet tabs.
 * Returns logo/PDF URLs found in sheet cells for Storage cleanup.
 */
export async function purgeJulyAwardClubFromGoogleSheets(
  clubName: string,
  universityName: string
): Promise<{ ok: true; assetUrls: string[] } | { ok: false; message: string }> {
  if (!isJulyAwardSheetsConfigured()) {
    return { ok: true, assetUrls: [] };
  }
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const { deletes, assetUrls } = await findSheetRowDeletes(sheets, spreadsheetId, clubName, universityName);
    await applySheetRowDeletes(sheets, spreadsheetId, deletes);
    return { ok: true, assetUrls };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Google Sheets request failed.";
    return { ok: false, message: raw };
  }
}
