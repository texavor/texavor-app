# API Updates for AEO (Answer Engine Optimization) Integration

This guide outlines the changes made to the backend API to support the new "AI Visibility" features. Frontend components should be updated to visualize these new metrics.

## 1. Article Analysis (`/article_analyses`)

The `insight_data` object in the response now includes a detailed `platform_scores` breakdown.

### Response Structure Update

```jsonc
{
  "insight_data": {
    "score": 85,
    // [NEW] Platform-Specific AEO Scores
    "platform_scores": {
      "gemini": 80, // Optimized for Depth/Code
      "perplexity": 90, // Optimized for Lists/Citations
      "chatgpt": 85, // Optimized for Balance/Structure
    },
    "issues": [
      // [NEW] Potential new issue types
      { "type": "answer_target_too_long", "message": "..." },
      { "type": "opportunity_table", "message": "..." },
    ],
  },
}
```

### Action Items for Frontend

- **Radar Chart**: Use `platform_scores` to render a 3-axis radar chart (Gemini vs Perplexity vs ChatGPT) instead of a single generic score.
- **Issue rendering**: Ensure the issue list renderer handles the new `type` strings gracefully (it should already work if just rendering `message`).

---

## 2. Keyword Research (`/keyword_research`)

The keyword objects (in both `seed` and `related` arrays) now expose an `ai_visibility_score`.

### Response Structure Update

```jsonc
{
  "seed": {
    "term": "react native",
    "search_volume": 50000,
    // [NEW] The primary AEO metric (0-10 scale)
    "ai_visibility_score": 8.5,
    // [DEPRECATED-ish] 'geo_score' is now an alias for 'ai_visibility_score'
    "geo_score": 8.5,
  },
}
```

### Action Items for Frontend

- **Metric Label**: Rename "GEO Score" to **"AI Visibility"** in the UI.
- **Data Source**: Prefer `ai_visibility_score` over `geo_score` if available, though they are currently identical.

---

## 3. Keyword Discovery (`/keyword_discoveries`)

Keywords found via competitor extraction or semantic discovery now include the AEO metric.

### Response Structure Update

```jsonc
{
  "keywords": [
    {
      "keyword": "best react templates",
      "opportunity_score": 75,
      // [NEW]
      "ai_visibility_score": 9.2,
      "ai_authority_score": 80, // Internal raw metric (0-100)
    },
  ],
}
```

### Action Items for Frontend

- **Columns**: Add a column for **"AI Visibility"** (`ai_visibility_score`) to the discovery results table.
- **Sorting**: Allow sorting by `ai_visibility_score` to find "Hidden Gems" (Low Volume, High AI Visibility).

---

## 4. Competitor Analysis (Internal)

When analyzing competitor sites, we now score _their_ content. This data flows into the `Competitor` models but isn't explicitly exposed on a dedicated endpoint yet, other than through potential future "Competitor Insights" dashboards.

### Data Availability

- `Competitor` extracted articles now contain `ai_visibility_score` in their metadata blob.
