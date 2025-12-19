# Linking Article to Saved Result Guide

This guide explains how to associate an Article with a Saved Result (e.g., an Outline or Keyword Result) and how to verify that link.

## 1. Creating the Link

To link an article to a saved result (like an outline), pass the `saved_result_id` in the request body when creating the article.

### Endpoint

`POST /api/v1/blogs/:blog_id/articles`

### Request Body

```json
{
  "article": {
    "title": "My New Article",
    "content": "Article content...",
    "status": "draft",
    "saved_result_id": "uuid-of-the-saved-result-here"
  }
}
```

## 2. Verifying the Link (Fetching)

When you fetch a SavedResult (e.g., to display an Outline), the API automatically includes any linked articles in the response.

### Endpoint

`GET /api/v1/blogs/:blog_id/saved_results/:id`

### Response Example

```json
{
  "data": {
    "id": "uuid...",
    "title": "My Outline",
    "result_type": "outline_generation",
    "articles": [
      {
        "id": "article-uuid...",
        "title": "My New Article",
        "slug": "my-new-article",
        "status": "draft",
        "published_at": null
      }
    ]
  }
}
```

## 3. Deletion Protection

If you try to delete a `SavedResult` that is linked to an `Article`, the API will return a 422 error, preventing accidental data loss of the source material.
