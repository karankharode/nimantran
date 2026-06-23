import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton. Next.js hot-reload would otherwise spawn many clients in
 * dev, exhausting Postgres connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
