import { purgeJulyAwardClubFromGoogleSheets } from "@/lib/july-award-google-sheet";
import { deleteJulyAwardGalleryObjectsFromUrls } from "@/lib/marketing/july-award-club-storage";
import { deleteJulyAwardClubCard } from "@/lib/repositories/july-award-club-card";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";

export type PurgeJulyAwardClubCardInput = {
  id: string;
  clubName: string;
  universityName: string;
  logoUrl: string;
};

/** Deletes Supabase row, Google Sheet rows, and july-award Storage files for one club entry. */
export async function purgeJulyAwardClubCard(
  input: PurgeJulyAwardClubCardInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const assetUrls = new Set<string>();
  const logo = ensureSupabasePublicObjectUrl(input.logoUrl.trim());
  if (logo) assetUrls.add(logo);

  const sheets = await purgeJulyAwardClubFromGoogleSheets(input.clubName, input.universityName);
  if (!sheets.ok) {
    return sheets;
  }
  for (const url of sheets.assetUrls) {
    assetUrls.add(url);
  }

  await deleteJulyAwardGalleryObjectsFromUrls([...assetUrls]);

  return deleteJulyAwardClubCard(input.id);
}
