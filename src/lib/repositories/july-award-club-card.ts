import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import type { JulyAwardClubCardRow } from "@/types/database";

const CLUB_CARD_COLUMNS_BASE =
  "id, club_name, university_name, logo_url, created_at";
const CLUB_CARD_COLUMNS_EXTENDED = `${CLUB_CARD_COLUMNS_BASE}, category_key, partner_label`;

export type JulyAwardClubCardListResult = {
  items: JulyAwardClubCardRow[];
  error: string | null;
};

function isMissingDebateColumnError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("category_key") ||
    m.includes("partner_label") ||
    m.includes("does not exist") ||
    m.includes("42703")
  );
}

function mapClubCardRow(row: unknown): JulyAwardClubCardRow {
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id),
    club_name: String(r.club_name),
    university_name: String(r.university_name),
    logo_url: String(r.logo_url),
    category_key: r.category_key != null ? String(r.category_key) : null,
    partner_label: r.partner_label != null ? String(r.partner_label) : null,
    created_at: String(r.created_at),
  };
}

/** Picks extended columns when migration 024 is applied; falls back to base columns. */
async function fetchJulyAwardClubCards(): Promise<JulyAwardClubCardListResult> {
  const supabase = createServiceRoleSupabase();

  const extended = await supabase
    .from("july_award_club_cards")
    .select(CLUB_CARD_COLUMNS_EXTENDED)
    .order("created_at", { ascending: false });

  if (!extended.error) {
    return {
      items: (extended.data ?? []).map((row) => mapClubCardRow(row)),
      error: null,
    };
  }

  if (!isMissingDebateColumnError(extended.error.message)) {
    return { items: [], error: extended.error.message };
  }

  const base = await supabase
    .from("july_award_club_cards")
    .select(CLUB_CARD_COLUMNS_BASE)
    .order("created_at", { ascending: false });

  if (base.error) {
    return { items: [], error: base.error.message };
  }

  return {
    items: (base.data ?? []).map((row) => mapClubCardRow(row)),
    error: null,
  };
}

async function selectClubCardColumns(): Promise<string> {
  const supabase = createServiceRoleSupabase();
  const probe = await supabase.from("july_award_club_cards").select("category_key").limit(1);
  if (probe.error && isMissingDebateColumnError(probe.error.message)) {
    return CLUB_CARD_COLUMNS_BASE;
  }
  return CLUB_CARD_COLUMNS_EXTENDED;
}

/** All club card rows for admin participation-card generation (newest first). */
export async function listJulyAwardClubCardsForAdmin(): Promise<JulyAwardClubCardRow[]> {
  const { items } = await fetchJulyAwardClubCards();
  return items;
}

export async function listJulyAwardClubCardsForAdminWithMeta(): Promise<JulyAwardClubCardListResult> {
  return fetchJulyAwardClubCards();
}

function clubCardLookupKey(clubName: string, universityName: string): string {
  return `${clubName.trim().toLowerCase()}|${universityName.trim().toLowerCase()}`;
}

/** Case-insensitive match on trimmed club + university (public card reload after admin edit). */
export async function findJulyAwardClubCardByClubAndUniversity(
  clubName: string,
  universityName: string
): Promise<JulyAwardClubCardRow | null> {
  const key = clubCardLookupKey(clubName, universityName);
  if (!key || key === "|") return null;

  const { items } = await fetchJulyAwardClubCards();
  for (const row of items) {
    if (clubCardLookupKey(row.club_name, row.university_name) === key) {
      return row;
    }
  }
  return null;
}

export async function getJulyAwardClubCardById(
  id: string
): Promise<JulyAwardClubCardRow | null> {
  const columns = await selectClubCardColumns();
  const supabase = createServiceRoleSupabase();
  const { data, error } = await supabase
    .from("july_award_club_cards")
    .select(columns)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return mapClubCardRow(data);
}

export type InsertJulyAwardClubCardInput = {
  clubName: string;
  universityName: string;
  logoUrl: string;
  categoryKey?: string | null;
  partnerLabel?: string | null;
};

export type UpdateJulyAwardClubCardInput = {
  id: string;
  clubName: string;
  universityName: string;
  logoUrl: string;
};

export async function updateJulyAwardClubCard(
  input: UpdateJulyAwardClubCardInput
): Promise<{ ok: true; row: JulyAwardClubCardRow } | { ok: false; message: string }> {
  try {
    const columns = await selectClubCardColumns();
    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase
      .from("july_award_club_cards")
      .update({
        club_name: input.clubName.trim(),
        university_name: input.universityName.trim(),
        logo_url: input.logoUrl.trim(),
      })
      .eq("id", input.id)
      .select(columns)
      .single();

    if (error || !data) {
      return { ok: false, message: error?.message ?? "Could not update club card record." };
    }

    return { ok: true, row: mapClubCardRow(data) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not update club card record." };
  }
}

export async function deleteJulyAwardClubCard(
  id: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const supabase = createServiceRoleSupabase();
    const { error } = await supabase.from("july_award_club_cards").delete().eq("id", id);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not delete club card record." };
  }
}

/** Persists club name, university, and public logo URL (file lives in Storage). */
export async function insertJulyAwardClubCard(
  input: InsertJulyAwardClubCardInput
): Promise<{ ok: true; row: JulyAwardClubCardRow } | { ok: false; message: string }> {
  try {
    const supabase = createServiceRoleSupabase();
    const baseRow = {
      club_name: input.clubName.trim(),
      university_name: input.universityName.trim(),
      logo_url: input.logoUrl.trim(),
    };
    const extendedRow = {
      ...baseRow,
      category_key: input.categoryKey ?? null,
      partner_label: input.partnerLabel ?? null,
    };

    let result = await supabase
      .from("july_award_club_cards")
      .insert(extendedRow)
      .select(CLUB_CARD_COLUMNS_EXTENDED)
      .single();

    if (result.error && isMissingDebateColumnError(result.error.message)) {
      result = await supabase
        .from("july_award_club_cards")
        .insert(baseRow)
        .select(CLUB_CARD_COLUMNS_BASE)
        .single();
    }

    if (result.error || !result.data) {
      return { ok: false, message: result.error?.message ?? "Could not save club card record." };
    }

    return { ok: true, row: mapClubCardRow(result.data) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save club card record." };
  }
}
