# Payment Migration Guide (Frontend) 💳

**Stripe ➡️ Lemon Squeezy**

We have moved the backend from Stripe to Lemon Squeezy service. This relies on **Hosted Checkout** (redirect), which is much simpler than handling Stripe Elements.

## 1. 🗑️ Clean Up (Remove Stripe)

Uninstall Stripe dependencies if they are not used elsewhere:

```bash
npm uninstall @stripe/stripe-js @stripe/react-stripe-js
```

_Remove any `<Elements>` providers or `PaymentElement` components from your Pricing/Checkout modals._

## 2. 🔌 New API Endpoints

### A. Create Checkout (Buy Plan)

**Endpoint:** `POST /api/v1/checkout`
**Payload:**

```json
{
  "plan": "starter", // starter | professional | business
  "interval": "monthly" // monthly | yearly
}
```

**Response:**

```json
{
  "checkout_url": "https://easywrite.lemonsqueezy.com/checkout/..."
}
```

**Action:** Simply `window.location.href = data.checkout_url`.

### B. Manage Subscription (Billing Portal)

**Endpoint:** `POST /api/v1/checkout/portal`
**Response:**

```json
{
  "portal_url": "https://easywrite.lemonsqueezy.com/billing?..."
}
```

**Action:** `window.location.href = data.portal_url`.

---

## 3. 💻 Code Example (React Hook)

Create a generic hook `useSubscription.ts`:

```typescript
import axios from "axios";
import { useState } from "react";

export const useSubscription = () => {
  const [loading, setLoading] = useState(false);

  const subscribe = async (
    plan: "starter" | "professional" | "business",
    interval: "monthly" | "yearly"
  ) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/checkout", { plan, interval });
      if (data.checkout_url) {
        window.location.href = data.checkout_url; // 🚀 Redirect to Lemon Squeezy
      }
    } catch (error) {
      console.error("Checkout failed", error);
      // toast.error("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/checkout/portal");
      if (data.portal_url) {
        window.location.href = data.portal_url; // 🚀 Redirect to Portal
      }
    } catch (error) {
      console.error("Portal failed", error);
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, manageSubscription, loading };
};
```

## 4. 📄 Update Pricing Page

**Before (Stripe):**

```tsx
const handleBuy = (priceId) => {
  // Complex Stripe Promise logic...
};
```

**After (Lemon Squeezy):**

```tsx
const { subscribe, loading } = useSubscription();

return (
  <PricingCard
    title="Starter"
    onSelect={() => subscribe("starter", "monthly")}
    isLoading={loading}
  />
);
```

## 5. ✅ Success Page

Lemon Squeezy will redirect users back to:
`https://easywrite.dev/dashboard/subscription?success=true`

Ensure your Dashboard checks for `?success=true` to show a "Thanks for subscribing!" toast (optional, as the webhook will update the state in the background).
