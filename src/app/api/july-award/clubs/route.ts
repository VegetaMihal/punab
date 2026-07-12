import { NextResponse } from "next/server";
import { listJulyAwardClubCardsForAdmin } from "@/lib/repositories/july-award-club-card";

export async function GET() {
  const items = await listJulyAwardClubCardsForAdmin();
  const clubs = items.map((c) => ({ clubName: c.club_name, universityName: c.university_name }));
  return NextResponse.json({ clubs });
}
