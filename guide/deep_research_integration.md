# Deep Research API Integration Guide

This guide details how to integrate the new "Deep Research" capabilities into the Outline Generation flow.

## Overview

The `Deep Research` mode enhances the standard outline generation by performing live scraping of top competitor articles. It provides two key outputs:

1.  **Research Brief**: A high-level summary of market gaps, stats, and sources.
2.  **Citations**: Specific source links attached to outline sections.

## Endpoint

**POST** `/api/v1/blogs/:blog_id/outline_generations`

### Request Payload

Add the `deep_research` boolean flag.

```json
{
  "topic": "Generative Engine Optimization",
  "target_audience": "SEO Professionals",
  "tone": "Authoritative",
  "deep_research": true // <--- NEW PARAMETER
}
```

> **Note**: Deep Research takes longer (~15-30 seconds) than standard generation due to scraping. Ensure your frontend timeout handling accounts for this.

## Response Structure

The response `data` object now contains a `research_brief` field and `citations` within sections.

```json
{
  "data": {
    "title": "The Ultimate Guide to GEO",
    "introduction": "...",

    // --- 1. NEW: Research Brief ---
    "research_brief": {
      "market_gaps": [
        "Competitors fail to mention the impact of voice search on GEO."
      ],
      "key_statistics": [
        "GEO is projected to impact 40% of search traffic by 2026."
      ],
      "common_questions": ["How is GEO different from SEO?"],
      "sources": [
        {
          "title": "Search Engine Land: The Future of SEO",
          "url": "https://searchengineland.com/geo-guide",
          "key_takeaway": "Focuses on technical implementation."
        }
      ]
    },

    "sections": [
      {
        "heading": "What is Generative Engine Optimization?",
        "key_points": [
          "Optimization for AI answers rather than blue links.",
          "Focus on entity density and direct answers."
        ],
        // --- 2. NEW: Citations per Section ---
        "citations": [
          {
            "title": "Search Engine Land: The Future of SEO",
            "url": "https://searchengineland.com/geo-guide"
          }
        ]
      }
    ]
  }
}
```

## TypeScript Interfaces

```typescript
export interface OutlineRequest {
  topic: string;
  tone?: string;
  target_audience?: string;
  deep_research?: boolean; // New
}

export interface OutlineResponse {
  data: OutlineData;
}

export interface OutlineData {
  title: string;
  introduction: string;
  sections: OutlineSection[];
  research_brief?: ResearchBrief; // New
}

export interface OutlineSection {
  heading: string;
  key_points: string[];
  citations?: Citation[]; // New
}

export interface Citation {
  title: string;
  url: string;
}

export interface ResearchBrief {
  market_gaps: string[];
  key_statistics: string[];
  common_questions: string[];
  sources: ResearchSource[];
}

export interface ResearchSource {
  title: string;
  url: string;
  key_takeaway: string;
}
```

## UI Implementation Guidelines

### 1. Toggle Switch

Add a "Deep Research Mode" toggle (default: off) in the Outline Generator form. Warn the user it may take longer.

### 2. Research Sidebar (Split Screen)

When `research_brief` is present, render a sidebar on the right side of the outline:

- **"Market Gaps" Card**: Highlight what competitors missed.
- **"Key Stats" Card**: Quick copy-paste stats for the writer.
- **"Competitors" List**: Links to the analyzed articles.

### 3. Inline Citations

In the Outline view, if a section has `citations`:

- Render a small "Book" or "Link" icon next to the heading.
- On hover/click, show a tooltip with the source link: _"Source: Search Engine Land"_.
