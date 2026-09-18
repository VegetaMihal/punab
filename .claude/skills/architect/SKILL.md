---
name: architect
description: PUNAB-Web file-placement rules for new features — where new pages, DB tables, types, repos, and RLS policies go. Use when planning where to put new code in this repo.
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
