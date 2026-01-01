import { test, expect } from "@playwright/test";

test.describe("Article Publication Settings", () => {
  // NOTE: You must be logged in for these tests to work.
  // Ideally, setup a global auth state or use a login helper.
  // For this script, we assume a valid session or you can add a login step.

  const ARTICLE_ID = "test-article-id"; // Replace with a valid ID or create one dynamically
  const BLOG_ID = "test-blog-id"; // Replace with valid blog ID

  test.beforeEach(async ({ page }) => {
    // Optional: Login implementation
    // await page.goto('/login');
    // await page.fill('input[type="email"]', 'user@example.com');
    // await page.fill('input[type="password"]', 'password');
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/dashboard');
  });

  test("should save Hashnode slug setting", async ({ page }) => {
    // 1. Navigate to article page
    await page.goto(`/article/${ARTICLE_ID}`);

    // 2. Open Settings Sheet
    await page.getByRole("button", { name: /Settings/i }).click();
    await expect(page.getByText("Article Settings")).toBeVisible();

    // 3. Select Hashnode integration (assuming it's connected)
    // You might need to check the checkbox first if not selected
    const hashnodeCheckbox = page.locator('label:has-text("Hashnode")');
    await hashnodeCheckbox.click(); // Ensure it's checked/active

    // 4. Open Platform Settings
    // Locate the settings button next to Hashnode
    // The button has a title="Configure platform settings" or generic Settings icon
    await page
      .locator(
        'div:has-text("Hashnode") button[title="Configure platform settings"]'
      )
      .click();

    // 5. Verify Dialog Opens
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Hashnode Settings")).toBeVisible();

    // 6. Fill Slug
    const testSlug = `test-slug-${Date.now()}`;
    await page.fill("#slug", testSlug);

    // 7. Save Settings
    await page.getByRole("button", { name: "Save Settings" }).click();

    // 8. Verify Toast/Success
    await expect(page.getByText("Settings updated")).toBeVisible();

    // 9. Reload and Verify Persistence
    await page.reload();
    await page.getByRole("button", { name: /Settings/i }).click();
    await page
      .locator(
        'div:has-text("Hashnode") button[title="Configure platform settings"]'
      )
      .click();
    await expect(page.locator("#slug")).toHaveValue(testSlug);
  });

  test("should save Custom Webhook category setting", async ({ page }) => {
    await page.goto(`/article/${ARTICLE_ID}`);
    await page.getByRole("button", { name: /Settings/i }).click();

    // Assuming Custom Webhook is named "Custom Webhook" or similar
    const webhookCheckbox = page.locator('label:has-text("Custom Webhook")');
    if (await webhookCheckbox.isVisible()) {
      if (!(await webhookCheckbox.isChecked())) {
        await webhookCheckbox.click();
      }

      await page
        .locator(
          'div:has-text("Custom Webhook") button[title="Configure platform settings"]'
        )
        .click();

      await expect(page.getByRole("dialog")).toBeVisible();
      await page.fill("#category", "News");

      await page.getByRole("button", { name: "Save Settings" }).click();
      await expect(page.getByText("Settings updated")).toBeVisible();

      // Verify persistence
      await page
        .locator(
          'div:has-text("Custom Webhook") button[title="Configure platform settings"]'
        )
        .click();
      await expect(page.locator("#category")).toHaveValue("News");
    } else {
      console.log(
        "Custom Webhook integration not found/connected, skipping test"
      );
    }
  });
});
