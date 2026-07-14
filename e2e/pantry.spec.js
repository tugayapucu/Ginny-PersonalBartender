// @ts-check
const { test, expect } = require("@playwright/test");
const { createTestUser, deleteTestUser } = require("./helpers/testUser");

let user;

test.beforeEach(async ({ page }) => {
  user = createTestUser("pantryuser");

  await page.goto("/register");
  await page.getByPlaceholder("Username").fill(user.username);
  await page.getByPlaceholder("Email").fill(user.email);
  await page.getByPlaceholder("Password").fill(user.password);
  await page.getByRole("button", { name: "Register" }).click();
  await page.waitForURL("**/login");

  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL("/");
});

test.afterEach(async ({ page, request }) => {
  try {
    await deleteTestUser({ page, request, user });
  } finally {
    user = null;
  }
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
