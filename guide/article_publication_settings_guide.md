# Article Publication Settings API Guide

This guide details how the frontend should save and retrieve platform-specific settings (like Dev.to Series, Organizations, Custom Webhook authors, etc.) for each article publication.

## 1. Overview

When creating or updating an article, you can attach specific configuration for each integration using the `publication_settings` field within `article_publications_attributes`.

**Key Concept**: These settings override the default integration settings for _this specific article_.

## 2. Saving Settings

**Endpoint**: `POST /api/v1/blogs/:blog_id/articles` (Create) or `PATCH /api/v1/blogs/:blog_id/articles/:id` (Update)

### Payload Structure

The `publication_settings` is a JSON object where keys are the platform names (e.g., `devto`, `hashnode`) and values are their specific overrides.

```json
{
  "article": {
    "title": "My Article",
    "article_publications_attributes": [
      {
        "integration_id": "uuid-of-devto-integration",
        "publication_settings": {
          "devto": {
            "organization_id": "12345",
            "series": "my-tutorial-series"
          }
        }
      },
      {
        "integration_id": "uuid-of-hashnode-integration",
        "publication_settings": {
          "hashnode": {
            "slug": "custom-article-slug"
          }
        }
      }
    ]
  }
}
```

### Supported Settings by Platform

#### Dev.to (`devto`)

| Key               | Type       | Description                                    |
| :---------------- | :--------- | :--------------------------------------------- |
| `organization_id` | String/Int | The ID of the organization to publish under.   |
| `series`          | String     | The name of the series to add this article to. |

#### Hashnode (`hashnode`)

| Key    | Type   | Description                              |
| :----- | :----- | :--------------------------------------- |
| `slug` | String | Custom slug for the article on Hashnode. |

#### Custom Webhook

| Key   | Type | Description                                                                                   |
| :---- | :--- | :-------------------------------------------------------------------------------------------- |
| (Any) | Any  | Any custom field defined in your webhook's field mapping (e.g., `category`, `custom_author`). |

## 3. Retrieving Settings

When you fetch an article, the API returns the saved `publication_settings` so you can populate the UI (e.g., show the selected Series in the dropdown).

**Endpoint**: `GET /api/v1/blogs/:blog_id/articles/:id`

**Response**:

```json
{
  "id": "article-uuid",
  "article_publications": [
    {
      "id": "pub-uuid",
      "integration_id": "...",
      "publication_settings": {
        "devto": {
          "organization_id": "12345",
          "series": "my-tutorial-series"
        }
      },
      "integration": {
        "platform": "devto"
      }
    }
  ]
}
```

## 4. Frontend Integration Flow

1.  **Discovery**: on the "Publishing Settings" panel, call the [Discovery API](integration_discovery_api_guide.md) to fetch available options (e.g., list of Orgs).
2.  **Selection**: User selects an Organization from the dropdown.
3.  **State Update**: Update your local form state:
    ```javascript
    // Example State
    {
      article_publications_attributes: [
        {
          integration_id: "...",
          publication_settings: {
            devto: { organization_id: selectedOrgId },
          },
        },
      ];
    }
    ```
4.  **Save**: Send the payload to the CREATE/UPDATE endpoints.
