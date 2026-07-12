import { NextResponse } from "next/server";

/** Legacy one-shot PDF endpoint — use create + [id]/generate-pdf instead. */
export async function POST() {
  return NextResponse.json(
    { error: "Create an invitation draft first, then generate PDF from its detail page." },
    { status: 410 },
  );
}

