# Custom Webhook URL Settings Guide

This guide explains how to configure URL retrieval for Custom Webhook integrations.

Since generic webhooks (e.g., Make.com, Zapier) may return unpredictable JSON responses, we provide mechanisms to ensure EasyWrite can identify the published URL for canonical tagging reliability.

## New Settings Fields

The `settings` JSON object for a Custom Webhook integration now supports two new optional fields:

| Field                | Type   | Description                                                               |
| :------------------- | :----- | :------------------------------------------------------------------------ |
| `response_url_field` | String | Dot-notation path to the URL in the response JSON.                        |
| `public_url_pattern` | String | A pattern string to construct the URL manually if the response is silent. |

---

## 1. Response URL Field (`response_url_field`)

If your webhook returns the published URL in its JSON response, use this field to tell EasyWrite where to find it.

**Example Response:**

```json
{
  "status": "success",
  "data": {
    "post": {
      "id": 123,
      "permalink": "https://mysite.com/blog/hello-world"
    }
  }
}
```

**Configuration:**
Set `response_url_field` to `response.data.post.permalink`.

**Frontend Implementation:**

- Add an input field "Response URL Field" in the "Advanced Settings" section.
- Placeholder: `e.g. response.data.url`

---

## 2. Public URL Pattern (`public_url_pattern`)

If your webhook DOES NOT return the URL (e.g., a fire-and-forget trigger), you can define a pattern to construct it.

**Supported Tokens:**

- `{{slug}}`: The article's slug (internal).
- `{{response.slug}}`: The slug extracted from the webhook response.
- `{{id}}`: The article's internal ID.

**Example Pattern:**
`https://mysite.com/blog/{{response.slug}}`

**Configuration:**
Set `public_url_pattern` to `https://mysite.com/blog/{{response.slug}}`.

**Frontend Implementation:**

- Add an input field "Public URL Pattern".
- Helper text: "Use {{slug}} or {{response.slug}}."

---

## 3. Fallback Logic

When an article is published via Custom Webhook, the system attempts to resolve the Canonical URL in this order:

1.  **Extract**: Checks `response_url_field` in the webhook response.
2.  **Default**: Checks common keys like `url`, `permalink`, `link`.
3.  **Construct**: Uses `public_url_pattern` with the article's slug.
4.  **Fallback**: Uses the **Texavor Public URL** (`https://[subdomain].texavor.com/p/[slug]`).

This ensures that downstream platforms (Medium, Dev.to) ALWAYS receive a valid canonical URL, even if the primary webhook is silent.

---

## API Payload Example (Update Integration)

**PATCH** `/api/v1/integrations/:id`

```json
{
  "integration": {
    "settings": {
      "webhook_url": "https://hook.make.com/...",
      "response_url_field": "data.url",
      "public_url_pattern": "https://mysite.com/posts/{{slug}}"
    }
  }
}
```
