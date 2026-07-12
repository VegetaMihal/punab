# Database layer: Prisma + Supabase

**Prisma** owns the **schema**, **migrations**, and **server-side** reads/writes to `public` app tables.  
**Supabase** stays in use for **Auth**, **session/cookies**, and **Storage** (uploads). Do not remove those.

---

## Phase 1 — Prisma foundation (done)

- **Installed:** `prisma`, `@prisma/client` (pinned to **5.x**; `schema.prisma` uses `DATABASE_URL` + `DIRECT_URL` for Supabase + Vercel).
- **Schema:** `prisma/schema.prisma` — models map to existing table names (`@@map`) and relations.
- **Client:** `src/lib/db/prisma.ts` — singleton `PrismaClient` for Node (Server Components, Server Actions, route handlers).
- **Scripts:** see `package.json`:
  - `build` → `prisma generate && next build` — **does not** run `prisma migrate deploy` (Vercel and CI stay compatible with an already-populated DB; **P3005** from applying the initial migration on top of existing data is avoided). Apply schema changes yourself when ready: `npm run db:deploy` locally or in a dedicated job with the correct `DATABASE_URL` / `DIRECT_URL`.
  - `postinstall` → `prisma generate` (Vercel/CI inject `DATABASE_URL` + `DIRECT_URL` into the environment).
  - `db:generate` / `db:migrate` / `db:deploy` / `db:push` / `db:seed` / `db:studio` → run via **`dotenv-cli`** with **`.env.local`** so Prisma CLI matches Next.js (Prisma does **not** load `.env.local` by itself).
- **Env:** `.env.example` — **`DATABASE_URL`** (queries; use **pooler** on Vercel) and **`DIRECT_URL`** (migrations / `prisma migrate deploy`). Local file-resolution quirks: **`src/lib/db/resolve-database-url.ts`**, **`PRISMA_DATABASE_URL_STRICT`**, **`ALLOW_LOCAL_POSTGRES`** (see that file).

### Vercel + Supabase (fix “Can’t reach database server” on `db.*.supabase.co:5432`)

Serverless often **cannot use the direct host** `db.<project>.supabase.co:5432`. In **Vercel → Environment Variables** set:

1. **`DATABASE_URL`** — Supabase Dashboard → **Connect** → **Transaction pooler** → URI (usually port **6543**, include **`pgbouncer=true`** and **`sslmode=require`** if offered).
2. **`DIRECT_URL`** — same screen → **Direct connection** URI (`db.<project>.supabase.co:5432`). Required because `schema.prisma` declares `directUrl` (Prisma validates env at `prisma generate`). Runtime queries use **`DATABASE_URL`** only. **Migrations are not run on Vercel build** right now; run `npm run db:deploy` manually when you need to apply migrations.

Local dev: **prefer the same split as production** — **`DATABASE_URL` = transaction pooler (6543)**, **`DIRECT_URL` = direct (5432)**. Runtime pages (`/leadership`, admin, etc.) only use `DATABASE_URL`; if that points at `db.*.supabase.co:5432` and your machine cannot reach it, you will see Prisma `P1001` / “Can’t reach database server”.

### Local fix: “Can’t reach database server at `db.*.supabase.co:5432`”

1. **Wrong string in `DATABASE_URL`** — You pasted the **Direct connection** URI into `DATABASE_URL`. Move that value to **`DIRECT_URL`** only. Set **`DATABASE_URL`** to the **Transaction pooler** URI from the same Supabase Connect screen (port **6543**, query params include `pgbouncer=true`).
2. **IPv6 / DNS** — On some Windows setups, Node resolves `db.*.supabase.co` to IPv6 first and the route fails. Try: run Node with IPv4 preference, e.g. `set NODE_OPTIONS=--dns-result-order=ipv4first` before `npm run dev`, or fix the pooler approach in (1) which often avoids the issue.
3. **Firewall / VPN** — Outbound **5432** may be blocked; **6543** (pooler) sometimes works.
4. **Sanity check** — With dev server running: `GET /api/debug/db-host` (non-production) shows which host `DATABASE_URL` resolves to, without printing secrets.

---

## Phase 2 — Migrations & seed (done)

**Initial migration:** `prisma/migrations/20260324120000_init/migration.sql`  
Creates app tables, extensions (`pgcrypto`), FKs, and (on Supabase) `profiles.id` → `auth.users.id` when `auth` exists.

**Seed:** `prisma/seed.ts` — idempotent upserts / safe inserts for demo data (does not wipe production tables).

### Commands (copy-paste)

```bash
# From punab-web/ with DATABASE_URL + DIRECT_URL in .env.local

npm run db:deploy      # migrate deploy (loads .env.local)
npm run db:migrate     # migrate dev — new migration
npm run db:generate    # prisma generate using .env.local
npm run db:seed
npm run db:studio

# Or: npx dotenv -e .env.local -- npx prisma migrate status
```

**Supabase RLS:** Prisma migrations create **tables only**. If you still use the **anon** Supabase client for SQL on these tables, apply your existing RLS SQL from `supabase/migrations/` (see `prisma/sql/post_deploy_supabase_rls.sql`).

---

## Phase 3 — Repository layer (done)

Server code should prefer these modules over ad-hoc SQL. All use **Prisma** (`src/lib/db/prisma.ts`).

| Area | Module |
|------|--------|
| Site settings | `src/lib/repositories/site-settings-repository.ts` |
| Gallery | `src/lib/repositories/gallery-repository.ts` |
| Leadership (layers + members) | `src/lib/repositories/leadership-repository.ts` |
| Notices | `src/lib/repositories/notices-repository.ts` |
| Events | `src/lib/repositories/events-repository.ts` |
| Chapters & universities | `src/lib/repositories/chapters-repository.ts` |
| Profiles (membership, signup upsert) | `src/lib/repositories/profiles-repository.ts` |
| CMS pages | `src/lib/repositories/pages-repository.ts` |
| Admin counts | `src/lib/repositories/admin-stats-repository.ts` |

Re-exports: `src/lib/repositories/index.ts`.  
**Admin guard (after session):** `src/lib/auth/require-admin.ts` — `assertAdmin()` uses Supabase **Auth** then Prisma **profile role**.

Domain DTOs / mapping: `src/lib/db/mappers.ts` → `@/types/database`.

---

## Phase 4 — Remaining direct Supabase **database** queries (refactor later)

These are **not** Auth and **not** Storage; they still hit Postgres via the Supabase **postgrest** client.

| Location | What | Why it remains | Refactor options |
|----------|------|----------------|------------------|
| `src/lib/supabase/middleware.ts` | `supabase.from("profiles").select("role")` for `/admin` | Edge **Middleware** cannot use `@prisma/client` reliably | (a) Keep as-is (RLS-aware anon key). (b) Move admin **role** check out of middleware and rely only on `src/app/admin/layout.tsx` + `getSessionProfile()` (Prisma) — accept that `/admin` might briefly load before layout redirect. (c) Use Supabase **JWT custom claims** for `role` and read from the session without a table round-trip (requires Auth hook / trigger). |

**Intentionally still Supabase (no refactor needed for “DB layer”):**

- **Auth:** `auth.getUser()`, `signIn`, `signUp`, `signOut` — `src/actions/auth.ts`, `session.ts`, `require-admin.ts`, `middleware.ts`.
- **Storage:** `supabase.storage.from(...)` — `src/actions/cms.ts`, `GalleryImagesManager.tsx`, `LeadershipForm.tsx`, `PhotoUpload.tsx`.

**Server actions** that only use `createClient()` for **`getUser()`** (no `.from()`) are Auth-only, not listed above.

---

## New developer checklist

1. `npm install`
2. Copy `.env.example` → `.env.local`, set `NEXT_PUBLIC_*`, **`DATABASE_URL` (pooler 6543)**, and **`DIRECT_URL` (direct 5432)**.
3. `npx prisma migrate deploy`
4. `npx prisma db seed` (optional)
5. `npm run dev`

Supabase project must have **Auth** enabled and **Storage** buckets expected by the app (`site-assets`, gallery bucket from env, leadership bucket, `member-photos`, etc.).
