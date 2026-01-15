# Lemon Squeezy Checkout - Frontend API Guide

## API Changes

### Checkout Endpoint

**Endpoint:** `POST /api/v1/checkout`

**New Parameter:**

```typescript
{
  "plan": "starter" | "professional" | "business",
  "interval": "monthly" | "yearly",
  "redirect_url": string  // NEW: Where to redirect after checkout
}
```

**Example:**

```typescript
const { data } = await axiosInstance.post("/api/v1/checkout", {
  plan: "starter",
  interval: "monthly",
  redirect_url: `${window.location.origin}/subscription/success`,
});

// Redirect user to Lemon Squeezy
window.location.href = data.checkout_url;
```

---

## Required Frontend Page

### `/subscription/success`

**Purpose:** Validate subscription status after Lemon Squeezy redirect

**API to Call:**

```typescript
GET / api / v1 / subscription;
```

**Response:**

```typescript
{
  "status": "active" | "trialing" | "free",
  "tier": "starter" | "professional" | "business" | "free",
  "processor_customer_id": string,
  // ... other fields
}
```

**Implementation Logic:**

1. Poll `/api/v1/subscription` every 2 seconds
2. If `status !== "free"` → Show success ✅
3. If still `"free"` after 10 retries → Show "processing delayed" ⏳
4. Stop polling once subscription is active

---

## Quick Implementation

```typescript
// app/subscription/success/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";

export default function SubscriptionSuccess() {
  const { data, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/subscription");
      return res.data;
    },
    refetchInterval: (data) => {
      // Stop polling if active
      return data?.status !== "free" ? false : 2000;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (data?.status !== "free") {
    return <div>✅ Subscription Active!</div>;
  }

  return <div>⏳ Processing payment...</div>;
}
```

---

## Summary

1. ✅ Pass `redirect_url` to `/api/v1/checkout`
2. ✅ Create `/subscription/success` page
3. ✅ Poll `/api/v1/subscription` to check status
4. ✅ Show success when `status !== "free"`
