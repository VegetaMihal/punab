/**
 * One-time import: July Award participants who answered "donates blood: yes" become
 * BloodHero donors with status='pending' (admin must fill district + activate).
 *
 * Dry run (default): npm run bloodhero:import-july-donors
 * Actually write:     npm run bloodhero:import-july-donors -- --apply
 */
import { listJulyParticipantRegistrationRows } from "../src/lib/july-participant-google-sheet";
import { createServiceRoleSupabase } from "../src/lib/supabase/service-role";

const VALID_BLOOD_GROUPS = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const DISTRICT_PLACEHOLDER = "Not provided";

function normalizeBloodGroup(raw: string): string | null {
  let v = raw.trim().toUpperCase();
  v = v.replace(/POSITIVE/g, "+").replace(/NEGATIVE/g, "-");
  v = v.replace(/[()\s.]/g, "");
  v = v.replace(/VE$/, ""); // "+ve" / "-ve"
  v = v.replace(/^0(?=[+-])/, "O"); // leading digit zero, not letter O
  const m = /^(A|B|AB|O)([+-]|POS|NEG)?$/.exec(v);
  if (!m) return VALID_BLOOD_GROUPS.has(v) ? v : null;
  const letter = m[1];
  let sign = m[2] ?? "";
  if (sign === "POS") sign = "+";
  if (sign === "NEG") sign = "-";
  if (sign !== "+" && sign !== "-") return null;
  const normalized = `${letter}${sign}`;
  return VALID_BLOOD_GROUPS.has(normalized) ? normalized : null;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const res = await listJulyParticipantRegistrationRows();
  if (!res.ok) {
    console.error("Failed to read participant sheet:", res.message);
    process.exit(1);
  }

  const consented = res.rows.filter((r) => r.donatesBlood.trim().toLowerCase() === "yes");
  console.log(`Participants with donatesBlood=yes: ${consented.length}`);

  const supabase = createServiceRoleSupabase();
  const { data: existingDonors, error: existingErr } = await supabase
    .from("bloodhero_donors")
    .select("email");
  if (existingErr) {
    console.error("Failed to read existing donors:", existingErr.message);
    process.exit(1);
  }
  const existingEmails = new Set((existingDonors ?? []).map((d) => String(d.email).trim().toLowerCase()));

  const seenInBatch = new Set<string>();
  const toInsert: {
    full_name: string;
    email: string;
    phone: string;
    blood_group: string;
    district: string;
    available_now: boolean;
    status: "pending";
  }[] = [];
  const skipped: { email: string; reason: string }[] = [];

  for (const r of consented) {
    const email = r.email.trim().toLowerCase();
    const bloodGroup = normalizeBloodGroup(r.bloodGroup);
    if (!email) {
      skipped.push({ email: r.email, reason: "missing email" });
      continue;
    }
    if (!bloodGroup) {
      skipped.push({ email, reason: `invalid blood group "${r.bloodGroup}"` });
      continue;
    }
    if (!r.fullName.trim() || !r.phoneNumber.trim()) {
      skipped.push({ email, reason: "missing name or phone" });
      continue;
    }
    if (existingEmails.has(email) || seenInBatch.has(email)) {
      skipped.push({ email, reason: "already a donor / duplicate row" });
      continue;
    }
    seenInBatch.add(email);
    toInsert.push({
      full_name: r.fullName.trim(),
      email,
      phone: r.phoneNumber.trim(),
      blood_group: bloodGroup,
      district: DISTRICT_PLACEHOLDER,
      available_now: true,
      status: "pending",
    });
  }

  console.log(`\nWould import: ${toInsert.length}`);
  console.log(`Skipped: ${skipped.length}`);
  for (const s of skipped) console.log(`  - ${s.email}: ${s.reason}`);

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write these rows.");
    return;
  }

  if (toInsert.length === 0) {
    console.log("\nNothing to insert.");
    return;
  }

  const { error: insertErr, count } = await supabase
    .from("bloodhero_donors")
    .insert(toInsert, { count: "exact" });
  if (insertErr) {
    console.error("Insert failed:", insertErr.message);
    process.exit(1);
  }

  console.log(`\nInserted ${count ?? toInsert.length} donor(s) as status='pending'.`);
  console.log(`District is a placeholder ("${DISTRICT_PLACEHOLDER}") — admin must fill it in before these donors are matched to any request.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
