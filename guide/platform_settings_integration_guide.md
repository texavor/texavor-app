# Platform Settings & Discovery Integration Guide

This guide describes how to implement **platform-specific settings** (like Dev.to Series, Hashnode Subtitle, or Authors) for article publications. Use this guide to build the "Publishing Settings" UI for each integration.

## 1. Overview

For each integration connected to an article, you can:

1.  **Discover** available options (e.g., list of Series, Organizations, Authors) from the third-party platform.
2.  **Save** the selected options to the article using `publication_settings`.

## 2. API Reference

### Discovery API (Getting Options)

**Endpoint:** `POST /api/v1/blogs/:blog_id/integrations/:integration_id/discover`

**Response:**

```json
{
  "success": true,
  "discovered": {
    "organizations": [ ... ],
    "series": [ ... ],
    "authors": [ ... ]
  }
}
```

### Savings Settings via Article API

**Endpoint:** `POST /api/v1/blogs/:blog_id/articles` (Create) or `PATCH .../:id` (Update)

**Payload:**

```json
{
  "article": {
    "article_publications_attributes": [
      {
        "integration_id": "uuid...",
        "publication_settings": {
          "devto": { "series": "my-series" }
        }
      }
    ]
  }
}
```

---

## 3. Supported Platforms & Settings

### Dev.to (`devto`)

| Setting Key       | Label        | Input Type          | Data Source (Discovery)                 |
| :---------------- | :----------- | :------------------ | :-------------------------------------- |
| `organization_id` | Organization | Select              | `discovered.organizations`              |
| `series`          | Series       | Select/Combobox     | `discovered.series`                     |
| `tags`            | Tags         | Select/Multi-select | `discovered.tags` (Top 30 popular tags) |

**Discovery Response Example:**

```json
"discovered": {
  "organizations": [{ "label": "My Org", "value": "123" }],
  "series": ["Series A", "Series B"],
  "tags": ["javascript", "webdev", "react"]
}
```

---

### Hashnode (`hashnode`)

| Setting Key        | Label            | Input Type | Data Source                        |
| :----------------- | :--------------- | :--------- | :--------------------------------- |
| `subtitle`         | Subtitle         | Text Input | (Manual)                           |
| `series_id`        | Series           | Select     | `discovered.publications[].series` |
| `disable_comments` | Disable Comments | Toggle     | (Manual)                           |
| `slug`             | Slug Override    | Text Input | (Manual)                           |

**Discovery Response Example:**

```json
"discovered": {
  "publications": [
    {
      "label": "My Blog",
      "value": "pub_id",
      "series": [{ "label": "React Series", "value": "series_id" }]
    }
  ]
}
```

_Note: You may need to find the series inside the `publications` object matching the integration's selected publication._

---

### Webflow (`webflow`)

| Setting Key | Label  | Input Type | Data Source          |
| :---------- | :----- | :--------- | :------------------- |
| `author_id` | Author | Select     | `discovered.authors` |

**Discovery Response Example:**

```json
"discovered": {
  "authors": [{ "name": "John Doe", "external_id": "item_id_123" }]
}
```

_Note: This requires an "Authors Collection" to be configured in the main Integration settings._

---

### Custom Webhook (`custom_webhook`)

| Setting Key | Label  | Input Type | Data Source          |
| :---------- | :----- | :--------- | :------------------- |
| `author_id` | Author | Select     | `discovered.authors` |

**Discovery Response Example:**

```json
"discovered": {
  "authors": [
    {
      "name": "Jane Doe",
      "external_id": "user_123",
      "email": "jane@example.com",
      "avatar_url": "..."
    }
  ]
}
```

_Note: Discovery works only if an `authors_endpoint` is configured in the integration settings._

---

## 4. Frontend Implementation Recommendations

1.  **When opening the "Publish" modal/sheet**:
    - Find the `article_publications` for the article.
    - For each active integration, check `integration.platform`.
2.  **Fetch Options**:

    - Call the **Discovery API** for that integration.
    - Store the result (e.g., `options['devto'] = result.discovered`).

3.  **Render Inputs**:

    - **Dev.to**: Show "Organization" dropdown (map `discovered.organizations`). Show "Series" dropdown (map `discovered.series`).
    - **Hashnode**: Show "Subtitle" input. Show "Series" dropdown (find series in `discovered.publications`).
    - **Webflow/Webhook**: Show "Author" dropdown (map `discovered.authors`).

4.  **Save**:
    - Send the full `article_publications_attributes` array to the backend on save.

---

### WordPress (`wordpress`)

| Setting Key        | Label       | Input Type             | Data Source                                              |
| :----------------- | :---------- | :--------------------- | :------------------------------------------------------- |
| `author_id`        | Author      | Select                 | `discovered.authors`                                     |
| `post_status`      | Status      | Select                 | Static Options: `publish`, `draft`, `private`, `pending` |
| `default_category` | Category ID | Text/Number            | (Manual)                                                 |
| `default_tags`     | Tags        | Text (comma separated) | (Manual)                                                 |

**Discovery Response Example:**

```json
"discovered": {
  "authors": [{ "name": "Admin", "external_id": "1" }]
}
```

---

### Medium (`medium`)

| Setting Key | Label | Input Type             | Description |
| :---------- | :---- | :--------------------- | :---------- |
| `tags`      | Tags  | Text (comma separated) | limit 5.    |

_Note: Medium API usually publishes as `draft`. Author selection is limited to the authenticated user._

---

### Shopify (`shopify`)

| Setting Key | Label | Input Type             | Description             |
| :---------- | :---- | :--------------------- | :---------------------- |
| `tags`      | Tags  | Text (comma separated) | Tags for the blog post. |

_Note: Shopify Blog ID is currently configured at the Integration level, not per-article. Author selection is not currently supported._
