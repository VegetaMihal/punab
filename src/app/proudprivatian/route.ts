import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

/**
 * Serves the Proud Privatian Card Studio HTML at /proudprivatian.
 * The file is read once at module load so it stays cached in memory
 * across warm serverless invocations.
 */
const html = readFileSync(
  join(process.cwd(), "src/components/Privatian/Proud Privatian Card Studio.html"),
  "utf-8"
);

export async function GET() {
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
