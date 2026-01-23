# Article Filtering API Guide

Use the `status` query parameter to filter articles on the dashboard.

## Endpoint

`GET /api/v1/blogs/:blog_id/articles`

## Status Filters

| Value       | Description                                                                    |
| :---------- | :----------------------------------------------------------------------------- |
| `all`       | **Default.** Returns articles of ALL statuses.                                 |
| `draft`     | Not yet published or scheduled.                                                |
| `published` | Successfully published to **ALL** intended platforms (or Primary).             |
| `partial`   | **[NEW]** Published to _some_ platforms, but at least one failed.              |
| `failed`    | **[NEW]** Failed to publish to **ALL** intended platforms. Attention required. |
| `scheduled` | Scheduled for future publication.                                              |

## Example Usage

### Fetch "Attention Needed" (Standard View)

Show failed and partial items at the top.

```javascript
// Fetch failed items
const failed = await axios.get("/articles?status=failed");

// Fetch partial items
const partial = await axios.get("/articles?status=partial");
```

### Fetch Clean List

```javascript
// Fetch only fully published items
const published = await axios.get("/articles?status=published");
```

## Response Shape

```json
{
  "articles": [
    {
      "id": 101,
      "title": "My Post",
      "status": "partial", // <--- Check this field
      "article_publications": [
        { "platform": "devto", "status": "success" },
        { "platform": "hashnode", "status": "failed", "error": "Invalid Key" }
      ]
    }
  ]
}
```
