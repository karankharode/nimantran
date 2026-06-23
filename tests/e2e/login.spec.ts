import { test, expect } from "@playwright/test";

/**
 * Phase 0 happy path: phone-OTP login → empty authenticated dashboard.
 * Requires a reachable Postgres (DATABASE_URL) and no MSG91 key configured, so
 * the dev code surfaces in the UI. Skipped automatically when DB is absent.
 */
const HAS_DB = !!process.env.DATABASE_URL;

test.describe("OTP login", () => {
  test.skip(!HAS_DB, "needs DATABASE_URL (Postgres) to upsert the user");

  test("logs in with the dev code and lands on the dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Phone number").fill("9876500000");
    await page.getByRole("button", { name: "Send code" }).click();

    // Dev mode surfaces the code (no SMS gateway). Field is pre-filled.
    const code = page.getByLabel("6-digit code");
    await expect(code).toBeVisible();
    await expect(code).not.toHaveValue("");

    await page.getByRole("button", { name: "Verify & continue" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("No invitations yet")).toBeVisible();
  });
});
