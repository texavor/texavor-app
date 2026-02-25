# Frontend API Integration Guide: Topical Authority Map Builder

This guide explains how to integrate the new Topical Authority Map generation feature into the frontend. Generating a 50+ node topical authority map takes a considerable amount of time (30-60 seconds) due to multi-source SERP gathering and LLM reasoning. Therefore, the architecture uses an **asynchronous polling pattern**.

---

## 1. Initiate Generation & Credit Hold

**Endpoint:** `POST /api/v1/blogs/:blog_id/topical_authorities`

This endpoint initiates the generation process. It will synchronous perform a credit check. Generating a map requires an upfront hold of **350 credits**.

**Request Body:**

```json
{
  "topic": "SaaS Marketing",
  "tone": "professional", // Optional: defaults to blog's tone
  "target_audience": "founders" // Optional: defaults to blog's audience
}
```

**Responses:**

- **202 Accepted (Success)**
  The process has started successfully in the background. Note the `job_id`.

  ```json
  {
    "status": 202,
    "message": "Topical Authority map generation started.",
    "job_id": 1234
  }
  ```

- **402 Payment Required (Insufficient Credits)**
  The user does not have 350 credits in their wallet. Display an upgrade/top-up prompt.

  ```json
  {
    "status": 402,
    "error": "Insufficient credits. Generating a massive 3-Tier Topical Map requires 350 credits."
  }
  ```

- **403 Forbidden (Plan Restriction)**
  The user is on a Free or Trial plan. Topical Authority is a paid feature. Display a Pro/Business upgrade prompt.

  ```json
  {
    "error": "Subscription limit reached",
    "message": "You've used 0 of 0 topical_authorities this month. Upgrade to get more!",
    "upgrade_required": true
  }
  ```

- **422 Unprocessable Entity (Invalid Topic)**
  ```json
  {
    "status": 422,
    "error": "Topic cannot be empty"
  }
  ```

---

## 2. Polling for Completion

**Endpoint:** `GET /api/v1/blogs/:blog_id/topical_authorities/:id`

Once you receive a `job_id` (which is the `id` of the ToolResult row) from the POST request, the frontend should immediately begin polling this endpoint.
**Recommended Polling Interval:** Every 3 seconds (`setInterval`).

**Responses:**

- **200 OK (Still Processing)**
  Keep polling.

  ```json
  {
    "status": 200,
    "job_status": "pending", // or "processing"
    "data": null
  }
  ```

- **200 OK (Completed Successfully)**
  The job finished and the massive JSON map is returned in `data`. You should stop polling and render the visual map.

  ```json
  {
    "status": 200,
    "job_status": "completed",
    "data": {
      "seed_topic": "SaaS Marketing",
      "total_nodes": 54,
      "pillars": [
        {
          "title": "The Ultimate Guide to SaaS Marketing",
          "description": "...",
          "relevance_score": 100,
          "subtopics": [
            {
              "title": "B2B SaaS Content Strategy",
              "relevance_score": 90,
              "supporting_articles": [
                {
                  "title": "How to build a SaaS content engine",
                  "relevance_score": 85
                }
              ]
            }
          ]
        }
      ]
    }
  }
  ```

- **200 OK (Validation Failed - Refund Issued)**
  If the `job_status` is `"failed"` but `data.status` is `"validation_failed"`, it means our rigorous pre-flight checks (Business Relevance, SEO Competition, Topic Breadth, Search Demand) aborted the generation.
  **Crucial:** A refund of 350 credits has already been applied automatically to the user's wallet. You should display the `error` and strongly encourage the user to use the `suggested_topic`.

  ```json
  {
    "status": 200,
    "job_status": "failed",
    "data": {
      "status": "validation_failed",
      "error": "Competition Validation Failed: The top search results are completely dominated by massive sites. You will not rank.",
      "suggested_topic": "SaaS marketing for bootstrapped startups"
    }
  }
  ```

- **200 OK (System Error - Refund Issued)**
  If the `job_status` is `"failed"` due to a general error, the credits have also been automatically refunded.
  ```json
  {
    "status": 200,
    "job_status": "failed",
    "data": {
      "error": "An unexpected system error occurred during generation."
    }
  }
  ```

---

## Example Frontend Implementation Flow (React/Zustand)

```typescript
const generateMap = async (topic: string) => {
  setIsLoading(true);

  try {
    // 1. Initiate Generation
    const response = await axiosInstance.post(
      `/api/v1/blogs/${blogId}/topical_authorities`,
      { topic },
    );
    const jobId = response.data.job_id;

    // 2. Start Polling
    const intervalId = setInterval(async () => {
      const pollRes = await axiosInstance.get(
        `/api/v1/blogs/${blogId}/topical_authorities/${jobId}`,
      );
      const status = pollRes.data.job_status;

      if (status === "completed") {
        clearInterval(intervalId);
        setTopicalMap(pollRes.data.data);
        setIsLoading(false);
      } else if (status === "failed") {
        clearInterval(intervalId);
        setIsLoading(false);

        // Check if it was a validation block (refunded)
        if (pollRes.data.data?.status === "validation_failed") {
          showToastError(pollRes.data.data.error); // E.g., "Topic too broad"
          setSuggestedTopic(pollRes.data.data.suggested_topic);
        } else {
          showToastError("An error occurred during generation.");
        }
      }
      // if 'pending' or 'processing', do nothing, let interval run again
    }, 3000);
  } catch (error) {
    setIsLoading(false);
    // Handle 402 Insufficient Credits or 403 Subscription Limits here via standard error interceptors
  }
};
```
