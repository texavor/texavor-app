# AEO & Search Intelligence API Guide

This guide documents the new data-driven analysis features introduced to `ArticleAnalysis`. We've moved beyond simple grammar checks to **Live Search Intelligence**.

## Endpoints

### 1. Get Article Analysis

**Endpoint**: `GET /api/v1/blogs/:blog_id/articles/:article_id/article_analyses`

**Description**: Retrieves the most recent AEO/SEO analysis for the article.

---

### 2. Trigger Analysis

**Endpoint**: `POST /api/v1/blogs/:blog_id/articles/:article_id/article_analyses`

**Description**: Runs a fresh analysis. **Warning**: This now involves live Google searches and LLM simulation, so it typically takes 5-10 seconds. Recommend showing a progress state.

---

## Response Structure

The `seo_details` column is now expanded into several high-value components:

```json
{
  "seo_score": 75,
  "stats": {
    "word_count": 1200,
    "reading_time": 6,
    "keyword_count": 15,
    "difficulty": 2,
    "headings_count": 5,
    "paragraphs_count": 12
  },
  "aeo": {
    "score": 85,
    "platform_scores": {
      "gemini": 90,
      "perplexity": 80,
      "chatgpt": 85
    },
    "issues": [
      {
        "type": "missing_answer_target",
        "message": "No direct definition found..."
      }
    ]
  },
  "simulation": {
    "snippet": "AI Simulation is a tool for...",
    "style": "Structured",
    "aeo_readiness": 85
  },
  "entity_gaps": {
    "score": 70,
    "missing": ["Entity A", "Entity B"],
    "message": "Consider mentioning: Entity A..."
  },
  "live_benchmark": [
    { "title": "Top Competitor 1", "url": "https://...", "type": "listicle" }
  ]
}
```

## Component Breakdown & UI Guidance

### 1. AI Search Simulation (`simulation`)

**Purpose**: Shows a preview of how an AI engine (like Gemini) would summarize the content.

- **`snippet`**: The actual generated summary.
- **`style`**: Either `Structured` or `Conversational`.
- **`aeo_readiness`**: A confidence score of how "digestible" the article is for AI.
- **UI Idea**: Use a "Google Search / Gemini Preview" card style.

### 2. Entity Gap Analysis (`entity_gaps`)

**Purpose**: Identifies missing concepts that are common in top-ranking articles.

- **`missing`**: Array of keywords/entities to add.
- **UI Idea**: Display as a "Checklist" or "Topic Tags" to add.

### 3. Answer Engine Optimization (`aeo`)

**Purpose**: Checks for structural signals like answer targets and lists.

- **`platform_scores`**: Heuristic scores for Gemini, Perplexity, and ChatGPT.
- **UI Idea**: A horizontal bar chart or Radar chart (matching the existing Radar UI).

### 4. Intent Alignment (`live_benchmark`)

**Purpose**: Shows which competitor articles are actually winning.

- **UI Idea**: A "Competitor Table" showing Title, URL, and Content Type (Guide vs Listicle).

---

## Frontend Integration Tips

### Handling "Placeholder" Grammar

We have removed `GrammarService`. The API still returns a `grammar` object for legacy compatibility, but `issues` will always be empty and `score` will be 100.
**Action**: You can safely hide the "Grammar" section in the UI or replace it with the new "AEO Simulation" section.

### Loading States

Because the analysis now performs **live network calls** to Google and Azure:

1. Show a meaningful loader (e.g., "Scanning Live Results...", "Simulating AI Response...").
2. The endpoint remains idempotent; calling POST while an analysis is already running in background (if implemented via Sidekiq) should be handled with status polling if necessary (currently it is a synchronous blocking call in this version).

---

**Status**: V1 implementation is live in production.
