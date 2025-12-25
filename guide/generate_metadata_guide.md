# Article Metadata Generation API Guide

## Overview

This API allows you to on-demand generate specific metadata fields for an article using AI. You can request generation for `description` (SEO optimized), `tags`, `categories`, or `key_phrases`.

**Base URL**: `/api/v1/blogs/:blog_id/articles/:article_id`

---

## Generate Metadata

Triggers AI generation for specified fields and updates the article.

- **Endpoint**: `POST /generate_metadata`
- **Content-Type**: `application/json`

### Request Body

| Parameter | Type            | Description                                                                                             |
| :-------- | :-------------- | :------------------------------------------------------------------------------------------------------ |
| `targets` | `Array<String>` | List of fields to generate. Allowed values: `"description"`, `"tags"`, `"categories"`, `"key_phrases"`. |

#### Examples

**Generate Description Only (SEO Optimized):**

```json
{
  "targets": ["description"]
}
```

_Note: This generates a `seo_description` optimized to be between 150-160 characters._

**Generate Tags and Categories:**

```json
{
  "targets": ["tags", "categories"]
}
```

### Response

Returns the updated fields of the article.

**Success (200 OK):**

```json
{
  "success": true,
  "article": {
    "id": "uuid",
    "seo_description": "Learn how to build a web app with Ruby on Rails step-by-step. This guide covers everything from setup to deployment in a concise manner.",
    "tags": ["ruby", "rails", "web development"],
    "categories": null,
    "key_phrases": null
  }
}
```

**Error (422 Unprocessable Entity):**

```json
{
  "error": "No targets specified"
}
```

---

## Behavior Notes

1.  **Partial Updates**: The API only updates the requested fields. Existing values for other fields are preserved.
2.  **SEO Description**: When `"description"` is requested, the AI is explicitly instructed to generate a summary between **150 and 160 characters**.
3.  **Tags**: Generates up to 5 relevant tags.
4.  **Categories**: Generates max 2 specific categories.
