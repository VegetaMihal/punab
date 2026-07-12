/** Node-only DB client. Use from repositories / server actions — not Edge middleware. See `DATA_LAYER.md`. */
import { PrismaClient } from "@prisma/client";
import {
  getPrismaConnectionDiagnostics,
  resolvePrismaDatabaseUrlWithMeta,
  type PrismaDatabaseResolution,
} from "@/lib/db/resolve-database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const { url: prismaDatabaseUrl, resolution } = resolvePrismaDatabaseUrlWithMeta();

function logPrismaStartup(res: PrismaDatabaseResolution, databaseUrl: string): void {
  if (process.env.NODE_ENV !== "development") return;
  console.log("[punab] DATABASE_URL effective: yes");
  console.log("[punab] Prisma URL resolution:", res);
  const diag = getPrismaConnectionDiagnostics(databaseUrl);
  if (diag.prisma_target_host) {
    const local =
      diag.prisma_target_host === "localhost" ||
      diag.prisma_target_host === "127.0.0.1" ||
      diag.prisma_target_host === "::1";
    const bits = [
      `${diag.prisma_target_host}:${diag.prisma_target_port ?? "?"}`,
      local ? "localhost" : "remote",
      diag.prisma_uses_pgbouncer ? "pgbouncer" : null,
    ].filter(Boolean);
    console.log("[punab] Prisma target:", bits.join(" · "));
  } else {
    console.log("[punab] Prisma target host: COULD_NOT_PARSE");
  }
  if (diag.prisma_connection_hint) {
    console.warn("[punab] DB hint:", diag.prisma_connection_hint);
  }
  if (res === ".env.local-overrides-localhost-shell") {
    console.log(
      "[punab] Shell DATABASE_URL pointed at localhost; Prisma is using DATABASE_URL from .env.local instead.",
    );
  }
}

logPrismaStartup(resolution, prismaDatabaseUrl);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: prismaDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
