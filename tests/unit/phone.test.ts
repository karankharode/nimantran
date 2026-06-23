import { describe, it, expect } from "vitest";
import { normalizePhone, isValidPhone } from "@/lib/phone";

describe("normalizePhone", () => {
  it("prefixes a bare 10-digit Indian number with +91", () => {
    expect(normalizePhone("9876543210")).toBe("+919876543210");
  });

  it("adds + to a 91-prefixed number", () => {
    expect(normalizePhone("919876543210")).toBe("+919876543210");
  });

  it("strips spaces and dashes", () => {
    expect(normalizePhone("+91 98765-43210")).toBe("+919876543210");
  });

  it("leaves an already-normalized number unchanged", () => {
    expect(normalizePhone("+919876543210")).toBe("+919876543210");
  });
});

describe("isValidPhone", () => {
  it("accepts E.164 numbers", () => {
    expect(isValidPhone("+919876543210")).toBe(true);
  });

  it("rejects numbers without a country code", () => {
    expect(isValidPhone("9876543210")).toBe(false);
  });

  it("rejects too-short numbers", () => {
    expect(isValidPhone("+91123")).toBe(false);
  });
});
