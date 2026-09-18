---
name: test-writer
description: PUNAB-Web test-writing rules — what to mock, what to cover, output format. Use when writing tests for Server Actions, repositories, or utilities in this repo.
---

## Agent: Test Writer

**Role:** Write tests for Server Actions, repositories, utilities.

**Rules:**
- Mock `src/lib/db/prisma.ts` for repository tests.
- Mock `src/lib/supabase/` for BloodHero action tests.
- Always cover: happy path + Zod rejection + auth failure (unauthenticated + wrong role).
- No UI component tests unless asked.
- Output test file only.
