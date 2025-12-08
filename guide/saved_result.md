# Saved Results (Bookmarks) API Documentation

## Overview

The Saved Results API allows users to bookmark and save results from keyword research, outline generation, and topic generation for easy access later. This eliminates the need to re-run expensive AI operations.

## Base URL

```
/api/v1/blogs/:blog_id/saved_results
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Data Structure

The API uses a unified table with JSONB columns to store different types of research results:

### Keyword Research

```json
{
  "result_type": "keyword_research",
  "search_params": { "query": "SEO tips", "mode": "detailed" },
  "result_data": {
    "seed": { "term": "SEO tips", "search_volume": 5000, "difficulty": 45 },
    "related": [{ "term": "SEO best practices", "search_volume": 3200 }]
  }
}
```

### Outline Generation

```json
{
  "result_type": "outline_generation",
  "search_params": {"topic": "How to Start a Blog", "tone": "friendly"},
  "result_data": {
    "title": "Complete Guide to Starting a Blog",
    "sections": [{"heading": "Choose Your Niche", "key_points": [...]}],
    "estimated_word_count": 2500
  }
}
```

### Topic Generation

```json
{
  "result_type": "topic_generation",
  "search_params": { "keywords": ["blogging", "SEO"], "tone": "professional" },
  "result_data": [
    {
      "keyword": "blogging",
      "title": "Advanced SEO Techniques",
      "difficulty": 7,
      "opportunity": 8
    }
  ]
}
```

## Endpoints

### 1. List Saved Results

**GET** `/api/v1/blogs/:blog_id/saved_results`

Retrieve all saved results for the current user with optional filtering and pagination.

**Query Parameters:**

- `type` (optional): Filter by result type (`keyword_research`, `outline_generation`, `topic_generation`)
- `favorites` (optional): Filter favorites only (`true`/`false`)
- `tag` (optional): Filter by tag
- `q` (optional): Search in titles and notes
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Results per page (default: 20, max: 100)

**Example Request:**

```bash
curl "http://localhost:3000/api/v1/blogs/123/saved_results?type=keyword_research&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "status": 200,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "blog_id": "uuid",
      "result_type": "keyword_research",
      "title": "SEO Keywords for Blog",
      "search_params": {...},
      "result_data": {...},
      "tags": ["seo", "keywords"],
      "notes": "Great keywords for Q1 content",
      "is_favorite": false,
      "saved_at": "2025-12-03T12:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "per_page": 20,
    "total_pages": 3
  }
}
```

---

### 2. Get Single Saved Result

**GET** `/api/v1/blogs/:blog_id/saved_results/:id`

Retrieve a specific saved result.

**Example Request:**

```bash
curl "http://localhost:3000/api/v1/blogs/123/saved_results/456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "status": 200,
  "data": {
    "id": "456",
    "result_type": "keyword_research",
    "title": "SEO Keywords for Blog",
    "search_params": {...},
    "result_data": {...},
    "tags": ["seo"],
    "notes": "Important for Q1",
    "is_favorite": true,
    "saved_at": "2025-12-03T12:00:00Z"
  }
}
```

---

### 3. Create Saved Result

**POST** `/api/v1/blogs/:blog_id/saved_results`

Save a new research result.

**Request Body:**

```json
{
  "saved_result": {
    "result_type": "keyword_research",
    "title": "SEO Keywords for Blog",
    "search_params": {
      "query": "SEO tips",
      "mode": "detailed"
    },
    "result_data": {
      "seed": { "term": "SEO tips", "search_volume": 5000 },
      "related": [{ "term": "SEO best practices", "search_volume": 3200 }]
    },
    "tags": ["seo", "keywords"],
    "notes": "Great keywords for Q1 content",
    "is_favorite": false
  }
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/blogs/123/saved_results" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"saved_result": {...}}'
```

**Response:**

```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "result_type": "keyword_research",
    "title": "SEO Keywords for Blog",
    ...
  },
  "message": "Result saved successfully"
}
```

---

### 4. Update Saved Result

**PATCH** `/api/v1/blogs/:blog_id/saved_results/:id`

Update title, notes, tags, or favorite status.

**Request Body:**

```json
{
  "saved_result": {
    "title": "Updated Title",
    "notes": "Updated notes",
    "tags": ["seo", "content", "q1"],
    "is_favorite": true
  }
}
```

**Example Request:**

```bash
curl -X PATCH "http://localhost:3000/api/v1/blogs/123/saved_results/456" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"saved_result": {...}}'
```

**Response:**

```json
{
  "status": 200,
  "data": {...},
  "message": "Result updated successfully"
}
```

---

### 5. Delete Saved Result

**DELETE** `/api/v1/blogs/:blog_id/saved_results/:id`

Delete a saved result.

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/v1/blogs/123/saved_results/456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "status": 200,
  "message": "Result deleted successfully"
}
```

---

### 6. Toggle Favorite

**POST** `/api/v1/blogs/:blog_id/saved_results/:id/toggle_favorite`

Toggle the favorite status of a saved result.

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/blogs/123/saved_results/456/toggle_favorite" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "status": 200,
  "data": {...},
  "message": "Added to favorites"
}
```

---

### 7. Compare Results

**POST** `/api/v1/blogs/:blog_id/saved_results/compare`

Compare 2-5 saved results side-by-side.

**Request Body:**

```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/blogs/123/saved_results/compare" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["uuid1", "uuid2"]}'
```

**Response:**

```json
{
  "status": 200,
  "data": {
    "total_compared": 2,
    "grouped_by_type": {
      "keyword_research": [
        {...},
        {...}
      ]
    },
    "all_results": [...]
  }
}
```

---

### 8. Get Statistics

**GET** `/api/v1/blogs/:blog_id/saved_results/stats`

Get statistics about saved results.

**Example Request:**

```bash
curl "http://localhost:3000/api/v1/blogs/123/saved_results/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "status": 200,
  "data": {
    "total": 50,
    "by_type": {
      "keyword_research": 20,
      "outline_generation": 15,
      "topic_generation": 15
    },
    "favorites": 10,
    "tags": ["seo", "content", "keywords", "q1", "q2"]
  }
}
```

---

### 9. Export Results

**GET** `/api/v1/blogs/:blog_id/saved_results/export`

Export saved results as JSON or CSV.

**Query Parameters:**

- `format` (optional): Export format (`json` or `csv`, default: `json`)
- `type` (optional): Filter by result type
- `favorites` (optional): Export favorites only
- `tag` (optional): Filter by tag

**Example Request (JSON):**

```bash
curl "http://localhost:3000/api/v1/blogs/123/saved_results/export?format=json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -O saved_results.json
```

**Example Request (CSV):**

```bash
curl "http://localhost:3000/api/v1/blogs/123/saved_results/export?format=csv&favorites=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -O saved_results.csv
```

---

## Error Responses

### 422 Unprocessable Entity

```json
{
  "status": 422,
  "errors": ["Title is too long", "Result type is not included in the list"]
}
```

### 404 Not Found

```json
{
  "status": 404,
  "error": "Record not found"
}
```

### 401 Unauthorized

```json
{
  "status": 401,
  "error": "You need to sign in or sign up before continuing"
}
```

---

## Usage Examples

### Save Keyword Research Result

```javascript
const saveKeywordResearch = async (blogId, query, results) => {
  const response = await fetch(`/api/v1/blogs/${blogId}/saved_results`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      saved_result: {
        result_type: "keyword_research",
        search_params: { query, mode: "detailed" },
        result_data: results,
        tags: ["seo", "keywords"],
      },
    }),
  });
  return response.json();
};
```

### List Favorites

```javascript
const getFavorites = async (blogId) => {
  const response = await fetch(
    `/api/v1/blogs/${blogId}/saved_results?favorites=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.json();
};
```

### Search Saved Results

```javascript
const searchResults = async (blogId, query) => {
  const response = await fetch(
    `/api/v1/blogs/${blogId}/saved_results?q=${encodeURIComponent(query)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.json();
};
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- The `search_params` and `result_data` fields are JSONB and can store any valid JSON structure
- Tags are stored as PostgreSQL arrays
- Maximum 5 results can be compared at once
- Export files are named with the current date (e.g., `saved_results_2025-12-03.csv`)
