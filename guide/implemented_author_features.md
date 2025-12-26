# Author Management System - Implementation Guide

This guide details the newly implemented Author Management System, which allows users to fetch, manage, and select platform-specific authors for their publications.

## 1. Core Workflows

### A. Auto-Fetching Authors on Connection

When you connect a new integration that supports author profiles (Medium, Dev.to, Hashnode, Custom Webhook), the system now automatically fetches available authors.

- **Trigger**: Happens immediately after a successful connection in the "Connect Integration" sheet.
- **Feedback**: A toast notification appears confirming "Authors fetched successfully".

### B. Managing Authors (Settings)

A dedicated management interface is available at `Settings > Authors`.

- **Grouped by Integration**: Authors are clearly separated by the platform they belong to.
- **Manual Sync**: Each integration has an "Import from [Platform]" button to refresh the author list manually.
- **Default Author**: You can set a "Default" author for each integration. This author will be pre-selected when you publish to this platform, unless you manually choose another.

### C. Publishing with Specific Authors

When publishing an article, you can now choose which identity to use.

1. Open an Article.
2. In the publishing sheet, select a platform (e.g., Dev.to).
3. Click the **Settings (Gear) Icon** next to the platform name.
4. **"Publish As" Dropdown**:
   - If authors are available, a dropdown appears at the top of the dialog.
   - You can see which author is currently selected.
   - You can choose a specific author or revert to "Default Author".
   - If a specific author is selected, their ID is sent as `platform_author_id` during publication.

## 2. Technical Implementation Details

### API Integration (`lib/api/authors.ts`)

- **`fetchFromPlatform(blogId, integrationId)`**: Triggers the backend verify/sync process.
- **`listIntegrationAuthors(blogId, integrationId)`**: Retrieves authors specific to a connected integration.
- **`setDefaultAuthor(blogId, integrationId, authorId)`**: Marks an author as the default for that integration.

### Frontend Components

- **`ConnectIntegrationSheet.tsx`**:

  - Updated to call `fetchFromPlatform` immediately upon successful connection.

- **`app/(dashboard)/settings/authors/page.tsx`**:

  - Refactored to map through connected integrations.
  - Renders an `AuthorsList` for each supported integration, passing the specific `integrationId`.

- **`components/authors/AuthorsList.tsx`**:

  - Now accepts an `integrationId` prop.
  - Switches between fetching _all_ authors (legacy) or _integration-specific_ authors.
  - Handles the "Set as Default" action.

- **`components/IntegrationSettingsDialog.tsx`**:

  - **New Feature**: Added the "Publish As" dropdown.
  - Fetches authors for the specific integration when the dialog opens.
  - Updates the `platform_author_id` in the settings object which is then passed to the publication payload.

- **`ArticleDetailsSheet.tsx`**:
  - Unified the settings dialog logic so all platforms (including Dev.to) use the `IntegrationSettingsDialog`, enabling author selection across the board.

## 3. Supported Platforms

- **Medium**
- **Dev.to**
- **Hashnode**
- **Custom Webhook** (if configured to return author data)
