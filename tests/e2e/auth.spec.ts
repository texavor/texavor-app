import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should allow user to log in", async ({ page }) => {
    // Mock the login API call
    await page.route("**/api/v1/login", async (route) => {
      const json = {
        data: {
          token: "fake-token",
          blogs: [{ id: 1, status: "active" }],
        },
      };
      await route.fulfill({
        json,
        headers: { authorization: "Bearer fake-token" },
      });
    });

    await page.goto("/login");

    // Fill in credentials
    await page.fill('input[name="email"]', "surajvishwakarma625@gmail.com");
    await page.fill('input[name="password"]', "Dimple#1125");

    // Click login
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should show error on failure", async ({ page }) => {
    // Mock failed login
    await page.route("**/api/v1/login", async (route) => {
      await route.fulfill({
        status: 401,
        json: { error: "Invalid credentials" },
      });
    });

    await page.goto("/login");
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrongpass");
    await page.click('button[type="submit"]');

    // Expecting URL to NOT change or stay on login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should initiate google login flow", async ({ page }) => {
    await page.goto("/login");
    const googleBtn = page.locator('a[href*="google_oauth2"]');

    // Ensure button is visible
    await expect(googleBtn).toBeVisible();

    // Verify clicking triggers the correct navigation
    // We expect the browser to navigate to the API URL
    const navigationPromise = page.waitForRequest((req) =>
      req.url().includes("/api/v1/auth/google_oauth2")
    );

    await googleBtn.click();

    const request = await navigationPromise;
    expect(request).toBeTruthy();
  });
});
