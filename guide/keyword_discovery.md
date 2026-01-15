# Keyword Discovery API

## Overview

The Keyword Discovery API generates 100-200 high-quality SEO keywords based on your blog's content, competitors, and AI predictions.

---

## Endpoints

### 1. Trigger Keyword Discovery

**POST** `/api/v1/blogs/:blog_id/keyword_discoveries`

Starts a new keyword discovery process (runs in background).

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `202 Accepted`

```json
{
  "message": "Keyword discovery started",
  "status": "processing"
}
```

**Notes:**

- Discovery runs asynchronously (takes ~2 minutes)
- Check subscription limits before calling
- Use `/usage` endpoint to check remaining discoveries

---

### 2. Get Latest Discovery

**GET** `/api/v1/blogs/:blog_id/keyword_discoveries/latest`

Retrieves the most recent keyword discovery results.

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "status": "completed",
  "trigger_type": "manual",
  "total_keywords": 152,
  "high_opportunity_count": 45,
  "keywords": [
    {
      "keyword": "generative engine optimization",
      "search_volume": 8100,
      "difficulty": 45,
      "opportunity_score": 78,
      "source": "semantic_similarity",
      "relevance_score": 0.92,
      "competitor_using": false,
      "cpc": 2.5
    },
    {
      "keyword": "ai content strategy",
      "search_volume": 3600,
      "difficulty": 38,
      "opportunity_score": 82,
      "source": "competitor",
      "competitor_name": "Example Blog",
      "competitor_using": true,
      "relevance_score": 0.85
    }
  ],
  "metadata": {
    "sources": {
      "semantic_similarity": 50,
      "competitor": 30,
      "ai_prediction": 30,
      "google_autocomplete": 42
    },
    "avg_opportunity_score": 65.5,
    "avg_search_volume": 1250
  },
  "completed_at": "2026-01-15T10:30:00Z",
  "created_at": "2026-01-15T10:28:00Z"
}
```

**Keyword Object Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `keyword` | string | The keyword phrase |
| `search_volume` | integer | Monthly search volume |
| `difficulty` | integer | SEO difficulty (0-100) |
| `opportunity_score` | integer | Overall opportunity (0-100) |
| `source` | string | Where keyword came from |
| `relevance_score` | float | Relevance to your blog (0-1) |
| `competitor_using` | boolean | If competitor uses this keyword |
| `cpc` | float | Cost per click (USD) |

**Sources:**

- `semantic_similarity` - From similar blog content
- `competitor` - From competitor analysis
- `ai_prediction` - AI-generated suggestions
- `google_autocomplete` - Google autocomplete expansion
- `blog_content` - From your own blog

---

### 3. Get Specific Discovery

**GET** `/api/v1/blogs/:blog_id/keyword_discoveries/:id`

Retrieves a specific keyword discovery by ID.

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** Same as `/latest` endpoint

---

### 4. List All Discoveries

**GET** `/api/v1/blogs/:blog_id/keyword_discoveries`

Lists all keyword discoveries (last 10).

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "discoveries": [
    {
      "id": "uuid",
      "status": "completed",
      "total_keywords": 152,
      "high_opportunity_count": 45,
      "completed_at": "2026-01-15T10:30:00Z",
      "created_at": "2026-01-15T10:28:00Z"
    }
  ]
}
```

---

### 5. Check Usage & Limits

**GET** `/api/v1/blogs/:blog_id/keyword_discoveries/usage`

Check how many discoveries you have left this month.

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "limit": 5,
  "used": 2,
  "remaining": 3,
  "tier": "starter"
}
```

**Limits by Tier:**

- Free: 0 discoveries/month
- Starter: 5 discoveries/month (~750 keywords)
- Professional: 20 discoveries/month (~3,000 keywords)
- Business: 50 discoveries/month (~7,500 keywords)

---

## Status Values

| Status       | Description                     |
| ------------ | ------------------------------- |
| `processing` | Discovery is running            |
| `completed`  | Discovery finished successfully |
| `failed`     | Discovery encountered an error  |

---

## Error Responses

### 403 Forbidden (Limit Exceeded)

```json
{
  "error": "Subscription limit exceeded",
  "resource": "keyword_discoveries",
  "limit": 5,
  "used": 5
}
```

### 404 Not Found

```json
{
  "message": "No keyword discoveries found",
  "keywords": []
}
```

---

## Typical Workflow

1. **Check Usage**

   ```
   GET /api/v1/blogs/:blog_id/keyword_discoveries/usage
   ```

2. **Trigger Discovery** (if remaining > 0)

   ```
   POST /api/v1/blogs/:blog_id/keyword_discoveries
   ```

3. **Poll for Results** (every 10 seconds)

   ```
   GET /api/v1/blogs/:blog_id/keyword_discoveries/latest
   ```

4. **Display Keywords** (when status = "completed")
   - Sort by `opportunity_score` (descending)
   - Filter by `source` or `competitor_using`
   - Show high opportunity keywords (score > 70)

---

## Polling for Progress

### Check Discovery Status

**GET** `/api/v1/blogs/:blog_id/keyword_discoveries/:id/status`

Poll this endpoint to check real-time progress of a running discovery.

**Headers:**

```
Authorization: Bearer {token}
```

**Response (Processing):** `200 OK`

```json
{
  "id": "uuid",
  "status": "processing",
  "started_at": "2026-01-15T10:00:00Z",
  "progress": {
    "current_stage": "Enriching with metrics",
    "stage_number": 5,
    "total_stages": 6,
    "percentage": 83,
    "estimated_seconds_remaining": 20
  },
  "estimated_completion_at": "2026-01-15T10:02:20Z"
}
```

**Response (Completed):** `200 OK`

```json
{
  "id": "uuid",
  "status": "completed",
  "started_at": "2026-01-15T10:00:00Z",
  "completed_at": "2026-01-15T10:02:15Z",
  "progress": {
    "current_stage": "Completed",
    "stage_number": 6,
    "total_stages": 6,
    "percentage": 100
  },
  "total_keywords": 152,
  "high_opportunity_count": 45
}
```

**Response (Failed):** `200 OK`

```json
{
  "id": "uuid",
  "status": "failed",
  "started_at": "2026-01-15T10:00:00Z",
  "failed_at": "2026-01-15T10:01:30Z",
  "error": "DataForSEO API error"
}
```

### Stages

| Stage | Description                    | Avg Duration |
| ----- | ------------------------------ | ------------ |
| 1     | Generating semantic keywords   | ~15s         |
| 2     | Extracting competitor keywords | ~10s         |
| 3     | Generating AI keywords         | ~15s         |
| 4     | Expanding with autocomplete    | ~10s         |
| 5     | Enriching with metrics         | ~30s         |
| 6     | Calculating opportunity scores | ~5s          |

**Total:** ~2 minutes

### Polling Pattern

**Recommended:** Poll every **3 seconds** until `status` is `completed` or `failed`.

**Example Flow:**

```typescript
// 1. Trigger discovery
const { data } = await axiosInstance.post(
  `/api/v1/blogs/${blogId}/keyword_discoveries`
);

// 2. Get discovery ID from /latest
const { data: latest } = await axiosInstance.get(
  `/api/v1/blogs/${blogId}/keyword_discoveries/latest`
);
const discoveryId = latest.id;

// 3. Poll status
const pollStatus = async () => {
  const { data: status } = await axiosInstance.get(
    `/api/v1/blogs/${blogId}/keyword_discoveries/${discoveryId}/status`
  );

  if (status.status === "completed") {
    // Fetch full results
    const { data: results } = await axiosInstance.get(
      `/api/v1/blogs/${blogId}/keyword_discoveries/latest`
    );
    return results;
  }

  if (status.status === "failed") {
    throw new Error(status.error);
  }

  // Show progress
  console.log(
    `${status.progress.percentage}% - ${status.progress.current_stage}`
  );

  // Poll again in 3 seconds
  setTimeout(pollStatus, 3000);
};

pollStatus();
```

### React Hook (TanStack Query)

```typescript
const useKeywordDiscoveryStatus = (discoveryId: string) => {
  return useQuery({
    queryKey: ["keyword-discovery-status", discoveryId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/api/v1/blogs/${blogId}/keyword_discoveries/${discoveryId}/status`
      );
      return data;
    },
    refetchInterval: (data) => {
      // Stop polling when done
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    enabled: !!discoveryId,
  });
};

// Usage in component
const { data: status } = useKeywordDiscoveryStatus(discoveryId);

// Show progress bar
<ProgressBar
  value={status?.progress?.percentage || 0}
  label={status?.progress?.current_stage}
/>;
```

---

## Filters

### Discovery-Level Filters (on `/index`)

Filter the list of discoveries:

| Parameter      | Type   | Values                                     | Description                                 |
| -------------- | ------ | ------------------------------------------ | ------------------------------------------- |
| `status`       | string | `processing`, `completed`, `failed`, `all` | Filter by discovery status                  |
| `start_date`   | date   | ISO 8601                                   | Filter discoveries created after this date  |
| `end_date`     | date   | ISO 8601                                   | Filter discoveries created before this date |
| `trigger_type` | string | `manual`, `all`                            | Filter by trigger type                      |

**Example:**

```bash
GET /api/v1/blogs/:blog_id/keyword_discoveries?status=completed&start_date=2026-01-08
```

### Keyword-Level Filters (on `/latest` and `/show`)

Filter keywords within discovery results:

| Parameter         | Type    | Values                                                                                             | Description                        |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `source`          | string  | `semantic_similarity`, `competitor`, `ai_prediction`, `google_autocomplete`, `blog_content`, `all` | Filter by keyword source           |
| `min_opportunity` | integer | 0-100                                                                                              | Minimum opportunity score          |
| `max_opportunity` | integer | 0-100                                                                                              | Maximum opportunity score          |
| `min_volume`      | integer | 0+                                                                                                 | Minimum search volume              |
| `max_volume`      | integer | 0+                                                                                                 | Maximum search volume              |
| `min_difficulty`  | integer | 0-100                                                                                              | Minimum difficulty                 |
| `max_difficulty`  | integer | 0-100                                                                                              | Maximum difficulty                 |
| `competitor_only` | boolean | `true`, `false`                                                                                    | Show only keywords competitors use |
| `sort_by`         | string  | `opportunity`, `volume`, `difficulty`, `relevance`                                                 | Sort keywords by field             |
| `sort_order`      | string  | `asc`, `desc`                                                                                      | Sort direction (default: `desc`)   |

**Examples:**

```bash
# High-opportunity keywords (score > 70)
GET /api/v1/blogs/:blog_id/keyword_discoveries/latest?min_opportunity=70

# Competitor keywords only
GET /api/v1/blogs/:blog_id/keyword_discoveries/latest?source=competitor&competitor_only=true

# High volume, low difficulty (easy wins)
GET /api/v1/blogs/:blog_id/keyword_discoveries/latest?min_volume=1000&max_difficulty=40

# Sort by search volume
GET /api/v1/blogs/:blog_id/keyword_discoveries/latest?sort_by=volume&sort_order=desc
```

### Preset Filter Combinations

**"Easy Wins"** - High opportunity, low difficulty:

```
?min_opportunity=70&max_difficulty=40
```

**"Competitor Keywords"** - What competitors rank for:

```
?source=competitor&competitor_only=true
```

**"High Volume Opportunities"** - Popular keywords:

```
?min_volume=5000&min_opportunity=60
```

**"Long-tail Keywords"** - Lower volume, easier to rank:

```
?max_volume=1000&min_opportunity=50
```

**"AI Suggestions"** - AI-predicted keywords:

```
?source=ai_prediction&sort_by=opportunity&sort_order=desc
```

---

## Notes

- Each discovery generates **150-200 keywords**
- Discovery takes **~2 minutes** to complete
- Keywords are sorted by opportunity score (high to low)
- High opportunity = score > 70
- Use `source` field to understand keyword origin
- `competitor_using: true` means a competitor ranks for this keyword
