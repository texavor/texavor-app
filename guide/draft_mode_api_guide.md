# Draft Mode - API Integration Guide

This guide explains how to integrate the Draft Mode generation feature into the frontend editor.

## 1. Trigger Draft Generation

Start the asynchronous generation process for an article. If the article doesn't have an outline, one will be automatically generated via "Deep Research" before drafting.

- **Endpoint**: `POST /api/v1/blogs/:blog_id/articles/:id/generate_draft`
- **Auth**: Required (Bearer Token)
- **Response** (Status 202 Accepted):

```json
{
  "article_id": "uuid",
  "job_id": "uuid",
  "status": "processing",
  "message": "Draft generation has been queued."
}
```

## 2. Track Generation Progress

Use the `job_id` returned in the previous step to poll for the current status.

- **Endpoint**: `GET /api/v1/blogs/:blog_id/job_statuses/:job_id`
- **Auth**: Required
- **Response Fields**:
  - `status`: `pending`, `processing`, `completed`, or `failed`.
  - `result`: Contains metadata if available (e.g., `article_id`, `current_step`, `percentage`).
  - `error_message`: Present if status is `failed`.

- **Processing Response Example** (Status 200 OK):

```json
{
  "id": "uuid",
  "status": "processing",
  "job_type": "generate_draft",
  "error_message": null,
  "result": {
    "article_id": "uuid",
    "current_step": "Writing Section 2/5: Technical architecture...",
    "percentage": 45
  },
  "completed_at": null
}
```

- **Success Response Example** (Status 200 OK):

```json
{
  "id": "uuid",
  "status": "completed",
  "job_type": "generate_draft",
  "error_message": null,
  "result": {
    "article_id": "uuid",
    "current_step": "Completed",
    "percentage": 100
  },
  "completed_at": "2024-03-10T..."
}
```

## 3. Retrieve the Generated Draft

Once the job status is `completed`, refetch the article to get the new content.

- **Endpoint**: `GET /api/v1/blogs/:blog_id/articles/:id`
- **Key Fields**:
  - `content`: The full AI-generated draft (Markdown).
  - `status`: Will be set to `draft`.

---

### Suggested Frontend Workflow

1. User clicks **"Generate AI Draft"** in the editor.
2. Frontend calls **Trigger Endpoint** and receives `job_id`.
3. Show a loading overlay: _"Researching and Writing... (Step 1/2)"_.
4. **Poll** the Job Status endpoint every 3-5 seconds.
5. When `status === 'completed'`:
   - Fetch the latest article content.
   - Update the editor state.
   - Show a success toast: _"Draft generated successfully!"_.
6. If `status === 'failed'`:
   - Show error message: `error_message`.
