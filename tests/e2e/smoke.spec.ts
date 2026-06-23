import { test, expect } from "@playwright/test";

/** No-DB smoke: the public shell renders and routes to login. */
test("landing renders and links to login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByLabel("Phone number")).toBeVisible();
});
