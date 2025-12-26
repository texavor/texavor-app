# Author Management API Guide

## Overview

The Author Management system allows you to fetch platform-specific authors, manage them per integration, and select which author to publish articles as. This guide covers all API endpoints and frontend implementation.

---

## Key Concepts

1. **EasyWrite Author** - The person writing the article (automatic from logged-in user)
2. **Platform Author** - The account on the external platform (Dev.to, Medium, etc.)
3. **Default Author** - The platform author used when no specific selection is made

**Flow:** User writes article → Publishes to Dev.to → Uses default Dev.to account (or selects different one)

---

## API Endpoints

### 1. Fetch Authors from Platform

**Endpoint:** `POST /api/v1/blogs/:blog_id/integrations/:integration_id/fetch_authors`

**Purpose:** Fetches authors from the platform API and stores them locally

**Supported Platforms:**

- Medium
- Dev.to
- Hashnode
- Custom Webhook (with configured `authors_endpoint`)

**Request:**

```http
POST /api/v1/blogs/abc-123/integrations/xyz-789/fetch_authors
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "authors": [
    {
      "id": "author-uuid",
      "external_id": "12345",
      "name": "John Doe",
      "username": "johndoe",
      "email": null,
      "is_default": true,
      "display_name": "John Doe"
    }
  ]
}
```

**What It Does:**

1. Calls platform API to get authenticated user info
2. Creates/updates `PlatformAuthor` record
3. Auto-sets as default if it's the first author
4. Returns all authors for this integration

---

### 2. List Authors

**Endpoint:** `GET /api/v1/blogs/:blog_id/integrations/:integration_id/authors`

**Purpose:** Get all stored authors for an integration

**Request:**

```http
GET /api/v1/blogs/abc-123/integrations/xyz-789/authors
Authorization: Bearer {token}
```

**Response:**

```json
{
  "authors": [
    {
      "id": "author-uuid-1",
      "external_id": "12345",
      "name": "John Doe",
      "username": "johndoe",
      "email": null,
      "is_default": true,
      "display_name": "John Doe"
    },
    {
      "id": "author-uuid-2",
      "external_id": "67890",
      "name": "Jane Smith",
      "username": "janesmith",
      "email": null,
      "is_default": false,
      "display_name": "Jane Smith"
    }
  ]
}
```

---

### 3. Set Default Author

**Endpoint:** `PATCH /api/v1/blogs/:blog_id/integrations/:integration_id/authors/:author_id/set_default`

**Purpose:** Mark an author as the default for this integration

**Request:**

```http
PATCH /api/v1/blogs/abc-123/integrations/xyz-789/authors/author-uuid/set_default
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "author": {
    "id": "author-uuid",
    "external_id": "12345",
    "name": "John Doe",
    "is_default": true
  }
}
```

**Note:** Setting an author as default automatically unsets the previous default.

---

###4. Publish with Author Selection

**Endpoint:** `POST /api/v1/blogs/:blog_id/articles/:article_id/publish`

**Purpose:** Publish article with optional author selection

**Request:**

```http
POST /api/v1/blogs/abc-123/articles/article-123/publish
Authorization: Bearer {token}
Content-Type: application/json

{
  "platforms": ["devto", "medium"],
  "platform_settings": {
    "devto": {
      "platform_author_id": "author-uuid",  // Optional: Override default
      "published": true,
      "tags": ["javascript", "webdev"]
    }
  }
}
```

**Behavior:**

- If `platform_author_id` provided → Use that author
- If not provided → Use default author for that integration
- If no default set → Use first author

---

## Frontend Implementation

### TypeScript Interfaces

```typescript
interface PlatformAuthor {
  id: string;
  external_id: string;
  name: string;
  username: string;
  email: string | null;
  is_default: boolean;
  display_name: string;
}

interface Integration {
  id: string;
  platform: string;
  is_connected: boolean;
  settings: Record<string, any>;
}
```

### API Service

```typescript
// services/authorApi.ts
export const authorApi = {
  // Fetch authors from platform
  fetchFromPlatform: async (integrationId: string) => {
    const response = await fetch(
      `/api/v1/blogs/${blogId}/integrations/${integrationId}/fetch_authors`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  // List stored authors
  listAuthors: async (integrationId: string) => {
    const response = await fetch(
      `/api/v1/blogs/${blogId}/integrations/${integrationId}/authors`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  // Set default author
  setDefault: async (integrationId: string, authorId: string) => {
    const response = await fetch(
      `/api/v1/blogs/${blogId}/integrations/${integrationId}/authors/${authorId}/set_default`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },
};
```

---

## React Components

### Author Management Component

```tsx
// components/AuthorManagement.tsx
import { useState, useEffect } from "react";
import { authorApi } from "@/services/authorApi";

export function AuthorManagement({
  integration,
}: {
  integration: Integration;
}) {
  const [authors, setAuthors] = useState<PlatformAuthor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const result = await authorApi.fetchFromPlatform(integration.id);
      if (result.success) {
        setAuthors(result.authors);
        toast.success("Authors fetched successfully");
      }
    } catch (error) {
      toast.error("Failed to fetch authors");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (authorId: string) => {
    try {
      await authorApi.setDefault(integration.id, authorId);
      // Refresh authors list
      const result = await authorApi.listAuthors(integration.id);
      setAuthors(result.authors);
      toast.success("Default author updated");
    } catch (error) {
      toast.error("Failed to update default author");
    }
  };

  useEffect(() => {
    // Load authors on mount
    authorApi.listAuthors(integration.id).then((result) => {
      setAuthors(result.authors || []);
    });
  }, [integration.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Author Management</CardTitle>
        <CardDescription>
          Manage which {integration.platform} account to publish as
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchAuthors} disabled={loading}>
            {loading ? "Fetching..." : `Fetch from ${integration.platform}`}
          </Button>

          {authors.length > 0 && (
            <div className="space-y-2">
              <Label>Available Authors</Label>
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">{author.name}</div>
                    <div className="text-sm text-muted-foreground">
                      @{author.username}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {author.is_default ? (
                      <Badge>Default</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(author.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {authors.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No authors found. Click "Fetch" to load from{" "}
              {integration.platform}.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Publishing Dialog with Author Selection

```tsx
// components/PublishDialog.tsx
export function PublishDialog({ article }: { article: Article }) {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("default");
  const [authors, setAuthors] = useState<PlatformAuthor[]>([]);

  useEffect(() => {
    if (selectedPlatform) {
      const integration = integrations.find(
        (i) => i.platform === selectedPlatform
      );
      if (integration) {
        // Load authors for this platform
        authorApi.listAuthors(integration.id).then((result) => {
          setAuthors(result.authors || []);
        });
      }
    }
  }, [selectedPlatform]);

  const handlePublish = async () => {
    const platformSettings = {
      [selectedPlatform]: {
        ...(selectedAuthor !== "default" && {
          platform_author_id: selectedAuthor,
        }),
        // Other settings...
      },
    };

    await publishArticle(article.id, {
      platforms: [selectedPlatform],
      platform_settings: platformSettings,
    });
  };

  const defaultAuthor = authors.find((a) => a.is_default);
  const showAuthorSelector = authors.length > 1;

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Article</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Platform</Label>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {integrations.map((integration) => (
                  <SelectItem key={integration.id} value={integration.platform}>
                    {integration.platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showAuthorSelector && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span className="text-sm">Advanced: Select Author</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2">
                  <Label>Publish As</Label>
                  <Select
                    value={selectedAuthor}
                    onValueChange={setSelectedAuthor}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">
                        Default{" "}
                        {defaultAuthor && `(${defaultAuthor.display_name})`}
                      </SelectItem>
                      {authors
                        .filter((a) => !a.is_default)
                        .map((author) => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.display_name} (@{author.username})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Button onClick={handlePublish}>Publish</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Custom Webhook Configuration

For custom webhooks, configure the authors endpoint in integration settings:

```json
{
  "webhook_url": "https://api.example.com/articles",
  "authors_endpoint": "https://api.example.com/users",
  "author_id_field": "id",
  "author_name_field": "name",
  "author_username_field": "username",
  "field_mapping": {
    "authorId": "{{platform_author_id}}"
  }
}
```

**New Variable:** `{{platform_author_id}}` - Uses selected author's `external_id`

---

## User Flows

### First-Time Setup (90% of users)

1. User connects integration (e.g., Dev.to)
2. System automatically fetches their account
3. Sets as default author
4. Future publishes use this automatically

**UX:** Zero author selection needed!

### Multi-Account User

1. User connects 2nd Dev.to integration
2. Clicks "Fetch Authors"
3. Chooses which to set as default
4. Publishes:
   - Uses default automatically
   - Can override in "Advanced Options"

---

## Best Practices

### 1. Auto-Fetch on Integration

```typescript
// After creating integration
const handleConnect = async () => {
  const integration = await createIntegration(platformData);

  // Auto-fetch authors
  await authorApi.fetchFromPlatform(integration.id);

  toast.success("Integration connected and authors loaded");
};
```

### 2. Show Default Author in UI

```tsx
<div className="flex items-center gap-2">
  <span>{integration.platform}</span>
  {defaultAuthor && (
    <Badge variant="outline">Publishing as @{defaultAuthor.username}</Badge>
  )}
</div>
```

### 3. Only Show Selector When Needed

```typescript
const shouldShowAuthorSelector =
  authors.length > 1 || userPreferences.alwaysShowAuthor;
```

---

## Error Handling

```typescript
try {
  const result = await authorApi.fetchFromPlatform(integrationId);

  if (!result.success) {
    // Platform doesn't support author fetching (Shopify, Webflow)
    toast.info("This platform uses admin account automatically");
    return;
  }

  if (result.authors.length === 0) {
    toast.warning("No authors found. Check integration credentials.");
    return;
  }

  setAuthors(result.authors);
} catch (error) {
  toast.error("Failed to fetch authors. Please try again.");
}
```

---

## Platform Support

| Platform       | Supports Authors | Auto-Fetched    |
| -------------- | ---------------- | --------------- |
| Medium         | ✅ Yes           | Yes             |
| Dev.to         | ✅ Yes           | Yes             |
| Hashnode       | ✅ Yes           | Yes             |
| WordPress      | ⚠️ Partial       | If configured   |
| Webflow        | ❌ No            | N/A             |
| Shopify        | ❌ No            | N/A             |
| Custom Webhook | ✅ Configurable  | If endpoint set |

**For platforms without author support:** System uses admin/owner account automatically.

---

## Summary

**What's Implemented:**

- ✅ Fetch authors from platform APIs
- ✅ Store authors per integration
- ✅ Default author selection
- ✅ Publish with optional author override
- ✅ Custom webhook author endpoint support

**User Experience:**

- Simple by default (automatic author)
- Powerful when needed (multi-account support)
- Zero configuration for 90% of users

**Next Steps:**

1. Implement frontend components
2. Test author fetching for each platform
3. Handle edge cases (no authors, API errors)
4. Add author avatar display
