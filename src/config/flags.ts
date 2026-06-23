/** Feature flags from env so features can ship dark. See .env.example. */
const bool = (v: string | undefined, def = false) =>
  v == null ? def : v === "true" || v === "1";

export const flags = {
  aiIntakeEnabled: bool(process.env.AI_INTAKE_ENABLED, true),
  subscriptionsEnabled: bool(process.env.SUBSCRIPTIONS_ENABLED, true),
  adsEnabled: bool(process.env.ADS_ENABLED, false),
} as const;
