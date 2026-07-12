import fs from "node:fs";
import path from "node:path";

export type PrismaDatabaseResolution =
  | "process.env"
  | ".env"
  | ".env.local"
  | ".env.local-overrides-localhost-shell";

function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

/** Reads DATABASE_URL from a single env file (no process.env). */
export function readDatabaseUrlFromEnvFile(absPath: string): string | undefined {
  if (!fs.existsSync(absPath)) return undefined;
  const text = fs.readFileSync(absPath, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    if (!t.startsWith("DATABASE_URL=")) continue;
    const v = stripQuotes(t.slice("DATABASE_URL=".length));
    if (v) return v;
  }
  return undefined;
}

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/** Safe diagnostics for DATABASE_URL (no secrets). */
export function getPrismaConnectionDiagnostics(databaseUrl: string): {
  prisma_target_host: string | null;
  prisma_target_port: string | null;
  prisma_uses_pgbouncer: boolean;
  prisma_connection_hint: string | null;
} {
  try {
    const u = new URL(databaseUrl);
    const host = u.hostname;
    const port = u.port || (u.protocol === "postgresql:" || u.protocol === "postgres:" ? "5432" : "");
    const usesPgbouncer = u.searchParams.get("pgbouncer") === "true";
    const looksLikeSupabaseDirect =
      host.startsWith("db.") &&
      host.endsWith(".supabase.co") &&
      (port === "5432" || port === "") &&
      !usesPgbouncer;

    let hint: string | null = null;
    if (looksLikeSupabaseDirect) {
      hint =
        "DATABASE_URL looks like Supabase direct (db.*.supabase.co:5432). Prisma queries use this URL — if you see P1001 locally, set DATABASE_URL to the Transaction pooler URI (port 6543, pgbouncer=true) and put the direct URI in DIRECT_URL only.";
    }

    return {
      prisma_target_host: host,
      prisma_target_port: port || null,
      prisma_uses_pgbouncer: usesPgbouncer,
      prisma_connection_hint: hint,
    };
  } catch {
    return {
      prisma_target_host: null,
      prisma_target_port: null,
      prisma_uses_pgbouncer: false,
      prisma_connection_hint: null,
    };
  }
}

/**
 * Resolves the Postgres URL Prisma should use at runtime.
 *
 * Next.js (and Node) give **pre-set `process.env.DATABASE_URL` (shell / OS)** precedence over
 * `.env.local`. If the shell points at localhost but `.env.local` has a remote URL, we use
 * `.env.local` so local dev matches the repo config.
 *
 * Escape hatches:
 * - `ALLOW_LOCAL_POSTGRES=1` — do not override; use shell `process.env.DATABASE_URL` when set.
 * - `PRISMA_DATABASE_URL_STRICT=1` — never read files; `process.env.DATABASE_URL` only.
 */
export function resolvePrismaDatabaseUrlWithMeta(): {
  url: string;
  resolution: PrismaDatabaseResolution;
} {
  const cwd = process.cwd();
  const fromEnv = readDatabaseUrlFromEnvFile(path.join(cwd, ".env"));
  const fromLocal = readDatabaseUrlFromEnvFile(path.join(cwd, ".env.local"));
  const fromFiles = fromLocal ?? fromEnv;
  const fromProcess = process.env.DATABASE_URL?.trim();

  const strict = process.env.PRISMA_DATABASE_URL_STRICT === "1" || process.env.PRISMA_DATABASE_URL_STRICT === "true";
  const allowLocal = process.env.ALLOW_LOCAL_POSTGRES === "1" || process.env.ALLOW_LOCAL_POSTGRES === "true";

  if (strict) {
    if (!fromProcess) {
      throw new Error(
        "DATABASE_URL is missing (PRISMA_DATABASE_URL_STRICT=1: only process.env is read).",
      );
    }
    return { url: fromProcess, resolution: "process.env" };
  }

  if (fromProcess && fromFiles) {
    const hp = hostOf(fromProcess);
    const hf = hostOf(fromFiles);
    if (hp && hf && isLocalHost(hp) && !isLocalHost(hf) && !allowLocal) {
      return { url: fromFiles, resolution: ".env.local-overrides-localhost-shell" };
    }
  }

  if (fromProcess) {
    return { url: fromProcess, resolution: "process.env" };
  }
  if (fromLocal) {
    return { url: fromLocal, resolution: ".env.local" };
  }
  if (fromEnv) {
    return { url: fromEnv, resolution: ".env" };
  }

  throw new Error(
    "DATABASE_URL is missing. Add it to punab-web/.env.local (Supabase → Project Settings → Database → Connection string → URI).",
  );
}

/** Safe JSON for `/api/debug/db-host` — no secrets. */
export function getPrismaDatabaseUrlAudit(): {
  database_url_effective: "yes" | "no";
  prisma_target_host: string | null;
  prisma_target_port: string | null;
  prisma_uses_pgbouncer: boolean;
  prisma_connection_hint: string | null;
  resolution: PrismaDatabaseResolution | "error";
  process_env_database_url: "set" | "unset";
  punab_env_local_database_url: "set" | "unset";
  punab_env_database_url: "set" | "unset";
} {
  const cwd = process.cwd();
  const fromEnv = readDatabaseUrlFromEnvFile(path.join(cwd, ".env"));
  const fromLocal = readDatabaseUrlFromEnvFile(path.join(cwd, ".env.local"));
  const fromProcess = process.env.DATABASE_URL?.trim();

  try {
    const { url, resolution } = resolvePrismaDatabaseUrlWithMeta();
    const diag = getPrismaConnectionDiagnostics(url);
    return {
      database_url_effective: "yes",
      prisma_target_host: diag.prisma_target_host,
      prisma_target_port: diag.prisma_target_port,
      prisma_uses_pgbouncer: diag.prisma_uses_pgbouncer,
      prisma_connection_hint: diag.prisma_connection_hint,
      resolution,
      process_env_database_url: fromProcess ? "set" : "unset",
      punab_env_local_database_url: fromLocal ? "set" : "unset",
      punab_env_database_url: fromEnv ? "set" : "unset",
    };
  } catch {
    return {
      database_url_effective: "no",
      prisma_target_host: null,
      prisma_target_port: null,
      prisma_uses_pgbouncer: false,
      prisma_connection_hint: null,
      resolution: "error",
      process_env_database_url: fromProcess ? "set" : "unset",
      punab_env_local_database_url: fromLocal ? "set" : "unset",
      punab_env_database_url: fromEnv ? "set" : "unset",
    };
  }
}
