# PUNAB-Web — Claude Chat Memory
Last updated: April 2026

## How to start this chat
Paste this at the top of any new Claude or Cursor chat:
"Read CLAUDE_MEMORY.md for full project context before anything else."

---

## Project
- Name: PUNAB-Web (Private University National Association of Bangladesh)
- Repo: github.com/punabofficial/PUNAB-Web
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, 
  Prisma 5, Supabase, Resend, Sonner, Zod, react-dropzone
- Live site: www.punab.com
- Local path: D:\Websites\PUNAB\PUNAB-Web

---

## Branch Strategy
| Branch | Purpose |
|---|---|
| main | Production — only merge after staging verified |
| staging | Test merges before main — always created fresh from main |
| mehal | Active development branch |

Flow: mehal -> staging (test) -> main (go live)

---

## Hosting
- Current: Vercel Hobby plan (free, Pro upgrade coming — want to avoid)
- Planned: Coolify self-hosted on Hetzner CX22 VPS (~EUR4/mo total)
- Migration steps when ready:
  1. Add output: "standalone" to next.config.ts
  2. Write Dockerfile (multi-stage, Node 20 Alpine, 
     run prisma generate before npm run build)
  3. Create .dockerignore (node_modules, .next, .env*, .git)
  4. Spin up Hetzner CX22 (EUR3.79/mo)
  5. Install Coolify via one-line script
  6. Connect GitHub, set env vars, point DNS
  7. Supabase and Resend stay completely untouched
- Status: PLANNED, not started

---

## Vercel Setup
- Production URL: auto-deployed from main
- Staging preview: https://punab-web-git-staging-punabs-projects.vercel.app
- Mehal preview: https://punab-web-mehal-glogfi0cq-punabs-projects.vercel.app
- Preview env vars -> practice DB credentials
- Production env vars -> prod DB credentials
- Deployment protection: OFF (previews are public)
- vercel.json has cron: */10 * * * * hitting 
  /api/bloodhero/run-escalation

---

## Two Supabase Projects
| Project | Ref | Region | Use |
|---|---|---|---|
| PUNAB Web Production DB | vhucsjaoxfizmztyzooa | West EU Ireland | Live site |
| PUNAB practice DB | mmsxpfcdoajinnwycnwv | Southeast Asia Singapore | Local dev |

---

## Database — Migration Status
- Production DB: Migrations 001->027 ALL APPLIED and tracked
- Supabase CLI currently linked to: production (vhucsjaoxfizmztyzooa)
- Migration 028 is PENDING (not yet pushed — voice fields)
- To push new migrations: npx supabase db push
- NEVER run prisma migrate dev on production
- Only ever run: npx prisma migrate deploy

---

## Migration History (001->028)
| # | File | What it does |
|---|---|---|
| 001 | mvp_schema | Core tables: profiles, universities, chapters etc |
| 002 | cms_gallery | Gallery albums and images |
| 003 | leadership_layers | Leadership structure |
| 004 | fix_is_admin_rls_recursion | RLS fix |
| 005 | bloodhero_donors | Donor table |
| 006 | bloodhero_requests | Request table |
| 007 | bloodhero_tracker | Tracker events |
| 008 | bloodhero_request_created_event_copy | Event copy |
| 009 | bloodhero_tracking_number | Tracking number sequence from 1 |
| 010 | bloodhero_matching | Matching engine tables |
| 011 | bloodhero_matching_post_insert_trigger | Trigger |
| 012 | bloodhero_matching_logic_refine | Matching refinement |
| 013 | bloodhero_donor_response | Donor response flow |
| 014 | bloodhero_admins | Created admin table (DROPPED in 016) |
| 015 | bloodhero_donors_admin_access | Donor admin access |
| 016 | bloodhero_admin_unified_access | Drops bloodhero_admins, unified access |
| 017 | bloodhero_email_events | Email event log table |
| 018 | bloodhero_donor_auto_approval | Auto approval setting |
| 019 | bloodhero_matching_admin_event_refine | Admin event refinement |
| 020 | honorary_leadership_layer | Honorary layer |
| 021 | harden_rls_exposed_tables | RLS hardening |
| 022 | hero_site_copy | site_settings hero copy refresh |
| 023 | event_post_url | Event post URL field |
| 024 | bloodhero_requests_admin_access | Request admin RLS |
| 025 | bloodhero_location_fields | Adds center_point_address/lat/lng to donors, donation_location_address/lat/lng to requests |
| 026 | bloodhero_criticality | Adds condition_text, criticality, criticality_overridden_by to requests |
| 027 | bloodhero_escalation | Adds last_escalation_at, escalation_count, escalation_paused to requests |
| 028 | bloodhero_voice | PENDING — adds condition_voice_transcript, condition_summary, condition_input_type to requests |

---

## Key Migration Notes
- bloodhero_admins created in 014, DROPPED in 016 — must not exist
- Migration filenames use simple numeric prefixes (001, 002...)
  NOT timestamps — Supabase CLI shows time parse warnings but works
- Always use ALTER TABLE ADD COLUMN IF NOT EXISTS — never drops
- Always write rollback comments at top of migration file

---

## 18 Core Tables
bloodhero_admin_access, bloodhero_donors, bloodhero_email_events,
bloodhero_request_events, bloodhero_request_notifications,
bloodhero_requests, bloodhero_settings, chapters, events,
gallery_albums, gallery_images, leadership_layers,
leadership_members, notices, pages, profiles, site_settings,
universities

---

## Env Variables Required
```bash
DATABASE_URL                      # pooler URL port 6543
DIRECT_URL                        # direct URL port 5432
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
BLOODHERO_RESEND_FROM             # e.g. noreply@punab.org
BLOODHERO_RESPONSE_TOKEN_SECRET
BLOODHERO_MATCHING_RUN_SECRET     # cron + manual escalation auth
NEXT_PUBLIC_APP_URL               # e.g. https://punab.org
BLOODHERO_TEST_EMAIL              # dev only
GROQ_API_KEY                      # free — console.groq.com (PENDING setup)
```

---

## Key Architecture Rules
- Server Actions -> src/actions/ — always "use server" + Zod
- Main DB -> src/lib/repositories/ via src/lib/db/prisma.ts ONLY
- BloodHero DB -> src/lib/supabase/ (NOT Prisma, NOT repositories)
- Storage -> src/lib/storage.ts ONLY
- Admin auth -> src/lib/auth/require-admin.ts
- Types -> src/types/database.ts
- Toasts -> Sonner
- Email -> Resend, Server Actions/API routes only
- Geocoding -> src/lib/bloodhero/geocode.ts
  (OpenStreetMap Nominatim, User-Agent: "PUNAB-BloodHero/1.0 (punab.org)")
- Distance -> src/lib/bloodhero/distance.ts (Haversine, pure function)
- Donor matching -> src/lib/bloodhero/match-donors.ts
- Criticality -> src/lib/bloodhero/classify-criticality.ts (rule-based)
- Escalation config -> src/lib/bloodhero/escalation-config.ts
- Escalation runner -> src/lib/bloodhero/run-escalation.ts
- Escalation API -> src/app/api/bloodhero/run-escalation/route.ts
- Summarizer -> src/lib/bloodhero/summarize-condition.ts (truncation, no AI)
- Transcription -> src/actions/bloodhero-transcribe.ts (Groq Whisper)
- Match + notify -> runCriticalityGeoMatchAndNotify() in bloodhero-request.ts

---

## BloodHero Email System
- Helper: src/lib/bloodhero/bloodhero-mail.ts
- Functions: sendDonorRegistrationEmail, sendDonorApprovedEmail,
  sendDonorRejectedEmail, sendBloodRequestNotificationEmail
- Every send attempt logged to bloodhero_email_events (success + failure)
- Response tokens: HMAC-SHA256 signed, src/lib/bloodhero/response-token.ts
- Email failure never fails the action — always non-blocking

---

## BloodHero Escalation System
- Cron: every 10 minutes via vercel.json
- Route: GET /api/bloodhero/run-escalation
- Auth: x-escalation-secret OR Authorization: Bearer 
  both matching BLOODHERO_MATCHING_RUN_SECRET
- Runner: runEscalationForRequest(requestId) in run-escalation.ts
- Skips: closed, fulfilled, cancelled, paused requests
- Auto-fulfills when accepted count >= required_units
- Returns JSON: { candidates, dueForEscalation, processed }

---

## BloodHero Development Phases
| Phase | Status | What |
|---|---|---|
| Phase 1 | ✅ Done | Donor registration, admin approval, email, request creation |
| Phase 2 | ✅ Done | Tracking number, request tracker, events foundation |
| Phase 3 | ✅ Done | Location fields, geocoding, distance-based matching (migration 025) |
| Phase 4 | 🔲 Partial | Criticality ✅, escalation scheduler ✅, voice/transcription PENDING |
| Phase 5 | 🔲 Not started | Donor notification email response links (accept/block) |
| Phase 6 | 🔲 Not started | Donation confirmation, certificates |

---

## Phase 4 Remaining (do this next)
1. Push migration 028 to production: npx supabase db push
2. Sign up at console.groq.com -> get free API key
3. Add GROQ_API_KEY to .env and Vercel env vars
4. Send voice recorder UI prompt to Cursor (see below)

### Voice recorder UI prompt for Cursor:
```text
Read these files before writing anything:
- src/actions/bloodhero-transcribe.ts
- src/components/bloodhero/ (all files)
- src/app/(bloodhero)/bloodhero/request/ (request form page)

Create src/components/bloodhero/BloodHeroVoiceRecorder.tsx

Props:
- onTranscript: (transcript: string) => void
- onError?: (error: string) => void
- disabled?: boolean

Behavior:
- Uses browser MediaRecorder API
- Three states: idle (mic button), recording (stop button + timer), 
  processing (spinner + "Transcribing...")
- On stop: collect audio blob, create FormData with key "audio",
  call transcribeConditionAudio server action
- On success: call onTranscript(transcript)
- On failure: call onError or show inline error
- Handle mic permission denied with clear message
- Mobile friendly — large tap targets
- Match exact styling of existing BloodHero components

Then wire into the blood request form:
- Add BloodHeroVoiceRecorder below condition text field
- When transcript arrives, populate condition text field
- Show "Transcribed from voice" label when populated via voice
- User can still edit transcribed text before submitting
- Pass original transcript separately alongside edited text

Do not change form submission logic or return types.
No Prisma. TypeScript strict, no any.
```

---

## Phase 5 — Next After Phase 4 (Donor Response Links)
Donors receive emails with secure one-click action links:
- I can donate to this request
- Block me for 3 months (donated recently)
- Block me for 2 months
- Block me for 1 month

What needs building:
- Response page: src/app/(bloodhero)/bloodhero/respond/page.tsx
- Validates HMAC token from URL param
- Reads donor_id + request_id from token
- Updates bloodhero_request_notifications response_status
- Updates bloodhero_donors block_until if blocking
- Shows confirmation UI to donor
- No login required — token is the auth

---

## Phase 6 — Donation Confirmation + Certificates
- Admin marks donation as confirmed
- Increases donor donation_count
- Generates certificate (PDF or styled page)
- Stores in bloodhero_certificates table
- Donor can download via secure link

---

## Pending / Next Steps
- [ ] Push migration 028 (voice fields) to production
- [ ] Sign up at console.groq.com — get free GROQ_API_KEY
- [ ] Add GROQ_API_KEY to .env and Vercel
- [ ] Build BloodHeroVoiceRecorder UI component (prompt above)
- [ ] Phase 5: donor email response links + respond page
- [ ] Phase 6: donation confirmation + certificates
- [ ] Replace GOOGLE_FORM_URL_PLACEHOLDER in join/page.tsx
- [ ] Migrate hosting from Vercel to Coolify on Hetzner VPS
- [ ] Make yourself admin on production DB:
      UPDATE public.profiles SET role = 'admin' 
      WHERE email = 'your@email.com';
- [ ] Run full UI enhancement prompts through Cursor

---

## Common Commands
```bash
# switch branches
git checkout mehal
git checkout staging
git checkout main

# save and push work
git add .
git commit -m "feat: description"
git push origin mehal

# merge mehal -> staging -> main
git checkout staging && git merge mehal && git push origin staging
git checkout main && git merge staging && git push origin main

# prisma
npx prisma migrate status
npx prisma migrate deploy

# supabase
npx supabase migration list
npx supabase db push
npx supabase link --project-ref vhucsjaoxfizmztyzooa  # production
npx supabase link --project-ref mmsxpfcdoajinnwycnwv  # practice

# check DB tables and counts (run from project root)
# write a temp script using supabase-js service role client
# see previous session for pattern
```

---

## .gitignore Must Have
```gitignore
.env.local
.env.production
.env.practice
.env.staging
supabase/.temp/
all_migrations.sql
missing_migrations.sql
structure.txt
```
