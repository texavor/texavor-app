# Running UI Tests

Since the project does not currently have a testing framework configured, I have created a sample Playwright test script to verify the Article Publication Settings.

## Prerequisites

You need to install Playwright to run these tests.

```bash
npm install -D @playwright/test
npx playwright install
```

## Running the Verification Script

1. **Update Config**: Open `tests/e2e/article-publication-settings.spec.ts` and update `ARTICLE_ID` and `BLOG_ID` with valid IDs from your local database.
2. **Authentication**: The script assumes you are logged in. You can either:

   - Run the app locally and log in manually in the browser before running the test (if using `npx playwright test --ui`).
   - Or uncomment the login steps in the `beforeEach` block and provide valid credentials.

3. **Run Test**:
   ```bash
   npx playwright test tests/e2e/article-publication-settings.spec.ts --ui
   ```

This will launch the Playwright UI runner, allowing you to watch the test execute and debug any steps.
