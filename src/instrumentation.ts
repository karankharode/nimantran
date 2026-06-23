import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

/**
 * Next.js instrumentation hook. Initializes Sentry per-runtime, but only when a
 * DSN is configured — so local/dev stays quiet (doc 01: error monitoring).
 */
export async function register() {
  if (!dsn) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({ dsn, tracesSampleRate: 1.0 });
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({ dsn, tracesSampleRate: 1.0 });
  }
}

export const onRequestError = Sentry.captureRequestError;
