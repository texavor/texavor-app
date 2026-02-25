# Article Refetch API Guide

This guide describes how the frontend can integrate the new "Refetch Content" functionality to fetch articles with structured (Heading, Tables, etc) content.

## Endpoints

### 1. Refetch Article Content

Re-fetches the article from its source URL and parses it with structure preservation.

- **URL**: `/api/v1/blogs/:blog_id/articles/:id/refetch`
- **Method**: `POST`
- **Auth Required**: YES
- **Status Codes**:
  - `200 OK`: Refetch completed successfully.
  - `404 Not Found`: Blog or Article not found.
  - `422 Unprocessable Entity`: Article has no source URL.

#### Example Request

```typescript
const refetchMutation = useMutation({
  mutationFn: async ({
    blogId,
    articleId,
  }: {
    blogId: string;
    articleId: string;
  }) => {
    return axiosInstance.post(
      `/api/v1/blogs/${blogId}/articles/${articleId}/refetch`,
    );
  },
});
```

### 2. Check Fetch Status

The `Article` object now includes a `fetched_with_structure` field.

- **Field**: `fetched_with_structure` (boolean)
- **True**: Content was fetched and parsed as Markdown (headings, tables preserved).
- **False**: Content was fetched as plain text (default for old articles).

## Implementation Strategy

### Status Indicator

You can show a notice or icon if an article was fetched without structure:

```tsx
{
  !article.fetched_with_structure && (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Plain Text Content</AlertTitle>
      <AlertDescription>
        This article was imported as plain text. Headers and tables might be
        missing.
        <Button onClick={handleRefetch} size="sm" variant="link">
          Fix structure
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

### Refreshing UI

Since the refetching happens in a background job, you should poll the article data or notify the user to refresh the page after a few seconds.

1.  User clicks **Refetch**.
2.  Frontend shows a loading state/toast "Refetching started...".
3.  Wait 5-10 seconds.
4.  Invalidate the article query: `queryClient.invalidateQueries(['article', id])`.

---

### 3. Linking External IDs

When you import or link an article that exists on an external platform, you can provide the `external_id` through `article_publications_attributes`. This allows the "Update" functionality to work for that specific integration.

#### Example Update/Link Request

```typescript
const updateMutation = useMutation({
  mutationFn: async (payload: any) => {
    return axiosInstance.patch(
      `/api/v1/blogs/${blogId}/articles/${articleId}`,
      {
        article: {
          article_publications_attributes: [
            {
              integration_id: "your-integration-uuid",
              external_id: "external-post-id-123", // The ID from your platform
            },
          ],
        },
      },
    );
  },
});
```
