# Competitor Tracking & Analysis API Documentation

## Overview

The Competitor API allows you to track and analyze competitor content strategies, SEO metrics, and publishing patterns. This feature helps identify content gaps, keyword opportunities, and competitive insights.

**Base URL:** `/api/v1/blogs/:blog_id/competitors`

**Authentication:** All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Subscription Limits

Competitor tracking is limited based on subscription tier:

| Tier                | Competitor Limit |
| ------------------- | ---------------- |
| Trial/Starter       | 5                |
| Professional        | 15               |
| Business/Enterprise | Unlimited        |

Use the **Usage API** (`GET /api/v1/usage`) to check current competitor usage.

---

## Endpoints

### 1. List Competitors

Get all competitors for a blog.

**Endpoint:** `GET /api/v1/blogs/:blog_id/competitors`

**Request:**

```bash
curl -X GET "https://api.example.com/api/v1/blogs/abc-123/competitors" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** `200 OK`

```json
{
  "competitors": [
    {
      "id": "comp-uuid-123",
      "name": "Tech Blog Competitor",
      "website_url": "https://competitor.com",
      "domain": "competitor.com",
      "rss_feed_url": "https://competitor.com/feed",
      "description": "Main competitor in tech space",
      "active": true,
      "last_analyzed_at": "2025-12-01T08:30:00Z",
      "articles_tracked": 45,
      "needs_analysis": false,
      "latest_analysis": {
        "content": { "new_articles_count": 3, "publishing_frequency": {...} },
        "seo": { "domain_authority": 65 },
        "topics": { "topics": [...] },
        "keywords": { "keywords": [...] }
      },
      "created_at": "2025-11-15T10:00:00Z",
      "updated_at": "2025-12-01T08:30:00Z"
    }
  ],
  "total": 3,
  "limit": 5,
  "remaining": 2
}
```

---

### 2. Get Competitor Details

Get detailed information about a specific competitor.

**Endpoint:** `GET /api/v1/blogs/:blog_id/competitors/:id`

**Request:**

```bash
curl -X GET "https://api.example.com/api/v1/blogs/abc-123/competitors/comp-uuid-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** `200 OK`

```json
{
  "competitor": {
    "id": "comp-uuid-123",
    "name": "Tech Blog Competitor",
    "website_url": "https://competitor.com",
    "domain": "competitor.com",
    "rss_feed_url": "https://competitor.com/feed",
    "description": "Main competitor in tech space",
    "active": true,
    "last_analyzed_at": "2025-12-01T08:30:00Z",
    "articles_tracked": 45,
    "needs_analysis": false,
    "latest_analysis": {...},
    "created_at": "2025-11-15T10:00:00Z",
    "updated_at": "2025-12-01T08:30:00Z"
  },
  "analyses": [
    {
      "id": "analysis-uuid-1",
      "created_at": "2025-12-01T08:30:00Z",
      "new_articles_found": 3,
      "content_quality_score": 78.5,
      "seo_score": 65.0,
      "overall_score": 71.75
    }
  ]
}
```

---

### 3. Add New Competitor

Add a competitor to track.

**Endpoint:** `POST /api/v1/blogs/:blog_id/competitors`

**Request:**

```bash
curl -X POST "https://api.example.com/api/v1/blogs/abc-123/competitors" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "competitor": {
      "name": "Tech Blog Competitor",
      "website_url": "https://competitor.com",
      "rss_feed_url": "https://competitor.com/feed",
      "description": "Main competitor in tech space"
    }
  }'
```

**Request Body:**

```json
{
  "competitor": {
    "name": "string (required)",
    "website_url": "string (required, must be valid URL)",
    "rss_feed_url": "string (optional, must be valid URL)",
    "description": "string (optional)"
  }
}
```

**Response:** `201 Created`

```json
{
  "competitor": {
    "id": "comp-uuid-123",
    "name": "Tech Blog Competitor",
    "website_url": "https://competitor.com",
    "domain": "competitor.com",
    "rss_feed_url": "https://competitor.com/feed",
    "description": "Main competitor in tech space",
    "active": true,
    "last_analyzed_at": null,
    "articles_tracked": 0,
    "needs_analysis": true,
    "latest_analysis": {},
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-01T10:00:00Z"
  },
  "message": "Competitor added successfully. Initial analysis started."
}
```

**Error Response:** `403 Forbidden` (Limit reached)

```json
{
  "error": "Competitor limit reached",
  "limit": 5,
  "current_usage": 5,
  "upgrade_message": "You've used 5 of 5 competitors this month. Upgrade to get more!",
  "suggested_tier": "professional"
}
```

**Error Response:** `422 Unprocessable Entity` (Validation errors)

```json
{
  "errors": ["Website url must be a valid URL", "Name can't be blank"]
}
```

---

### 4. Update Competitor

Update competitor details.

**Endpoint:** `PATCH /api/v1/blogs/:blog_id/competitors/:id`

**Request:**

```bash
curl -X PATCH "https://api.example.com/api/v1/blogs/abc-123/competitors/comp-uuid-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "competitor": {
      "name": "Updated Competitor Name",
      "description": "Updated description",
      "rss_feed_url": "https://competitor.com/new-feed"
    }
  }'
```

**Request Body:**

```json
{
  "competitor": {
    "name": "string (optional)",
    "website_url": "string (optional)",
    "rss_feed_url": "string (optional)",
    "description": "string (optional)",
    "active": "boolean (optional)"
  }
}
```

**Response:** `200 OK`

```json
{
  "competitor": {...},
  "message": "Competitor updated successfully"
}
```

---

### 5. Delete Competitor

Deactivate a competitor (soft delete).

**Endpoint:** `DELETE /api/v1/blogs/:blog_id/competitors/:id`

**Request:**

```bash
curl -X DELETE "https://api.example.com/api/v1/blogs/abc-123/competitors/comp-uuid-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** `200 OK`

```json
{
  "message": "Competitor deactivated successfully"
}
```

---

### 6. Trigger Analysis

Manually trigger analysis for a competitor.

**Endpoint:** `POST /api/v1/blogs/:blog_id/competitors/:id/analyze`

**Request:**

```bash
curl -X POST "https://api.example.com/api/v1/blogs/abc-123/competitors/comp-uuid-123/analyze" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** `202 Accepted`

```json
{
  "message": "Analysis started. This may take a few moments.",
  "status": "pending"
}
```

**Error Response:** `429 Too Many Requests` (Recently analyzed)

```json
{
  "message": "Competitor was recently analyzed. Please wait before requesting a new analysis.",
  "last_analyzed_at": "2025-12-01T08:30:00Z",
  "next_analysis_available_at": "2025-12-08T08:30:00Z"
}
```

> **Note:** Analysis can only be triggered once every 7 days per competitor to prevent abuse.

---

### 7. List Competitor Analyses

Get historical analyses for a competitor.

**Endpoint:** `GET /api/v1/blogs/:blog_id/competitors/:competitor_id/analyses`

**Request:**

```bash
curl -X GET "https://api.example.com/api/v1/blogs/abc-123/competitors/comp-uuid-123/analyses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** `200 OK`

```json
{
  "analyses": [
    {
      "id": "analysis-uuid-1",
      "created_at": "2025-12-01T08:30:00Z",
      "new_articles_found": 3,
      "content_quality_score": 78.5,
      "seo_score": 65.0,
      "overall_score": 71.75,
      "has_new_content": true
    },
    {
      "id": "analysis-uuid-2",
      "created_at": "2025-11-24T08:30:00Z",
      "new_articles_found": 5,
      "content_quality_score": 75.0,
      "seo_score": 62.0,
      "overall_score": 68.5,
      "has_new_content": true
    }
  ],
  "competitor": {
    "id": "comp-uuid-123",
    "name": "Tech Blog Competitor"
  }
}
```

---

### 8. Get Analysis Details

Get detailed analysis results.

**Endpoint:** `GET /api/v1/blogs/:blog_id/competitors/:competitor_id/analyses/:id`

**Request:**

```bash
curl -X GET "https://api.example.com/api/v1/blogs/abc-123/competitors/comp-uuid-123/analyses/analysis-uuid-1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** `200 OK`

```json
{
  "analysis": {
    "id": "analysis-uuid-1",
    "competitor_id": "comp-uuid-123",
    "created_at": "2025-12-01T08:30:00Z",
    "content_analysis": {
      "status": "success",
      "source": "rss",
      "new_articles_count": 3,
      "recent_articles": [
        {
          "title": "Latest Tech Trends 2025",
          "url": "https://competitor.com/tech-trends-2025",
          "published_at": "2025-11-30T00:00:00Z",
          "summary": "An overview of emerging tech...",
          "categories": ["Technology", "Trends"]
        }
      ],
      "publishing_frequency": {
        "articles_per_month": 12.5,
        "frequency_rating": "high",
        "total_articles_analyzed": 10,
        "date_range": {
          "from": "2025-11-01",
          "to": "2025-12-01"
        }
      },
      "content_types": {
        "Technology": 5,
        "Business": 3,
        "Tutorials": 2
      },
      "average_length": {
        "average_summary_length": 350,
        "estimated_word_count": 70,
        "length_category": "medium"
      }
    },
    "seo_analysis": {
      "domain": "competitor.com",
      "domain_authority": 65,
      "backlinks": null,
      "organic_keywords": null,
      "traffic_estimate": null,
      "analyzed_at": "2025-12-01T08:30:00Z",
      "note": "Basic analysis. Integrate with SEO APIs for detailed metrics."
    },
    "topics_identified": {
      "topics": [
        { "name": "Technology", "count": 5 },
        { "name": "Business", "count": 3 },
        { "name": "AI", "count": 2 }
      ],
      "total_unique_topics": 3
    },
    "keywords_found": {
      "keywords": [
        { "word": "technology", "frequency": 15 },
        { "word": "business", "frequency": 10 },
        { "word": "innovation", "frequency": 8 }
      ],
      "total_keywords": 150
    },
    "new_articles_found": 3,
    "content_quality_score": 78.5,
    "seo_score": 65.0,
    "overall_score": 71.75,
    "summary": {
      "competitor_name": "Tech Blog Competitor",
      "analyzed_at": "2025-12-01T08:30:00Z",
      "new_articles": 3,
      "quality_score": 78.5,
      "seo_score": 65.0,
      "topics_count": 3,
      "keywords_count": 15
    }
  }
}
```

---

## Data Models

### Competitor Object

```typescript
interface Competitor {
  id: string;
  name: string;
  website_url: string;
  domain: string;
  rss_feed_url?: string;
  description?: string;
  active: boolean;
  last_analyzed_at?: string; // ISO 8601
  articles_tracked: number;
  needs_analysis: boolean;
  latest_analysis: LatestAnalysis;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

interface LatestAnalysis {
  content: ContentAnalysis;
  seo: SeoAnalysis;
  topics: TopicsAnalysis;
  keywords: KeywordsAnalysis;
}
```

### Analysis Object

```typescript
interface Analysis {
  id: string;
  competitor_id: string;
  created_at: string; // ISO 8601
  content_analysis: ContentAnalysis;
  seo_analysis: SeoAnalysis;
  topics_identified: TopicsAnalysis;
  keywords_found: KeywordsAnalysis;
  new_articles_found: number;
  content_quality_score?: number;
  seo_score?: number;
  overall_score?: number;
}

interface ContentAnalysis {
  status: "success" | "error" | "no_rss" | "rss_error";
  source?: "rss";
  new_articles_count: number;
  recent_articles?: Article[];
  publishing_frequency?: PublishingFrequency;
  content_types?: Record<string, number>;
  average_length?: ContentLength;
  message?: string;
}

interface Article {
  title: string;
  url: string;
  published_at: string;
  summary: string;
  categories: string[];
}

interface PublishingFrequency {
  articles_per_month: number;
  frequency_rating: "low" | "moderate" | "high" | "very_high";
  total_articles_analyzed: number;
  date_range: {
    from: string;
    to: string;
  };
}

interface SeoAnalysis {
  domain: string;
  domain_authority?: number;
  backlinks?: number;
  organic_keywords?: number;
  traffic_estimate?: number;
  analyzed_at: string;
  note?: string;
  error?: string;
}

interface TopicsAnalysis {
  topics: Array<{
    name: string;
    count: number;
  }>;
  total_unique_topics: number;
}

interface KeywordsAnalysis {
  keywords: Array<{
    word: string;
    frequency: number;
  }>;
  total_keywords: number;
}
```

---

## Usage Examples

### React/Next.js Example

```typescript
// api/competitors.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const competitorApi = {
  // List all competitors
  async list(blogId: string) {
    const response = await axios.get(
      `${API_BASE}/blogs/${blogId}/competitors`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  },

  // Add competitor
  async create(blogId: string, data: CompetitorCreateData) {
    const response = await axios.post(
      `${API_BASE}/blogs/${blogId}/competitors`,
      { competitor: data },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Trigger analysis
  async analyze(blogId: string, competitorId: string) {
    const response = await axios.post(
      `${API_BASE}/blogs/${blogId}/competitors/${competitorId}/analyze`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  },

  // Get analysis history
  async getAnalyses(blogId: string, competitorId: string) {
    const response = await axios.get(
      `${API_BASE}/blogs/${blogId}/competitors/${competitorId}/analyses`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  },
};
```

### Component Example

```tsx
// components/CompetitorList.tsx
import { useState, useEffect } from "react";
import { competitorApi } from "@/api/competitors";

export default function CompetitorList({ blogId }: { blogId: string }) {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitors();
  }, [blogId]);

  const loadCompetitors = async () => {
    try {
      const data = await competitorApi.list(blogId);
      setCompetitors(data.competitors);
    } catch (error) {
      console.error("Failed to load competitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (competitorId: string) => {
    try {
      await competitorApi.analyze(blogId, competitorId);
      alert("Analysis started!");
    } catch (error) {
      alert("Failed to start analysis");
    }
  };

  return (
    <div>
      {competitors.map((competitor) => (
        <div key={competitor.id}>
          <h3>{competitor.name}</h3>
          <p>{competitor.domain}</p>
          <button onClick={() => handleAnalyze(competitor.id)}>Analyze</button>
        </div>
      ))}
    </div>
  );
}
```

---

## Rate Limiting

Competitor API endpoints follow the standard rate limiting rules:

- **General API:** 100 requests/minute, 1000 requests/hour
- **Analysis endpoint:** Limited to once per 7 days per competitor

See [Rate Limiting Documentation](../rate_limiting.md) for details.

---

## Error Handling

### Standard Error Responses

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 400         | Bad Request - Invalid request format     |
| 401         | Unauthorized - Missing or invalid token  |
| 403         | Forbidden - Subscription limit reached   |
| 404         | Not Found - Blog or competitor not found |
| 422         | Unprocessable Entity - Validation errors |
| 429         | Too Many Requests - Rate limit exceeded  |
| 500         | Internal Server Error                    |

### Error Response Format

```json
{
  "error": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

---

## Best Practices

1. **Poll for Analysis Results:** After triggering analysis, poll the competitor details endpoint to check `last_analyzed_at` for updates.

2. **Handle Limits Gracefully:** Check `remaining` count before allowing users to add competitors.

3. **Cache Results:** Analysis data doesn't change frequently. Cache results for at least 1 hour.

4. **RSS Feed Discovery:** If RSS feed is unknown, suggest common paths (`/feed`, `/rss`, `/blog/feed`).

5. **Display Insights:** Use the `latest_analysis` data to show:

   - Content gaps
   - Keyword opportunities
   - Publishing frequency comparison

6. **Error States:** Handle `no_rss`, `rss_error` states gracefully with helpful messages.

---

## Roadmap

### Future Enhancements

- **Real-time Monitoring:** Webhook notifications for new competitor content
- **Advanced SEO Metrics:** Integration with Moz, Ahrefs, SEMrush APIs
- **Competitive Intelligence Dashboard:** Visualizations and trend analysis
- **Content Similarity Analysis:** Identify overlapping content
- **Automated Recommendations:** AI-powered content suggestions based on competitor analysis

---

## Support

For questions or issues, contact support or refer to:

- [Main API Documentation](./integrations.md)
- [Rate Limiting](../rate_limiting.md)
- [User Memory Profiles](./user_memory_profile_api.md)
