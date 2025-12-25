# Article Publication API Guide

## Overview

This guide details the endpoints for managing article publications across external platforms (Dev.to, Hashnode, Medium, WordPress, Webflow, Shopify).

**Base URL**: `/api/v1/blogs/:blog_id/articles/:article_id`

---

## 1. Publish Article

Triggers the publication process for an article. This runs in the background.

- **Endpoint**: `POST /publish`
- **Body**:
  ```json
  {
    "integration_ids": ["uuid-1", "uuid-2"]
    // OR
    "article_publications": ["devto", "hashnode"] // (Platform names)
  }
  ```
- **Response**:
  ```json
  {
    "message": "Article publishing started",
    "publications": [
      {
        "id": "pub_id",
        "integration_id": "int_id",
        "platform": "devto",
        "status": "pending"
      }
    ]
  }
  ```

---

## 2. Unpublish Article

Removes the article from external platforms or reverts it to draft.

- **Endpoint**: `POST /unpublish`
- **Body**:
  ```json
  {
    "all": true
    // OR
    "integration_ids": ["int_id_1"]
  }
  ```
- **Behavior by Platform**:

  - **Dev.to**: Reverts to Draft (published: false).
  - **Wordpress**: Reverts to Draft status.
  - **Shopify**: Unsets `published_at` (hidden from store).
  - **Webflow**: Unpublishes from live site (keeps in CMS as draft).
  - **Hashnode**: **DELETES** the post (API restriction).
  - **Medium**: **DELETES** the post (API restriction).

- **Response**:
  ```json
  {
    "message": "Unpublish processed",
    "results": [
      { "id": "pub_id", "platform": "devto", "status": "unpublished" },
      { "id": "pub_id", "platform": "hashnode", "status": "unpublished" } // Actually deleted
    ]
  }
  ```

### Example: Unpublish from Dev.to only

If you have an article published on multiple platforms but only want to unpublish it from Dev.to:

1. Identify the `integration_id` for Dev.to from the `article_publications` list.
2. Send the request with that ID:
   ```json
   {
     "integration_ids": ["c79acea3-8421-41e6-88ac-6d3b2418207b"]
   }
   ```
   This will only unpublish the article from Dev.to, leaving Hashnode and others unaffected.

---

## 3. Update Published Article

Updates the content of an already published article on external platforms.

- **Endpoint**: `POST /update_published`
- **Body**:
  ```json
  {
    "integration_ids": ["int_id_1"] // Optional, defaults to all successful publications
  }
  ```
- **Behavior**:

  - Updates title, content, canonical URL, tags, and cover image where supported.
  - **Medium**: **Not Supported** (API does not allow updates).

- **Response**:
  ```json
  {
    "message": "Update processed",
    "results": [{ "id": "pub_id", "platform": "devto", "status": "updated" }]
  }
  ```

---

## 4. Retry Publication

Retries a specific failed publication.

- **Endpoint**: `/api/v1/blogs/:blog_id/articles/:article_id/publications/:publication_id/retry`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "id": "pub_id",
    "status": "publishing",
    "retry_count": 1,
    "attempted_at": "2024-03-20T10:00:00Z"
  }
  ```

---

## Publication Object Structure

When fetching articles, the `article_publications` array contains:

```json
{
  "id": "uuid",
  "integration_id": "uuid",
  "status": "success | failed | pending | publishing",
  "external_url": "https://dev.to/user/slug",
  "external_id": "12345",
  "error_message": null,
  "published_at": "ISO8601",
  "integration": {
    "id": "uuid",
    "platform": "devto",
    "settings": { ... }
  }
}
```
