# Dashboard V2 API Integration Guide

This guide outlines the new data structures available in the `GET /api/v1/blogs/:blog_id/dashboard` endpoint to support the "Actionable Dashboard" update.

## Overview

The dashboard response has been enhanced with three new sections designed to drive user action:

1.  **`decay_watch`**: Alerts for content freshness (SEO Decay).
2.  **`competitor_intel`**: Competitor "Share of Voice" insights.
3.  **`action_plan`**: A prioritized list of suggested tasks.

## Endpoint Response

**GET** `/api/v1/blogs/:id/dashboard`

```json
{
  "data": {
    "highlights": { ... }, // Existing stats
    "overview": { ... },   // Existing charts
    "analytics": { ... },  // Existing analytics

    // --- NEW SECTIONS ---
    "decay_watch": {
      "total_at_risk": 5,
      "articles": [
        {
          "id": "uuid",
          "title": "SEO Strategies 2024",
          "published_at": "2024-01-01T00:00:00Z",
          "age_months": 14,
          "freshness_score": 50,
          "action": "Refresh Content"
        }
      ]
    },
    "competitor_intel": {
      "overview": "Tracking 3 competitors",
      "top_llm_performers": [
        {
          "id": "uuid",
          "name": "Competitor A",
          "llm_share_of_voice": 85.0,
          "last_analyzed": "2026-01-16T12:00:00Z"
        }
      ]
    },
    "action_plan": [
      {
        "type": "refresh", // or 'write', 'setup'
        "priority": "high", // 'high', 'medium', 'low'
        "title": "Refresh 'SEO Strategies 2024'",
        "description": "This article is 14 months old. Update it to maintain rankings.",
        "link": "/article/uuid-of-article"
      }
    ]
  }
}
```

## TypeScript Interfaces

Use these interfaces to type the response in the frontend.

```typescript
export interface DashboardResponse {
  data: DashboardData;
}

export interface DashboardData {
  highlights: Highlights;
  overview: Overview;
  analytics: Analytics;
  decay_watch: DecayWatch;
  competitor_intel: CompetitorIntel;
  action_plan: ActionItem[];
}

// ... existing interfaces ...

// --- NEW INTERFACES ---

export interface DecayWatch {
  total_at_risk: number;
  articles: DecayArticle[];
}

export interface DecayArticle {
  id: string;
  title: string;
  published_at: string;
  age_months: number;
  freshness_score: number;
  action: string;
}

export interface CompetitorIntel {
  overview: string;
  top_llm_performers: CompetitorPerformer[];
}

export interface CompetitorPerformer {
  id: string;
  name: string;
  llm_share_of_voice: number;
  last_analyzed: string;
}

export interface ActionItem {
  type: "refresh" | "write" | "setup";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  link: string;
}
```

## UI Implementation Guidelines

### 1. Action Plan Widget

- **Display**: Top of the dashboard or a prominent sidebar.
- **Visuals**: Use cards with color-coded borders/icons based on `priority` (High = Red/Orange, Medium = Blue).
- **Interaction**: Clicking the card should navigate to the `link`.

### 2. Decay Watch Alert

- **Condition**: Only show if `decay_watch.total_at_risk > 0`.
- **Display**: An alert banner or a "Needs Attention" list.
- **Content**: "You have X articles at risk of content decay."

### 3. Competitor Intel Card

- **Display**: A list or bar chart showing top competitors.
- **Key Metric**: `llm_share_of_voice` (%).
- **Context**: "These competitors are dominating AI search results."
