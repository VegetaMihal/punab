---
name: schema-migration
description: PUNAB-Web migration rules — Prisma vs Supabase numbered SQL, RLS policy placement, rollback comments. Use when writing a Prisma migration or a Supabase SQL migration in this repo.
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
