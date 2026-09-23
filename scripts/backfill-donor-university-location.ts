/**
 * Backfills district + center_point_lat/lng for donors imported from the July
 * participant sheet (district still "Not provided") using their university name,
 * geocoded via the free Photon API (same service BloodHero's location picker uses).
 *
 * Only touches donors with district='Not provided' AND no center_point_lat yet,
 * so it's safe to re-run — already-geocoded donors are skipped.
 *
 * Dry run (default): npm run bloodhero:backfill-university-location
 * Actually write:     npm run bloodhero:backfill-university-location -- --apply
 */
import { listJulyParticipantRegistrationRows } from "../src/lib/july-participant-google-sheet";
import { createServiceRoleSupabase } from "../src/lib/supabase/service-role";

const DISTRICT_PLACEHOLDER = "Not provided";
const DELAY_MS = 250; // stay polite to the free Photon service across ~600 lookups
const BD_BBOX = "88.0,20.5,92.7,26.7";
const BD_BIAS = { lat: 23.8103, lon: 90.4125 };

type PhotonResult = {
  lat: number;
  lng: number;
  district: string;
  label: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geocodeUniversity(name: string): Promise<PhotonResult | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", `${name}, Bangladesh`);
  url.searchParams.set("limit", "1");
  url.searchParams.set("lat", String(BD_BIAS.lat));
  url.searchParams.set("lon", String(BD_BIAS.lon));
  url.searchParams.set("bbox", BD_BBOX);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      features?: {
        geometry?: { coordinates?: [number, number] };
        properties?: { name?: string; district?: string; city?: string; county?: string; state?: string };
      }[];
    };
    const f = data.features?.[0];
    const [lng, lat] = f?.geometry?.coordinates ?? [];
    if (typeof lat !== "number" || typeof lng !== "number" || !f?.properties) return null;

    const p = f.properties;
    const districtRaw = p.district || p.city || p.county || p.state;
    const district = districtRaw
      ? districtRaw.replace(/\s+(District|Division|Zila)$/i, "").trim() || DISTRICT_PLACEHOLDER
      : DISTRICT_PLACEHOLDER;

    return { lat, lng, district, label: p.name ?? name };
  } catch {
    return null;
  }
}

async function main() {
  const apply = process.argv.includes("--apply");

  const sheetRes = await listJulyParticipantRegistrationRows();
  if (!sheetRes.ok) {
    console.error("Failed to read participant sheet:", sheetRes.message);
    process.exit(1);
  }
  const universityByEmail = new Map<string, string>();
  for (const r of sheetRes.rows) {
    const email = r.email.trim().toLowerCase();
    const uni = r.universityName.trim();
    if (email && uni) universityByEmail.set(email, uni);
  }

  const supabase = createServiceRoleSupabase();
  const { data: donors, error } = await supabase
    .from("bloodhero_donors")
    .select("id, email")
    .eq("district", DISTRICT_PLACEHOLDER)
    .is("center_point_lat", null);
  if (error) {
    console.error("Failed to read donors:", error.message);
    process.exit(1);
  }

  console.log(`Donors to geocode: ${donors?.length ?? 0}`);
  let geocoded = 0;
  let noUniversity = 0;
  let geocodeFailed = 0;

  for (const d of donors ?? []) {
    const email = String(d.email).trim().toLowerCase();
    const university = universityByEmail.get(email);
    if (!university) {
      noUniversity += 1;
      continue;
    }

    const result = await geocodeUniversity(university);
    await sleep(DELAY_MS);
    if (!result) {
      geocodeFailed += 1;
      continue;
    }

    if (apply) {
      const { error: updateErr } = await supabase
        .from("bloodhero_donors")
        .update({
          district: result.district,
          center_point_lat: result.lat,
          center_point_lng: result.lng,
          center_point_address: university,
        })
        .eq("id", d.id);
      if (updateErr) {
        console.error(`  update failed for ${email}: ${updateErr.message}`);
        continue;
      }
    }

    geocoded += 1;
    if (geocoded % 50 === 0) console.log(`  ...${geocoded} geocoded so far`);
  }

  console.log(`\nGeocoded: ${geocoded}`);
  console.log(`No university on record: ${noUniversity}`);
  console.log(`Geocode lookup failed: ${geocodeFailed}`);
  if (!apply) console.log("\nDry run only. Re-run with --apply to write these updates.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
