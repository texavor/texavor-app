# Subscription Cancellation & Upgrade Guide

## Overview

This guide details how to implement subscription cancellation and usage-based upgrade suggestions in the frontend.

## 1. Upgrade Suggestions

The `GET /api/v1/subscription` (or `/api/v1/blogs/:id/subscription`) endpoint now returns a `suggest_upgrade` boolean field.

### Response Structure

\`\`\`json
{
"tier": "starter",
"status": "active",
"subscription_details": { ... },
"limits": { ... },
"usage": { ... },
"usage_percentages": { ... },
"suggest_upgrade": true,
"suggested_upgrade_tier": "professional"
}
\`\`\`

### Frontend Logic

1.  Fetch subscription data via `useQuery`.
2.  Check `data.suggest_upgrade`.
3.  If `true`, display an upgrade prompt/banner to the user.
    - **Message**: "You've used over 75% of your plan limits. Upgrade to [suggested_upgrade_tier] to avoid interruption."
    - **Action**: Link to the billing/plans page.

## 2. Subscription Cancellation

Users can now cancel their subscription directly from the application.

### API Endpoint

- **Method**: `DELETE`
- **URL**: `/api/v1/subscription` OR `/api/v1/blogs/:blog_id/subscription` (depending on context)
- **Headers**: Authorization (Bearer token)

### Frontend Implementation

1.  Add a "Cancel Subscription" button in the Billing/Settings page.
    - _Note_: Ensure this is behind a confirmation modal ("Are you sure? You will lose access to premium features...").
2.  On confirmation validation, call the API:

\`\`\`javascript
const cancelSubscription = async () => {
try {
await axiosInstance.delete('/api/v1/subscription');
toast.success('Subscription cancelled successfully.');
// Invalidate queries to refresh subscription status
queryClient.invalidateQueries(['subscription']);
} catch (error) {
// Global error handler usually handles this, but custom handling if needed
console.error('Cancellation failed', error);
}
};
\`\`\`

3.  **UI Updates**:
    - After cancellation, the `subscription_details.cancel_at_period_end` flag will be `true`.
    - Update UI to show "Cancellation Scheduled" instead of "Cancel Subscription" button.
    - Show the date when access will end (`subscription_details.current_period_end` or `cancel_at`).
    - Show a "Resume Subscription" button.

## 3. Subscription Reactivation

If a user has cancelled but is still within the billing period (grace period), they can reactivate.

### API Endpoint

- **Method**: `POST`
- **URL**: `/api/v1/subscription/resume` OR `/api/v1/blogs/:blog_id/subscription/resume`
- **Headers**: Authorization (Bearer token)

### Frontend Implementation

1.  If `subscription_details.cancel_at_period_end` is `true`, show a "Resume Subscription" button.
2.  On click, call the API:
    \`\`\`javascript
    await axiosInstance.post('/api/v1/subscription/resume');
    \`\`\`
3.  On success, `cancel_at_period_end` returns to `false`.

## 4. Testing

- **Upgrade**: Manually exhaust >75% of a limit (e.g., generate enough keywords) and verify the `suggest_upgrade` flag.
- **Cancel**: Click cancel, confirm, and verify the UI updates to show the cancellation pending state.
- **Resume**: After cancelling, click "Resume Subscription" and verify the status reverts to active.
