# Frontend API Guide: Author Management

This guide explains how to implement author fetching and management for Webflow, WordPress, and Custom Webhook integrations.

## 1. Overview

The author management flow relies on three main markers in the `integrations` list:

1. **`supports_authors`**: (Boolean) Indicates if the platform _can_ support authors.
2. **`is_connected`**: (Boolean) Indicates if the user has connected this account.
3. **`is_ready_for_authors`**: (Boolean) Indicates if the configuration is complete (e.g., Webflow has a collection ID, Custom Webhook has a URL) and authors are ready to be fetched.

---

## 2. Webflow Implementation

Webflow requires a specific "Authors" collection to exist in the CMS.

### Step A: Discovery

Check the `integrations` list. Webflow will have `supports_authors: true`.

### Step B: List Collections (Optional but Recommended)

To help the user find their "Authors" collection ID:
**Endpoint**: `GET /api/v1/blogs/:blog_id/integrations/:integration_id/collections`

- **Response**: A list of collections with `id` and `display_name`.
- **Action**: The user selects the collection and you save the `id` as `authors_collection_id` in the integration settings.

### Step C: Fetch Authors

**Endpoint**: `POST /api/v1/blogs/:blog_id/integrations/:integration_id/fetch_authors`

- **Prerequisite**: `authors_collection_id` must be set in settings.
- **Result**: Imports all items from that collection as authors.

---

## 3. WordPress Implementation

WordPress uses the native `/wp-json/wp/v2/users` API.

### Step A: Discovery

Check the `integrations` list. WordPress will have `supports_authors: true`.

### Step B: Fetch Authors

**Endpoint**: `POST /api/v1/blogs/:blog_id/integrations/:integration_id/fetch_authors`

- **Result**: Imports all users with the "author" or higher role from the WordPress site. No extra configuration is needed beyond the base connection.

---

## 4. Custom Webhook Implementation

Supporting custom authors via a user-defined URL.

### Step A: Configuration

The user must provide an `authors_endpoint` URL in the settings.
Optional mapping fields:

- `author_id_field`: JSON path to the ID (default: `"id"`)
- `author_name_field`: JSON path to the Name (default: `"name"`)
- `author_username_field`: JSON path to the username (default: `"username"`)

### Step B: Discovery

If `authors_endpoint` is present, the integration metadata will automatically show `supports_authors: true`.

### Step C: Fetch Authors

**Endpoint**: `POST /api/v1/blogs/:blog_id/integrations/:integration_id/fetch_authors`

- **Result**: Hits the user's URL, parses the list using the mapping, and imports the authors.

---

## 5. Backend Response Format

All `fetch_authors` calls return:

```json
{
  "success": true,
  "authors": [
    {
      "id": "uuid-in-db",
      "external_id": "id-on-platform",
      "name": "Author Name",
      "username": "author_user",
      "display_name": "Author Name (author_user)",
      "is_default": true
    }
  ]
}
```

## 6. Listing Saved Authors

To show the list of authors _after_ they've been imported:
**Endpoint**: `GET /api/v1/blogs/:blog_id/integrations/:integration_id/authors`

---

### 6.1 Identifying Defaults in the Main List

When fetching the general list of authors (`GET /api/v1/blogs/:blog_id/authors`), each author now includes a `platform_defaults` array.

- **`platform_defaults`**: An array of platform names (e.g., `["webflow", "wordpress"]`) where this specific author is currently set as the default.
- **Usage**: Use this to show "Default" badges in your main Author Management UI without making extra API calls.

---

## 7. Setting a Default Author

Users can designate one author as the "Default" for an integration.
**Endpoint**: `PATCH /api/v1/blogs/:blog_id/integrations/:integration_id/authors/:author_id/set_default`

- **Behavior**: Setting an author as default automatically unmarks any previous default author for that specific integration.
- **Usage**: Use this to ensure there's always a fallback author for automated or quick publishing.

---

## 8. Publishing with Authors

When publishing an article via the API, the author is handled as follows:

### Option A: Explicit Selection

Send the `platform_author_id` in your publication payload.

```json
{
  "article_publications": [
    {
      "integration_id": "...",
      "platform_author_id": "uuid-of-platform-author"
    }
  ]
}
```

### Option B: Automatic Fallback (No Selection)

If you do **not** provide `platform_author_id`, the backend will automatically:

1. Look for the author marked `is_default: true` for that integration.
2. Use that author's credentials for the platform post.

---

### 8.1 Sending to EasyWrite (Frontend)

When you `PATCH` an article to select an author, use the `article_publications_attributes` key:

**Endpoint**: `PATCH /api/v1/blogs/:blog_id/articles/:id`

```json
{
  "article": {
    "article_publications_attributes": [
      {
        "id": "uuid-of-the-publication-record",
        "platform_author_id": "uuid-of-platform-author"
      }
    ]
  }
}
```

---

### 8.2 Receiving in Custom Webhook (Your Server)

When EasyWrite hits your webhook after a successful publish, it includes the author ID in the payload:

- **Default Key**: `author_id` (contains the `external_id` you provided during import).
- **Custom Mapping**: If you use "Field Mapping", you can use the variable `{{author_id}}` or `{{platform_author_id}}` to place it in your custom JSON structure.

> [!IMPORTANT]
> Always ensure at least one author is marked as default (this usually happens automatically during the first import) to prevent "Unknown Author" errors on platforms that require attribution.
