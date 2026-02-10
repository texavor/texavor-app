# AI Credit System - Frontend Integration Guide

## Overview

The AI Credit System tracks and limits AI feature usage at the **blog level**. Each blog has its own credit balance based on the subscription tier.

**Exchange Rate:** 100 Credits = $1.00 USD

---

## Credit Limits by Tier

| Tier         | Monthly Credits | Dollar Value |
| ------------ | --------------- | ------------ |
| Free         | 100             | $1.00        |
| Starter      | 1,000           | $10.00       |
| Professional | 2,500           | $25.00       |
| Business     | 5,000           | $50.00       |
| Enterprise   | 10,000          | $100.00      |

---

## Feature Costs

| Feature          | Credit Cost  | Notes                                  |
| ---------------- | ------------ | -------------------------------------- |
| Grammar Check    | 1-3 credits  | Token-based (varies by article length) |
| Article Analysis | 5-15 credits | Token-based (varies by article length) |
| Keyword Research | 5 credits    | Fixed cost per query                   |
| Image Generation | 8 credits    | Fixed cost per image                   |
| Topic Generation | 3-10 credits | Token-based                            |

---

## API Endpoints

### 1. Get Credit Balance

**Endpoint:** `GET /api/v1/blogs/:blog_id/credits`

**Description:** Fetch current credit balance and usage statistics for a blog.

**Response:**

```json
{
  "credits": {
    "remaining": 850.0,
    "limit": 1000.0,
    "used_this_month": 150.0,
    "total_used": 450.0,
    "usage_percentage": 15.0,
    "reset_at": "2026-03-06T18:03:16.949Z"
  },
  "tier": "starter"
}
```

**Implementation Example:**

```typescript
const fetchCreditBalance = async (blogId: string) => {
  const response = await axiosInstance.get(`/api/v1/blogs/${blogId}/credits`);
  return response.data;
};
```

---

### 2. Get Credit Transaction History

**Endpoint:** `GET /api/v1/blogs/:blog_id/credits/transactions`

**Query Parameters:**

- `limit` (optional): Number of transactions to return (default: 20, max: 100)
- `feature` (optional): Filter by feature name

**Response:**

```json
{
  "transactions": [
    {
      "id": "uuid",
      "feature": "grammar_check",
      "amount": -2.5,
      "metadata": {
        "input_tokens": 1000,
        "output_tokens": 500,
        "content_length": 3000
      },
      "created_at": "2026-02-06T18:03:16.915Z"
    },
    {
      "id": "uuid",
      "feature": "keyword_research",
      "amount": -5.0,
      "metadata": {
        "query": "react hooks",
        "provider": "dataforseo"
      },
      "created_at": "2026-02-06T17:45:10.123Z"
    }
  ],
  "total_count": 45
}
```

**Implementation Example:**

```typescript
const fetchTransactions = async (blogId: string, limit = 20) => {
  const response = await axiosInstance.get(
    `/api/v1/blogs/${blogId}/credits/transactions`,
    { params: { limit } },
  );
  return response.data;
};
```

---

### 3. Get Usage Statistics

**Endpoint:** `GET /api/v1/blogs/:blog_id/credits/usage`

**Description:** Get breakdown of credit usage by feature.

**Response:**

```json
{
  "usage_by_feature": {
    "grammar_check": 45.5,
    "keyword_research": 75.0,
    "image_generation": 24.0,
    "article_analysis": 5.5
  },
  "total_used": 150.0,
  "period": "current_month"
}
```

---

## Error Handling

### Insufficient Credits Error

When a user tries to use a feature without enough credits, the API returns:

**Status Code:** `402 Payment Required`

**Response:**

```json
{
  "error": "Insufficient credits",
  "message": "You don't have enough credits to generate an image. Please upgrade your plan.",
  "required": 8.0,
  "available": 2.5,
  "upgrade_url": "/pricing"
}
```

**Frontend Handling:**

```typescript
try {
  await generateImage(prompt);
} catch (error) {
  if (error.response?.status === 402) {
    // Show upgrade modal or toast
    showUpgradeModal({
      message: error.response.data.message,
      required: error.response.data.required,
      available: error.response.data.available,
    });
  }
}
```

---

## UI Components

### 1. Credit Balance Display

**Location:** Dashboard header, settings page

**Design:**

```tsx
<div className="credit-balance">
  <div className="credit-info">
    <span className="label">AI Credits</span>
    <span className="balance">{credits.remaining.toLocaleString()}</span>
    <span className="limit">/ {credits.limit.toLocaleString()}</span>
  </div>
  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${credits.usage_percentage}%` }}
    />
  </div>
  <span className="reset-date">Resets on {formatDate(credits.reset_at)}</span>
</div>
```

**Color Coding:**

- Green: 0-50% used
- Yellow: 50-80% used
- Red: 80-100% used

---

### 2. Credit Cost Preview

**Location:** Before AI operations (image generation, keyword research)

**Design:**

```tsx
<div className="credit-cost-preview">
  <InfoIcon />
  <span>This will use 8 credits</span>
  <span className="remaining">({remainingCredits} remaining)</span>
</div>
```

---

### 3. Upgrade Prompt

**Trigger:** When credits < 20% or operation fails due to insufficient credits

**Design:**

```tsx
<Modal>
  <h3>Running Low on Credits</h3>
  <p>You have {credits.remaining} credits remaining.</p>
  <p>Upgrade to get more credits and unlock unlimited features.</p>

  <div className="tier-comparison">
    <TierCard tier="starter" credits={1000} />
    <TierCard tier="professional" credits={2500} highlighted />
    <TierCard tier="business" credits={5000} />
  </div>

  <Button onClick={handleUpgrade}>Upgrade Now</Button>
</Modal>
```

---

## Real-Time Updates

### Using React Query

```typescript
// hooks/useCredits.ts
import { useQuery } from "@tanstack/react-query";

export const useCredits = (blogId: string) => {
  return useQuery({
    queryKey: ["credits", blogId],
    queryFn: () => fetchCreditBalance(blogId),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30s
  });
};

// Usage in component
const { data: credits, isLoading } = useCredits(currentBlog.id);
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: generateImage,
  onMutate: async () => {
    // Optimistically deduct credits
    await queryClient.cancelQueries(["credits", blogId]);
    const previousCredits = queryClient.getQueryData(["credits", blogId]);

    queryClient.setQueryData(["credits", blogId], (old) => ({
      ...old,
      remaining: old.remaining - 8,
    }));

    return { previousCredits };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(["credits", blogId], context.previousCredits);
  },
  onSettled: () => {
    // Refetch to get accurate data
    queryClient.invalidateQueries(["credits", blogId]);
  },
});
```

---

## Feature-Specific Integration

### Image Generation

```typescript
const handleGenerateImage = async () => {
  // Check credits before operation
  if (credits.remaining < 8) {
    showUpgradeModal();
    return;
  }

  try {
    const result = await axiosInstance.post("/api/v1/blogs/generations", {
      prompt,
      style,
      blog_id: blogId,
    });

    // Credits automatically deducted by backend
    queryClient.invalidateQueries(["credits", blogId]);

    return result.data;
  } catch (error) {
    if (error.response?.status === 402) {
      showInsufficientCreditsError(error.response.data);
    }
  }
};
```

### Keyword Research

```typescript
const handleKeywordResearch = async (query: string) => {
  // Check credits (5 credits per query)
  if (credits.remaining < 5) {
    showUpgradeModal();
    return;
  }

  try {
    const result = await axiosInstance.get("/api/v1/keyword_research", {
      params: { query, blog_id: blogId },
    });

    queryClient.invalidateQueries(["credits", blogId]);
    return result.data;
  } catch (error) {
    handleCreditError(error);
  }
};
```

### Grammar Check

```typescript
const handleGrammarCheck = async (content: string) => {
  // Grammar check is token-based (1-3 credits)
  // Show estimated cost
  const estimatedCost = Math.ceil(content.length / 1000) * 2;

  if (credits.remaining < estimatedCost) {
    showUpgradeModal();
    return;
  }

  try {
    const result = await axiosInstance.post("/api/v1/articles/analyze", {
      content,
      blog_id: blogId,
    });

    queryClient.invalidateQueries(["credits", blogId]);
    return result.data;
  } catch (error) {
    handleCreditError(error);
  }
};
```

---

## Analytics & Tracking

### Credit Usage Chart

Display credit usage over time:

```typescript
const { data: transactions } = useQuery({
  queryKey: ["credit-transactions", blogId],
  queryFn: () => fetchTransactions(blogId, 100),
});

// Group by date for chart
const chartData = transactions.reduce((acc, txn) => {
  const date = format(new Date(txn.created_at), "MMM dd");
  acc[date] = (acc[date] || 0) + Math.abs(txn.amount);
  return acc;
}, {});
```

### Feature Usage Breakdown

```typescript
const { data: usage } = useQuery({
  queryKey: ['credit-usage', blogId],
  queryFn: () => fetchUsageStats(blogId)
});

// Display as pie chart or bar chart
<PieChart data={usage.usage_by_feature} />
```

---

## Best Practices

1. **Always check credits before operations** - Prevent failed requests
2. **Show cost previews** - Let users know what they're spending
3. **Use optimistic updates** - Better UX, but always refetch
4. **Cache credit data** - Reduce API calls, but keep it fresh
5. **Handle errors gracefully** - Show helpful upgrade prompts
6. **Display usage analytics** - Help users understand their consumption
7. **Warn at thresholds** - Alert at 80% and 95% usage

---

## Testing

### Mock Data

```typescript
export const mockCredits = {
  remaining: 850,
  limit: 1000,
  used_this_month: 150,
  total_used: 450,
  usage_percentage: 15,
  reset_at: "2026-03-06T18:03:16.949Z",
};

export const mockTransactions = [
  {
    id: "1",
    feature: "grammar_check",
    amount: -2.5,
    metadata: { input_tokens: 1000, output_tokens: 500 },
    created_at: "2026-02-06T18:03:16.915Z",
  },
];
```

### Test Scenarios

1. **Sufficient credits** - Operation succeeds
2. **Insufficient credits** - Shows upgrade modal
3. **Credit depletion** - Handles 402 error
4. **Credit reset** - Updates UI when credits reset
5. **Multiple blogs** - Switches credit context correctly

---

## Support

For backend implementation details, see:

- [`AiCreditService`](file:///e:/EasyWrite.Dev/easywrite/app/services/ai_credit_service.rb)
- [`SubscriptionLimitsService`](file:///e:/EasyWrite.Dev/easywrite/app/services/subscription_limits_service.rb)
- [Credit Limits Guide](file:///e:/EasyWrite.Dev/easywrite/docs/guides/ai_credit_limits.md)
