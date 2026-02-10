# Frontend API Guide: AI Credits System

This guide explains how to transition the EasyWrite frontend from the old usage counters to the new **Dynamic Credit Model**.

## 1. Unified Usage & Credits API

The existing `/api/v1/blogs/:blog_id/usage` endpoint has been updated. Use this as your primary source for both usage stats and credit balance.

**Endpoint**: `GET /api/v1/blogs/:blog_id/usage`

**Key Response Fields**:

```json
{
  "credits": {
    "balance": 1100,
    "usage_forecast": {
      "articles": 110,
      "detailed_research": 44,
      "deep_research": 14,
      "keyword_discovery": 3
    },
    "forecast_message": "Can generate ~110 articles"
  },
  "current_month": {
    "articles_created": 5,
    "articles_limit": 10
  }
}
```

## 2. Wallet API (Specific Context)

For dedicated billing pages or headers where you only need the balance.

**Endpoint**: `GET /api/v1/blogs/:blog_id/wallet`

**Response**:

```json
{
  "balance": 1100,
  "predicted_usage": "Can generate ~110 articles"
}
```

## 3. Transaction History

To show a ledger of how credits were spent.

**Endpoint**: `GET /api/v1/blogs/:blog_id/credit_transactions`

**Response**:

```json
[
  {
    "id": 10,
    "amount": -75,
    "balance_after": 1025,
    "feature_name": "outline_generation",
    "metadata": {
      "topic": "SaaS Pricing",
      "deep_research": true,
      "usage": { "search_api_call": 5, "azure_input_token": 5000 }
    },
    "created_at": "2026-02-10T08:31:44Z"
  }
]
```

## 4. Implementation Recommendations

1.  **Header Balance**: Replace "5/10 Articles" with "1,100 Credits" in the app header.
2.  **Usage Forecast**: Use the `usage_forecast` object to show a tooltip like: _"You have enough credits for ~110 standard articles or 14 deep research tasks."_
3.  **Cost Warning**: For expensive features like **Keyword Discovery**, show a confirmation modal: _"This task will use approximately 350 credits. Proceed?"_
4.  **Transaction Detail**: In the billing history, use the `metadata.usage` to show exactly why a charge occurred (e.g. "Includes 5 Search API calls").

## 5. Error Handling (Credit Exhaustion)

If a user attempts an action that costs more credits than they have, the API will return a **402 Payment Required** error.

**Status Code**: `402 Payment Required`

**Response**:

```json
{
  "error": "Insufficient credits",
  "message": "Insufficient credits. Required: 350, Available: 20",
  "code": "INSUFFICIENT_CREDITS"
}
```

**Frontend Action**: When you receive a `402` with code `INSUFFICIENT_CREDITS`, you should trigger the "Top Up" or "Upgrade" modal automatically.
