# Custom Webhook Test Connection API Guide

## Overview

The test connection feature allows you to validate your custom webhook configuration by fetching a sample article from your API. This helps auto-detect response structure and suggests optimal configuration settings.

---

## Endpoint

```
POST /api/v1/blogs/:blog_id/integrations/:integration_id/test_connection
```

---

## Authentication

Requires authentication token in header:

```
Authorization: Bearer {your_auth_token}
```

---

## Request

### URL Parameters

| Parameter        | Type   | Required | Description                   |
| ---------------- | ------ | -------- | ----------------------------- |
| `blog_id`        | string | Yes      | Your blog ID                  |
| `integration_id` | string | Yes      | Custom webhook integration ID |

### Body Parameters

| Parameter         | Type   | Required | Description                                 |
| ----------------- | ------ | -------- | ------------------------------------------- |
| `test_article_id` | string | No       | ID of existing article in your API to fetch |

**Note:** If not provided, uses `test_article_id` from integration settings.

### Example Request

```http
POST /api/v1/blogs/abc-123/integrations/xyz-789/test_connection
Content-Type: application/json
Authorization: Bearer your_token_here

{
  "test_article_id": "42"
}
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "status": 200,
  "response_body": {
    "id": "42",
    "title": "Sample Article",
    "body": "<p>HTML content...</p>",
    "slug": "sample-article",
    "created_at": "2025-12-26T..."
  },
  "detected_id_fields": [
    {
      "field": "id",
      "value": "42",
      "confidence": "high"
    }
  ],
  "suggested_config": {
    "response_id_field": "id",
    "content_format": "html",
    "field_mapping": {
      "title": "{{title}}",
      "body": "{{content}}",
      "slug": "{{slug}}"
    }
  }
}
```

### Response with Nested ID

```json
{
  "success": true,
  "status": 200,
  "response_body": {
    "data": {
      "article_id": "xyz-123",
      "title": "My Article",
      "content": "# Markdown content"
    }
  },
  "detected_id_fields": [
    {
      "field": "data.article_id",
      "value": "xyz-123",
      "confidence": "high"
    }
  ],
  "suggested_config": {
    "response_id_field": "data.article_id",
    "content_format": "markdown"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "No test article ID provided. Please specify test_article_id in settings or pass as parameter."
}
```

### Authentication Error (401 Unauthorized)

```json
{
  "success": false,
  "status": 401,
  "error": "Unauthorized"
}
```

### Connection Failed (Timeout/Network)

```json
{
  "success": false,
  "error": "Connection failed: execution expired"
}
```

---

## Response Fields

### `success`

**Type:** `boolean`  
**Description:** Whether the test was successful

### `status`

**Type:** `integer`  
**Description:** HTTP status code from your API

### `response_body`

**Type:** `object | string`  
**Description:** The actual response from your API (parsed JSON or raw text)

### `detected_id_fields`

**Type:** `array`  
**Description:** List of potential ID fields found in the response

**Structure:**

```typescript
{
  field: string; // Field path (e.g., "id", "data.article_id")
  value: any; // The actual value
  confidence: string; // "high" or "medium"
}
```

### `suggested_config`

**Type:** `object`  
**Description:** Recommended configuration based on response structure

**Fields:**

- `response_id_field` - Suggested ID field to extract
- `content_format` - Detected format ("html" or "markdown")
- `field_mapping` - Suggested payload field mapping

---

## Frontend Implementation

### React/TypeScript Example

```typescript
interface TestConnectionResponse {
  success: boolean;
  status?: number;
  response_body?: any;
  detected_id_fields?: Array<{
    field: string;
    value: any;
    confidence: "high" | "medium";
  }>;
  suggested_config?: {
    response_id_field?: string;
    content_format?: "html" | "markdown";
    field_mapping?: Record<string, string>;
  };
  error?: string;
}

const testWebhookConnection = async (
  blogId: string,
  integrationId: string,
  testArticleId?: string
): Promise<TestConnectionResponse> => {
  const response = await fetch(
    `/api/v1/blogs/${blogId}/integrations/${integrationId}/test_connection`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        test_article_id: testArticleId,
      }),
    }
  );

  return response.json();
};
```

### Usage in Component

```typescript
const [testResult, setTestResult] = useState<TestConnectionResponse | null>(
  null
);
const [testing, setTesting] = useState(false);

const handleTestConnection = async () => {
  setTesting(true);

  try {
    const result = await testWebhookConnection(
      blogId,
      integrationId,
      "42" // Your test article ID
    );

    setTestResult(result);

    if (result.success) {
      // Auto-apply suggested configuration
      if (result.suggested_config) {
        setFormData({
          ...formData,
          response_id_field: result.suggested_config.response_id_field,
          content_format: result.suggested_config.content_format,
          field_mapping: result.suggested_config.field_mapping,
        });
      }

      toast.success("Connection successful!");
    } else {
      toast.error(`Test failed: ${result.error}`);
    }
  } catch (error) {
    toast.error("Failed to test connection");
  } finally {
    setTesting(false);
  }
};
```

### UI Component Example

```tsx
<Card>
  <CardHeader>
    <CardTitle>Test Connection</CardTitle>
    <CardDescription>
      Verify your webhook configuration by fetching a sample article
    </CardDescription>
  </CardHeader>

  <CardContent>
    <div className="space-y-4">
      <div>
        <Label>Test Article ID</Label>
        <Input
          placeholder="Enter an existing article ID from your API"
          value={testArticleId}
          onChange={(e) => setTestArticleId(e.target.value)}
        />
      </div>

      <Button
        onClick={handleTestConnection}
        disabled={testing || !testArticleId}
      >
        {testing ? "Testing..." : "Test Connection"}
      </Button>

      {testResult && (
        <div className="mt-4">
          {testResult.success ? (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Connection Successful!</AlertTitle>
                <AlertDescription>
                  Fetched article from your API
                </AlertDescription>
              </Alert>

              {testResult.suggested_config && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Suggested Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>ID Field:</strong>{" "}
                        {testResult.suggested_config.response_id_field}
                      </div>
                      <div>
                        <strong>Content Format:</strong>{" "}
                        {testResult.suggested_config.content_format}
                      </div>
                    </div>
                    <Button
                      className="mt-4"
                      onClick={() =>
                        applySuggestedConfig(testResult.suggested_config)
                      }
                    >
                      Apply Configuration
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Collapsible className="mt-4">
                <CollapsibleTrigger>View Raw Response</CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(testResult.response_body, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>{testResult.error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

---

## Use Cases

### 1. Initial Setup

When user first configures custom webhook:

1. Enter webhook URL and auth
2. Enter test article ID
3. Click "Test Connection"
4. System fetches sample article
5. Auto-detects configuration
6. User confirms or adjusts

### 2. Troubleshooting

When publishing fails:

1. Check authentication works
2. Verify API response structure
3. Validate ID field extraction
4. Confirm content format

### 3. Migration

When migrating from another system:

1. Test with existing article
2. See how API structures data
3. Configure field mapping
4. Validate before first publish

---

## Best Practices

### 1. Always Test Before Publishing

```typescript
// Before enabling integration
const testResult = await testWebhookConnection(...);

if (!testResult.success) {
  alert('Please fix configuration before publishing');
  return;
}

// Proceed with enabling integration
```

### 2. Show Detected Fields to User

```tsx
{
  detectedFields.map((field) => (
    <div key={field.field}>
      <Badge variant={field.confidence === "high" ? "default" : "secondary"}>
        {field.confidence} confidence
      </Badge>
      <code>{field.field}</code>: {field.value}
    </div>
  ));
}
```

### 3. Handle Errors Gracefully

```typescript
if (!testResult.success) {
  if (testResult.error?.includes("401")) {
    setError("Authentication failed. Check your credentials.");
  } else if (testResult.error?.includes("timeout")) {
    setError("Request timed out. Check your API URL.");
  } else {
    setError(`Test failed: ${testResult.error}`);
  }
}
```

### 4. Cache Test Results

```typescript
// Don't re-test on every render
const [testCache, setTestCache] = useState<Record<string, TestConnectionResponse>>({});

const testWithCache = async (articleId: string) => {
  if (testCache[articleId]) {
    return testCache[articleId];
  }

  const result = await testWebhookConnection(...);
  setTestCache({ ...testCache, [articleId]: result });
  return result;
};
```

---

## Error Handling

### Common Errors

| Error              | Cause                     | Solution                                  |
| ------------------ | ------------------------- | ----------------------------------------- |
| No test article ID | Missing `test_article_id` | Provide article ID in request or settings |
| Connection timeout | API unreachable or slow   | Check URL, increase timeout setting       |
| 401 Unauthorized   | Invalid auth credentials  | Verify auth_type and credentials          |
| 404 Not Found      | Article doesn't exist     | Use valid article ID                      |
| Invalid JSON       | API returns non-JSON      | Check API documentation                   |

---

## Examples

### Example 1: Adonis.js API

**Request:**

```http
POST /api/v1/blogs/abc/integrations/xyz/test_connection
{
  "test_article_id": "1"
}
```

**Response:**

```json
{
  "success": true,
  "response_body": {
    "id": "1",
    "title": "My Article",
    "markdown": "# Content",
    "slug": "my-article"
  },
  "detected_id_fields": [{ "field": "id", "value": "1", "confidence": "high" }],
  "suggested_config": {
    "response_id_field": "id",
    "content_format": "markdown",
    "field_mapping": {
      "title": "{{title}}",
      "markdown": "{{content}}",
      "slug": "{{slug}}"
    }
  }
}
```

### Example 2: WordPress API

**Request:**

```http
POST /api/v1/blogs/abc/integrations/xyz/test_connection
{
  "test_article_id": "42"
}
```

**Response:**

```json
{
  "success": true,
  "response_body": {
    "id": 42,
    "title": { "rendered": "My Post" },
    "content": { "rendered": "<p>HTML</p>" }
  },
  "suggested_config": {
    "response_id_field": "id",
    "content_format": "html"
  }
}
```

---

## Summary

**Benefits:**

- ✅ Validates authentication
- ✅ Auto-detects ID fields
- ✅ Suggests content format
- ✅ Recommends field mapping
- ✅ Shows actual API response
- ✅ Reduces configuration errors

**Required Settings:**

- `webhook_url` - Your API endpoint
- `auth_type` - Authentication method
- Credentials configured

**Optional Settings:**

- `test_article_id` - Default test article

Use this endpoint during initial setup and troubleshooting to ensure your custom webhook is configured correctly! 🎯
