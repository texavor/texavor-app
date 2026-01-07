# API Guide: LLM Brand Mention Tracker

**Feature:** Competitor "Share of Voice" in AI
**Goal:** Track if top LLMs (ChatGPT) consider a competitor an "Authority" in their niche.

## 1. Endpoint Overview

**URL:** `POST /api/v1/blogs/:blog_id/competitors/:id/analyze`
**Auth:** Bearer Token (Authenticated User)

This endpoint triggers a full analysis job. When complete, the metric appears in the `latest_analysis` object.

---

## 2. Response Structure (Reading the Metric)

After analysis, fetch the competitor details:

**URL:** `GET /api/v1/blogs/:blog_id/competitors/:id`

**Response JSON:**

```json
{
  "competitor": {
    "id": 123,
    "name": "HubSpot",
    "latest_analysis": {
      "llm_share_of_voice": 80, // <--- The New Metric (0-100)
      "content_quality_score": 92,
      "seo_score": 88
    },
    "analysis_status": "completed"
  }
}
```

## 3. Historical Data (For Graphing)

To plot "AI Authority Over Time", fetch the analysis history.

**URL:** `GET /api/v1/blogs/:blog_id/competitors/:id/analyses`

**Response:**

```json
{
  "analyses": [
    {
      "created_at": "2026-01-07T12:00:00Z",
      "llm_share_of_voice": 80,
      "seo_score": 88
    },
    {
      "created_at": "2026-01-01T12:00:00Z",
      "llm_share_of_voice": 75,
      "seo_score": 85
    }
  ]
}
```

## 4. Metric Explanation (0-100)

Accurately label this metric in the UI as **"AI Brand Authority"**.

| Score      | Meaning                | Tooltip Text                                                  |
| :--------- | :--------------------- | :------------------------------------------------------------ |
| **80-100** | **Dominant Authority** | "Consistently cited by AI as a top 3 expert in this niche."   |
| **60-79**  | **Rising Star**        | "Mentioned by AI, but not yet a primary source."              |
| **20-59**  | **Unknown to AI**      | "The AI model does not recognize this brand as an authority." |
| **0**      | **No Data**            | "Analysis pending or failed."                                 |

## 4. Frontend Tips

- **Visual:** Use a **Radial Gauge** or **Progress Circle** for this score.
- **Color Coding:**
  - 80+ (Green)
  - 50-79 (Yellow/Orange)
  - <50 (Gray)
