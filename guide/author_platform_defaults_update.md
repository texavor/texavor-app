# Author API Update Guide

## Overview

We have updated the `platform_defaults` field in the Author API response to provide more granular details about the integrations where an author is set as default.

## Changes

### `platform_defaults`

Previously, this field returned an array of platform strings:

```json
"platform_defaults": [
  "custom_webhook",
  "devto"
]
```

**New Response Format:**
It now returns an array of objects containing the `integration_id`, `platform`, and a human-readable `name` (label).

```json
"platform_defaults": [
  {
    "integration_id": "a0fa2b11-e61f-4a83-b8f1-61645ecfacde",
    "platform": "custom_webhook",
    "name": "Discord Announcements"
  },
  {
    "integration_id": "483c5998-58a2-4db3-bf81-d12e7b258300",
    "platform": "devto",
    "name": "Dev.to"
  }
]
```

## Why this change?

This allows the frontend to distinguish between multiple integrations of the same type (e.g., multiple custom webhooks) and display the user-defined label properly.

## Action Required

- Feature: Updates handling of `author.platform_defaults` in frontend components.
- Update any frontend code that relies on `platform_defaults` to check for strings.
- Update UI components to use `item.platform` and `item.name` from the object.
- If checking for "is default on platform X", you can now check:
  ```javascript
  const isDefault = author.platform_defaults.some(
    (pd) => pd.platform === "devto",
  );
  ```
  or strictly for a specific integration:
  ```javascript
  const isDefault = author.platform_defaults.some(
    (pd) => pd.integration_id === myIntegrationId,
  );
  ```
