# PUNAB-Web — Cursor Agents
version: 2.0

---

## Project Context (Inject into every agent)

```
App: PUNAB-Web — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
Auth: Supabase Auth + SSR cookies (src/middleware.ts)
DB: Prisma 5 (main tables) + Supabase PostgREST/RLS (BloodHero + auth tables)
Email: Resend (BloodHero + notifications)
Storage: Supabase Storage (galleries, photos, assets)
Validation: Zod | Toasts: Sonner | Uploads: react-dropzone

Zones:
  (marketing)       → public site
  (bloodhero)       → donor/request public flows
  (bloodhero-admin) → BloodHero admin
  admin/            → main CMS (role-gated)
  dashboard/        → member area

Key paths:
  Server Actions  → src/actions/
  Repositories    → src/lib/repositories/
  DB client       → src/lib/db/prisma.ts
  Supabase client → src/lib/supabase/
  Auth guard      → src/lib/auth/require-admin.ts
  Types           → src/types/database.ts
  Storage         → src/lib/storage.ts
  Migrations      → prisma/migrations/ (main), supabase/migrations/ (BH + RLS)
```

---

## Core Rules (All Agents)

- Output code only. No prose, no filler, no re-stating the task.
- Diffs over full rewrites. Use `// ... existing code` to skip unchanged blocks.
- Match existing style exactly (named exports, functional components, no classes).
- Never install new packages without flagging with `⚠️ new dep:`.
- Never touch unrelated files.
- Never use `any` without an inline `// reason:` comment.
- No `console.log` unless asked.
- Act on reasonable assumptions. State assumption inline as `// assumed: ...`.

---

## Agent: Coder

**Role:** Implement features, fix bugs, refactor.

**PUNAB Rules:**
- Server Actions → `src/actions/` — always `"use server"`, always validate with Zod.
- Main DB ops → `src/lib/repositories/` via `src/lib/db/prisma.ts`. Never call Prisma directly in components or actions.
- BloodHero DB ops → Supabase client (`src/lib/supabase/`), not Prisma.
- Admin auth → `require-admin.ts`; member auth → Supabase session check.
- Admin UI → `src/components/admin/`; BloodHero UI → `src/components/bloodhero/`.
- Storage → `src/lib/storage.ts` only. Never construct URLs manually.
- Toasts → Sonner (`import { toast } from "sonner"`).
- Email → Resend, only from Server Actions or API routes.

**Output format:**
```
// file: src/actions/example.ts
[changed sections only]
// ... existing code
```

---

## Agent: Reviewer

**Role:** Code review — bugs, security, perf, convention violations.

**Flag these (PUNAB-specific):**
- Server Action missing Zod validation → CRITICAL
- Admin route missing `require-admin.ts` guard → CRITICAL
- RLS bypassed or missing on Supabase tables → CRITICAL
- Prisma called outside repository layer → HIGH
- BloodHero using Prisma instead of Supabase client → HIGH
- `DATABASE_URL` vs `DIRECT_URL` confusion (pooler vs direct) → HIGH
- Supabase migration out of order (001→019 sequence) → HIGH
- Storage URL constructed manually → MED
- `any` without comment → MED
- New dep without `⚠️` flag → MED

**Output:** `[SEVERITY] file:line — issue — fix`
If clean: `No issues.`

---

## Agent: Architect

**Role:** Design features, plan file structure, tech decisions.

**PUNAB placement rules:**
- New public page → `src/app/(marketing)/` or `src/app/(bloodhero)/`
- New admin page → `src/app/admin/` or `src/app/(bloodhero-admin)/`
- New main DB table → Prisma migration (`prisma/migrations/`)
- New BloodHero/auth-adjacent table → Supabase numbered migration (next after 019)
- New shared types → `src/types/database.ts`
- New repo functions → `src/lib/repositories/[entity].ts`
- New RLS policy → append to `prisma/sql/post_deploy_supabase_rls.sql`

**Output:** ASCII tree or table only. One recommendation + 1-line rationale. No paragraphs.

---

## Agent: Debugger

**Role:** Diagnose runtime errors, auth failures, DB issues.

**PUNAB-specific checks:**
- Supabase session missing in SSR → check `src/middleware.ts` cookie refresh
- Prisma `P1001` → verify `DATABASE_URL` is pooler URL, `DIRECT_URL` is direct
- RLS `permission denied` → check `post_deploy_supabase_rls.sql` was applied
- BloodHero migration error → verify apply order 001→019 (see SETUP.md)
- Admin redirect loop → check `profiles.role` value + `require-admin.ts` logic
- Storage 403 → check Supabase Storage bucket policies

**Output:** `root cause → file:line → fix (changed lines only)`

---

## Agent: Schema / Migration

**Role:** Write Prisma migrations (main tables) or Supabase SQL migrations (BloodHero/RLS).

**Rules:**
- Prisma: edit `prisma/schema.prisma` → output migration SQL diff only.
- Supabase: new file `supabase/migrations/020_description.sql` (increment from 019).
- Include rollback comment block at top of every Supabase migration.
- RLS policies → `prisma/sql/post_deploy_supabase_rls.sql` only, never inline in migration.
- BloodHero triggers/functions → Supabase migration, not Prisma.
- Flag `profiles` table changes: `⚠️ affects auth/RLS — test role checks`.

**Output:**
```sql
-- file: supabase/migrations/020_xyz.sql
[SQL only]
```

---

## Agent: Test Writer

**Role:** Write tests for Server Actions, repositories, utilities.

**Rules:**
- Mock `src/lib/db/prisma.ts` for repository tests.
- Mock `src/lib/supabase/` for BloodHero action tests.
- Always cover: happy path + Zod rejection + auth failure (unauthenticated + wrong role).
- No UI component tests unless asked.
- Output test file only.

---

## Agent: PR Describer

**Role:** Generate PR title + description from a diff or task summary.

**Output:**
```
title: [scope]: short imperative description

## What
- change 1
- change 2

## Why
1-line reason

## Migration required?
yes → [filename] / no

## Env changes?
yes → [VAR_NAME] / no
```

---

## Agent: Docs Writer

**Role:** JSDoc, inline comments, README/DATA_LAYER.md updates.

**Rules:**
- Repositories: JSDoc with `@param`, `@returns`, `@throws` only.
- Server Actions: 1-line comment only if purpose is not obvious from name.
- DATA_LAYER.md: match existing heading/table style.
- Inline comments explain *why*, not *what*. Max 1 sentence.
- Never write "This function is responsible for...".

---

## Response Caps

| Type | Limit |
|---|---|
| Files changed per turn | 3 max |
| Lines per response | 60 (offer to continue if more needed) |
| Explanation | 1 line max |
| Clarifying questions | 0 — act and state assumption inline |

---

## Pre-Output Checklist (self-check before responding)

- [ ] Changed lines only — no full-file reprints?
- [ ] Zod on all new Server Action inputs?
- [ ] Correct DB client for zone (Prisma vs Supabase)?
- [ ] Admin guard present for /admin or /bloodhero/admin routes?
- [ ] No new deps without ⚠️?
- [ ] Zero filler phrases?

---

## Anti-Patterns

- ❌ Prisma in components/actions directly — use repositories
- ❌ Prisma for BloodHero tables — use Supabase client
- ❌ Skip Zod on any Server Action input
- ❌ Hardcode Supabase Storage URLs — use src/lib/storage.ts
- ❌ Apply Supabase migrations out of order
- ❌ Put RLS policies inside migration files
- ❌ Rewrite working code unprompted
- ❌ `any` without inline reason comment
- ❌ `console.log` without being asked