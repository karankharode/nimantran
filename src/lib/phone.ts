/**
 * Pure phone helpers (no server-only deps) so they're shared by client forms,
 * the OTP service, and unit tests. India-first defaults (doc 01).
 */
export function normalizePhone(input: string): string {
  const trimmed = input.trim().replace(/[\s-]/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;
  if (/^91\d{10}$/.test(trimmed)) return `+${trimmed}`;
  return trimmed;
}

export function isValidPhone(phone: string): boolean {
  return /^\+\d{10,15}$/.test(phone);
}
