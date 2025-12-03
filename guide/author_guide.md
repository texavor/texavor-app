# Authors API Guide

## Overview

The Authors API allows managing authors for your blog and importing authors from connected integrations (WordPress, Medium, Webflow).

**Base URL:** `/api/v1/blogs/:blog_id/authors`

**Authentication:** Required (Bearer token)

---

## Key Features

- ✅ **Auto-Created Owner** - Blog owners are automatically added as authors when creating a blog
- ✅ **Import from Integrations** - Fetch authors from WordPress, Medium, or Webflow
- ✅ **Subscription Limits** - Author creation respects subscription tier limits
- ✅ **Smart Deduplication** - Prevents duplicate imports using external IDs

---

## Endpoints

### 1. List All Authors

**GET** `/api/v1/blogs/:blog_id/authors`

Returns all authors for a specific blog.

#### Response

```json
[
  {
    "id": "uuid-here",
    "blog_id": "blog-uuid",
    "user_id": "user-uuid",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Blog owner and primary author",
    "role": "owner",
    "active": true,
    "external_id": null,
    "external_platform": null,
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-01T10:00:00Z"
  },
  {
    "id": "uuid-here-2",
    "blog_id": "blog-uuid",
    "user_id": "user-uuid",
    "name": "Jane Smith",
    "avatar": "https://example.com/jane.jpg",
    "bio": "Guest writer specializing in tech",
    "role": "imported",
    "active": true,
    "external_id": "123",
    "external_platform": "wordpress",
    "created_at": "2025-12-01T11:00:00Z",
    "updated_at": "2025-12-01T11:00:00Z"
  }
]
```

#### Response Fields

| Field               | Type              | Description                                   |
| ------------------- | ----------------- | --------------------------------------------- |
| `id`                | UUID              | Author's unique identifier                    |
| `blog_id`           | UUID              | Associated blog ID                            |
| `user_id`           | UUID              | User who created/owns this author             |
| `name`              | string            | Author's display name                         |
| `avatar`            | string (nullable) | Author's profile image URL                    |
| `bio`               | string (nullable) | Author biography                              |
| `role`              | string            | `"owner"`, `"imported"`, or `"writer"`        |
| `active`            | boolean           | Whether author is active                      |
| `external_id`       | string (nullable) | ID from external platform                     |
| `external_platform` | string (nullable) | Platform source (`wordpress`, `medium`, etc.) |

---

### 2. Get Single Author

**GET** `/api/v1/blogs/:blog_id/authors/:id`

Retrieves a specific author by ID.

#### Response

```json
{
  "id": "uuid-here",
  "blog_id": "blog-uuid",
  "user_id": "user-uuid",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Blog owner and primary author",
  "role": "owner",
  "active": true,
  "external_id": null,
  "external_platform": null,
  "created_at": "2025-12-01T10:00:00Z",
  "updated_at": "2025-12-01T10:00:00Z"
}
```

---

### 3. Create Author

**POST** `/api/v1/blogs/:blog_id/authors`

Creates a new author for the blog.

> **Note:** This endpoint is subject to subscription limits. Trial tier allows 3 authors.

#### Request Body

```json
{
  "author": {
    "name": "Jane Smith",
    "avatar": "https://example.com/jane.jpg",
    "bio": "Guest writer specializing in tech",
    "role": "writer",
    "active": true
  }
}
```

#### Request Fields

| Field    | Type    | Required | Description                       |
| -------- | ------- | -------- | --------------------------------- |
| `name`   | string  | ✅ Yes   | Author's display name             |
| `avatar` | string  | No       | Profile image URL                 |
| `bio`    | string  | No       | Author biography                  |
| `role`   | string  | No       | Author role (default: `"writer"`) |
| `active` | boolean | No       | Active status (default: `true`)   |

#### Success Response (201)

```json
{
  "id": "uuid-here",
  "blog_id": "blog-uuid",
  "user_id": "user-uuid",
  "name": "Jane Smith",
  "avatar": "https://example.com/jane.jpg",
  "bio": "Guest writer specializing in tech",
  "role": "writer",
  "active": true,
  "external_id": null,
  "external_platform": null,
  "created_at": "2025-12-01T12:00:00Z",
  "updated_at": "2025-12-01T12:00:00Z"
}
```

#### Error Response - Subscription Limit (403)

```json
{
  "error": "Subscription limit reached",
  "message": "You've used 3 of 3 authors this month. Upgrade to get more!",
  "current_usage": 3,
  "limit": 3,
  "suggested_tier": "professional",
  "upgrade_required": true
}
```

---

### 4. Update Author

**PATCH** `/api/v1/blogs/:blog_id/authors/:id`

Updates an existing author.

#### Request Body

```json
{
  "author": {
    "name": "Jane Doe",
    "bio": "Updated biography",
    "active": false
  }
}
```

#### Success Response (200)

```json
{
  "id": "uuid-here",
  "blog_id": "blog-uuid",
  "user_id": "user-uuid",
  "name": "Jane Doe",
  "avatar": "https://example.com/jane.jpg",
  "bio": "Updated biography",
  "role": "writer",
  "active": false,
  "created_at": "2025-12-01T12:00:00Z",
  "updated_at": "2025-12-01T13:00:00Z"
}
```

---

### 5. Delete Author

**DELETE** `/api/v1/blogs/:blog_id/authors/:id`

Deletes an author.

> **Warning:** Cannot delete the blog owner (role: "owner")

#### Success Response (204)

No content returned.

---

### 6. Import Authors from Integration

**POST** `/api/v1/blogs/:blog_id/authors/import/:integration_id`

Imports authors from a connected integration (WordPress, Medium, or Webflow).

#### Parameters

| Parameter        | Type | Location | Description              |
| ---------------- | ---- | -------- | ------------------------ |
| `blog_id`        | UUID | Path     | Blog identifier          |
| `integration_id` | UUID | Path     | Connected integration ID |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Successfully imported 5 of 5 authors",
  "imported_count": 5,
  "total_found": 5,
  "errors": []
}
```

#### Response Fields

| Field            | Type    | Description                             |
| ---------------- | ------- | --------------------------------------- |
| `success`        | boolean | Whether import was successful           |
| `message`        | string  | Human-readable result message           |
| `imported_count` | number  | Number of authors successfully imported |
| `total_found`    | number  | Total authors found on platform         |
| `errors`         | array   | Any errors encountered during import    |

#### Error Response - Platform Not Supported (422)

```json
{
  "success": false,
  "error": "Dev.to does not support author import"
}
```

#### Error Response - Missing Configuration (422)

```json
{
  "success": false,
  "error": "Authors collection ID not configured in integration settings"
}
```

---

## Platform Support

| Platform  | Import Support | Notes                                        |
| --------- | -------------- | -------------------------------------------- |
| WordPress | ✅ Full        | Imports all users with author roles          |
| Webflow   | ✅ Conditional | Requires `authors_collection_id` in settings |
| Medium    | ✅ Limited     | Only imports authenticated user              |
| Dev.to    | ❌ No          | No authors API available                     |
| Hashnode  | ❌ No          | Single-user platform                         |
| Shopify   | ❌ No          | Not applicable                               |

---

## Frontend Integration

### TypeScript Types

```typescript
interface Author {
  id: string;
  blog_id: string;
  user_id: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: "owner" | "imported" | "writer";
  active: boolean;
  external_id?: string;
  external_platform?: string;
  created_at: string;
  updated_at: string;
}

interface CreateAuthorPayload {
  author: {
    name: string;
    avatar?: string;
    bio?: string;
    role?: string;
    active?: boolean;
  };
}

interface ImportAuthorsResponse {
  success: boolean;
  message: string;
  imported_count: number;
  total_found: number;
  errors: string[];
}
```

### Fetch All Authors

```typescript
async function fetchAuthors(blogId: string, token: string): Promise<Author[]> {
  const response = await fetch(`/api/v1/blogs/${blogId}/authors`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch authors");
  }

  return response.json();
}
```

### Create Author

```typescript
async function createAuthor(
  blogId: string,
  authorData: CreateAuthorPayload,
  token: string
): Promise<Author> {
  const response = await fetch(`/api/v1/blogs/${blogId}/authors`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authorData),
  });

  if (response.status === 403) {
    const error = await response.json();
    throw new Error(error.message); // Subscription limit error
  }

  if (!response.ok) {
    throw new Error("Failed to create author");
  }

  return response.json();
}
```

### Import Authors

```typescript
async function importAuthors(
  blogId: string,
  integrationId: string,
  token: string
): Promise<ImportAuthorsResponse> {
  const response = await fetch(
    `/api/v1/blogs/${blogId}/authors/import/${integrationId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to import authors");
  }

  return data;
}
```

### Update Author

```typescript
async function updateAuthor(
  blogId: string,
  authorId: string,
  updates: Partial<CreateAuthorPayload["author"]>,
  token: string
): Promise<Author> {
  const response = await fetch(`/api/v1/blogs/${blogId}/authors/${authorId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ author: updates }),
  });

  if (!response.ok) {
    throw new Error("Failed to update author");
  }

  return response.json();
}
```

### Delete Author

```typescript
async function deleteAuthor(
  blogId: string,
  authorId: string,
  token: string
): Promise<void> {
  const response = await fetch(`/api/v1/blogs/${blogId}/authors/${authorId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete author");
  }
}
```

---

## React Component Examples

### Authors List

```tsx
import { useState, useEffect } from "react";

function AuthorsList({ blogId, token }: { blogId: string; token: string }) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthors(blogId, token)
      .then(setAuthors)
      .finally(() => setLoading(false));
  }, [blogId, token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="authors-list">
      {authors.map((author) => (
        <div key={author.id} className="author-card">
          {author.avatar && <img src={author.avatar} alt={author.name} />}
          <h3>{author.name}</h3>
          <p>{author.bio}</p>
          <span className="role-badge">{author.role}</span>
          {author.external_platform && (
            <span className="platform-badge">
              Imported from {author.external_platform}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Import Authors Button

```tsx
function ImportAuthorsButton({
  blogId,
  integrationId,
  integrationName,
  token,
}: {
  blogId: string;
  integrationId: string;
  integrationName: string;
  token: string;
}) {
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await importAuthors(blogId, integrationId, token);

      alert(result.message);

      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }
    } catch (error) {
      alert(`Failed to import: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <button onClick={handleImport} disabled={importing}>
      {importing ? "Importing..." : `Import from ${integrationName}`}
    </button>
  );
}
```

### Create Author Form

```tsx
function CreateAuthorForm({
  blogId,
  token,
  onSuccess,
}: {
  blogId: string;
  token: string;
  onSuccess: (author: Author) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const author = await createAuthor(blogId, { author: formData }, token);
      onSuccess(author);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <textarea
        placeholder="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
      />

      <input
        type="url"
        placeholder="Avatar URL"
        value={formData.avatar}
        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
      />

      <button type="submit">Create Author</button>
    </form>
  );
}
```

---

## Subscription Limits

Authors are subject to subscription tier limits:

| Tier         | Author Limit |
| ------------ | ------------ |
| Trial        | 3            |
| Starter      | 3            |
| Professional | 10           |
| Business     | Unlimited    |
| Enterprise   | Unlimited    |

**Note:** The blog owner (auto-created author) counts toward these limits.

---

## Best Practices

1. **Check Limits Before Creating** - Display current usage to users
2. **Handle Import Errors Gracefully** - Some authors may fail to import
3. **Display Import Source** - Show `external_platform` badge for imported authors
4. **Cache Author List** - Authors don't change frequently
5. **Validate Avatar URLs** - Ensure valid image URLs before submission

---

## Troubleshooting

### Import Returns 0 Authors

**WordPress:**

- Verify integration has valid credentials
- Check if WordPress site has any users

**Webflow:**

- Ensure `authors_collection_id` is set in integration settings
- Verify collection exists and has items

**Medium:**

- Medium only returns the authenticated user (expected behavior)

### Cannot Delete Owner

Blog owners (role: `"owner"`) cannot be deleted. This is by design to ensure blogs always have at least one author.

### Subscription Limit Errors

When hitting limits, guide users to upgrade their subscription. Display the `suggested_tier` from the error response.

---

## Rate Limiting

Author endpoints follow the general API rate limits:

- **Per Minute:** 100 requests
- **Per Hour:** 1000 requests

Import operations may take longer for platforms with many authors (e.g., WordPress sites with 100+ users).
