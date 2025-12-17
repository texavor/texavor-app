# Frontend Guide: Image Upload Implementation

This guide details how to implement the decoupled image upload flow in the frontend. Instead of uploading the image directly with the article data, we now upload the image first to a dedicated endpoint, receive a permanent URL, and then attach that URL to the article.

## 1. API Endpoint

- **Method:** `POST`
- **URL:** `/api/v1/images`
- **Authentication:** Required (Standard Bearer Token via `axiosInstance`)
- **Content-Type:** `multipart/form-data`

### Request Body (FormData)

| Key               | Type   | Description                                                          |
| ----------------- | ------ | -------------------------------------------------------------------- |
| `image[file]`     | File   | **Required**. The image file object (PNG, JPG, WEBP, GIF). Max 10MB. |
| `image[alt_text]` | String | _Optional_. Alt text for the image.                                  |

### Success Response (201 Created)

```json
{
  "id": "uuid-string",
  "url": "https://storage-url.com/container/filename.jpg"
}
```

### Error Response (422 Unprocessable Entity)

```json
{
  "errors": [
    "File must be less than 10MB",
    "File must be a PNG, JPG, JPEG, WebP, or GIF image"
  ]
}
```

---

## 2. Implementation Logic

We use `axiosInstance` and `FormData` to send the file.

### Step 1: Create the Upload Function

Use this helper function in your service layer (e.g., `services/imageService.ts`).

```typescript
import axiosInstance from "@/lib/axios"; // Adjust path to your axiosInstance

export interface ImageUploadResponse {
  id: string;
  url: string;
}

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image[file]", file);
  // formData.append('image[alt_text]', "Optional alt text");

  try {
    const response = await axiosInstance.post<ImageUploadResponse>(
      "/api/v1/images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error; // Let global error handler or component handle it
  }
};
```

### Step 2: Integrate into Component (e.g., Article Editor)

When the user selects a cover image:

1.  Trigger the `uploadImage` function immediately.
2.  Show a loading state for the image.
3.  On success, receive the `url`.
4.  Update your local form state's `thumbnail_url` (or `thumbnail` if you map it) with this string.

```typescript
// Example inside access handler of a file input or dropzone
const handleImageSelect = async (file: File) => {
  setIsUploading(true);
  try {
    const imageUrl = await uploadImage(file);

    // Update your form state (e.g., React Hook Form)
    setValue("thumbnail_url", imageUrl);

    // Display the preview
    setPreviewUrl(imageUrl);
  } catch (error) {
    // Error handling
  } finally {
    setIsUploading(false);
  }
};
```

### Step 3: Submitting the Article

When submitting the article (Create or Update), simply pass the URL string. You no longer need to send a `File` object to the Article controller.

**Payload to `POST /api/v1/blogs/:id/articles`:**

```json
{
  "article": {
    "title": "My Article",
    "content": "...",
    "thumbnail_url": "https://storage-url.com/container/filename.jpg"
  }
}
```

> **Note:** The backend `ArticlesController` is configured to look for `thumbnail_url`. This URL is public and valid indefinitely.

## Summary of Changes from Previous Flow

- **Before:** You might have been sending `thumbnail` as a binary file inside the Article FormData.
- **Now:**
  1. Upload `image[file]` to `/api/v1/images` -> Get URL.
  2. Send `thumbnail_url` field to Article endpoint.
