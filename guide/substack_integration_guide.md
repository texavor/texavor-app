# Substack Integration Frontend Guide

This guide details how to integrate the new Substack platform support in the frontend application.

## 1. Connection Dialog (New Integration)

When listing supported platforms (`GET /api/v1/blogs/:id/integrations`), you will now see a new entry:

```json
{
  "id": "substack",
  "name": "Substack",
  "type": "cookie",
  "icon": "substack-icon",
  "logo_url": "...",
  "supports_authors": true
}
```

### Form Fields for Connection

When the user selects "Substack", show the following fields in the connection form:

| Field Label        | Field Name               | Type     | Required | Helper Text                                                                      |
| :----------------- | :----------------------- | :------- | :------- | :------------------------------------------------------------------------------- |
| **Subdomain**      | `credentials[subdomain]` | Text     | Yes      | The text before `.substack.com`. E.g. enter `texavor` for `texavor.substack.com` |
| **Session Cookie** | `credentials[cookie]`    | Password | Yes      | Your `substack.sid` cookie value. Found in DevTools -> Application -> Cookies.   |

**Payload Example:**

```json
POST /api/v1/blogs/:blog_id/integrations
{
  "platform": "substack",
  "credentials": {
    "subdomain": "myblog",
    "cookie": "eyJ_long_cookie_string..."
  },
  "settings": {
    "primary": true
    // "test_article_id": "optional" if we support connection testing
  }
}
```

## 2. Publication Settings (Publish Dialog)

When publishing an article, if Substack is enabled, offer these specific settings under the Substack tab/section.

### Settings Schema

| Field Label            | JSON Key     | Type           | Options / Default                                                                       | Description                                                                                   |
| :--------------------- | :----------- | :------------- | :-------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **Audience**           | `audience`   | Select         | `everyone` (Public)<br>`only_paid` (Paid Subscribers)<br>`only_free` (Free Subscribers) | Who can see this post? Default: `everyone`                                                    |
| **Send as Newsletter** | `send_email` | Toggle/Boolean | `true` / `false`                                                                        | If enabled, this post will be emailed to valid subscribers upon publishing. Default: `false`. |
| **Save as Draft**      | `draft`      | Toggle/Boolean | `true` / `false`                                                                        | Recommended default: `true`. Substack API usually creates drafts.                             |

**Payload Example:**

```json
POST /api/v1/blogs/:blog_id/articles/:article_id/publish
{
  "publication_settings": {
    "substack": {
      "audience": "only_paid",
      "send_email": true,
      "draft": true
    }
  }
}
```

## 3. Author Handling

Substack supports authors! The integration will attempt to fetch authors using the connected cookie.

- Use the standard `GET /integrations/:id/authors` endpoint to list available Substack authors (usually just the account owner users).
- Allow users to "Set Default" author just like generic integrations.

## 4. Testing Connection

You can use the `POST .../test_connection` endpoint.

- It verifies if the `substack.sid` cookie is valid by fetching the user's latest draft/post.
- **Error Handling**: If it returns "401" or "Connection failed", prompt the user that their Cookie might have expired.

## Summary of Changes Required

1.  **Add Substack Icon/Option** in `ConnectIntegrationSheet`.
2.  **Add Input Fields** for `subdomain` and `cookie` in the connector form.
3.  **Add Settings UI** in the `PublishArticleDialog` for Audience and Email toggle.
