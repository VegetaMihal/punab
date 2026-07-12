/**
 * Safe diagnostics: does not print DATABASE_URL or credentials.
 * Merges .env then .env.local, then lets process.env.DATABASE_URL override (Next-like).
 * The running app’s Prisma client uses `src/lib/db/resolve-database-url.ts` (may prefer .env.local when shell is localhost).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseEnvFile(rel) {
  const filePath = path.join(root, rel);
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const fromFiles = { ...parseEnvFile(".env"), ...parseEnvFile(".env.local") };
const fromShell = process.env.DATABASE_URL?.trim();
const fileUrl = fromFiles.DATABASE_URL?.trim();
const effective = fromShell || fileUrl;

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

console.log("DATABASE_URL from process.env (shell/CI):", fromShell ? "set" : "unset");
console.log("DATABASE_URL from .env files (.env + .env.local):", fileUrl ? "set" : "unset");
console.log("Effective DATABASE_URL for this check:", effective ? "set" : "NOT SET");
console.log("Effective source:", fromShell ? "process.env (wins over .env files when set)" : fileUrl ? ".env files" : "none");

if (fromShell && fileUrl) {
  const hShell = hostOf(fromShell);
  const hFile = hostOf(fileUrl);
  if (hShell && hFile && hShell !== hFile) {
    console.log("");
    console.log("MISMATCH: Shell DATABASE_URL host != .env files DATABASE_URL host.");
    console.log("  process.env DATABASE_URL host:", hShell);
    console.log("  .env files DATABASE_URL host:", hFile);
    console.log("Next.js and Prisma use process.env when your shell exports DATABASE_URL — .env.local is ignored for that key.");
  }
}

if (!effective) {
  process.exitCode = 1;
  console.error("Cannot parse host: no DATABASE_URL.");
  process.exit();
}

try {
  const u = new URL(effective);
  console.log("prisma_target_host:", u.hostname);
  console.log("prisma_target_port:", u.port || "(default)");
  const local = u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "::1";
  console.log("prisma_target_kind:", local ? "localhost" : "remote");
} catch {
  console.error("prisma_target_host: COULD_NOT_PARSE (value is not a valid URL)");
  process.exitCode = 1;
}
