import { NextResponse } from "next/server";
import { getPrismaDatabaseUrlAudit } from "@/lib/db/resolve-database-url";

/**
 * Temporary: safe DB target audit (no secrets). Disabled in production.
 * GET /api/debug/db-host
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.json(getPrismaDatabaseUrlAudit());
}
