# Author API Update Guide (Revised)

## Overview

We have simplified the Author API response by removing `platform_defaults` and replacing it with a direct `integration_id`.

## Changes

### [REMOVED] `platform_defaults`

The ambiguous and complex `platform_defaults` array has been removed.

### [ADDED] `integration_id`

We now expose an `integration_id` field directly on the Author object for imported authors.

**New Response Format:**

```json
{
  "id": "...",
  "name": "Suraj Vishwakarma",
  "external_id": "123",
  "external_platform": "custom_webhook",
  "integration_id": "a0fa2b11-e61f-4a83-b8f1-61645ecfacde", // <--- THE FIX
  "imported?": true
}
```

## Logic

1. The backend searches for a `PlatformAuthor` matching the `external_id` within the user's integrations.
2. If found, it returns that integration's ID.
3. If not found (fallback), it tries to find the first integration matching the `external_platform` type.

## Action Required

- Update frontend to use `author.integration_id` to identify which integration an imported author belongs to.
- Remove any dependency on `platform_defaults`.
