# Content Repurposing API Integration Guide

This guide details how to consume the Content Repurposing API to generate X (Twitter), LinkedIn, and Reddit content from existing articles.

## API Endpoints

### 1. Generate Content (POST)

**POST** `/api/v1/blogs/:blog_id/articles/:article_id/repurposing`

Repurposes an article's content for a specific social media platform and saves it.

### 2. Retrieve Content (GET)

**GET** `/api/v1/blogs/:blog_id/articles/:article_id/repurposing`

Returns the previously generated and saved content relative to the article.

#### Response Examples

**Scenario 1: Full or Partial Content Exists**

If content has been generated for any platform, it returns the `RepurposedContent` object. Fields for ungenerated platforms will be `null`.

```json
{
  "id": 105,
  "article_id": 42,
  "twitter_content": {
    "platform": "twitter",
    "hooks": ["..."],
    "tweets": ["..."]
  },
  "linkedin_content": null, // Not generated yet
  "reddit_content": {
    "platform": "reddit",
    "titles": ["..."],
    "body": "..."
  },
  "created_at": "2023-10-27T10:00:00.000Z",
  "updated_at": "2023-10-27T10:05:00.000Z"
}
```

**Scenario 2: No Content Generated Yet**

If the article has never been repurposed, it returns an empty JSON object.

```json
{}
```

---

## 1. Request Format (POST) & GET)

The POST response returns the generated content for the requested platform.
The GET response returns the content for _all_ keys if they exist in the database. (POST)

### Headers

- `Content-Type`: `application/json`
- `Authorization`: `Bearer <token>`

### Body Parameters

| Parameter  | Type     | Required | Description                             |
| :--------- | :------- | :------- | :-------------------------------------- |
| `platform` | `string` | **Yes**  | One of: `twitter`, `linkedin`, `reddit` |

#### Example Request

```json
{
  "platform": "twitter"
}
```

---

## 2. Response Formats

### A. Twitter (X) Response

Use this to pre-fill a thread composer.

```json
{
  "status": "success",
  "data": {
    "platform": "twitter",
    "hooks": ["Hook Option 1...", "Hook Option 2...", "Hook Option 3..."],
    "tweets": ["Tweet 1 (Body)...", "Tweet 2 (Body)...", "Tweet 3 (Body)..."],
    "thread_count": 10
  }
}
```

### B. LinkedIn Response

Use this to pre-fill a LinkedIn post composer.

```json
{
  "status": "success",
  "data": {
    "platform": "linkedin",
    "hooks": [
      "Professional Hook 1...",
      "Professional Hook 2...",
      "Professional Hook 3..."
    ],
    "body": "💡 TL;DR\n\n[Content]..."
  }
}
```

### C. Reddit Response

Use this to pre-fill a Reddit post composer.

```json
{
  "status": "success",
  "data": {
    "platform": "reddit",
    "titles": ["Case Study Title...", "Guide Title...", "Insight Title..."],
    "body": "## Full Markdown Content..."
  }
}
```

---

## 3. TypeScript Interfaces

```typescript
// Common Request Interface
interface RepurposeRequest {
  platform: "twitter" | "linkedin" | "reddit";
}

// Response Interfaces
interface TwitterResponse {
  platform: "twitter";
  hooks: string[];
  tweets: string[];
  thread_count: number;
}

interface LinkedInResponse {
  platform: "linkedin";
  hooks: string[];
  body: string;
}

interface RedditResponse {
  platform: "reddit";
  titles: string[];
  body: string;
}

// Unified API Response Type
type RepurposeResponse = TwitterResponse | LinkedInResponse | RedditResponse;
```

## 4. Error Handling

| Status Code | Description                          |
| :---------- | :----------------------------------- |
| `401`       | Unauthorized (Invalid token)         |
| `404`       | Blog or Article not found            |
| `422`       | Invalid platform or processing error |
| `500`       | Internal Server Error                |

```json
{
  "status": "error",
  "message": "Platform is required"
}
```
