# Subscription Payment & Failure Handling Guide

This guide details how the frontend should handle subscription statuses, specifically payment failures (`past_due`), and how to initiate the payment recovery flow.

## 1. Checking Subscription Status

To determine if a user has an active subscription or a payment issue, fetch the current subscription details.

**Endpoint:** `GET /api/v1/subscription`

**Response:**

```json
{
  "tier": "professional",
  "status": "active", // Possible: 'active', 'past_due', 'canceled', 'unpaid', 'trialing'
  "subscription_details": {
    "processor_customer_id": "cus_...",
    "current_period_end": "2026-03-04T12:00:00.000Z",
    "days_until_renewal": 15,
    "cancel_at_period_end": false
  },
  "limits": { ... },
  "usage": { ... }
}
```

### frontend Logic:

1.  **Check `status`**:
    - `active` / `trialing`: User has access.
    - `past_due`: **Payment failed.** User access should typically be restricted or a warning banner displayed.
    - `canceled`: Subscription is canceled (check `current_period_end` for grace period access).
    - `unpaid`: Subscription is unpaid and likely suspended.

2.  **Handling `past_due` / `unpaid`**:
    - Display a persistent banner: _"Your last payment failed. Please update your payment method to avoid interruption."_
    - Disable sensitive actions (e.g., generating new articles) if strict enforcement is required.
    - Provide a "Fix Payment" button calling the Portal API (see below).

---

## 2. Fixing Failed Payments (Stripe)

To allow the user to update their card or retry a failed payment, generate a secure link to the Stripe Billing Portal.

**Endpoint:** `POST /api/v1/stripe/customer_portal`

**Request:**

```json
{
  "return_url": "https://app.texavor.com/settings/subscription" // Optional, defaults to dashboard
}
```

**Response:**

```json
{
  "portal_url": "https://billing.stripe.com/p/session/test_..."
}
```

### Frontend Logic:

1.  User clicks "Update Payment Method" or "Manage Subscription".
2.  Call `POST /api/v1/stripe/customer_portal`.
3.  **Redirect** the browser window to `response.portal_url`.
4.  User updates their card on Stripe's hosted page.
5.  Stripe automatically retries the failed invoice.
6.  User is redirected back to the `return_url`.
7.  **Webhook Sync**:
    - Stripe sends `invoice.payment_succeeded`.
    - Backend updates status to `active`.
    - Frontend should re-fetch `GET /api/v1/subscription` upon return to verify the fixed status.

---

## 3. Webhook Handling (Backend)

- **`invoice.payment_failed`**: Backend sets status to `past_due` and emails the user.
- **`invoice.payment_succeeded`**: Backend sets status to `active` (recovering from `past_due` automatically).
