/**
 * One-off / repeat-safe: creates missing worksheet tabs (one per July Award category key)
 * and writes the standard header row (full width) on row 1 of each tab.
 *
 * Run from repo root:
 *   npm run july-award:setup-sheets
 *
 * Requires in .env.local: JULY_AWARD_GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
 * GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY — and the spreadsheet shared with the service account (Editor).
 *
 */
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { JULY_AWARD_CLUB_CATEGORIES } from "../src/lib/july-award-2026-clubs";
import {
  JULY_AWARD_APPRECIATION_PARTNER_HEADER_ROW,
  JULY_AWARD_APPRECIATION_PARTNERS_TAB,
  JULY_AWARD_LEGACY_SHEET_TAB_RENAMES,
  JULY_AWARD_SHEET_HEADER_ROW,
  julyAwardSheetHeaderRangeA1,
} from "../src/lib/july-award-google-sheet";

function quoteSheetTab(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'`;
}

type SheetInfo = { sheetId: number; title: string };

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

async function countDataRows(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabKey: string
): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetTab(tabKey)}!A2:${LAST_COL}`,
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

async function reconcileLegacyTabs(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetList: SheetInfo[]
): Promise<SheetInfo[]> {
  let list = [...sheetList];

  for (const [legacy, next] of Object.entries(JULY_AWARD_LEGACY_SHEET_TAB_RENAMES)) {
    const legacySheet = list.find((s) => s.title === legacy);
    if (!legacySheet) continue;

    const nextSheet = list.find((s) => s.title === next);
    if (!nextSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: { sheetId: legacySheet.sheetId, title: next },
                fields: "title",
              },
            },
          ],
        },
      });
      console.log(`Renamed tab: ${legacy} → ${next}`);
      list = list.map((s) => (s.sheetId === legacySheet.sheetId ? { ...s, title: next } : s));
      continue;
    }

    const legacyRows = await countDataRows(sheets, spreadsheetId, legacy);
    if (legacyRows > 0) {
      console.error(
        `Both "${legacy}" and "${next}" exist; "${legacy}" has ${legacyRows} nomination row(s). Move rows to "${next}", delete "${legacy}", then re-run.`
      );
      process.exit(1);
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteSheet: { sheetId: legacySheet.sheetId } }] },
    });
    console.log(`Deleted empty legacy tab: ${legacy}`);
    list = list.filter((s) => s.sheetId !== legacySheet.sheetId);
  }

  return list;
}

async function main() {
  const spreadsheetId = process.env.JULY_AWARD_GOOGLE_SHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.error(
      "Missing env: JULY_AWARD_GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
    );
    process.exit(1);
  }

  const jwt = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  await jwt.authorize();
  const sheets = google.sheets({ version: "v4", auth: jwt });

  const { data } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });
  let sheetList: SheetInfo[] = (data.sheets ?? [])
    .map((s) => ({
      sheetId: s.properties?.sheetId,
      title: s.properties?.title,
    }))
    .filter((s): s is SheetInfo => typeof s.sheetId === "number" && Boolean(s.title));

  sheetList = await reconcileLegacyTabs(sheets, spreadsheetId, sheetList);

  const existing = new Set(sheetList.map((s) => s.title));
  const needed = JULY_AWARD_CLUB_CATEGORIES.map((c) => c.key);
  const toCreate = needed.filter((k) => !existing.has(k));

  if (toCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: toCreate.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    });
    console.log("Created tabs:", toCreate.join(", "));
  } else {
    console.log("All category tabs already exist (no new sheets added).");
  }

  for (const key of needed) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quoteSheetTab(key)}!${julyAwardSheetHeaderRangeA1()}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [JULY_AWARD_SHEET_HEADER_ROW] },
    });
  }
  console.log("Header row written on tabs:", needed.join(", "));

  const refreshed = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(title)",
  });
  const titles = new Set(
    (refreshed.data.sheets ?? [])
      .map((s) => s.properties?.title)
      .filter((t): t is string => Boolean(t))
  );
  if (!titles.has(JULY_AWARD_APPRECIATION_PARTNERS_TAB)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: JULY_AWARD_APPRECIATION_PARTNERS_TAB } } }],
      },
    });
    console.log("Created tab:", JULY_AWARD_APPRECIATION_PARTNERS_TAB);
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetTab(JULY_AWARD_APPRECIATION_PARTNERS_TAB)}!A1:D1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [JULY_AWARD_APPRECIATION_PARTNER_HEADER_ROW] },
  });
  console.log("Header row written on tab:", JULY_AWARD_APPRECIATION_PARTNERS_TAB);

  console.log(`Done — ${needed.length} category tabs (expected ${JULY_AWARD_CLUB_CATEGORIES.length}).`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
