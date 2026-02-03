# AEO (Answer Engine Optimization) API Guide

## Overview

The AEO API allows you to track and optimize your brand's visibility across AI platforms (ChatGPT, Claude, Gemini, Perplexity, etc.). Monitor how often your brand is mentioned in AI responses, track competitive rankings, and measure your overall AI visibility score.

**Base URL:** `/api/v1/blogs/:blog_id/aeo`

**Authentication:** Required (Bearer token)

---

## Key Features

- ✅ **Visibility Score Tracking** - Monitor your brand's AI visibility (0-100 scale)
- ✅ **Multi-Platform Coverage** - Track across the Big 5 AI platforms (ChatGPT, Claude, Gemini, Perplexity, Grok)
- ✅ **Competitive Analysis** - Compare your brand against competitors
- ✅ **Prompt Management** - Create and manage custom tracking prompts
- ✅ **Automated Collection** - Daily background jobs collect fresh data
- ✅ **Historical Trends** - View 30-day visibility trends

---

## Endpoints

### 1. Get AEO Metrics Overview

**GET** `/api/v1/blogs/:blog_id/aeo`

Returns comprehensive AEO metrics including current visibility score, historical data, and platform breakdowns.

#### Response

```json
{
  "current_score": {
    "date": "2026-01-30",
    "overall_score": 72.5,
    "interpretation": "Good",
    "color": "blue",
    "presence_rate": 68.0,
    "cross_model_consistency": 85.7,
    "total_mentions": 17,
    "total_prompts_tested": 5,
    "platforms_count": 5,
    "trend": {
      "direction": "up",
      "change": 5.2
    },
    "best_platform": "chatgpt",
    "worst_platform": "deepseek"
  },
  "historical_scores": [
    {
      "date": "2026-01-30",
      "overall_score": 72.5,
      "presence_rate": 68.0,
      "total_mentions": 17
    },
    {
      "date": "2026-01-29",
      "overall_score": 67.3,
      "presence_rate": 64.0,
      "total_mentions": 16
    }
  ],
  "platform_breakdown": {
    "chatgpt": {
      "score": 80.0,
      "mentions": 4,
      "total": 5,
      "mention_rate": "4/5",
      "avg_position": 1.5
    },
    "claude": {
      "score": 75.0,
      "mentions": 3,
      "total": 4,
      "mention_rate": "3/4",
      "avg_position": 2.0
    }
  },
  "category_breakdown": {
    "software_selection": {
      "score": 85.0,
      "mentions": 12,
      "total": 14,
      "prompts_count": 3
    },
    "brand_awareness": {
      "score": 60.0,
      "mentions": 5,
      "total": 8,
      "prompts_count": 2
    }
  },
  "summary": {
    "total_prompts": 5,
    "total_responses": 25,
    "platforms_tracked": 5
  }
}
```

#### Response Fields

| Field                     | Type   | Description                                                           |
| ------------------------- | ------ | --------------------------------------------------------------------- |
| `current_score`           | object | Latest visibility score with full metrics                             |
| `overall_score`           | number | Overall visibility score (0-100)                                      |
| `interpretation`          | string | Score interpretation: `Excellent`, `Good`, `Fair`, `Poor`, `Critical` |
| `presence_rate`           | number | Percentage of responses mentioning your brand                         |
| `cross_model_consistency` | number | Percentage of platforms mentioning your brand                         |
| `trend.direction`         | string | Trend direction: `up`, `down`, `neutral`                              |
| `platform_breakdown`      | object | Per-platform performance metrics                                      |
| `category_breakdown`      | object | Per-category performance metrics                                      |

---

### 2. List All Prompts

**GET** `/api/v1/blogs/:blog_id/aeo/prompts`

Returns all active AEO tracking prompts with their visibility metrics.

#### Response

```json
{
  "prompts": [
    {
      "id": "uuid-here",
      "prompt_text": "What are the best content marketing platforms for SEO?",
      "category": "software_selection",
      "priority": 1,
      "active": true,
      "visibility_score": 85.7,
      "brand_mentioned_today": true,
      "response_count_today": 7,
      "created_at": "2026-01-25T10:00:00Z",
      "updated_at": "2026-01-30T02:00:00Z"
    }
  ],
  "total": 5
}
```

#### Prompt Categories

- `product_discovery` - Product/service discovery queries
- `software_selection` - Software comparison queries
- `brand_awareness` - Brand recognition queries
- `local_services` - Local business queries
- `general` - General queries

---

### 3. Create Prompt

**POST** `/api/v1/blogs/:blog_id/aeo/prompts`

Creates a new AEO tracking prompt.

#### Request Body

```json
{
  "prompt": {
    "prompt_text": "Which platforms are best for AI-powered content creation?",
    "category": "software_selection",
    "priority": 1,
    "active": true
  }
}
```

#### Request Fields

| Field         | Type    | Required | Description                          |
| ------------- | ------- | -------- | ------------------------------------ |
| `prompt_text` | string  | ✅ Yes   | The prompt to track (10-500 chars)   |
| `category`    | string  | No       | Prompt category (default: `general`) |
| `priority`    | number  | No       | Priority level (default: `0`)        |
| `active`      | boolean | No       | Active status (default: `true`)      |

#### Success Response (201)

```json
{
  "prompt": {
    "id": "uuid-here",
    "prompt_text": "Which platforms are best for AI-powered content creation?",
    "category": "software_selection",
    "priority": 1,
    "active": true,
    "visibility_score": 0,
    "brand_mentioned_today": false,
    "response_count_today": 0,
    "created_at": "2026-01-30T14:00:00Z",
    "updated_at": "2026-01-30T14:00:00Z"
  },
  "message": "Prompt created successfully"
}
```

---

### 4. Update Prompt

**PUT** `/api/v1/blogs/:blog_id/aeo/prompts/:id`

Updates an existing prompt.

#### Request Body

```json
{
  "prompt": {
    "priority": 5,
    "active": false
  }
}
```

#### Success Response (200)

```json
{
  "prompt": {
    "id": "uuid-here",
    "prompt_text": "Which platforms are best for AI-powered content creation?",
    "category": "software_selection",
    "priority": 5,
    "active": false,
    "created_at": "2026-01-30T14:00:00Z",
    "updated_at": "2026-01-30T15:00:00Z"
  },
  "message": "Prompt updated successfully"
}
```

---

### 5. Delete Prompt

**DELETE** `/api/v1/blogs/:blog_id/aeo/prompts/:id`

Deletes a prompt and all associated responses.

#### Success Response (200)

```json
{
  "message": "Prompt deleted successfully"
}
```

---

### 6. Get Competitive Rankings

**GET** `/api/v1/blogs/:blog_id/aeo/competitive`

Returns competitive ranking analysis comparing your brand against competitors.

#### Response

```json
{
  "rankings": [
    {
      "competitor_id": "uuid-here",
      "competitor_name": "HubSpot",
      "average_position": 2.3,
      "share_of_voice": 45.5,
      "platforms": {
        "chatgpt": {
          "brand_position": 1,
          "competitor_position": 3,
          "brand_ahead": true
        },
        "claude": {
          "brand_position": 2,
          "competitor_position": 1,
          "brand_ahead": false
        }
      }
    }
  ],
  "summary": {
    "brand_average_position": 1.8,
    "total_competitors": 3,
    "total_rankings": 21
  }
}
```

---

### 7. Trigger Manual Data Refresh

**POST** `/api/v1/blogs/:blog_id/aeo/refresh`

Triggers immediate data collection for all active prompts. This enqueues a background job that typically completes in 2-5 minutes.

#### Success Response (202)

```json
{
  "message": "Data collection started. This may take a few minutes.",
  "status": "processing"
}
```

> **Note:** Data is automatically collected daily at 2 AM UTC. Use this endpoint sparingly for immediate updates.

---

### 8. Get Prompt Responses

**GET** `/api/v1/blogs/:blog_id/aeo/responses/:prompt_id`

Returns detailed AI platform responses for a specific prompt.

#### Response

```json
{
  "prompt": {
    "id": "uuid-here",
    "prompt_text": "What are the best content marketing platforms?",
    "visibility_score": 85.7
  },
  "responses": [
    {
      "id": "uuid-here",
      "ai_platform": "chatgpt",
      "brand_mentioned": true,
      "mention_position": 1,
      "mention_context": "...platforms: YourBrand is an excellent choice for...",
      "competitors_mentioned": ["HubSpot", "ContentStack"],
      "location": "US",
      "response_date": "2026-01-30",
      "response_preview": "Based on your requirements, YourBrand is an excellent choice for content marketing..."
    }
  ],
  "total": 7
}
```

---

## Frontend Integration

### TypeScript Types

```typescript
interface AeoVisibilityScore {
  date: string;
  overall_score: number;
  interpretation:
    | "Excellent"
    | "Good"
    | "Fair"
    | "Poor"
    | "Critical"
    | "No data";
  color: "green" | "blue" | "yellow" | "orange" | "red" | "gray";
  presence_rate: number;
  cross_model_consistency: number;
  total_mentions: number;
  total_prompts_tested: number;
  platforms_count: number;
  trend: {
    direction: "up" | "down" | "neutral";
    change: number;
  };
  best_platform?: string;
  worst_platform?: string;
}

interface PlatformBreakdown {
  [platform: string]: {
    score: number;
    mentions: number;
    total: number;
    mention_rate: string;
    avg_position?: number;
  };
}

interface AeoPrompt {
  id: string;
  prompt_text: string;
  category:
    | "product_discovery"
    | "software_selection"
    | "brand_awareness"
    | "local_services"
    | "general";
  priority: number;
  active: boolean;
  visibility_score: number;
  brand_mentioned_today: boolean;
  response_count_today: number;
  created_at: string;
  updated_at: string;
}

interface AeoMetricsOverview {
  current_score: AeoVisibilityScore | null;
  historical_scores: AeoVisibilityScore[];
  platform_breakdown: PlatformBreakdown;
  category_breakdown: Record<string, any>;
  summary: {
    total_prompts: number;
    total_responses: number;
    platforms_tracked: number;
  };
}

interface CompetitiveRanking {
  competitor_id: string;
  competitor_name: string;
  average_position: number | null;
  share_of_voice: number;
  platforms: Record<
    string,
    {
      brand_position: number | null;
      competitor_position: number | null;
      brand_ahead: boolean | null;
    }
  >;
}

interface AeoResponse {
  id: string;
  ai_platform: string;
  brand_mentioned: boolean;
  mention_position: number | null;
  mention_context: string | null;
  competitors_mentioned: string[];
  location: string;
  response_date: string;
  response_preview: string;
}
```

### Fetch AEO Metrics

```typescript
async function fetchAeoMetrics(
  blogId: string,
  token: string,
): Promise<AeoMetricsOverview> {
  const response = await fetch(`/api/v1/blogs/${blogId}/aeo`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch AEO metrics");
  }

  return response.json();
}
```

### Create Prompt

```typescript
async function createAeoPrompt(
  blogId: string,
  promptData: {
    prompt_text: string;
    category?: string;
    priority?: number;
    active?: boolean;
  },
  token: string,
): Promise<{ prompt: AeoPrompt; message: string }> {
  const response = await fetch(`/api/v1/blogs/${blogId}/aeo/prompts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: promptData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0] || "Failed to create prompt");
  }

  return response.json();
}
```

### Trigger Data Refresh

```typescript
async function refreshAeoData(
  blogId: string,
  token: string,
): Promise<{ message: string; status: string }> {
  const response = await fetch(`/api/v1/blogs/${blogId}/aeo/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to trigger data refresh");
  }

  return response.json();
}
```

### Fetch Competitive Rankings

```typescript
async function fetchCompetitiveRankings(
  blogId: string,
  token: string,
): Promise<{
  rankings: CompetitiveRanking[];
  summary: any;
}> {
  const response = await fetch(`/api/v1/blogs/${blogId}/aeo/competitive`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch competitive rankings");
  }

  return response.json();
}
```

---

## React Component Examples

### AEO Dashboard Overview

```tsx
import { useState, useEffect } from "react";

function AeoDashboard({ blogId, token }: { blogId: string; token: string }) {
  const [metrics, setMetrics] = useState<AeoMetricsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAeoMetrics(blogId, token)
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, [blogId, token]);

  if (loading) return <div>Loading AEO metrics...</div>;
  if (!metrics?.current_score) return <div>No AEO data available</div>;

  const { current_score } = metrics;

  return (
    <div className="aeo-dashboard">
      <div className="visibility-score-card">
        <h2>AI Visibility Score</h2>
        <div className={`score score-${current_score.color}`}>
          {current_score.overall_score.toFixed(1)}
        </div>
        <p className="interpretation">{current_score.interpretation}</p>

        {current_score.trend.direction !== "neutral" && (
          <div className={`trend trend-${current_score.trend.direction}`}>
            {current_score.trend.direction === "up" ? "↑" : "↓"}
            {Math.abs(current_score.trend.change).toFixed(1)} points
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <label>Presence Rate</label>
          <span>{current_score.presence_rate.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <label>Brand Mentions</label>
          <span>{current_score.total_mentions}</span>
        </div>
        <div className="metric">
          <label>Platforms</label>
          <span>
            {current_score.platforms_count}/{metrics.summary.platforms_tracked}
          </span>
        </div>
      </div>

      <div className="platform-breakdown">
        <h3>Platform Performance</h3>
        {Object.entries(metrics.platform_breakdown).map(([platform, data]) => (
          <div key={platform} className="platform-item">
            <span className="platform-name">{platform}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${data.score}%` }}
              />
            </div>
            <span className="platform-score">{data.score.toFixed(1)}%</span>
            <span className="mention-rate">({data.mention_rate})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Prompts Management

```tsx
function AeoPromptsManager({
  blogId,
  token,
}: {
  blogId: string;
  token: string;
}) {
  const [prompts, setPrompts] = useState<AeoPrompt[]>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [category, setCategory] = useState("software_selection");

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    const response = await fetch(`/api/v1/blogs/${blogId}/aeo/prompts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setPrompts(data.prompts);
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createAeoPrompt(
        blogId,
        { prompt_text: newPrompt, category },
        token,
      );

      setNewPrompt("");
      fetchPrompts(); // Refresh list
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="prompts-manager">
      <form onSubmit={handleCreatePrompt}>
        <textarea
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          placeholder="Enter a prompt to track (e.g., 'What are the best SEO tools?')"
          minLength={10}
          maxLength={500}
          required
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="software_selection">Software Selection</option>
          <option value="product_discovery">Product Discovery</option>
          <option value="brand_awareness">Brand Awareness</option>
          <option value="local_services">Local Services</option>
          <option value="general">General</option>
        </select>

        <button type="submit">Add Prompt</button>
      </form>

      <div className="prompts-list">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="prompt-card">
            <p className="prompt-text">{prompt.prompt_text}</p>
            <div className="prompt-meta">
              <span className="category-badge">{prompt.category}</span>
              <span className="visibility-score">
                {prompt.visibility_score.toFixed(1)}% visibility
              </span>
              {prompt.brand_mentioned_today && (
                <span className="mentioned-badge">✓ Mentioned today</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Real-time Data Refresh & Polling

Since AI data collection takes time (10-30 seconds per prompt), the frontend must use **polling** to check for updates after triggering a refresh.

#### Custom Hook: `useAeoPolling`

````typescript
import { useState, useRef, useCallback } from "react";

### Real-time Data Refresh & Polling

Since AI data collection takes time (10-30 seconds per prompt), the backend provides a dedicated job status tracking system.

**The Flow:**
1. Call `POST /refresh` -> receive a unique `job_id`.
2. Poll `GET /jobs/:job_id` every 3 seconds.
3. When `status === 'completed'`, stop polling and refresh the main data.

#### Custom Hook: `useAeoPolling`

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';

export function useAeoPolling(blogId: string, token: string, onUpdate: () => void) {
  const [isPolling, setIsPolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollTimeout = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(async () => {
    setIsPolling(true);
    setProgress(0);

    try {
      // 1. Trigger the background job
      const triggerRes = await fetch(`/api/v1/blogs/${blogId}/aeo/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!triggerRes.ok) throw new Error('Failed to start refresh');

      const { job_id } = await triggerRes.json();

      // 2. Start polling loop for specific job ID
      const checkStatus = async () => {
        try {
          const statusRes = await fetch(`/api/v1/blogs/${blogId}/aeo/jobs/${job_id}`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });

          if (statusRes.ok) {
            const job = await statusRes.json();

            // Update progress bar from backend
            setProgress(job.progress || 0);

            if (job.status === 'completed') {
               // Job done! Refresh main data
               onUpdate();
               setIsPolling(false);
               setProgress(100);
               return;
            }

            if (job.status === 'failed') {
               setIsPolling(false);
               alert(`Analysis failed: ${job.error}`);
               return;
            }
          }
        } catch (err) {
          console.error('Polling error', err);
        }

        // Poll every 3 seconds
        pollTimeout.current = setTimeout(checkStatus, 3000);
      };

      checkStatus();

    } catch (err) {
      console.error('Failed to trigger refresh:', err);
      setIsPolling(false);
      alert('Failed to start data collection');
    }
  }, [blogId, token, onUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, []);

  return { isPolling, startPolling, progress };
}
````

#### Updated Endpoints for Polling

**POST** `/api/v1/blogs/:blog_id/aeo/refresh`

Returns:

```json
{
  "message": "Data collection started",
  "job_id": "uuid-of-new-job",
  "status": "pending"
}
```

**GET** `/api/v1/blogs/:blog_id/aeo/jobs/:id`

Returns:

```json
{
  "id": "uuid-of-job",
  "status": "processing",
  "progress": 50,
  "error": null,
  "completed_at": null
}
```

#### Status Values

- `pending`: Job created, waiting for worker.
- `processing`: Analysis in progress (check `progress` field).
- `completed`: Analysis finished successfully.
- `failed`: Analysis failed (check `error` field).

#### Implementation Example: Refresh Button

```tsx
function RefreshAeoButton({
  blogId,
  token,
  onRefreshComplete,
}: {
  blogId: string;
  token: string;
  onRefreshComplete: () => void;
}) {
  const { isPolling, startPolling, progress } = useAeoPolling(
    blogId,
    token,
    onRefreshComplete,
  );

  return (
    <div className="refresh-container">
      <button
        onClick={startPolling}
        disabled={isPolling}
        className={isPolling ? "btn-loading" : "btn-primary"}
      >
        {isPolling ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Analyzing ({progress}%)...
          </span>
        ) : (
          "⚡ Analyze Live Data"
        )}
      </button>

      {isPolling && (
        <p className="text-xs text-muted mt-2">
          Querying ChatGPT, Claude, Gemini & Perplexity... This usually takes
          ~30 seconds.
        </p>
      )}
    </div>
  );
}
```

      {isPolling && (
        <p className="text-xs text-muted mt-2">
          Querying ChatGPT, Claude, Gemini & Perplexity... This usually takes
          ~30 seconds.
        </p>
      )}
    </div>

);
}

````

### Competitive Rankings Display

```tsx
function CompetitiveRankings({
  blogId,
  token,
}: {
  blogId: string;
  token: string;
}) {
  const [rankings, setRankings] = useState<CompetitiveRanking[]>([]);

  useEffect(() => {
    fetchCompetitiveRankings(blogId, token).then((data) =>
      setRankings(data.rankings),
    );
  }, [blogId, token]);

  return (
    <div className="competitive-rankings">
      <h3>Competitive Analysis</h3>

      {rankings.map((ranking) => (
        <div key={ranking.competitor_id} className="competitor-card">
          <h4>{ranking.competitor_name}</h4>

          <div className="metrics">
            <div className="metric">
              <label>Avg Position</label>
              <span>{ranking.average_position?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="metric">
              <label>Share of Voice</label>
              <span>{ranking.share_of_voice.toFixed(1)}%</span>
            </div>
          </div>

          <div className="platform-comparison">
            {Object.entries(ranking.platforms).map(([platform, data]) => (
              <div key={platform} className="platform-row">
                <span>{platform}</span>
                <span className={data.brand_ahead ? "winning" : "losing"}>
                  You: {data.brand_position || "N/A"} vs{" "}
                  {data.competitor_position || "N/A"}
                  {data.brand_ahead !== null &&
                    (data.brand_ahead ? " ✓" : " ✗")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
````

---

## Understanding the Visibility Score

The **Overall Visibility Score** is calculated using the formula:

```
Overall Score = (Presence Rate × 80%) + (Cross-Model Consistency × 20%)
```

### Components

- **Presence Rate**: Percentage of total responses that mention your brand
- **Cross-Model Consistency**: Percentage of AI platforms that mention your brand

### Score Interpretation

| Score Range | Interpretation | Color  | Meaning                                           |
| ----------- | -------------- | ------ | ------------------------------------------------- |
| 80-100      | Excellent      | Green  | Your brand is highly visible across AI platforms  |
| 60-79       | Good           | Blue   | Strong visibility with room for improvement       |
| 40-59       | Fair           | Yellow | Moderate visibility, optimization needed          |
| 20-39       | Poor           | Orange | Low visibility, immediate action required         |
| 0-19        | Critical       | Red    | Very low visibility, critical optimization needed |

---

## Best Practices

1. **Create Diverse Prompts** - Cover different use cases and query types
2. **Monitor Trends** - Check visibility scores weekly to spot trends
3. **Optimize for Top Platforms** - Focus on platforms where your audience is active
4. **Track Competitors** - Add competitors to understand your market position
5. **Refresh Strategically** - Use manual refresh sparingly (data updates daily automatically)
6. **Category Organization** - Use categories to segment prompt performance

---

## Data Collection Schedule

- **Automatic Collection**: Daily at 2:00 AM UTC
- **Manual Refresh**: Available via POST `/aeo/refresh` endpoint
- **Processing Time**: 2-5 minutes for complete data collection
- **Data Retention**: 30 days of historical scores

---

## Troubleshooting

### No Data Available

- Ensure you have created at least one active prompt
- Wait for the next daily collection (2 AM UTC) or trigger manual refresh
- Check that your blog has competitors added for competitive analysis

### Low Visibility Score

- Review your prompts - ensure they're relevant to your brand
- Check if competitors are mentioned more frequently
- Consider optimizing your content for AI platforms

### Refresh Not Working

- Verify you're not rate-limited (max 1 refresh per hour recommended)
- Check background job status in logs
- Ensure prompts are set to `active: true`

---

## Rate Limiting

AEO endpoints follow standard API rate limits:

- **Per Minute:** 60 requests
- **Per Hour:** 500 requests
- **Refresh Endpoint:** Recommended max 1 per hour

---

## Migration from Simulated to Real Data

Currently, the API uses **simulated data** for rapid development and UX validation. When ready to switch to real AI platform APIs:

1. Set environment variable: `USE_REAL_AI_APIS=true`
2. Configure AI platform API keys
3. Real data collection will automatically replace simulated responses

> **Note:** Real API integration will incur costs from AI platform providers. Estimated $50-200/month depending on usage.
