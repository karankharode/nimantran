import "server-only";
import { createHash, randomInt } from "crypto";
import { db } from "./db";
import { redis } from "./redis";
import { normalizePhone, isValidPhone } from "@/lib/phone";

/**
 * Phone-OTP primitives (doc 01 — MSG91 primary, India-first). Codes are hashed
 * at rest; raw codes are never stored. In dev (no MSG91 key) the code is logged
 * to the server console so you can sign in without an SMS gateway.
 */

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

export { normalizePhone, isValidPhone };

function hashCode(phone: string, code: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHash("sha256").update(`${phone}:${code}:${secret}`).digest("hex");
}

export interface RequestOtpResult {
  ok: boolean;
  cooldown?: number;
  /** present only in dev (no MSG91 configured) so you can log in locally */
  devCode?: string;
}

export async function requestOtp(rawPhone: string): Promise<RequestOtpResult> {
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) throw new Error("INVALID_PHONE");

  const cooldownKey = `otp:cooldown:${phone}`;
  const existing = await redis.ttl(cooldownKey);
  if (existing && existing > 0) return { ok: false, cooldown: existing };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = hashCode(phone, code);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  await db.otpChallenge.create({ data: { phone, codeHash, expiresAt } });
  await redis.set(cooldownKey, "1", "EX", RESEND_COOLDOWN_SECONDS);

  const sent = await sendSms(phone, code);
  return { ok: true, ...(sent.devCode ? { devCode: sent.devCode } : {}) };
}

export interface VerifyOtpResult {
  ok: boolean;
  phone: string;
  reason?: "EXPIRED" | "NO_CHALLENGE" | "BAD_CODE" | "TOO_MANY_ATTEMPTS";
}

export async function verifyOtp(rawPhone: string, code: string): Promise<VerifyOtpResult> {
  const phone = normalizePhone(rawPhone);
  const challenge = await db.otpChallenge.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) return { ok: false, phone, reason: "NO_CHALLENGE" };
  if (challenge.expiresAt < new Date()) return { ok: false, phone, reason: "EXPIRED" };
  if (challenge.attempts >= MAX_ATTEMPTS) return { ok: false, phone, reason: "TOO_MANY_ATTEMPTS" };

  if (challenge.codeHash !== hashCode(phone, code)) {
    await db.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, phone, reason: "BAD_CODE" };
  }

  await db.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true, phone };
}

interface SendResult {
  devCode?: string;
}

/** Send the OTP over SMS via MSG91. Falls back to console log in dev. */
async function sendSms(phone: string, code: string): Promise<SendResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    // Dev fallback: no gateway configured.
    console.info(`[otp] DEV code for ${phone}: ${code}`);
    return { devCode: code };
  }

  try {
    const params = new URLSearchParams({
      authkey: authKey,
      mobile: phone.replace("+", ""),
      otp: code,
      ...(process.env.MSG91_SENDER_ID ? { sender: process.env.MSG91_SENDER_ID } : {}),
    });
    const res = await fetch(`https://control.msg91.com/api/v5/otp?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`MSG91 ${res.status}`);
  } catch (err) {
    console.error("[otp] MSG91 send failed", err);
    throw new Error("OTP_SEND_FAILED");
  }
  return {};
}
