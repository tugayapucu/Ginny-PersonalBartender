// @ts-check
const { test, expect } = require("@playwright/test");

// Unique credentials per run — no dependency on pre-existing user data
const timestamp = Date.now();
const USER = {
  username: `user${timestamp}`,
  email: `user${timestamp}@example.com`,
  password: "Secure1!Pass",
};

// Known cocktail that exists in the seed data
const SEARCH_TERM = "Margarita";

test("user journey: register → login → search → detail → favorite → settings", async ({
  page,
}) => {
  // ------------------------------------------------------------------
  // 1. Register a new user
  // ------------------------------------------------------------------
  await test.step("register new user", async () => {
    await page.goto("/register");
    await page.getByPlaceholder("Username").fill(USER.username);
    await page.getByPlaceholder("Email").fill(USER.email);
    await page.getByPlaceholder("Password").fill(USER.password);
    await page.getByRole("button", { name: "Register" }).click();
    await page.waitForURL("**/login");
  });

  // ------------------------------------------------------------------
  // 2. Log in (already redirected to /login)
  // ------------------------------------------------------------------
  await test.step("log in", async () => {
    await page.getByLabel("Email").fill(USER.email);
    await page.getByLabel("Password").fill(USER.password);
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForURL("/");
    await expect(page.getByRole("button", { name: /logout/i })).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 3. Search for a cocktail by name
  // ------------------------------------------------------------------
  let cocktailName;
  await test.step("search for a cocktail by name", async () => {
    await page.goto("/recipes");
    await page
      .getByPlaceholder("Search by cocktail name or ingredient")
      .fill(SEARCH_TERM);
    const firstCard = page.locator('[data-testid="cocktail-card"]').first();
    await expect(firstCard).toBeVisible();
    cocktailName = (await firstCard.getByRole("heading").textContent()).trim();
    expect(cocktailName).toBeTruthy();
  });

  // ------------------------------------------------------------------
  // 4. Open cocktail detail page
  // ------------------------------------------------------------------
  await test.step("open cocktail detail page", async () => {
    // Clicking the h3 inside the <Link> navigates to the detail route
    await page
      .locator('[data-testid="cocktail-card"]')
      .first()
      .getByRole("heading")
      .click();
    await page.waitForURL("**/cocktails/**");
    await expect(
      page.getByRole("heading", { name: cocktailName })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Ingredients" })
    ).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 5. Add cocktail to favorites
  // ------------------------------------------------------------------
  await test.step("add cocktail to favorites", async () => {
    await page.goto("/recipes");
    await page
      .getByPlaceholder("Search by cocktail name or ingredient")
      .fill(SEARCH_TERM);
    const firstCard = page.locator('[data-testid="cocktail-card"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard
      .getByRole("button", { name: "Add to favorites" })
      .click();
    await expect(
      firstCard.getByRole("button", { name: "Remove from favorites" })
    ).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 6. Favorites page shows the saved cocktail
  // ------------------------------------------------------------------
  await test.step("cocktail appears on favorites page", async () => {
    await page.goto("/favorites");
    await expect(
      page.locator('[data-testid="favorite-card"]').first()
    ).toBeVisible();
    await expect(page.getByText(cocktailName)).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 7. Remove cocktail from favorites
  // ------------------------------------------------------------------
  await test.step("remove cocktail from favorites", async () => {
    await page
      .getByRole("button", { name: "Remove from favorites" })
      .first()
      .click();
    await expect(page.getByText("No favorites yet.")).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 8. Settings page shows all sections
  // ------------------------------------------------------------------
  await test.step("settings shows profile, password, and theme sections", async () => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "Profile Information" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Change Password" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Appearance" })
    ).toBeVisible();
  });
});
