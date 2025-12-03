# Scheduling & Publication Tracking API Guide

## Overview

This guide covers the API endpoints for scheduling articles and tracking their publication status across different platforms.

---

## 1. Scheduling Articles

### Create/Update Article with Scheduling

**Endpoint:** `POST /api/v1/blogs/:blog_id/articles` or `PATCH /api/v1/blogs/:blog_id/articles/:id`

**Request Body:**

```json
{
  "article": {
    "title": "My Scheduled Article",
    "content": "<p>Article content here...</p>",
    "slug": "my-scheduled-article",
    "scheduled_at": "2025-11-28T18:00:00Z",
    "seo_title": "SEO Title",
    "seo_description": "SEO Description",
    "tags": ["AI", "Technology"],
    "categories": ["Blog"]
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "My Scheduled Article",
  "content": "<p>Article content here...</p>",
  "status": "scheduled",
  "scheduled_at": "2025-11-28T18:00:00Z",
  "published_at": null,
  "created_at": "2025-11-28T12:00:00Z",
  "updated_at": "2025-11-28T12:00:00Z"
}
```

**Notes:**

- Setting `scheduled_at` automatically schedules a background job
- Article `status` will be set to `"scheduled"`
- Updating `scheduled_at` cancels the old job and creates a new one
- Set `scheduled_at` to `null` to cancel scheduling

---

## 2. Integration Settings

### Update Integration Settings

**Endpoint:** `PATCH /api/v1/integrations/:id`

**Request Body Examples:**

#### WordPress Settings

```json
{
  "integration": {
    "settings": {
      "post_status": "draft",
      "default_category": "Blog",
      "default_tags": ["AI", "Technology", "SEO"]
    }
  }
}
```

#### Shopify Settings

```json
{
  "integration": {
    "settings": {
      "blog_id": "123456789",
      "blog_handle": "news",
      "tags": ["Product Updates", "News"]
    }
  }
}
```

#### Medium Settings

```json
{
  "integration": {
    "settings": {
      "tags": ["Technology", "AI", "Programming"]
    }
  }
}
```

#### Dev.to Settings

```json
{
  "integration": {
    "settings": {
      "tags": ["webdev", "javascript", "tutorial"]
    }
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "platform": "wordpress",
  "settings": {
    "post_status": "draft",
    "default_category": "Blog",
    "default_tags": ["AI", "Technology", "SEO"]
  },
  "created_at": "2025-11-28T12:00:00Z",
  "updated_at": "2025-11-28T12:00:00Z"
}
```

---

## 3. Publication Status Tracking

### Get Article Publications

**Endpoint:** `GET /api/v1/blogs/:blog_id/articles/:article_id/publications`

**Response:**

```json
{
  "publications": [
    {
      "id": "uuid",
      "article_id": "uuid",
      "integration_id": "uuid",
      "status": "success",
      "external_url": "https://example.com/blog/my-article",
      "external_id": "123",
      "error_message": null,
      "published_at": "2025-11-28T18:00:00Z",
      "attempted_at": "2025-11-28T18:00:00Z",
      "retry_count": 0,
      "metadata": {},
      "integration": {
        "id": "uuid",
        "platform": "wordpress",
        "settings": {}
      }
    },
    {
      "id": "uuid",
      "article_id": "uuid",
      "integration_id": "uuid",
      "status": "failed",
      "external_url": null,
      "external_id": null,
      "error_message": "Invalid API token",
      "published_at": null,
      "attempted_at": "2025-11-28T18:00:00Z",
      "retry_count": 1,
      "metadata": {},
      "integration": {
        "id": "uuid",
        "platform": "medium",
        "settings": {}
      }
    }
  ]
}
```

**Status Values:**

- `"pending"` - Waiting to be published
- `"publishing"` - Currently being published
- `"success"` - Successfully published
- `"failed"` - Publication failed

---

## 4. Retry Failed Publication

**Endpoint:** `POST /api/v1/blogs/:blog_id/articles/:article_id/publications/:publication_id/retry`

**Request Body:** (empty)

**Response:**

```json
{
  "id": "uuid",
  "status": "publishing",
  "retry_count": 2,
  "attempted_at": "2025-11-28T19:00:00Z"
}
```

**Notes:**

- Maximum 3 retry attempts allowed
- Returns 422 if retry limit exceeded

---

## 5. Manual Publish Now

**Endpoint:** `POST /api/v1/blogs/:blog_id/articles/:article_id/publish`

**Request Body:** (empty)

**Response:**

```json
{
  "message": "Article publishing started",
  "publications": [
    {
      "integration_id": "uuid",
      "platform": "wordpress",
      "status": "publishing"
    },
    {
      "integration_id": "uuid",
      "platform": "shopify",
      "status": "publishing"
    }
  ]
}
```

**Notes:**

- Publishes immediately to all connected integrations
- Creates/updates article_publications records
- Updates article status to "published"

---

## Frontend Implementation Examples

### 1. Schedule Article Form

```typescript
interface ScheduleArticleData {
  title: string;
  content: string;
  scheduled_at: string | null; // ISO 8601 format
  tags?: string[];
  categories?: string[];
}

async function scheduleArticle(blogId: string, data: ScheduleArticleData) {
  const response = await fetch(`/api/v1/blogs/${blogId}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ article: data }),
  });

  return response.json();
}

// Usage
const article = await scheduleArticle("blog-uuid", {
  title: "My Article",
  content: "<p>Content...</p>",
  scheduled_at: "2025-11-28T18:00:00Z", // Schedule for 6 PM
});
```

### 2. Update Integration Settings

```typescript
interface IntegrationSettings {
  post_status?: string;
  default_category?: string;
  default_tags?: string[];
  blog_id?: string;
  tags?: string[];
}

async function updateIntegrationSettings(
  integrationId: string,
  settings: IntegrationSettings
) {
  const response = await fetch(`/api/v1/integrations/${integrationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      integration: { settings },
    }),
  });

  return response.json();
}

// Usage - WordPress
await updateIntegrationSettings("integration-uuid", {
  post_status: "draft",
  default_category: "Blog",
  default_tags: ["AI", "Technology"],
});

// Usage - Shopify
await updateIntegrationSettings("integration-uuid", {
  blog_id: "123456",
  tags: ["Product Updates"],
});
```

### 3. Display Publication Status

```typescript
interface Publication {
  id: string;
  status: "pending" | "publishing" | "success" | "failed";
  external_url: string | null;
  error_message: string | null;
  retry_count: number;
  integration: {
    platform: string;
  };
}

async function getPublicationStatus(blogId: string, articleId: string) {
  const response = await fetch(
    `/api/v1/blogs/${blogId}/articles/${articleId}/publications`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json();
  return data.publications;
}

// Usage in React component
function PublicationStatusList({
  publications,
}: {
  publications: Publication[];
}) {
  return (
    <div>
      {publications.map((pub) => (
        <div key={pub.id} className="publication-item">
          <div className="platform">{pub.integration.platform}</div>

          {pub.status === "success" && (
            <div className="success">
              ✅ Published
              <a href={pub.external_url} target="_blank">
                View
              </a>
            </div>
          )}

          {pub.status === "failed" && (
            <div className="error">
              ❌ Failed: {pub.error_message}
              {pub.retry_count < 3 && (
                <button onClick={() => retryPublication(pub.id)}>Retry</button>
              )}
            </div>
          )}

          {pub.status === "publishing" && (
            <div className="loading">⏳ Publishing...</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 4. Retry Failed Publication

```typescript
async function retryPublication(
  blogId: string,
  articleId: string,
  publicationId: string
) {
  const response = await fetch(
    `/api/v1/blogs/${blogId}/articles/${articleId}/publications/${publicationId}/retry`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.json();
}

// Usage
await retryPublication("blog-uuid", "article-uuid", "publication-uuid");
```

### 5. Schedule Article with Date Picker

```typescript
import { useState } from "react";

function ScheduleArticleForm() {
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  const handleSchedule = async () => {
    const isoDate = scheduledAt?.toISOString() || null;

    await scheduleArticle("blog-uuid", {
      title: "My Article",
      content: "<p>Content...</p>",
      scheduled_at: isoDate,
    });
  };

  return (
    <div>
      <input
        type="datetime-local"
        onChange={(e) => setScheduledAt(new Date(e.target.value))}
      />
      <button onClick={handleSchedule}>Schedule</button>
    </div>
  );
}
```

---

## Platform-Specific Settings Reference

### WordPress

```typescript
{
  post_status: 'publish' | 'draft',
  default_category: string,      // Category name or ID
  default_tags: string[]          // Array of tag names
}
```

### Shopify

```typescript
{
  blog_id: string,                // Shopify blog ID
  blog_handle: string,            // Blog handle for URL
  tags: string[]                  // Array of tags
}
```

### Medium

```typescript
{
  tags: string[],                 // Max 5 tags
  publication_id?: string         // Optional publication ID
}
```

### Dev.to

```typescript
{
  tags: string[]                  // Max 4 tags
}
```

### Webflow

```typescript
{
  collection_id: string,          // Webflow collection ID
  site_id: string,                // Webflow site ID
  site_url?: string               // Optional site URL
}
```

### Hashnode

```typescript
{
  publication_id: string,         // Hashnode publication ID
  tags: string[]
}
```

### Custom Webhook

```typescript
{
  webhook_url: string,            // Webhook endpoint
  headers?: Record<string, string>, // Custom headers
  field_mapping?: Record<string, string> // Field mapping
}
```

---

## Error Handling

### Common Error Responses

**422 Unprocessable Entity** - Validation errors

```json
{
  "errors": {
    "scheduled_at": ["must be in the future"],
    "title": ["can't be blank"]
  }
}
```

**404 Not Found** - Resource not found

```json
{
  "error": "Article not found"
}
```

**401 Unauthorized** - Authentication required

```json
{
  "error": "Invalid or expired token"
}
```

---

## WebSocket Updates (Optional)

For real-time publication status updates, subscribe to:

```typescript
const cable = ActionCable.createConsumer("/cable");

cable.subscriptions.create(
  {
    channel: "ArticlePublicationsChannel",
    article_id: "article-uuid",
  },
  {
    received(data) {
      // data = { publication_id, status, external_url, error_message }
      console.log("Publication updated:", data);
    },
  }
);
```

---

## Summary

**Key Endpoints:**

1. `POST /api/v1/blogs/:blog_id/articles` - Create scheduled article
2. `PATCH /api/v1/integrations/:id` - Update integration settings
3. `GET /api/v1/blogs/:blog_id/articles/:article_id/publications` - Get status
4. `POST /api/v1/blogs/:blog_id/articles/:article_id/publications/:id/retry` - Retry
5. `POST /api/v1/blogs/:blog_id/articles/:article_id/publish` - Publish now

**Key Features:**

- ✅ Direct scheduling with `scheduled_at`
- ✅ Per-platform settings configuration
- ✅ Real-time status tracking
- ✅ Error messages and retry support
- ✅ External URL links to published content
