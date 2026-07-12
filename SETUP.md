# PUNAB web — setup guide (v1)

Step-by-step instructions to run the app locally and wire Supabase.

## Prerequisites

- Node.js 20+ (recommended)
- A [Supabase](https://supabase.com) project
- This repo: `punab-web/` (Next.js App Router)

## 1. Install dependencies

```bash
cd punab-web
npm install
```

## 2. Environment variables (required)

Create **`punab-web/.env.local`** in the project root (same folder as `package.json`).  
**Do not commit this file** — it is listed in `.gitignore`.

Use the template from **`.env.example`** and fill in values from the Supabase dashboard:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings → API → Project URL** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | **Project Settings → API → Project API keys** — use the **anon** or **publishable** key (safe for the browser). **Never** put the **service_role** secret in `NEXT_PUBLIC_*` variables. |

Example shape (replace with your real values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

The app reads these in:

- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — server components / server actions
- `src/lib/supabase/middleware.ts` — session refresh
- `next.config.ts` — image remote patterns for Supabase Storage public URLs

Restart `npm run dev` after changing env vars.

## 3. Database schema (Supabase SQL)

1. Open the Supabase project → **SQL Editor**.
2. Paste and run the full script: **`supabase/schema.sql`**.

This creates:

- Tables: `profiles`, `universities`, `chapters`, `leadership_members`, `notices`, `events`
- RLS policies, triggers (new user → `profiles` row, protect `role` / `membership_status` for non-admins)
- Storage bucket **`member-photos`** and policies for user uploads under `{user_id}/...`
- Seed rows for sample universities (optional; uses `ON CONFLICT (slug) DO NOTHING`)

If anything fails (e.g. object already exists), adjust or drop conflicting objects and re-run the relevant section.

### BloodHero (`/bloodhero/*`)

BloodHero tables and RPCs are **not** created by **`schema.sql`** or by **Prisma** migrations. They live under **`supabase/migrations/`** as numbered SQL files.

If donor registration shows an error about **`bloodhero_donors`** or PostgREST **`PGRST205`**, the table was never applied to this project.

1. In **SQL Editor**, run these files **in order** (copy-paste each file’s contents, or use the Supabase CLI if you prefer):

   | Order | File | Purpose |
   |------:|------|---------|
   | 1 | `supabase/migrations/005_bloodhero_donors.sql` | Donor signup table + RLS + grants |
   | 2 | `006_bloodhero_requests.sql` | Blood requests |
   | 3 | `007_bloodhero_tracker.sql` | Tracker / events |
   | 4 | `008_bloodhero_request_created_event_copy.sql` | Event copy helper |
   | 5 | `009_bloodhero_tracking_number.sql` | Tracking number column + RPC |
   | 6 | `010_bloodhero_matching.sql` | Matching + notifications queue |
   | 7 | `011_bloodhero_matching_post_insert_trigger.sql` | Post-insert trigger |
   | 8 | `012_bloodhero_matching_logic_refine.sql` | Matching refinements |
   | 9 | `013_bloodhero_donor_response.sql` | Donor response / tokens support |
   | 10 | `014_bloodhero_admins.sql` | Legacy user-id allow-list (optional if you will run **016** next; **016** drops this table) |
   | 11 | `015_bloodhero_donors_admin_access.sql` | Admins: read donors + RPC approve/reject pending |
   | 12 | `016_bloodhero_admin_unified_access.sql` | **Required for current app:** PUNAB admin **or** `bloodhero_admin_access` by email; replaces `014` table |
   | 13 | `017_bloodhero_email_events.sql` | Optional audit rows for BloodHero emails (`bloodhero_email_events`) |

2. **Donor registration only** needs **`005`** at minimum. Request submission, matching, and email response links need the later files through **`013`** as you enable those features.

3. Verify: **Table Editor** → **`bloodhero_donors`** exists, then retry **`/bloodhero/donor`**.

#### BloodHero admin (`/bloodhero/admin`)

Uses the **same Supabase Auth** (email + password) as PUNAB. **Who may access** is decided in Postgres by **`public.is_bloodhero_admin()`** (exposed to the app via RPC). Access is allowed if **either**:

1. **PUNAB full admin** — `public.profiles.role = 'admin'` for the signed-in user (same rule as main **`/admin`**). No extra BloodHero row required.
2. **BloodHero-only** — an **active** row in **`public.bloodhero_admin_access`** where **`email`** matches the signed-in **`auth.users` email** (case-insensitive). This does **not** grant main PUNAB **`/admin`**.

**`admin@punab.test`** is inserted by **`016_bloodhero_admin_unified_access.sql`** (if not already present) so that account can use BloodHero admin **via the email grant** as soon as migration **016** runs. If that user is **also** promoted with **`profiles.role = 'admin'`**, they still qualify via the PUNAB-admin branch—no duplicate setup required.

**Order:** run **`015`** then **`016`**. **`014`** is optional legacy; **`016`** migrates from **`bloodhero_admins`** if it exists, then drops it.

**Add a BloodHero-only coordinator** (no PUNAB admin) — use the **same email** they use in Supabase Auth:

```sql
insert into public.bloodhero_admin_access (email, is_active)
select lower(trim('coordinator@example.org')), true
where not exists (
  select 1 from public.bloodhero_admin_access
  where lower(trim(email)) = lower(trim('coordinator@example.org'))
);
```

**Revoke** by setting **`is_active = false`** (do not delete the row if you want an audit trail).

There is **no new env var** for this flow beyond existing **`NEXT_PUBLIC_SUPABASE_*`** used elsewhere.

**Pending donors (BloodHero admin):** after **`005`**, **`015`**, **`016`**, and **`018`**, open **`/bloodhero/admin/pending-donors`** (or **Overview → Pending donors**). Approve/reject uses RPC **`bloodhero_admin_review_donor`** with the same **`is_bloodhero_admin()`** gate as the rest of BloodHero admin. **Approve** (pending → **active**) triggers a **Resend** welcome email via **`RESEND_API_KEY`** and **`BLOODHERO_RESEND_FROM`**; approval still succeeds if sending fails. Migration **`018`** also adds BloodHero donor **auto approval** (admin toggle + registration RPC path).

**Email logging:** Run **`017_bloodhero_email_events.sql`** to create **`bloodhero_email_events`**. Each welcome send writes **structured lines** prefixed with **`[BloodHero:email]`** (`phase: "attempt"` then `phase: "result"`) to the server console (Vercel **Logs**, local terminal). With **017** applied, a row is also stored (**`success`** / **`failed`**, optional **`error_message`**) — query in **Table Editor** while signed in as a BloodHero coordinator, or via SQL.

## 4. Authentication

- In Supabase: **Authentication → Providers** — ensure **Email** is enabled for sign-up/login.
- Confirm **Site URL** and **Redirect URLs** include your local app (e.g. `http://localhost:3000`) for production deployments.

## 5. First admin user

After the first user signs up:

1. In **SQL Editor**, promote your account (replace the email):

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

2. Sign out and sign in again (or refresh the session) so middleware and RLS see the admin role.

## 6. Storage

The script creates bucket **`member-photos`** (public).  
Members upload profile photos from **Join** / **Profile**; paths must be `{auth.uid()}/filename`.

If uploads fail, check **Storage → Policies** and that the bucket exists.

## 7. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

Use this for production-style checks.

## 8. Route map (quick reference)

| Area | Routes |
|------|--------|
| Public | `/`, `/about`, `/leadership`, `/chapters`, `/events`, `/events/[id]`, `/notices`, `/notices/[id]`, `/contact`, `/join` |
| Auth | `/login`, `/signup` |
| Member | `/dashboard`, `/dashboard/profile` (middleware protects) |
| Admin | `/admin`, `/admin/members`, `/admin/notices`, `/admin/events`, `/admin/leadership`, `/admin/chapters`, `/admin/universities` (admin role + middleware) |

## 9. Notes

- **Contact form**: validated server-side; v1 does not persist messages (extend with a table or email later).
- **Middleware**: Next.js 16 may show a deprecation notice about the `middleware` file convention; behaviour is unchanged until you migrate to the new convention.
- **RLS**: If you ever see recursion errors on `profiles`, see Supabase docs for **security definer** helpers; the provided `is_admin()` is written to match common Supabase patterns.
