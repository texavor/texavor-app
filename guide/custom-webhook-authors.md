# Custom Webhook Authors Configuration Guide

## Overview

Custom webhooks can optionally support author management if your API has an authors/users endpoint. This guide shows how to configure it.

---

## When to Use Author Support

**Use author support if:**

- Your API has multiple author accounts
- You publish to different author accounts
- Your API requires author ID in article payload

**Skip author support if:**

- Your API only has one admin account
- Author is determined by API key automatically
- You don't need author selection

---

## Configuration

### 1. Basic Custom Webhook (No Authors)

```json
{
  "label": "My API",
  "webhook_url": "https://api.example.com/articles",
  "auth_type": "bearer",
  "field_mapping": {
    "title": "{{title}}",
    "content": "{{content}}"
  }
}
```

**Credentials:**

```json
{
  "auth_token": "your-token-here"
}
```

**Result:** `supports_authors: false` - No author management available

---

### 2. Custom Webhook with Authors Support

```json
{
  "label": "My API",
  "webhook_url": "https://api.example.com/articles",
  "authors_endpoint": "https://api.example.com/users",
  "author_id_field": "id",
  "author_name_field": "name",
  "author_username_field": "username",
  "auth_type": "bearer",
  "field_mapping": {
    "title": "{{title}}",
    "content": "{{content}}",
    "authorId": "{{platform_author_id}}"
  }
}
```

**Credentials:**

```json
{
  "auth_token": "your-token-here"
}
```

**Result:** `supports_authors: true` - Author management enabled!

---

## Settings Fields

### `authors_endpoint` (Required for author support)

**Description:** Complete URL to fetch list of authors/users

**Examples:**

```json
{
  "authors_endpoint": "https://api.example.com/users"
}
```

```json
{
  "authors_endpoint": "https://api.example.com/v1/authors"
}
```

### `author_id_field` (Optional, default: `"id"`)

**Description:** Field name for author ID in API response

**When to use:** If your API uses something other than `id`

**Examples:**

```json
{
  "author_id_field": "user_id"
}
```

```json
{
  "author_id_field": "author_id"
}
```

**Supports nested fields:**

```json
{
  "author_id_field": "data.user_id"
}
```

### `author_name_field` (Optional, default: `"name"`)

**Description:** Field name for author's display name

**Examples:**

```json
{
  "author_name_field": "full_name"
}
```

```json
{
  "author_name_field": "display_name"
}
```

### `author_username_field` (Optional, default: `"username"`)

**Description:** Field name for author's username

**Examples:**

```json
{
  "author_username_field": "handle"
}
```

```json
{
  "author_username_field": "email"
}
```

---

## API Response Formats

Your authors endpoint should return JSON in one of these formats:

### Format 1: Simple Array

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "username": "janesmith",
    "email": "jane@example.com"
  }
]
```

**Configuration:**

```json
{
  "authors_endpoint": "https://api.example.com/users",
  "author_id_field": "id",
  "author_name_field": "name",
  "author_username_field": "username"
}
```

### Format 2: Nested in `authors` Key

```json
{
  "authors": [
    {
      "user_id": "abc123",
      "full_name": "John Doe",
      "handle": "johndoe"
    }
  ]
}
```

**Configuration:**

```json
{
  "authors_endpoint": "https://api.example.com/users",
  "author_id_field": "user_id",
  "author_name_field": "full_name",
  "author_username_field": "handle"
}
```

### Format 3: Nested in `data` Key

```json
{
  "data": {
    "authors": [
      {
        "id": "xyz789",
        "name": "John Doe"
      }
    ]
  }
}
```

**Configuration:**

```json
{
  "authors_endpoint": "https://api.example.com/users",
  "author_id_field": "id",
  "author_name_field": "name"
}
```

---

## Using Author ID in Payloads

Once configured, use `{{platform_author_id}}` in your field mapping:

```json
{
  "field_mapping": {
    "title": "{{title}}",
    "content": "{{content}}",
    "authorId": "{{platform_author_id}}",
    "author": "{{platform_author_id}}"
  }
}
```

**What happens:**

1. User selects an author (or uses default)
2. System replaces `{{platform_author_id}}` with selected author's `external_id`
3. Sends to your API with correct author reference

---

## Complete Example: Adonis.js API

### API Structure

**Authors Endpoint:**

```
GET https://surajondev-adonis.onrender.com/users
Authorization: Bearer token123

Response:
[
  { "id": 1, "name": "Suraj", "username": "surajondev" },
  { "id": 2, "name": "Admin", "username": "admin" }
]
```

**Articles Endpoint:**

```
POST https://surajondev-adonis.onrender.com/articles
Authorization: Bearer token123
Content-Type: application/json

{
  "title": "My Article",
  "markdown": "# Content here",
  "authorId": 1,
  "slug": "my-article"
}
```

### Configuration

**Settings:**

```json
{
  "label": "Surajondev API",
  "webhook_url": "https://surajondev-adonis.onrender.com/articles",
  "authors_endpoint": "https://surajondev-adonis.onrender.com/users",
  "author_id_field": "id",
  "author_name_field": "name",
  "author_username_field": "username",
  "auth_type": "bearer",
  "content_format": "markdown",
  "field_mapping": {
    "title": "{{title}}",
    "markdown": "{{content}}",
    "authorId": "{{platform_author_id}}",
    "slug": "{{slug}}"
  }
}
```

**Credentials:**

```json
{
  "auth_token": "your-bearer-token-here"
}
```

---

## Frontend Integration

### Check if Platform Supports Authors

```typescript
// From GET /api/v1/blogs/:blog_id/integrations
{
  "integrations": [
    {
      "id": "devto",
      "name": "Dev.to",
      "supports_authors": true  // ✅ Show fetch authors button
    },
    {
      "id": "custom_webhook",
      "name": "My API",
      "supports_authors": true,  // ✅ Has authors_endpoint configured
      "settings": {
        "authors_endpoint": "https://api.example.com/users"
      }
    },
    {
      "id": "webflow",
      "name": "Webflow",
      "supports_authors": false  // ❌ Don't show fetch authors button
    }
  ]
}
```

### Conditional UI

```tsx
{
  integration.supports_authors && (
    <Button onClick={() => fetchAuthors(integration.id)}>Fetch Authors</Button>
  );
}
```

---

## Testing

### 1. Add Configuration

Add `authors_endpoint` and field mappings to your custom webhook settings.

### 2. Test Fetch

```http
POST /api/v1/blogs/:blog_id/integrations/:id/fetch_authors
```

**Expected:** Returns list of authors from your API

### 3. Verify Storage

```http
GET /api/v1/blogs/:blog_id/integrations/:id/authors
```

**Expected:** Returns stored authors

### 4. Test Publishing

Publish article → Check that `{{platform_author_id}}` is replaced with correct ID

---

## Troubleshooting

### No Authors Returned

**Possible causes:**

1. `authors_endpoint` not configured
2. API authentication failing
3. API returns different response format

**Solution:**
Check logs for API response, verify field names match your API.

### Wrong Author ID

**Problem:** API receives wrong author ID

**Solution:**

- Check `author_id_field` matches your API
- Verify `{{platform_author_id}}` is in field_mapping
- Check correct author is selected/default

### Authentication Fails

**Problem:** 401/403 when fetching authors

**Solution:**

- Verify `auth_type` and credentials
- Check if authors endpoint requires different auth
- Some APIs use same auth for both endpoints

---

## Summary

**To enable author support:**

1. ✅ Add `authors_endpoint` to settings
2. ✅ Configure field names (if not using defaults)
3. ✅ Use `{{platform_author_id}}` in field_mapping
4. ✅ Fetch authors from platform
5. ✅ Publish with selected author

**Result:** `supports_authors: true` and full author management! 🎯
