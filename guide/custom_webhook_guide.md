# Custom Webhook Integration API Guide

## Overview

The custom webhook adapter allows you to publish articles to any custom API endpoint with full control over the request format, content type, and CRUD operations.

---

## Configuration Settings

### Basic Settings

```json
{
  "label": "My Custom API",
  "webhook_url": "https://api.example.com/articles"
}
```

### Advanced Settings

```json
{
  "label": "My Custom API",
  "webhook_url": "https://api.example.com/articles",
  "content_format": "html",
  "response_id_field": "article_id",
  "update_url": "https://api.example.com/articles/{id}",
  "delete_url": "https://api.example.com/articles/{id}",
  "headers": {
    "Authorization": "Bearer your-api-token",
    "X-Custom-Header": "value"
  },
  "field_mapping": {
    "title": "{{title}}",
    "body": "{{content}}",
    "slug": "{{slug}}"
  }
}
```

---

## Content Format Selection

### Setting: `content_format`

**Values:** `"markdown"` | `"html"`  
**Default:** `"markdown"`

Controls which content format is sent to your webhook.

**Markdown Format:**

```json
{
  "content_format": "markdown"
}
```

Sends: `article.content` (raw Markdown)

**HTML Format:**

```json
{
  "content_format": "html"
}
```

Sends: `article.content_html` (pre-rendered HTML from TipTap)

**Example:**

```json
{
  "field_mapping": {
    "title": "{{title}}",
    "markdown": "{{content}}" // Will use HTML if content_format is "html"
  },
  "content_format": "html"
}
```

---

## CRUD Operations

### 1. Publish (POST)

**Endpoint:** `webhook_url`  
**Method:** POST

**Request:**

```http
POST https://api.example.com/articles
Content-Type: application/json

{
  "title": "My Article",
  "body": "<p>HTML content...</p>",
  "slug": "my-article"
}
```

**Expected Response:**

```json
{
  "id": "abc123",
  "status": "published"
}
```

The `id` field will be extracted and saved as `external_id`.

---

### 2. Update (PATCH)

**Setting:** `update_url` (optional)

**Default:** `{webhook_url}/{id}`

**Custom URL:**

```json
{
  "update_url": "https://api.example.com/articles/{id}/update"
}
```

**Token Replacement:**

- `{id}` → Replaced with `external_id` from publish response
- `{article_id}` → Replaced with internal article ID

**Request:**

```http
PATCH https://api.example.com/articles/abc123
Content-Type: application/json

{
  "title": "Updated Title",
  "body": "<p>Updated content...</p>"
}
```

---

### 3. Unpublish (DELETE)

**Setting:** `delete_url` (optional)

**Default:** `{webhook_url}/{id}`

**Custom URL:**

```json
{
  "delete_url": "https://api.example.com/articles/{id}"
}
```

**Request:**

```http
DELETE https://api.example.com/articles/abc123
```

---

## Response ID Extraction

### Setting: `response_id_field`

**Purpose:** Tell the adapter which field contains the article ID in your API response.

**Default Behavior:**
Tries in order: `id` → `_id` → `uuid` → `article_id`

### Simple ID Field

```json
{
  "response_id_field": "article_id"
}
```

**Response:**

```json
{
  "article_id": "abc123",
  "status": "success"
}
```

**Extracted:** `"abc123"`

### Nested ID Field

```json
{
  "response_id_field": "data.id"
}
```

**Response:**

```json
{
  "data": {
    "id": "xyz789",
    "status": "published"
  }
}
```

**Extracted:** `"xyz789"`

---

## Custom Headers

### Setting: `headers`

Add authentication or custom headers to all requests.

```json
{
  "headers": {
    "Authorization": "Bearer sk_test_abc123",
    "X-API-Key": "your-api-key",
    "X-Custom-Header": "custom-value"
  }
}
```

**All requests will include:**

```http
Content-Type: application/json
Authorization: Bearer sk_test_abc123
X-API-Key: your-api-key
X-Custom-Header: custom-value
```

---

## Field Mapping

### Setting: `field_mapping`

Map article fields to your API's expected format.

### Available Variables

| Variable            | Description                                     | Example                           |
| ------------------- | ----------------------------------------------- | --------------------------------- |
| `{{title}}`         | Article title                                   | `"My Article"`                    |
| `{{content}}`       | Content (format determined by `content_format`) | `"<p>HTML</p>"` or `"# Markdown"` |
| `{{slug}}`          | URL-friendly slug                               | `"my-article"`                    |
| `{{description}}`   | SEO description                                 | `"Article summary..."`            |
| `{{seo_title}}`     | SEO title                                       | `"My Article - SEO"`              |
| `{{canonical_url}}` | Canonical URL                                   | `"https://..."`                   |
| `{{tags}}`          | Array of tags                                   | `["javascript", "webdev"]`        |
| `{{categories}}`    | Array of categories                             | `["Development"]`                 |
| `{{author.name}}`   | Author full name                                | `"John Doe"`                      |
| `{{author.email}}`  | Author email                                    | `"john@example.com"`              |
| `{{author.id}}`     | Author ID                                       | `"uuid"`                          |
| `{{id}}`            | Article ID                                      | `"uuid"`                          |
| `{{published_at}}`  | Timestamp                                       | `"2025-12-26T..."`                |

### Example Mapping

```json
{
  "field_mapping": {
    "title": "{{title}}",
    "body": "{{content}}",
    "slug": "{{slug}}",
    "author": "{{author.name}}",
    "tags": "{{tags}}",
    "metadata": {
      "seo_title": "{{seo_title}}",
      "description": "{{description}}"
    }
  }
}
```

**Resulting Payload:**

```json
{
  "title": "My Article",
  "body": "<p>HTML content...</p>",
  "slug": "my-article",
  "author": "John Doe",
  "tags": ["javascript", "webdev"],
  "metadata": {
    "seo_title": "My Article - Complete Guide",
    "description": "This is a comprehensive guide..."
  }
}
```

---

## Complete Configuration Example

### For Adonis.js API

```json
{
  "label": "Surajondev API",
  "webhook_url": "https://surajondev-adonis.onrender.com/articles",
  "content_format": "html",
  "response_id_field": "id",
  "update_url": "https://surajondev-adonis.onrender.com/articles/{id}",
  "delete_url": "https://surajondev-adonis.onrender.com/articles/{id}",
  "headers": {
    "Authorization": "Bearer your-api-token"
  },
  "field_mapping": {
    "title": "{{title}}",
    "markdown": "{{content}}",
    "slug": "{{slug}}",
    "description": "{{description}}",
    "canonicalUrl": "{{canonical_url}}",
    "authorId": "{{author.id}}",
    "tag": "{{tags}}"
  }
}
```

---

## Logging & Debugging

All webhook operations are logged with detailed information:

### Log Output Example

```
===== Custom Webhook Publishing =====
Webhook URL: https://api.example.com/articles
Content Format: html
Headers: {"Content-Type"=>"application/json", "Authorization"=>"Bearer ..."}
Payload: {"title":"My Article","body":"<p>...</p>"}
Publish Response Status: 200
Publish Response Headers: {"content-type"=>"application/json"}
Publish Response Body: {"id":"abc123","status":"published"}
Extracted ID from response: abc123
======================================
```

### Logs Include:

- Request method and URL
- Content format being used
- Headers sent
- Complete payload
- Response status code
- Response headers
- Response body
- Extracted external ID

---

## Testing Your Webhook

### Step 1: Configure Integration

Create integration with basic settings:

```json
{
  "webhook_url": "https://your-api.com/articles"
}
```

### Step 2: Publish Test Article

The adapter will:

1. POST to your webhook
2. Log the request/response
3. Extract the ID from response

### Step 3: Check Logs

Look for:

- ✅ 200-299 status code
- ✅ ID extracted successfully
- ❌ Any errors in response body

### Step 4: Test Update/Delete

- Update: Verify PATCH request works
- Unpublish: Verify DELETE request works

---

## Error Handling

### Publish Failed

If webhook returns non-2xx status:

```
Custom Webhook FAILED: {"error":"Validation failed"}
```

Article publication status will be marked as `failed`.

### Update/Delete Not Supported

If your API doesn't support PATCH/DELETE:

```
Update failed: {"error":"Method not allowed"}
```

These operations will log a warning but won't fail the operation.

---

## Migration from Default Payload

### Default Payload Structure

Without `field_mapping`, the adapter sends:

```json
{
  "event": "publish_article",
  "timestamp": "2025-12-26T12:00:00Z",
  "data": {
    "id": "article-uuid",
    "title": "My Article",
    "content": "Markdown or HTML content",
    "slug": "my-article",
    "canonical_url": "https://...",
    "tags": ["tag1", "tag2"],
    "author": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Migration to Custom Mapping

To match your API format, add `field_mapping`:

```json
{
  "field_mapping": {
    "title": "{{title}}",
    "body": "{{content}}",
    "slug": "{{slug}}"
  }
}
```

---

## Best Practices

1. **Always set `content_format`** - Specify `"html"` or `"markdown"` based on what your API expects
2. **Configure `response_id_field`** - Ensure ID extraction works correctly
3. **Test CRUD operations** - Verify all operations work before production
4. **Use secure headers** - Add authentication tokens in `headers`
5. **Monitor logs** - Check Rails logs for webhook request/response details

---

## Troubleshooting

### ID Not Extracted

**Problem:** `external_id` is `null`

**Solution:** Set `response_id_field`:

```json
{
  "response_id_field": "id" // or "data.id", "_id", etc.
}
```

### Wrong Content Format

**Problem:** API expects HTML but receives Markdown

**Solution:** Set content format:

```json
{
  "content_format": "html"
}
```

### Update/Delete URL Wrong

**Problem:** PATCH/DELETE requests go to wrong URL

**Solution:** Configure custom URLs:

```json
{
  "update_url": "https://api.example.com/posts/{id}/edit",
  "delete_url": "https://api.example.com/posts/{id}"
}
```

---

## Summary

| Feature         | Setting             | Default                          |
| --------------- | ------------------- | -------------------------------- |
| Content Format  | `content_format`    | `"markdown"`                     |
| Create Endpoint | `webhook_url`       | Required                         |
| Update Endpoint | `update_url`        | `{webhook_url}/{id}`             |
| Delete Endpoint | `delete_url`        | `{webhook_url}/{id}`             |
| ID Field        | `response_id_field` | Auto-detect                      |
| Headers         | `headers`           | `Content-Type: application/json` |
| Field Mapping   | `field_mapping`     | Default payload                  |
