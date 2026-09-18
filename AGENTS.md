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

> Agent playbooks for Reviewer, Architect, Debugger, Schema/Migration, Test Writer, PR Describer, and Docs Writer moved to on-demand skills: `.claude/skills/{reviewer,architect,debugger,schema-migration,test-writer,pr-describer,docs-writer}/SKILL.md`. They load automatically when the matching task comes up.

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