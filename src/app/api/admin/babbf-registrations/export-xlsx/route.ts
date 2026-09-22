import * as XLSX from "xlsx";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { listBabbfRegistrations } from "@/lib/babbf-registration-sheet";
import { BABBF_SHEET_HEADER_ROW } from "@/lib/babbf-registration-google";
import { BABBF_EVENT_TYPE_LABEL, BABBF_EVENT_TYPES } from "@/lib/validations/babbf-registration";

export async function GET() {
  try {
    await assertAdminScope("babbf_registrations");

    const workbook = XLSX.utils.book_new();

    for (const eventType of BABBF_EVENT_TYPES) {
      const result = await listBabbfRegistrations(eventType);
      if (!result.ok) {
        return new Response(JSON.stringify({ error: `${BABBF_EVENT_TYPE_LABEL[eventType]}: ${result.message}` }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }

      const data = result.rows.map((r) =>
        Object.fromEntries(BABBF_SHEET_HEADER_ROW.map((label, i) => [label, r.cells[i] ?? ""]))
      );

      const sheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, sheet, BABBF_EVENT_TYPE_LABEL[eventType]);
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="babbf-championship-2026-registrations.xlsx"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to export";
    return new Response(JSON.stringify({ error: message }), {
      status: message === "Unauthorized" || message === "Forbidden" ? 401 : 500,
      headers: { "content-type": "application/json" },
    });
  }
}
