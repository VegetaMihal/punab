/**
 * Activates the pending BloodHero donors imported from the July participant sheet
 * (district still the "Not provided" placeholder — location was intentionally skipped).
 * Only touches rows matching that exact placeholder + pending status, so it never
 * activates unrelated normal signups awaiting review.
 *
 * Dry run (default): npm run bloodhero:activate-july-donors
 * Actually write:     npm run bloodhero:activate-july-donors -- --apply
 */
import { createServiceRoleSupabase } from "../src/lib/supabase/service-role";

const DISTRICT_PLACEHOLDER = "Not provided";

async function main() {
  const apply = process.argv.includes("--apply");
  const supabase = createServiceRoleSupabase();

  const { data: rows, error } = await supabase
    .from("bloodhero_donors")
    .select("id, email")
    .eq("district", DISTRICT_PLACEHOLDER)
    .eq("status", "pending");
  if (error) {
    console.error("Failed to read donors:", error.message);
    process.exit(1);
  }

  console.log(`Pending donors with placeholder district: ${rows?.length ?? 0}`);

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to activate these rows.");
    return;
  }

  if (!rows || rows.length === 0) {
    console.log("Nothing to activate.");
    return;
  }

  const { error: updateErr, count } = await supabase
    .from("bloodhero_donors")
    .update({ status: "active" }, { count: "exact" })
    .eq("district", DISTRICT_PLACEHOLDER)
    .eq("status", "pending");
  if (updateErr) {
    console.error("Update failed:", updateErr.message);
    process.exit(1);
  }

  console.log(`Activated ${count ?? rows.length} donor(s). District stays "${DISTRICT_PLACEHOLDER}" — matching falls back to distance-less/district-less ranking for them.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
