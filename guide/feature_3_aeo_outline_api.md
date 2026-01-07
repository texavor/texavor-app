# API Guide: AEO-Optimized Outlines

**Feature:** Answer Engine Optimization (AEO)
**Goal:** Structure the blog outline to win "Featured Snippets" and "Voice Search" answers.

## 1. Endpoint Overview

**URL:** `POST /api/v1/blogs/:blog_id/outline_generation`
**Auth:** Bearer Token (Authenticated User)

### Parameters:

| Param              | Type      | Required | Description                        |
| :----------------- | :-------- | :------- | :--------------------------------- |
| `topic`            | `string`  | **Yes**  | The blog title or topic.           |
| `aeo_optimization` | `boolean` | **Yes**  | Set to `true` to enable AEO logic. |
| `tone`             | `string`  | No       | e.g., "Professional", "Casual".    |
| `target_audience`  | `string`  | No       | e.g., "Beginners", "CTOs".         |
| `blog_id`          | `integer` | **Yes**  | ID of the current blog context.    |

---

## 2. Frontend Changes Required

To support this feature, you just need to add a simple **Checkbox** or **Toggle** in the Outline Generation form.

### UI Recommendation

- **Label:** "Optimize for AI Search (AEO)"
- **Tooltip:** "Adds a 'Quick Answer' summary and an 'FAQ' section to target Featured Snippets and Google SGE."
- **Default State:** `false` (or `true` if you want to push this as a default).

### Example Payload

```javascript
const payload = {
  topic: "How to fix a leaky faucet",
  tone: "Helpful",
  aeo_optimization: true, // <--- The new flag
};

axios.post(`/api/v1/blogs/${blogId}/outline_generation`, payload);
```

---

## 3. Response Difference

When `aeo_optimization: true`, the generated outline will contain specific sections:

1.  **Direct Answer (Introduction):** "Summary answer in 40-60 words..."
2.  **Structured Content:** Headers will likely include "Step-by-Step" or "List of".
3.  **FAQ Section:** A dedicated H2 at the end with Q&A schema-ready content.

**Response JSON (Standard Structure):**

```json
{
  "status": 200,
  "data": {
    "title": "How to Fix a Leaky Faucet (Step-by-Step Guide)",
    "sections": [
      {
        "heading": "Quick Answer",
        "content_type": "paragraph",
        "description": "A direct 50-word answer for Featured Snippets..."
      },
      // ... standard sections ...
      {
        "heading": "Frequently Asked Questions",
        "description": "1. Why is my faucet dripping? 2. Do I need a plumber?"
      }
    ]
  }
}
```
