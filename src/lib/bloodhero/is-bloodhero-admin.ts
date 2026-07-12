import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * BloodHero admin UI (`/bloodhero/admin/*`) — **not** the same gate as main PUNAB `/admin`.
 *
 * **Allowed if either:**
 * 1. **PUNAB full admin** — `public.profiles.role = 'admin'` for `auth.uid()` (same rule as main admin layout).
 * 2. **BloodHero-only** — active row in `public.bloodhero_admin_access` whose `email` matches the signed-in
 *    `auth.users.email` (case-insensitive). This does **not** grant main `/admin`.
 *
 * Implemented in Postgres as `public.is_bloodhero_admin()` (SECURITY DEFINER) and invoked via RPC so middleware
 * and RLS stay consistent. **Fail closed** on RPC errors.
 *
 * @see `supabase/migrations/016_bloodhero_admin_unified_access.sql`
 */
export async function canAccessBloodHeroAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_bloodhero_admin");
  if (error) return false;
  return data === true;
}

const BH_ADMIN_HOME = "/bloodhero/admin";

/** Internal redirect targets only (blocks `//evil.com` style open redirects). */
export function safeBloodHeroAdminRedirectTarget(raw: unknown): string {
  if (typeof raw !== "string") return BH_ADMIN_HOME;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return BH_ADMIN_HOME;
  try {
    const u = new URL(trimmed, "http://local.invalid");
    if (u.protocol !== "http:" || u.host !== "local.invalid") return BH_ADMIN_HOME;
    const p = u.pathname;
    if (p !== BH_ADMIN_HOME && !p.startsWith(`${BH_ADMIN_HOME}/`)) return BH_ADMIN_HOME;
    return u.pathname + u.search + u.hash;
  } catch {
    return BH_ADMIN_HOME;
  }
}
