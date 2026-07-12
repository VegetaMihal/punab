/**
 * Creates the registrations tab if missing, then writes the header row.
 *   npm run july-injured-student:setup-sheet
 */
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import {
  getJulyInjuredStudentSheetTab,
  julyInjuredStudentSheetHeaderRangeA1,
  JULY_INJURED_STUDENT_SHEET_HEADER_ROW,
} from "../src/lib/july-injured-student-google-sheet";

function quoteSheetTab(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'`;
}

async function main() {
  const spreadsheetId = process.env.JULY_INJURED_STUDENT_GOOGLE_SHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.error(
      "Missing: JULY_INJURED_STUDENT_GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
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
  const tab = getJulyInjuredStudentSheetTab();

  const { data: meta } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const titles = new Set(
    (meta.sheets ?? []).map((s) => s.properties?.title).filter((t): t is string => Boolean(t))
  );
  if (!titles.has(tab)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
    });
    console.log("Created tab:", tab);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetTab(tab)}!${julyInjuredStudentSheetHeaderRangeA1()}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [JULY_INJURED_STUDENT_SHEET_HEADER_ROW] },
  });
  console.log("Header row written on tab:", tab);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
