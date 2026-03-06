# Frontend API Integration Guide: Topical Authority Map Builder

This guide explains how to integrate the new Topical Authority Map generation feature into the frontend. Generating a 50+ node topical authority map takes a considerable amount of time (30-60 seconds) due to multi-source SERP gathering and LLM reasoning. Therefore, the architecture uses an **asynchronous polling pattern**.

---

## 0. Discover Seed Topics (Optional Pre-Flight)

**Endpoint:** `GET /api/v1/blogs/:blog_id/topical_authorities/suggest_seeds`

This is a synchronous API that analyzes the existing blog profile (target audience, product description, existing articles) and uses AI to suggest 10 highly relevant Seed Topics. This is very useful for users who don't know what broad topic to build a map around. This request costs **25 credits** to execute.

**Responses:**

- **200 OK (Success)**
  Returns 10 suggested seed topics with a brand relevance score.

  ```json
  {
    "status": 200,
    "data": {
      "seeds": [
        {
          "topic": "SaaS Content Marketing Automation",
          "relevance_score": 95,
          "reasoning": "Directly targets marketing professionals and aligns perfectly with your software product offering."
        }
      ]
    }
  }
  ```

- **402 Payment Required**
  If the user does not have 25 credits.

---

## 1. Initiate Generation & Credit Hold

**Endpoint:** `POST /api/v1/blogs/:blog_id/topical_authorities`

This endpoint initiates the generation process. It will synchronous perform a credit check. Generating a map requires an upfront hold of **350 credits**.

**Request Body:**

```json
{
  "topic": "SaaS Marketing",
  "tone": "professional", // Optional: defaults to blog's tone
  "target_audience": "founders", // Optional: defaults to blog's audience
  "author_name": "Jane Doe", // Optional: injects human attribution
  "expertise_context": "We have 10 years experience scaling B2B SaaS MRR", // Optional: informs LLM on specific expertise angles
  "editorial_guidelines": "Must include data-backed case studies" // Optional: enforces strict editorial logic
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
      "total_nodes": 124,
      "pillars": [
        {
          "type": "pillar",
          "title": "The Ultimate Guide to SaaS Marketing",
          "description": "...",
          "relevance_score": 100,
          "subtopics": [
            {
              "type": "subtopic",
              "title": "B2B SaaS Content Strategy",
              "description": "...",
              "relevance_score": 90,
              "supporting_articles": [
                {
                  "type": "article",
                  "title": "How We Used Content Clusters to Triple Organic Traffic",
                  "slug": "/content-clusters-saas-crm-growth",
                  "description": "A detailed case study on...",
                  "primary_keyword": "saas content clusters",
                  "supporting_keywords": [
                    "seo content clusters",
                    "crm organic growth"
                  ],
                  "search_intent": "Informational",
                  "funnel_stage": "MOFU",
                  "editorial_angle": "Explains how...",
                  "experience_hook": "Insights from scaling a CRM SaaS blog...",
                  "format": "Case Study",
                  "schema_type": ["Article", "HowTo"],
                  "content_outline": [
                    "Introduction: Why Content Clusters Matter",
                    "Step 1: Identifying High-Intent Keywords"
                  ],
                  "relevance_score": 80,
                  "search_volume": 1200,
                  "keyword_difficulty": 38,
                  "internal_links": [
                    "A Data-Backed Guide to Designing SaaS Content Clusters",
                    "B2B SaaS Content Strategy"
                  ]
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
  **Crucial:** A refund of 400 credits has already been applied automatically to the user's wallet. You should display the `error` and strongly encourage the user to use the `suggested_topic`.

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

## 3. Retrieving Past Maps (Index)

**Endpoint:** `GET /api/v1/blogs/:blog_id/topical_authorities`

This endpoint returns a 50-item list of all previously started (pending, processing, completed, or failed) Topical Authority maps for the blog, ordered from newest to oldest.

**Responses:**

- **200 OK (Success)**

  ```json
  {
    "status": 200,
    "data": [
      {
        "id": "1bb8719a-9a91-40f3-941c-fe132e1e0d18",
        "topic": "SaaS Marketing",
        "job_status": "completed",
        "created_at": "2026-02-24T18:40:00.000Z",
        "total_nodes": 124
      }
    ]
  }
  ```

---

## 4. Frontend Visualization Strategy (UI/UX Recommendations)

A standard Topical Map generated by this engine contains **120+ nodes**. It is a massive, highly valuable programmatic architecture. Displaying this effectively is critical so the user is "wowed" and understands the value.

### Recommended UI Components (`Shadcn UI`)

1. **The High-Level Overview (Hero Section)**
   - At the top of the map view, show large Statistic Cards (use Shadcn `Card` + generic semantic icons):
     - **Pillars:** 4
     - **Subtopics:** 20
     - **Articles:** 100
     - **Total Nodes:** 124
   - _Why?_ This immediately communicates the immense scale of what the AI just built for them.

2. **The Map Explorer (Nested Accordions or Sidebar Layout)**
   - Because a tree map is deep, DO NOT render all 120 nodes on screen at once.
   - **Best Approach:** Use a two-pane layout.
     - **Left Sidebar:** A nested navigation tree. Show the 4 Pillars as top-level items. Users click a Pillar to expand and see its 5 Subtopics.
     - **Main Content Area:** When a user clicks a _Subtopic_ in the sidebar, the main area populates with the 5 `supporting_articles` belonging to it.
   - **Alternative (Simpler):** Use heavily nested Shadcn `Accordion` components, but ensure clear border separation and indentation.

3. **The Article Card (The "Brief" View)**
   - For each article, render a rich card that exposes the SEO intelligence:
     - **Badges:** `Primary Keyword`, `MOFU` (Funnel Stage), `Case Study` (Format), `Vol: 1200 / KD: 38`.
     - **Content Outline:** Render the `content_outline` array as a clean bulleted list, representing the H2 structure.
     - **E-E-A-T Hook:** Display the `experience_hook` visibly so users know _how_ the article will be uniquely positioned.

4. **Visualizing the Internal Link Graph**
   - Every article has an `internal_links` array containing exact titles of other nodes.
   - **In the UI:** Inside the Article Card, render a section called "Links To:" and list the titles as clickable jump-links (or visually distinct tags) that scroll the user to that specific sibling article in the UI.
   - **Why?** Showing that "Article A" connects directly to "Article B" proves to the user that this isn't just a random list of titles, but a true interconnected SEO cluster.

---

## 5. Example Frontend Implementation Flow (React/Zustand)

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
