# Shopify Blog Selection API Guide

## Overview

This guide covers the Shopify integration blog selection feature, which allows users to choose which Shopify blog to publish articles to.

## OAuth Flow

When a user connects their Shopify store via OAuth:

1. **Single Blog Store**: The `blog_id` is automatically configured
2. **Multiple Blog Store**: User must select a blog from available options

Check the integration settings after OAuth to determine if blog selection is needed:

```typescript
interface Integration {
  id: string;
  platform: "shopify";
  settings: {
    name?: string;
    email?: string;
    domain?: string;
    myshopify_domain?: string;
    blog_id?: string; // Auto-configured for single blog stores
    blog_handle?: string; // Auto-configured for single blog stores
    needs_blog_selection?: boolean; // True if user needs to select
    blog_count?: number; // Number of available blogs
  };
}
```

## API Endpoints

### 1. Fetch Available Blogs

Retrieve all blogs from the connected Shopify store.

**Endpoint:**

```
GET /api/v1/blogs/:blog_id/integrations/:integration_id/shopify/blogs
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "blogs": [
    {
      "id": "123456789",
      "title": "News",
      "handle": "news"
    },
    {
      "id": "987654321",
      "title": "Articles",
      "handle": "articles"
    }
  ],
  "auto_selected": false // true if only 1 blog exists
}
```

**Error Responses:**

- `400` - Integration is not Shopify
- `401` - Integration not authenticated
- `404` - Integration not found
- `422` - Failed to fetch blogs from Shopify

### 2. Update Blog Selection

Save the user's selected blog to integration settings.

**Endpoint:**

```
PATCH /api/v1/blogs/:blog_id/integrations/:integration_id/shopify/settings
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "blog_id": "123456789",
  "blog_handle": "news"
}
```

**Response:**

```json
{
  "success": true,
  "settings": {
    "name": "My Store",
    "email": "store@example.com",
    "domain": "mystore.com",
    "myshopify_domain": "mystore.myshopify.com",
    "blog_id": "123456789",
    "blog_handle": "news"
  }
}
```

**Error Responses:**

- `400` - Missing `blog_id` or integration is not Shopify
- `404` - Blog not found in Shopify store or integration not found
- `422` - Failed to update settings

## Frontend Implementation Example

### React/TypeScript Example

```typescript
import { useState, useEffect } from "react";

interface ShopifyBlog {
  id: string;
  title: string;
  handle: string;
}

function ShopifyBlogSelector({ integration }: { integration: Integration }) {
  const [blogs, setBlogs] = useState<ShopifyBlog[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if blog selection is needed
    if (integration.settings.needs_blog_selection) {
      fetchBlogs();
    } else if (integration.settings.blog_id) {
      setSelectedBlogId(integration.settings.blog_id);
    }
  }, [integration]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(
        `/api/v1/blogs/${blogId}/integrations/${integration.id}/shopify/blogs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setBlogs(data.blogs);

      // Auto-select if only one blog
      if (data.auto_selected && data.blogs.length === 1) {
        setSelectedBlogId(data.blogs[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  };

  const saveBlogSelection = async () => {
    setLoading(true);
    try {
      const blog = blogs.find((b) => b.id === selectedBlogId);

      await fetch(
        `/api/v1/blogs/${blogId}/integrations/${integration.id}/shopify/settings`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blog_id: selectedBlogId,
            blog_handle: blog?.handle,
          }),
        }
      );

      // Success - update UI or refetch integration
    } catch (error) {
      console.error("Failed to save blog selection:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label>Select Shopify Blog:</label>
      <select
        value={selectedBlogId}
        onChange={(e) => setSelectedBlogId(e.target.value)}
      >
        <option value="">-- Select a blog --</option>
        {blogs.map((blog) => (
          <option key={blog.id} value={blog.id}>
            {blog.title}
          </option>
        ))}
      </select>

      <button onClick={saveBlogSelection} disabled={!selectedBlogId || loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
```

## User Flow

1. **OAuth Completion**: User authorizes Shopify app
2. **Check Settings**: Frontend checks `integration.settings.needs_blog_selection`
3. **Fetch Blogs** (if needed): Call GET `/shopify/blogs` endpoint
4. **Display Selector**: Show dropdown with available blogs
5. **Save Selection**: Call PATCH `/shopify/settings` with selected blog
6. **Publishing Ready**: User can now publish articles to selected Shopify blog

## Notes

- Blog selection is required before publishing articles
- Attempting to publish without `blog_id` will result in a clear error message
- The adapter will use `settings.blog_id` to determine which blog to publish to
- Users can change their blog selection at any time via the settings update endpoint
