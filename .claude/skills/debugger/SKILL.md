---
name: debugger
description: PUNAB-Web specific diagnostic checklist for auth/SSR/Prisma/RLS/storage errors. Use when diagnosing runtime errors, auth failures, or DB issues in this repo.
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
