# API Guide: Content Freshness Monitor (Feature 5)

**Concept:** Neil Patel 2026 Strategy emphasizes that LLMs ignore "stale" content. This feature allows you to check the "Decay Risk" of an article and flags it if it needs a refresh.

## 1. Key Workflow: "Check Once, Persist Forever"

You **do not** need to call a separate API every time you load the article.

1.  **Trigger:** User clicks "Check Freshness" (or a background job runs).
2.  **Persist:** The system calculates the score using `ContentFreshnessService` and **saves it to the article record**.
3.  **Display:** Future calls to `GET /articles/:id` automatically include the score.

---

## 2. Endpoints

### A. Trigger Analysis (Manual Check)

**`POST /api/v1/blogs/:blog_id/articles/:id/check_freshness`**

- **When to call:** When the user clicks a "Check Freshness" button on the UI.
- **Response:** Returns the calculated score and updates the database.

```json
{
  "article_id": "uuid...",
  "freshness_score": 45, // 0-100 (Where 100 is Brand New)
  "decay_risk": 9, // 0-10 (High # means Critical Topic like AI News)
  "needs_update": true, // ACTION REQUIRED: Show Red Badge
  "last_updated": "2024-01-01T12:00:00Z"
}
```

### B. Displaying Results (Standard Fetch)

**`GET /api/v1/blogs/:blog_id/articles/:id`**

The standard article object now includes these fields automatically:

```ts
interface Article {
  id: string;
  title: string;
  // ... other fields
  freshness_score: number | null; // Null if never checked
  decay_risk: number | null;
  needs_freshness_update: boolean | null;
}
```

---

## 3. Frontend Implementation Guidelines

### A. The "Freshness Badge"

Display this on the Article Details header.

- **If `needs_freshness_update: true`**:

  - **Color:** Red / Warning
  - **Icon:** ⚠️ (Alert)
  - **Text:** "Stale Content (Risk Level: High)"
  - **Action:** "Refresh Now" (Links to Outline Generator)

- **If `freshness_score > 80`**:
  - **Color:** Green
  - **Icon:** ✅
  - **Text:** "LLM Optimized (Fresh)"

### B. The "Check" Logic

If `freshness_score` is `null` (never checked), show a **"Analyze Freshness"** button instead of a score.

- **On Click:** Call `POST /check_freshness`.
- **On Success:** Update the local article state with the new values.
