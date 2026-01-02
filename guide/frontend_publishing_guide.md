# Frontend Guide: Article Publishing Workflow

This guide details the recommended workflow for publishing articles. The process consists of **two distinct steps**:

1.  **Save/Update**: Persist changes to the database (title, content, settings, status).
2.  **Publish**: Trigger the actual distribution to external platforms (Dev.to, Medium, etc.).

---

## Workflow Overview

When a user clicks "Publish" or "Schedule", you should perform two API calls in sequence:

1.  **PUT/PATCH** `/api/v1/blogs/:blog_id/articles/:id`

    - Saves the latest content.
    - Updates `published_at` or `scheduled_at` timestamps.
    - Refreshes integration settings.
    - **Note**: This _only_ updates the local database record. It does not send data to external platforms.

2.  **POST** `/api/v1/blogs/:blog_id/articles/:id/publish`
    - **Only call this for "Publish Now"**.
    - Triggers the background jobs to push content to selected integrations.
    - For "Scheduled" articles, the backend handles this automatically at the scheduled time; you do _not_ need to call this endpoint.

---

## Step 1: Save/Update Article

**Endpoint**: `PATCH /api/v1/blogs/:blog_id/articles/:article_id`

### Scenario A: "Publish Now" (Immediate)

To indicate an article is effectively "published" locally:

```json
{
  "article": {
    "title": "My New Post",
    "content": "...",
    "scheduled_at": null, // MUST be explicitly null to clear any schedule
    "published_at": "2024-01-02T10:00:00.000Z", // Set to CURRENT time
    "status": "published", // Optional, backend infers this from published_at
    "article_publications_attributes": [
      { "integration_id": "uuid-1" },
      { "integration_id": "uuid-2" }
    ]
  }
}
```

### Scenario B: "Schedule for Later"

To queue the article for future publication:

```json
{
  "article": {
    "title": "Future Post",
    "content": "...",
    "published_at": null,
    "scheduled_at": "2024-01-05T15:00:00.000Z", // Future date (UTC)
    "status": "scheduled"
  }
}
```

### Notable Behavior

- **Deduplication**: You can safely send `article_publications_attributes` with `integration_id`s that are already linked. The backend will automatically detect this and **update** the existing link instead of returning a "has already been taken" error.

---

## Step 2: Trigger Publication (Publish Now Only)

**Endpoint**: `POST /api/v1/blogs/:blog_id/articles/:article_id/publish`

**When to call**: Immediately after the Step 1 request succeeds, IF the user selected "Publish Now".

**Payload** (Optional):
You can typically call this with an empty body, as the article is already saved. However, you can pass specific IDs if you only want to publish to a subset.

```json
{
  // Optional: Only publish to specific integrations
  "integration_ids": ["uuid-1", "uuid-2"]
}
```

**Response**:

```json
{
  "message": "Article publishing started",
  "publications": [
    { "platform": "devto", "status": "publishing" },
    { "platform": "medium", "status": "publishing" }
  ]
}
```
