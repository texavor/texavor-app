# API Guide: AI Visibility Score Integration

**Feature:** AI Visibility Score (formerly GEO Score)
**Goal:** To display how well a keyword targets AI Search Engines (ChatGPT, Perplexity, Gemini).

## 1. Endpoint Overview

**URL:** `GET /api/v1/blogs/:blog_id/keyword_research/search`
**Auth:** Bearer Token (Authenticated User)

### Parameters:

| Param     | Type      | Required | Description                                                                          |
| :-------- | :-------- | :------- | :----------------------------------------------------------------------------------- |
| `query`   | `string`  | **Yes**  | The keyword to analyze (e.g., "marketing automation").                               |
| `mode`    | `string`  | No       | `detailed` (Full metrics) or `basic` (Autocomplete + AI Score). Defaults to `basic`. |
| `blog_id` | `integer` | **Yes**  | ID of the current blog context.                                                      |

> **Update:** As of the latest version, `ai_visibility_score` is available in **both** `basic` and `detailed` modes. In `basic` mode, it is a "Semantic-Only" score (ignoring competition data).

---

## 2. Response Structure (Detailed Mode)

When `mode=detailed`, the API returns `ai_visibility_score` for the seed keyword and all related suggestions.

**Request:**

```bash
GET /api/v1/blogs/1/keyword_research/search?query=how+to+bake+sourdough&mode=detailed
```

**Response:**

```json
{
  "seed": {
    "term": "how to bake sourdough",
    "search_volume": 12000,
    "difficulty": 45,
    "ai_visibility_score": 8, // 0-10 Scale
    "geo_score": 8, // Alias for backward compatibility
    "seo_score": 5
    // ...other metrics
  },
  "related": [
    {
      "term": "sourdough bread recipe for beginners",
      "search_volume": 3500,
      "ai_visibility_score": 9,
      "geo_score": 9
    }
    // ... more items
  ]
}
```

---

## 3. Frontend Implementation Guidelines

### A. Display the Score

The `ai_visibility_score` is a 0-10 integer.

- **High (8-10):** "AI Optimized" (Green icon)
- **Medium (5-7):** "AI Friendly" (Yellow icon)
- **Low (0-4):** "Traditional SEO" (Gray/Red icon)

### B. Tooltip Explanation

When hovering over the score, show:

> "This score measures how likely an LLM (like ChatGPT) is to use your content as a direct answer. High scores mean the topic is specific, question-based, and educational."

### C. Typescript Interface

```typescript
interface KeywordMetric {
  term: string;
  search_volume: number;
  difficulty: number;
  ai_visibility_score: number; // The new 2026 Metric
  geo_score: number; // Deprecated alias
}
```
