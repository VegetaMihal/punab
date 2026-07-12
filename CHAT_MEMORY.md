# PUNAB-Web — Chat Memory
Last updated: April 2026

## Project
- Name: PUNAB-Web (Private University National Association of Bangladesh)
- Repo: github.com/punabofficial/PUNAB-Web
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Prisma 5, Supabase, Resend, Sonner, Zod, react-dropzone
- Deployed on: Vercel (Hobby plan) — planning migration to Coolify on Hetzner VPS
- Local path: D:\Websites\PUNAB\PUNAB-Web
## Branch Strategy
| Branch | Purpose |
|---|---|
| main | Production — only merge after staging verified |
| staging | Test merges before main — always created fresh from main |
| mehal | Active development branch |

Flow: mehal → staging (test) → main (go live)
## Vercel Setup
- Production URL: auto-deployed from main
- Preview URL: https://punab-web-git-staging-punabs-projects.vercel.app (staging)
- Mehal preview: https://punab-web-mehal-glogfi0cq-punabs-projects.vercel.app
- Preview env vars → practice DB credentials
- Production env vars → prod DB credentials
- Deployment protection: OFF (previews are public)

## Hosting Migration Plan
- Current: Vercel Hobby (free, but Pro upgrade coming)
- Target: Coolify self-hosted on Hetzner CX22 VPS (~€4/mo total)
- Steps: Add output: "standalone" to next.config.ts, write Dockerfile, 
  spin up Hetzner VPS, install Coolify, connect GitHub, set env vars, point DNS
- Supabase, Resend stay untouched
- Status: PLANNED, not started

## Database Setup
### Two Supabase Projects
- Practice DB → used for local dev + Vercel preview deployments
  - Project ref: mmsxpfcdoajinnwycnwv (Southeast Asia - Singapore)
- Production DB → used for main branch / live site (www.punab.com)
  - Project ref: vhucsjaoxfizmztyzooa (West EU - Ireland)

### Migration Status
- Production DB: Migrations 001→025 ALL APPLIED and tracked via Supabase CLI
- Supabase CLI linked to: production (vhucsjaoxfizmztyzooa)
- To push new migrations: npx supabase db push (only pending migrations run)
- NEVER run prisma migrate dev on production — only prisma migrate deploy
- Prisma baseline command: npx prisma migrate resolve --applied 20260324120000_init

### Migration History (001→025)
001 - mvp_schema
002 - cms_gallery
003 - leadership_layers
004 - fix_is_admin_rls_recursion
005 - bloodhero_donors
006 - bloodhero_requests
007 - bloodhero_tracker
008 - bloodhero_request_created_event_copy
009 - bloodhero_tracking_number
010 - bloodhero_matching
011 - bloodhero_matching_post_insert_trigger
012 - bloodhero_matching_logic_refine
013 - bloodhero_donor_response
014 - bloodhero_admins
015 - bloodhero_donors_admin_access
016 - bloodhero_admin_unified_access
017 - bloodhero_email_events
018 - bloodhero_donor_auto_approval
019 - bloodhero_matching_admin_event_refine
020 - honorary_leadership_layer
021 - harden_rls_exposed_tables
022 - hero_site_copy
023 - event_post_url
024 - bloodhero_requests_admin_access
025 - bloodhero_location_fields (adds center_point_address, 
      center_point_lat, center_point_lng, district_or_area 
      to bloodhero_donors; adds donation_location_address, 
      donation_location_lat, donation_location_lng 
      to bloodhero_requests)
027 - bloodhero_escalation (adds last_escalation_at, 
      escalation_count, escalation_paused to bloodhero_requests)

### 18 Core Tables
bloodhero_admin_access, bloodhero_donors, bloodhero_email_events,
bloodhero_request_events, bloodhero_request_notifications, 
bloodhero_requests, bloodhero_settings, chapters, events, 
gallery_albums, gallery_images, leadership_layers, 
leadership_members, notices, pages, profiles, site_settings, 
universities

### Key Migration Notes
- bloodhero_admins table was created in 014 and DROPPED in 016 
  — should not exist
- 002_cms_gallery.sql has DROP TRIGGER IF EXISTS fixes (safe)
- 009_bloodhero_tracking_number.sql seeds sequence from 1 not 0
- Migration filenames use simple numeric prefixes (001, 002...) 
  NOT timestamps — this causes Supabase CLI time parsing warnings 
  but works correctly
- prisma/sql/post_deploy_supabase_rls.sql is comments only 
  — RLS lives in migrations

## Env Variables Required
DATABASE_URL                          # pooler URL port 6543
DIRECT_URL                            # direct URL port 5432
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
BLOODHERO_RESEND_FROM                 # e.g. noreply@punab.org
BLOODHERO_RESPONSE_TOKEN_SECRET
BLOODHERO_MATCHING_RUN_SECRET   # cron + manual escalation auth
NEXT_PUBLIC_APP_URL                   # e.g. https://punab.org
BLOODHERO_TEST_EMAIL                  # dev only
GROQ_API_KEY                          # BloodHero voice transcription (Groq Whisper)

## Key Architecture Rules
- Server Actions → src/actions/ — always "use server" + Zod
- Main DB → src/lib/repositories/ via src/lib/db/prisma.ts ONLY
- BloodHero DB → src/lib/supabase/ (NOT Prisma, NOT repositories)
- Storage → src/lib/storage.ts ONLY
- Admin auth → src/lib/auth/require-admin.ts
- Types → src/types/database.ts
- Toasts → Sonner
- Email → Resend, Server Actions/API routes only
- Geocoding → src/lib/bloodhero/geocode.ts 
  (OpenStreetMap Nominatim, User-Agent: "PUNAB-BloodHero/1.0 (punab.org)")
- Distance → src/lib/bloodhero/distance.ts (Haversine, pure function)
- Donor matching → src/lib/bloodhero/match-donors.ts
- Escalation runner → src/lib/bloodhero/run-escalation.ts
- Escalation API → src/app/api/bloodhero/run-escalation/route.ts
- Vercel cron → vercel.json (*/10 * * * * hitting run-escalation)

## BloodHero Architecture
- Concept note: BloodHero_Concept_Note.docx (in project root or docs/)
- Email helper: src/lib/bloodhero/bloodhero-mail.ts
  (sendDonorRegistrationEmail, sendDonorApprovedEmail, 
  sendDonorRejectedEmail, sendBloodRequestNotificationEmail)
- Email event logging: bloodhero_email_events table, 
  logged on every send attempt (success and failure)
- Response tokens: HMAC-SHA256 signed, 
  from src/lib/bloodhero/response-token.ts
- Geocoding: non-blocking, returns null on failure
- Matching: findEligibleDonors() in match-donors.ts
  filters by approved status, blood group, block_until, 
  excludes already-notified donors, sorts by distance

## BloodHero Development Phases
- Phase 1 ✅ Donor registration, admin approval, email, request creation
- Phase 2 ✅ Tracking number, request tracker, events
- Phase 3 ✅ Location fields, geocoding, distance-based matching (migration 025)
- Phase 4 ✅ Criticality classification (026_bloodhero_criticality.sql)
- Phase 4 ✅ Escalation config (escalation-config.ts)
- Phase 4 ✅ Initial batch matching wired into request action
- Phase 4 ✅ Escalation follow-up scheduler (027_bloodhero_escalation.sql)
- Phase 4 ✅ Voice input + transcription (Groq whisper-large-v3-turbo, EN/BN toggle)
- Phase 4 🔲 AI criticality upgrade
- Phase 5 🔲 Donor notification emails and secure response links
- Phase 6 🔲 Matches, confirmation, certificates

## .gitignore — Must Have These
.env.local
.env.production
.env.practice
.env.staging
supabase/.temp/
all_migrations.sql
missing_migrations.sql
structure.txt

## Common Commands
# switch to mehal
git checkout mehal

# save and push work
git add .
git commit -m "feat: description"
git push origin mehal

# merge mehal into staging for testing
git checkout staging
git merge mehal
git push origin staging

# merge staging into main (go live)
git checkout main
git merge staging
git push origin main

# check prisma migration status
npx prisma migrate status

# apply prisma migrations
npx prisma migrate deploy

# check supabase migration status
npx supabase migration list

# push pending supabase migrations to production
npx supabase db push

# link supabase CLI to production
npx supabase link --project-ref vhucsjaoxfizmztyzooa

# link supabase CLI to practice
npx supabase link --project-ref mmsxpfcdoajinnwycnwv

## Pending / Next Steps
- [x] Set up production DB
- [x] Apply migrations to production Supabase
- [ ] Replace GOOGLE_FORM_URL_PLACEHOLDER with real Google Form 
      link in join/page.tsx
- [ ] Phase 4: implement criticality classification 
      (026_bloodhero_criticality.sql)
- [ ] Phase 4: escalation config and match trigger in request action
- [x] Phase 4: escalation follow-up scheduler
- [ ] Phase 5: donor notification email flow
- [ ] Phase 6: donation confirmation and certificates
- [ ] Migrate hosting from Vercel to Coolify on Hetzner VPS
- [ ] Make yourself admin on production DB:
      UPDATE public.profiles SET role = 'admin' 
      WHERE email = 'your@email.com';
- [ ] Run full UI enhancement prompts through Cursor
- [x] Fix production voice transcription env: GROQ_API_KEY was set only in Development; added to Production in Vercel and redeployed

## How to Start Next Chat
Paste this at the top of your next Claude or Cursor chat:
"Read CHAT_MEMORY.md for full project context before anything else."

---
