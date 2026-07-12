/**
 * Human hints for common Prisma DB errors. Keeps logic free of `@prisma/client` imports
 * so it can run in client error boundaries without bundling the Prisma engine.
 */

export type PrismaErrorMeta = {
  code?: string;
  message: string;
};

const CODE_RE = /\b(P\d{4})\b/;

export function readPrismaErrorMeta(error: unknown): PrismaErrorMeta {
  const message = error instanceof Error ? error.message : String(error);
  let code: string | undefined;
  if (error && typeof error === "object" && "code" in error) {
    const c = (error as { code?: unknown }).code;
    if (typeof c === "string" && /^P\d{4}$/.test(c)) {
      code = c;
    }
  }
  if (!code) {
    const m = message.match(CODE_RE);
    if (m) code = m[1];
  }
  return { code, message };
}

export function prismaDbErrorHint(meta: Pick<PrismaErrorMeta, "code">): string | null {
  switch (meta.code) {
    case "P1001":
      return "The app cannot reach Postgres. On Supabase, put the Transaction pooler URI in DATABASE_URL (port 6543, include pgbouncer=true and sslmode=require). Keep the direct db.*.supabase.co:5432 URI in DIRECT_URL for prisma migrate only.";
    case "P1000":
    case "P1017":
      return "Database authentication failed. Check the password in DATABASE_URL and that the Supabase project is not paused.";
    case "P2021":
      return "A required table is missing. Apply migrations to this database: npx prisma migrate deploy (or prisma migrate dev locally).";
    case "P2010":
      return "The database rejected a query (often RLS or SQL). If you use Supabase RLS on these tables, Prisma must connect with a role that bypasses RLS or policies must allow the operation.";
    default:
      return null;
  }
}
