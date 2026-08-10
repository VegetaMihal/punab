import * as XLSX from "xlsx";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { listMunApplications } from "@/lib/mun-form-sheet";
import { MUN_SHEET_HEADER_ROW } from "@/lib/mun-form-google";

export async function GET() {
  try {
    await assertAdminScope("mun_form");

    const result = await listMunApplications();
    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const data = result.rows.map((r) =>
      Object.fromEntries(MUN_SHEET_HEADER_ROW.map((label, i) => [label, r.cells[i] ?? ""]))
    );

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, "IMUN applications");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="imun-2026-applications.xlsx"`,
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
