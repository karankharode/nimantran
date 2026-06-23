import { describe, it, expect } from "vitest";
import { flags } from "@/config/flags";
import { brand } from "@/config/brand";

describe("config", () => {
  it("exposes feature flags as booleans", () => {
    expect(typeof flags.aiIntakeEnabled).toBe("boolean");
    expect(typeof flags.adsEnabled).toBe("boolean");
    expect(typeof flags.subscriptionsEnabled).toBe("boolean");
  });

  it("ads are off by default", () => {
    expect(flags.adsEnabled).toBe(false);
  });

  it("brand is the single source of truth for the product name", () => {
    expect(brand.name).toBeTruthy();
    expect(brand.inviteUrl("my-wedding")).toContain("/my-wedding");
  });
});
