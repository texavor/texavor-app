import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "fake-token");
      document.cookie =
        "_texavor_session=fake-token; path=/; secure; samesite=strict";
    });

    // Mock critical APIs that might be called on load
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        json: { data: { id: 1, email: "test@example.com" } },
      });
    });
  });

  test("should render sidebar and topbar", async ({ page }) => {
    await page.goto("/dashboard");

    // Verify Dashboard URL
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify Sidebar links are present (more robust than text which might be hidden)
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('a[href="/settings"]')).toBeVisible();
  });
});
