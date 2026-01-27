# Smart Linking API Guide

This guide details how to use the Smart Linking API to suggest internal and external links for an article, and view existing links.

## Endpoint

**POST** `/api/v1/blogs/:blog_id/articles/:article_id/link_suggestions`

Authentication: Required (`Bearer <token>`)

## Request

### Parameters

| Parameter          | Type    | Required | Description                                                                                                          |
| :----------------- | :------ | :------- | :------------------------------------------------------------------------------------------------------------------- |
| `force_refresh`    | Boolean | No       | If `true`, ignores cache and re-runs the LLM analysis. Default: `false`.                                             |
| `include_external` | Boolean | No       | If `true`, includes external link suggestions (requires LLM search). Default: `false` (or based on backend default). |

### Response (200 OK)

```json
{
  "suggestions": {
    "internal": [
      {
        "id": "uuid-1",
        "anchor_text": "SEO basics",
        "url": "/seo-basics",
        "reason": "Direct match...",
        "is_applied": false
      }
    ],
    "external": [
      {
        "id": "uuid-2",
        "anchor_text": "Knowledge Graph",
        "url": "https://...",
        "reason": "Authoritative definition...",
        "is_applied": false
      }
    ]
  },
  "cached": false
}
```

## Update Link Status

**PATCH** `/api/v1/blogs/:blog_id/articles/:article_id/link_suggestions`

### Option 1: Toggle Single Link

```json
{
  "id": "uuid-1",
  "is_applied": true
}
```

### Option 2: Apply All (Bulk)

Marks ALL suggested links (internal and external) as applied.

```json
{
  "apply_all": true
}
```

### Response (200 OK)

Returns success and the updated full suggestions object.

```json
{
  "success": true,
  "suggestions": { ... }
}
```

## Frontend Implementation Guide

### UI Recommendation

1.  **"Smart Links" Feature:** Add a button in the Editor toolbar (e.g., near formatting options).
2.  **Sidebar/Panel:** When clicked, open a sidebar with two main tabs or sections:
    - **Suggestions:** The new opportunities found by AI.
    - **Link Inventory:** List of `existing` links currently in the article.

### Interaction Flow

1.  **Suggestions:**
    - Show "Anchor Text" and target URL.
    - **Action:** "Apply" button to automatically wrap the found text in the editor content with the link.
    - **Action:** "Dismiss" button to remove from view (local state).

2.  **Existing Links:**
    - List all links found in `existing` array.
    - Group by Internal vs External.
    - **Action:** Clicking an item could scroll the editor to that link's position (optional).
    - **Visual:** Show a warning icon if an external link looks broken or low quality (future feature).

3.  **Loading:** Show a spinner while fetching (LLM can take 5-10s).
