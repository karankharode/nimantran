import { GoogleAnalytics } from "@next/third-parties/google";

/**
 * GA4 via the official @next/third-parties integration (doc 01). Loaded only in
 * production with a real measurement id, so dev/preview stay "dark".
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const enabled =
    process.env.NODE_ENV === "production" && !!gaId && !gaId.includes("XXX");
  if (!enabled || !gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
