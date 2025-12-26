# Custom Webhook Security & Authentication Guide

## Overview

Custom webhook adapter now supports **encrypted credential storage** and **multiple authentication methods** for secure API integration.

---

## Authentication Types

### Setting: `auth_type`

**Supported Values:**

- `bearer` - OAuth 2.0 Bearer Token
- `api_key` - API Key (Header or Query)
- `basic` - HTTP Basic Authentication
- `session` - Session/Cookie Authentication
- `custom` - Custom Headers

**Default:** No authentication

---

## 1. Bearer Token Authentication

**Use Case:** OAuth 2.0 APIs, modern REST APIs

### Configuration

**Settings:**

```json
{
  "webhook_url": "https://api.example.com/articles",
  "auth_type": "bearer"
}
```

**Credentials (Encrypted):**

```json
{
  "auth_token": "sk_live_abc123xyz789"
}
```

**Resulting Header:**

```
Authorization: Bearer sk_live_abc123xyz789
```

---

## 2. API Key Authentication

**Use Case:** APIs that require API keys

### Header-based API Key

**Settings:**

```json
{
  "webhook_url": "https://api.example.com/articles",
  "auth_type": "api_key",
  "api_key_location": "header",
  "api_key_name": "X-API-Key"
}
```

**Credentials (Encrypted):**

```json
{
  "api_key": "your-secret-api-key-123"
}
```

**Resulting Header:**

```
X-API-Key: your-secret-api-key-123
```

### Query Parameter API Key

**Settings:**

```json
{
  "webhook_url": "https://api.example.com/articles",
  "auth_type": "api_key",
  "api_key_location": "query",
  "api_key_name": "api_key"
}
```

**Credentials (Encrypted):**

```json
{
  "api_key": "your-secret-api-key-123"
}
```

**Resulting URL:**

```
https://api.example.com/articles?api_key=your-secret-api-key-123
```

---

## 3. Basic Authentication

**Use Case:** Traditional HTTP Basic Auth

### Configuration

**Settings:**

```json
{
  "webhook_url": "https://api.example.com/articles",
  "auth_type": "basic"
}
```

**Credentials (Encrypted):**

```json
{
  "username": "admin",
  "password": "secret-password-123"
}
```

**Resulting Header:**

```
Authorization: Basic YWRtaW46c2VjcmV0LXBhc3N3b3JkLTEyMw==
```

---

## 4. Session/Cookie Authentication

**Use Case:** Session-based APIs

### Configuration

**Settings:**

```json
{
  "webhook_url": "https://api.example.com/articles",
  "auth_type": "session"
}
```

**Credentials (Encrypted):**

```json
{
  "session_token": "session-abc-123-xyz",
  "cookie_name": "session_id"
}
```

**Resulting Header:**

```
Cookie: session_id=session-abc-123-xyz
```

---

## 5. Custom Headers

**Use Case:** APIs with non-standard auth mechanisms

### Configuration

**Settings:**

```json
{
  "webhook_url": "https://api.example.com/articles",
  "auth_type": "custom"
}
```

**Credentials (Encrypted):**

```json
{
  "custom_headers": {
    "X-Auth-Token": "token-123",
    "X-Signature": "signature-xyz",
    "X-Timestamp": "1234567890"
  }
}
```

**Resulting Headers:**

```
X-Auth-Token: token-123
X-Signature: signature-xyz
X-Timestamp: 1234567890
```

---

## Additional Configuration Options

### HTTP Method for Updates

**Setting:** `update_method`  
**Values:** `PATCH` (default) | `PUT`

```json
{
  "update_method": "PUT"
}
```

### Request Timeout

**Setting:** `timeout`  
**Default:** `30` seconds

```json
{
  "timeout": 60
}
```

### Response Validation

**Settings:** `success_field`, `success_value`

Validate success even if HTTP status is 200:

```json
{
  "success_field": "status",
  "success_value": "ok"
}
```

**Example Response:**

```json
{
  "status": "ok",
  "id": "123"
}
```

Will only be considered successful if `status === "ok"`.

---

## Complete Configuration Examples

### Example 1: Adonis.js with Bearer Auth

```json
{
  "label": "Surajondev API",
  "webhook_url": "https://surajondev-adonis.onrender.com/articles",
  "auth_type": "bearer",
  "content_format": "html",
  "response_id_field": "id",
  "update_url": "https://surajondev-adonis.onrender.com/articles/{id}",
  "delete_url": "https://surajondev-adonis.onrender.com/articles/{id}",
  "update_method": "PUT",
  "timeout": 30,
  "field_mapping": {
    "title": "{{title}}",
    "markdown": "{{content}}",
    "slug": "{{slug}}"
  }
}
```

**Credentials:**

```json
{
  "auth_token": "your-bearer-token-here"
}
```

### Example 2: API with API Key in Header

```json
{
  "label": "Custom CMS API",
  "webhook_url": "https://cms.example.com/api/posts",
  "auth_type": "api_key",
  "api_key_location": "header",
  "api_key_name": "X-API-Key",
  "content_format": "markdown",
  "timeout": 45
}
```

**Credentials:**

```json
{
  "api_key": "cms-api-key-secret-123"
}
```

### Example 3: WordPress with Basic Auth

```json
{
  "label": "WordPress Site",
  "webhook_url": "https://myblog.com/wp-json/wp/v2/posts",
  "auth_type": "basic",
  "content_format": "html",
  "field_mapping": {
    "title": "{{title}}",
    "content": "{{content}}",
    "status": "publish"
  }
}
```

**Credentials:**

```json
{
  "username": "wp_admin",
  "password": "application-password-here"
}
```

---

## Security Features

### 1. Encrypted Storage

All credentials are stored encrypted in the database:

- ✅ Bearer tokens
- ✅ API keys
- ✅ Passwords
- ✅ Session tokens
- ✅ Custom headers

### 2. Secure Logging

Sensitive data is **never** logged:

**Logged:**

```
Headers: {"Content-Type"=>"application/json", "Authorization"=>"***"}
URL: https://api.example.com/articles?api_key=***
```

**NOT Logged:**

```
Authorization: Bearer sk_live_abc123  ❌
api_key=secret-key                     ❌
```

### 3. Backward Compatibility

Old integrations with `headers` in settings still work:

```json
{
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

But credentials take precedence for security.

---

## Migration Guide

### From Old Setup to New Secure Setup

**Old Configuration (Insecure):**

```json
{
  "webhook_url": "https://api.example.com/articles",
  "headers": {
    "Authorization": "Bearer sk_live_abc123"
  }
}
```

**New Configuration (Secure):**

**Settings:**

```json
{
  "webhook_url": "https://api.example.com/articles",
  "auth_type": "bearer"
}
```

**Credentials:**

```json
{
  "auth_token": "sk_live_abc123"
}
```

---

## API Reference

### Settings Fields

| Field              | Type    | Description                   | Default                 |
| ------------------ | ------- | ----------------------------- | ----------------------- |
| `auth_type`        | string  | Authentication method         | none                    |
| `api_key_location` | string  | `header` or `query`           | `header`                |
| `api_key_name`     | string  | Header/param name for API key | `X-API-Key` / `api_key` |
| `update_method`    | string  | `PATCH` or `PUT`              | `PATCH`                 |
| `timeout`          | integer | Request timeout in seconds    | `30`                    |
| `success_field`    | string  | Field to validate in response | none                    |
| `success_value`    | string  | Expected value for success    | none                    |

### Credentials Fields (Encrypted)

**Bearer:**

- `auth_token` - Bearer token

**API Key:**

- `api_key` - API key value

**Basic:**

- `username` - Username
- `password` - Password

**Session:**

- `session_token` - Session token
- `cookie_name` - Cookie name (optional)

**Custom:**

- `custom_headers` - Object with custom headers

---

## Testing

### Step 1: Configure Authentication

Set `auth_type` and credentials

### Step 2: Publish Test Article

Check logs for:

```
Auth Type: bearer
Headers: {"Authorization"=>"***"}  ← Redacted!
```

### Step 3: Verify Request

Your API should receive:

```
Authorization: Bearer your-actual-token
```

---

## Troubleshooting

### 401 Unauthorized

**Problem:** Authentication failing

**Check:**

1. Correct `auth_type` configured
2. Credentials properly set
3. Token/key not expired

### API Key Not Working

**Problem:** API key not sent

**Check:**

- `api_key_location`: `header` vs `query`
- `api_key_name` matches API expectation
- Credential field is `api_key` (not `auth_token`)

### Headers Not Showing in Logs

**Solution:** This is intentional! Sensitive headers are redacted for security.

---

## Best Practices

1. **Always use encrypted credentials** - Never put tokens in `settings.headers`
2. **Choose correct auth type** - Match your API's authentication scheme
3. **Use specific API key names** - Set `api_key_name` to match your API
4. **Test authentication first** - Verify auth works before configuring complex mappings
5. **Monitor logs** - Check for `***` redactions to ensure security

---

## Summary

| Auth Type | Settings               | Credentials            |
| --------- | ---------------------- | ---------------------- |
| Bearer    | `auth_type: "bearer"`  | `auth_token`           |
| API Key   | `auth_type: "api_key"` | `api_key`              |
| Basic     | `auth_type: "basic"`   | `username`, `password` |
| Session   | `auth_type: "session"` | `session_token`        |
| Custom    | `auth_type: "custom"`  | `custom_headers`       |

All credentials are **encrypted** and **never logged**! 🔒
