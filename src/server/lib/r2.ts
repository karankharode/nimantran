import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 (S3-compatible) client for gallery images, audio, exported
 * PDFs and uploaded invitation cards. Signed-URL helpers land in Phase 2/3;
 * this is the shared client + config surface.
 */
export const R2_BUCKET = process.env.R2_BUCKET ?? "nimantran-media";
export const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? "";

const accountId = process.env.R2_ACCOUNT_ID;

export const r2 = new S3Client({
  region: "auto",
  endpoint: accountId
    ? `https://${accountId}.r2.cloudflarestorage.com`
    : undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

/** Public CDN URL for a stored object key. */
export function r2PublicUrl(key: string): string {
  if (!R2_PUBLIC_BASE_URL) return key;
  return `${R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

export const r2Configured = !!(
  accountId &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
);
