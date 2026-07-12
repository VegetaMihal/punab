#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";

const checks = [
  {
    label: "DATABASE_URL is set",
    ok: Boolean(process.env.DATABASE_URL?.trim()),
    hint: "Set DATABASE_URL in environment.",
  },
  {
    label: "DIRECT_URL is set",
    ok: Boolean(process.env.DIRECT_URL?.trim()),
    hint: "Set DIRECT_URL in environment.",
  },
  {
    label: "RESEND_API_KEY is set",
    ok: Boolean(process.env.RESEND_API_KEY?.trim()),
    hint: "Set RESEND_API_KEY for email sending.",
  },
  {
    label: "CERTIFICATE_RESEND_FROM or BLOODHERO_RESEND_FROM is set",
    ok: Boolean(process.env.CERTIFICATE_RESEND_FROM?.trim() || process.env.BLOODHERO_RESEND_FROM?.trim()),
    hint: "Set sender email env var for certificates.",
  },
  {
    label: "NEXT_PUBLIC_APP_URL is set",
    ok: Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim()),
    hint: "Set NEXT_PUBLIC_APP_URL to your production URL.",
  },
  {
    label: "Vercel PDF: Chromium pack via Supabase or explicit URL",
    ok: (() => {
      if (!process.env.VERCEL) return true;
      const u = process.env.CHROMIUM_PACK_URL?.trim();
      const p = process.env.CHROMIUM_PACK_OBJECT_PATH?.trim();
      const s = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      return Boolean(u || (p && s));
    })(),
    hint:
      "On Vercel set CHROMIUM_PACK_OBJECT_PATH (e.g. chromium/chromium-v138.0.2-pack.x64.tar) + public bucket, or CHROMIUM_PACK_URL to the pack .tar HTTPS URL.",
  },
  {
    label: "Local logo file exists",
    ok: existsSync(path.join(process.cwd(), "public", "branding", "punab-logo-v2.png")),
    hint: "Add logo at public/branding/punab-logo-v2.png or set NEXT_PUBLIC_PUNAB_LOGO_URL.",
  },
];

const failed = checks.filter((c) => !c.ok);
for (const check of checks) {
  process.stdout.write(`${check.ok ? "PASS" : "FAIL"} ${check.label}\n`);
  if (!check.ok) {
    process.stdout.write(`  -> ${check.hint}\n`);
  }
}

if (failed.length > 0) {
  process.stdout.write(`\nCertificate readiness failed (${failed.length} checks).\n`);
  process.exit(1);
}

process.stdout.write("\nCertificate readiness checks passed.\n");
