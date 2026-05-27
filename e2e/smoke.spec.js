// @ts-check
const { test, expect } = require("@playwright/test");

test("home page shows Ginny brand", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/ginny/i).first()).toBeVisible();
});

test("/login renders the login form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
