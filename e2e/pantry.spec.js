// @ts-check
const { test, expect } = require("@playwright/test");

const timestamp = Date.now();
const USER = {
  username: `pantryuser${timestamp}`,
  email: `pantryuser${timestamp}@example.com`,
  password: "Secure1!Pass",
};

test.beforeEach(async ({ page }) => {
  await page.goto("/register");
  await page.getByPlaceholder("Username").fill(USER.username);
  await page.getByPlaceholder("Email").fill(USER.email);
  await page.getByPlaceholder("Password").fill(USER.password);
  await page.getByRole("button", { name: "Register" }).click();
  await page.waitForURL("**/login");

  await page.getByLabel("Email").fill(USER.email);
  await page.getByLabel("Password").fill(USER.password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL("/");
});

test("pantry: add and remove an ingredient", async ({ page }) => {
  await page.goto("/pantry");

  // Empty state is visible before adding
  await expect(page.getByTestId("pantry-empty")).toBeVisible();

  // Add an ingredient
  await page.getByTestId("pantry-input").fill("Tequila");
  await page.getByTestId("pantry-add-btn").click();

  // Item appears in the list
  await expect(page.getByTestId("pantry-list")).toBeVisible();
  await expect(page.getByTestId("pantry-item").first()).toContainText("Tequila");

  // Empty state is gone
  await expect(page.getByTestId("pantry-empty")).not.toBeVisible();

  // Remove the ingredient
  await page.getByRole("button", { name: /remove tequila from pantry/i }).click();

  // Empty state returns
  await expect(page.getByTestId("pantry-empty")).toBeVisible();
});

test("pantry: duplicate ingredient shows error", async ({ page }) => {
  await page.goto("/pantry");

  await page.getByTestId("pantry-input").fill("Vodka");
  await page.getByTestId("pantry-add-btn").click();
  await expect(page.getByTestId("pantry-item").first()).toContainText("Vodka");

  // Add same ingredient again
  await page.getByTestId("pantry-input").fill("Vodka");
  await page.getByTestId("pantry-add-btn").click();

  await expect(page.getByTestId("pantry-error")).toBeVisible();
  await expect(page.getByTestId("pantry-error")).toContainText(/already in pantry/i);
});
