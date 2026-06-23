/**
 * Single resolver for "what is this user allowed to do".
 * Reads the cached Entitlement projection, falls back to Payment + Subscription.
 * See docs/03 §8.  All gating (publish, Premium, ads, custom domain, AI credits)
 * must go through this module — never check raw payment rows in feature code.
 */
import type { PrismaClient } from "@prisma/client";

export interface Entitlements {
  canPublish: (invitationId: string) => Promise<boolean>;
  isPremium: () => Promise<boolean>;
  adsDisabled: () => Promise<boolean>;
  customDomainAllowed: () => Promise<boolean>;
  aiCredits: () => Promise<number>;
}

export function entitlementsFor(db: PrismaClient, userId: string): Entitlements {
  const get = (key: string) =>
    db.entitlement.findUnique({ where: { userId_key: { userId, key } } });

  const isPremium = async () => {
    const e = await get("premium");
    if (e && (!e.expiresAt || e.expiresAt > new Date())) return true;
    const sub = await db.subscription.findUnique({ where: { userId } });
    return sub?.status === "ACTIVE";
  };

  return {
    isPremium,
    canPublish: async (invitationId) => {
      if (await isPremium()) return true;
      const e = await get(`publish:${invitationId}`);
      if (e) return true;
      const inv = await db.invitation.findUnique({ where: { id: invitationId } });
      return inv?.paymentStatus === "PAID";
    },
    adsDisabled: async () => isPremium(),
    customDomainAllowed: async () => isPremium(),
    aiCredits: async () => {
      const e = await get("ai_credits");
      const v = e?.value as { credits?: number } | null;
      return v?.credits ?? (await isPremium() ? 100 : 5);
    },
  };
}
