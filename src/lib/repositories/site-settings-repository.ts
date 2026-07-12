import { prisma } from "@/lib/db/prisma";
import { SITE_DEFAULTS } from "@/lib/site-defaults";

export async function getSiteSettingsMap(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, string> = { ...SITE_DEFAULTS };
  for (const row of rows) {
    map[row.key] = row.value ?? "";
  }
  return map;
}

export async function upsertSiteSettings(entries: Record<string, string>): Promise<void> {
  await prisma.$transaction(
    Object.entries(entries).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: value ?? "" },
        update: { value: value ?? "" },
      })
    )
  );
}
