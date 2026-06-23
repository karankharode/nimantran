import { auth } from "@/server/auth";
import { db } from "@/server/lib/db";
import { entitlementsFor } from "@/server/lib/entitlements";

/**
 * tRPC request context. Resolves the session once per request and exposes the
 * db handle + an entitlements resolver scoped to the current user (doc 03 §8).
 */
export async function createContext() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  return {
    db,
    session,
    userId,
    entitlements: userId ? entitlementsFor(db, userId) : null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
