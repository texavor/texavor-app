# Premium Link Suggestions API Guide

Base URL: `/api/v1/blogs/:blog_id/articles/:article_id`

## Overview

The new Premium Link Suggestions feature uses semantic vector search to find highly relevant internal links.

- **Improved accuracy:** Uses embeddings to match meaning, not just keywords.
- **Clean output:** Returns exact-match anchor texts directly from the draft content.
- **Error handling:** Returns clear error codes ("SUGGESTION_NOT_FOUND") if content changes invalidate a suggestion.

---

## 1. Retrieve Current Suggestions

Get the cached status of link suggestions for an article.

- **Endpoint:** `GET /link_suggestions`
- **Response:**

```json
{
  "suggestions": {
    "internal": [
      {
        "id": "uuid-1234",
        "anchor_text": "search engine optimization",
        "url": "/blog/what-is-seo",
        "reason": "semantic connection explanation",
        "simulated_click_text": "What is SEO? A Complete Guide",
        "is_applied": false,
        "valid": true,
        "position": 1450,
        "exact_match": "search engine optimization",
        "match_type": "exact"
      }
    ],
    "external": []
  },
  "cached": true
}
```

**Notes:**

- If `cached: false` and lists are empty, the UI should prompt the user to "Generate Suggestions".

---

## 2. Generate New Suggestions

Trigger the AI analysis to find new linking opportunities. This uses the new Semantic Search engine.

- **Endpoint:** `POST /link_suggestions`
- **Body:**

```json
{
  "force_refresh": true, // Optional: Set true to ignore cache and regenerate
  "include_external": false // Optional: Set true to also get external citation suggestions
}
```

- **Response:** Same structure as `GET`, but freshly generated.
- **Errors:**
  - `422 Unprocessable Entity`: If generation fails (e.g. LLM error).
  - `404 Not Found`: If article/blog invalid.

---

## 3. Apply / Reject Suggestion (Toggle Status)

Updates the status of a specific suggestion.

- **Endpoint:** `PATCH /link_suggestions`
- **Body:**

```json
{
  "id": "uuid-1234", // The ID of the suggestion to update
  "is_applied": true // true = applied/accepted, false = ignored/rejected
}
```

- **Response (Success):**

```json
{
  "success": true,
  "suggestions": { ...updated_full_object... }
}
```

- **Response (Error - Stale Data):**
  If the suggestion ID is no longer valid (e.g. user regenerated list in another tab), you get this error. Frontend should trigger a re-fetch or show a message.

```json
{
  "error": "Suggestion not found",
  "code": "SUGGESTION_NOT_FOUND",
  "message": "This suggestion no longer exists. The list may have been regenerated."
}
```

---

## 4. Apply All Suggestions

Bulk apply all suggestions in one go.

- **Endpoint:** `PATCH /link_suggestions`
- **Body:**

```json
{
  "apply_all": true
}
```

- **Response:**

```json
{
  "success": true,
  "suggestions": { ...updated_full_object... },
  "message": "All suggestions marked as applied"
}
```
