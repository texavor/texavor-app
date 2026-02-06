# Publication Management API Guide

This guide covers how to manage article publications, including removing specific integrations and handling the updated publish flow.

## 1. Remove a Publication Integration

Use this to remove a specific integration from an article's publication list.

**Endpoint**: `DELETE /api/v1/blogs/:blog_id/articles/:article_id/publications/:id`

**Response (Success)**:

```json
{
  "message": "Publication integration removed from article",
  "id": "123"
}
```

**Response (Error - Already Published)**:

> [!IMPORTANT]
> You cannot delete a publication that has already succeeded. You must unpublish it first.

```json
{
  "error": "Cannot remove a successful publication record. Unpublish it first."
}
```

---

## 2. Publish with Selection

The `publish` endpoint now correctly handles the `integration_ids` array, including empty lists.

**Endpoint**: `POST /api/v1/blogs/:blog_id/articles/:id/publish`

**Payload**:

```json
{
  "integration_ids": ["uuid-1", "uuid-2"]
}
```

### Handling Empty Selections (Deselecting All)

To clear all selected integrations and stop them from being published:

```json
{
  "integration_ids": []
}
```

**Response**:

```json
{
  "message": "Article publishing started",
  "publications": [
    {
      "id": "uuid",
      "integration_id": "uuid-1",
      "platform": "hashnode",
      "status": "pending"
    }
  ]
}
```

---

## Frontend Integration Tips

### TanStack Query Usage

When removing a publication, invalidate the article publications query:

```typescript
const deleteSource = useMutation({
  mutationFn: (pubId: string) =>
    axiosInstance.delete(
      `/api/v1/blogs/${blogId}/articles/${articleId}/publications/${pubId}`,
    ),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["article", articleId, "publications"],
    });
    toast.success("Platform removed from article");
  },
});
```

### Unpublishing vs Deleting

- **Unpublish**: Physically removes the post from the external platform (Hashnode, Medium, etc.) but keeps the record in EasyWrite as `pending`.
- **Remove (Delete)**: Removes the association between the article and that specific account entirely.
