# API Guide: Prompt Research Mode

**Feature:** Prompt Research (Thinking like an AI)
**Goal:** Instead of just keywords, find the actual _prompts_ users type into ChatGPT to find your content.

## 1. Endpoint Overview

**URL:** `GET /api/v1/blogs/:blog_id/keyword_research/search`
**Auth:** Bearer Token (Authenticated User)

### Parameters:

| Param     | Type      | Required | Description                            |
| :-------- | :-------- | :------- | :------------------------------------- |
| `query`   | `string`  | **Yes**  | The core topic (e.g., "SaaS Pricing"). |
| `mode`    | `string`  | **Yes**  | Set to `prompt` to activate this mode. |
| `blog_id` | `integer` | **Yes**  | ID of the current blog context.        |

---

## 2. Response Structure

The API returns a hybrid list of "Real Questions" (Google) and "Predicted Prompts" (Azure OpenAI), both graded by their `ai_visibility_score`.

**Request:**

```bash
GET /api/v1/blogs/1/keyword_research/search?query=keto+diet&mode=prompt
```

**Response:**

```json
{
  "seed": {
    "term": "keto diet",
    "type": "prompt_seed",
    "ai_visibility_score": 6
  },
  "related": [
    {
      "term": "what can i eat on a keto diet for beginners",
      "type": "google_question", // Real user question from Google
      "source": "google_autocomplete",
      "ai_visibility_score": 9 // High intent!
    },
    {
      "term": "Write a 7-day keto meal plan for weight loss",
      "type": "ai_prediction", // Synthesized prompt (What AI expects)
      "source": "azure_openai",
      "ai_visibility_score": 10 // Perfect structure for LLM
    }
  ]
}
```

---

## 3. Frontend Implementation Guidelines

### A. Segmenting the List

You should display the results in two potential ways:

1.  **Unified List:** Sorted by `ai_visibility_score` (Highest first).
2.  **Grouped:** "Questions People Ask" vs "Commands for AI".

### B. Visual Chips

- **Type: `google_question`** -> Badge: "Human Search" (Icon: Google/Magnifying Glass)
- **Type: `ai_prediction`** -> Badge: "AI Prompt" (Icon: Sparkles/Robot)

### C. Typescript Interface

```typescript
interface PromptResult {
  term: string;
  type: "google_question" | "ai_prediction" | "prompt_seed";
  source: "google_autocomplete" | "azure_openai";
  ai_visibility_score: number;
}
```
