# Competitor Analysis Frontend Integration Guide

This guide details how to integrate the enhanced Competitor Analysis features, specifically the new **Sitemap Support** and **Path Filtering** for shared platforms.

## 1. Adding a Competitor

### Endpoint

`POST /api/v1/blogs/:blog_id/competitors`

### Payload

You can now optionally send `sitemap_url`. If omitted, the backend will attempt to discover it automatically.

```json
{
  "competitor": {
    "name": "Competitor Name",
    "website_url": "https://medium.com/@username",
    "rss_feed_url": "https://medium.com/feed/@username", // Optional
    "sitemap_url": "https://medium.com/sitemap.xml", // Optional (New)
    "description": "Optional description"
  }
}
```

### Best Practices for `website_url`

- **Standard Sites**: Send the home page, e.g., `https://stripe.com/blog`.
- **Shared Platforms (Medium, Dev.to)**: Send the **profile URL**, e.g., `https://medium.com/@surajon`.
  - **Why?** The backend now uses this URL to filter the sitemap. If you send `https://medium.com`, we might index the entire site! sending the profile path ensures we only index articles belonging to that user.

## 2. Displaying Analysis Results

### Endpoint

`GET /api/v1/blogs/:blog_id/competitors` or `GET /api/v1/blogs/:blog_id/competitors/:id`

### Response Structure

The `competitor` object now includes `sitemap_url`.

```json
{
  "competitor": {
    "id": "...",
    "name": "...",
    "website_url": "...",
    "sitemap_url": "https://...",
    "rss_feed_url": "https://...",
    "latest_analysis": {
      "new_articles_found": 12,
      "content_quality_score": 85,
      ...
    }
  }
}
```

## 3. Handling User Input (Frontend UI)

1.  **Input Fields**:
    - **Required**: Name, Website URL.
    - **Advanced/Optional**: "Advanced Settings" toggle that reveals `RSS Feed URL` and `Sitemap URL` inputs.
    - **Tip**: You can tell users "Leave blank to auto-detect".

2.  **Validation**:
    - Ensure `website_url` is a valid URL.
    - If the user is adding a Medium/Dev.to link, suggest entering their specific profile URL for better accuracy.

## 4. Triggering Analysis manually

### Endpoint

`POST /api/v1/blogs/:blog_id/competitors/:id/analyze`

- This triggers the background job.
- The backend will check Sitemap first, then RSS, then Fallback.
- Use the `analysis_status` endpoint to poll for completion (or rely on WebSockets if implemented).
