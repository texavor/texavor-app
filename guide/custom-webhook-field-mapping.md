# Custom Webhook Field Mapping - Available Variables

This document lists all available variables that can be used in custom webhook field mappings.

## How Field Mapping Works

When configuring a custom webhook, you can specify how article data should be mapped to your API's expected fields using the `field_mapping` setting.

**Example:**

```json
{
  "field_mapping": {
    "post_title": "{{title}}",
    "post_content": "{{content}}",
    "featured_img": "{{image_url}}"
  }
}
```

---

## Available Variables

### Content Variables

| Variable              | Description                                          | Example Value                     |
| --------------------- | ---------------------------------------------------- | --------------------------------- |
| `{{title}}`           | Article title                                        | "How to Build a REST API"         |
| `{{content}}`         | Article content (markdown or HTML based on settings) | "# Introduction\n\nThis guide..." |
| `{{slug}}`            | URL-friendly slug                                    | "how-to-build-rest-api"           |
| `{{description}}`     | SEO description                                      | "Learn how to build..."           |
| `{{seo_title}}`       | SEO title (falls back to title)                      | "How to Build a REST API - Guide" |
| `{{seo_description}}` | SEO description                                      | "Complete guide to building..."   |
| `{{canonical_url}}`   | Canonical URL                                        | "https://example.com/article"     |

### Image Variables

| Variable        | Description     | Example Value                       |
| --------------- | --------------- | ----------------------------------- |
| `{{image_url}}` | Cover image URL | "https://cdn.example.com/cover.jpg" |

> **Note:** Map this to whatever field name your webhook expects (e.g., `featured_image`, `cover`, `thumbnail`, etc.).

### Taxonomy Variables

| Variable         | Description        | Example Value        | Type  |
| ---------------- | ------------------ | -------------------- | ----- |
| `{{tags}}`       | Article tags       | `["seo", "content"]` | Array |
| `{{categories}}` | Article categories | `["tutorials"]`      | Array |

### Metadata Variables

| Variable           | Description                      | Example Value          |
| ------------------ | -------------------------------- | ---------------------- |
| `{{published_at}}` | Publication timestamp (ISO 8601) | "2026-01-21T12:00:00Z" |
| `{{id}}`           | Article ID                       | 123                    |
| `{{blog_id}}`      | Blog ID                          | 456                    |

### Author Variables

| Variable                 | Description                                  | Example Value      |
| ------------------------ | -------------------------------------------- | ------------------ |
| `{{author.name}}`        | Author full name                             | "John Doe"         |
| `{{author.email}}`       | Author email                                 | "john@example.com" |
| `{{author.id}}`          | Author user ID                               | 789                |
| `{{author.external_id}}` | Platform author ID (from settings)           | "ext_123"          |
| `{{author_id}}`          | Dynamic author ID (from settings or user ID) | "ext_123" or 789   |
| `{{author_id_numeric}}`  | Numeric author ID                            | 123                |

---

## Usage Examples

### Example 1: WordPress-Compatible Mapping

```json
{
  "field_mapping": {
    "title": "{{title}}",
    "content": "{{content}}",
    "featured_media": "{{image_url}}",
    "author": "{{author_id}}",
    "slug": "{{slug}}",
    "tags": "{{tags}}"
  }
}
```

### Example 2: Ghost-Compatible Mapping

```json
{
  "field_mapping": {
    "title": "{{title}}",
    "html": "{{content}}",
    "feature_image": "{{image_url}}",
    "slug": "{{slug}}",
    "published_at": "{{published_at}}"
  }
}
```

### Example 3: Custom API with Nested Structure

```json
{
  "field_mapping": {
    "article": {
      "headline": "{{title}}",
      "body": "{{content}}",
      "cover_photo": "{{image_url}}",
      "metadata": {
        "author_name": "{{author.name}}",
        "publish_date": "{{published_at}}"
      }
    }
  }
}
```

---

## Image Handling

### When Image is Available

If the article has a cover image (via ActiveStorage attachment or `thumbnail_url` column):

- Returns full URL to the image
- Production: Azure Blob Storage URL
- Development: Rails blob URL

### When No Image

If the article has no cover image:

- Returns `null`
- Your API should handle null values gracefully

---

## Notes

- Variables are case-sensitive: use `{{title}}` not `{{Title}}`
- Array variables (`tags`, `categories`) are passed as JSON arrays
- Numeric variables (`id`, `blog_id`) are passed as numbers, not strings
