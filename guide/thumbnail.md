# Thumbnail Templates API Guide

## Overview

The Thumbnail Templates API allows you to generate reusable thumbnail style templates for your blog. Each template can be used across multiple articles with two variation types:

- **Minimal**: Consistent look, only text/icon changes
- **Full**: Adapts to content while maintaining overall style

**Base URL:** `https://api.easywrite.com/api/v1`

---

## Endpoints

### 1. Analyze & Generate Thumbnail Templates

Generate 6 custom thumbnail style templates based on your brand.

**Endpoint:** `POST /blogs/:blog_id/thumbnail_styles/analyze`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**

| Parameter     | Type   | Required | Description                                                  |
| ------------- | ------ | -------- | ------------------------------------------------------------ |
| `url`         | string | No       | Your website URL for brand analysis                          |
| `description` | string | No       | Brand description (falls back to blog's product_description) |

**Example Request:**

```javascript
const response = await axiosInstance.post(
  `/blogs/${blogId}/thumbnail_styles/analyze`,
  {
    url: "https://yourblog.com",
    description: "A modern tech blog focused on web development and AI",
  }
);
```

**Response (200 OK):**

```json
{
  "styles": [
    {
      "id": "style_1",
      "name": "Bold Gradient Tech",
      "description": "Vibrant purple-to-blue gradient background with centered icon and bottom text placement",
      "template_prompt": "Vibrant purple (#8B5CF6) to blue (#3B82F6) gradient background at 45-degree angle. Centered white circular icon placeholder (200px diameter). Title text area at bottom third in bold sans-serif white font (48px). Subtle geometric pattern overlay with 10% opacity.",
      "colors": ["#8B5CF6", "#3B82F6", "#FFFFFF"],
      "variation_type": "minimal",
      "text_placement": "bottom-third",
      "icon_style": "3D geometric shapes",
      "preview_url": "https://easywritedev.blob.core.windows.net/images/flux_abc123.png"
    },
    {
      "id": "style_2",
      "name": "Dynamic Topic Splash",
      "description": "Split-screen layout with topic-adaptive colors and icons",
      "template_prompt": "Split-screen layout: left 40% solid color block, right 60% complementary gradient. Icon on left side (150px). Title text overlays right gradient side in bold font. Colors and icon adapt to article topic while maintaining split-screen structure.",
      "colors": ["#10B981", "#34D399", "#FFFFFF"],
      "variation_type": "full",
      "text_placement": "right-side",
      "icon_style": "Flat minimalist icons",
      "preview_url": "https://easywritedev.blob.core.windows.net/images/flux_def456.png"
    }
    // ... 4 more styles (3 minimal + 3 full total)
  ]
}
```

---

### 2. Get Saved Thumbnail Styles

Retrieve previously generated thumbnail styles for your blog.

**Endpoint:** `GET /blogs/:blog_id/thumbnail_styles`

**Example Request:**

```javascript
const response = await axiosInstance.get(`/blogs/${blogId}/thumbnail_styles`);
```

**Response (200 OK):**

```json
{
  "styles": [
    {
      "id": "style_1",
      "name": "Bold Gradient Tech",
      "description": "...",
      "template_prompt": "...",
      "colors": ["#8B5CF6", "#3B82F6", "#FFFFFF"],
      "variation_type": "minimal",
      "text_placement": "bottom-third",
      "icon_style": "3D geometric shapes",
      "preview_url": "https://..."
    }
  ],
  "selected_style_id": "style_1"
}
```

---

### 3. Select a Thumbnail Style

Choose which thumbnail style to use for your blog.

**Endpoint:** `POST /blogs/:blog_id/thumbnail_styles/select`

**Request Body:**

| Parameter  | Type   | Required | Description                   |
| ---------- | ------ | -------- | ----------------------------- |
| `style_id` | string | Yes      | The ID of the style to select |

**Example Request:**

```javascript
const response = await axiosInstance.post(
  `/blogs/${blogId}/thumbnail_styles/select`,
  {
    style_id: "style_1",
  }
);
```

**Response (200 OK):**

```json
{
  "message": "Style selected successfully",
  "selected_style_id": "style_1"
}
```

---

### 4. Update Thumbnail Dimensions

Set custom dimensions for generated thumbnails.

**Endpoint:** `PATCH /blogs/:blog_id/thumbnail_styles/update_settings`

**Request Body:**

| Parameter | Type    | Required | Description                               |
| --------- | ------- | -------- | ----------------------------------------- |
| `width`   | integer | Yes      | Width in pixels (must be multiple of 32)  |
| `height`  | integer | Yes      | Height in pixels (must be multiple of 32) |

**Constraints:**

- Min: 256x256
- Max: 2048x2048
- Must be multiples of 32 (e.g., 1024, 512, 416)

**Example Request:**

```javascript
const response = await axiosInstance.patch(
  `/blogs/${blogId}/thumbnail_styles/update_settings`,
  {
    width: 1024,
    height: 416,
  }
);
```

**Response (200 OK):**

```json
{
  "message": "Settings updated successfully",
  "width": 1024,
  "height": 416
}
```

---

## Understanding Variation Types

### Minimal Variation

**Use Case:** Consistent branding across all articles

**Behavior:**

- ✅ Same background colors and gradients
- ✅ Same layout structure
- ✅ Same visual elements (shapes, patterns)
- ✅ Only text and icon change per article

**Example:**

```
Article 1: Purple gradient + Code icon + "10 JavaScript Tips"
Article 2: Purple gradient + Code icon + "React Best Practices"
Article 3: Purple gradient + Code icon + "CSS Grid Guide"
```

All three look nearly identical except for the text.

### Full Variation

**Use Case:** Adaptive thumbnails that match article topics

**Behavior:**

- ✅ Layout structure stays consistent
- ✅ Colors adapt to article topic
- ✅ Icons change based on content
- ✅ Overall style/mood maintained

**Example:**

```
Article 1: Blue tones + Database icon + "SQL Optimization"
Article 2: Green tones + Plant icon + "Sustainable Tech"
Article 3: Orange tones + Rocket icon + "Startup Growth"
```

Same layout, but colors and icons match each topic.

---

## React/TypeScript Examples

### Analyze and Display Styles

```typescript
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

interface ThumbnailStyle {
  id: string;
  name: string;
  description: string;
  template_prompt: string;
  colors: string[];
  variation_type: "minimal" | "full";
  text_placement: string;
  icon_style: string;
  preview_url: string;
}

export function ThumbnailStyleAnalyzer({ blogId }: { blogId: string }) {
  const analyzeStyles = useMutation({
    mutationFn: async (data: { url?: string; description?: string }) => {
      const response = await axiosInstance.post(
        `/blogs/${blogId}/thumbnail_styles/analyze`,
        data
      );
      return response.data;
    },
  });

  const handleAnalyze = () => {
    analyzeStyles.mutate({
      url: "https://yourblog.com",
      description: "A modern tech blog",
    });
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={analyzeStyles.isPending}>
        {analyzeStyles.isPending ? "Analyzing..." : "Generate Styles"}
      </button>

      {analyzeStyles.data?.styles && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {analyzeStyles.data.styles.map((style: ThumbnailStyle) => (
            <StyleCard key={style.id} style={style} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Style Card Component

```typescript
function StyleCard({ style }: { style: ThumbnailStyle }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Preview Image */}
      <img
        src={style.preview_url}
        alt={style.name}
        className="w-full h-48 object-cover"
      />

      {/* Style Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{style.name}</h3>
          <span
            className={`text-xs px-2 py-1 rounded ${
              style.variation_type === "minimal"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {style.variation_type}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">{style.description}</p>

        {/* Color Palette */}
        <div className="flex gap-2 mb-3">
          {style.colors.map((color, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>📍 Text: {style.text_placement}</div>
          <div>🎨 Icon: {style.icon_style}</div>
        </div>

        <button
          onClick={() => selectStyle(style.id)}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Select Style
        </button>
      </div>
    </div>
  );
}
```

### Select Style

```typescript
function selectStyle(styleId: string) {
  const selectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post(
        `/blogs/${blogId}/thumbnail_styles/select`,
        { style_id: id }
      );
      return response.data;
    },
    onSuccess: () => {
      console.log("Style selected successfully");
      // Refresh styles or update UI
    },
  });

  selectMutation.mutate(styleId);
}
```

### Filter by Variation Type

```typescript
function ThumbnailStyleList({ styles }: { styles: ThumbnailStyle[] }) {
  const [filter, setFilter] = useState<"all" | "minimal" | "full">("all");

  const filteredStyles = styles.filter(
    (style) => filter === "all" || style.variation_type === filter
  );

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "active" : ""}
        >
          All Styles
        </button>
        <button
          onClick={() => setFilter("minimal")}
          className={filter === "minimal" ? "active" : ""}
        >
          Minimal Variation (Consistent)
        </button>
        <button
          onClick={() => setFilter("full")}
          className={filter === "full" ? "active" : ""}
        >
          Full Variation (Adaptive)
        </button>
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredStyles.map((style) => (
          <StyleCard key={style.id} style={style} />
        ))}
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. **Choose the Right Variation Type**

**Use Minimal When:**

- You want strong brand consistency
- All articles are in the same category
- You prefer a uniform look across your blog

**Use Full When:**

- You cover diverse topics
- You want thumbnails to visually match content
- You need flexibility while maintaining brand identity

### 2. **Optimize Dimensions**

Common thumbnail sizes:

- **YouTube**: 1280x720 (16:9)
- **Blog Standard**: 1024x416 (2.45:1)
- **Social Media**: 1200x630 (1.91:1)
- **Square**: 1024x1024 (1:1)

### 3. **Preview URLs**

All preview URLs are **permanent** and **public**:

- ✅ No expiry
- ✅ Accessible to anyone
- ✅ Can be used in frontend without authentication

### 4. **Re-analyze Periodically**

Re-run the analyze endpoint when:

- Your brand evolves
- You want fresh design ideas
- You're targeting a new audience

---

## Error Handling

```typescript
try {
  const response = await axiosInstance.post(
    `/blogs/${blogId}/thumbnail_styles/analyze`,
    { url: "https://yourblog.com" }
  );
  console.log("Styles generated:", response.data);
} catch (error) {
  if (error.response?.status === 500) {
    console.error("AI generation failed:", error.response.data.error);
  } else if (error.response?.status === 422) {
    console.error("Invalid parameters:", error.response.data.error);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

---

## Complete Workflow Example

```typescript
// 1. Analyze and generate styles
const analyzeResponse = await axiosInstance.post(
  `/blogs/${blogId}/thumbnail_styles/analyze`,
  {
    url: "https://techblog.com",
    description: "Modern web development tutorials",
  }
);

// 2. Display styles to user (they choose one)
const selectedStyleId = "style_3"; // User selection

// 3. Select the chosen style
await axiosInstance.post(`/blogs/${blogId}/thumbnail_styles/select`, {
  style_id: selectedStyleId,
});

// 4. Optionally update dimensions
await axiosInstance.patch(`/blogs/${blogId}/thumbnail_styles/update_settings`, {
  width: 1024,
  height: 416,
});

// 5. Now when creating articles with thumbnails,
//    the selected style will be used automatically
```

---

## Response Field Reference

| Field             | Type     | Description                                  |
| ----------------- | -------- | -------------------------------------------- |
| `id`              | string   | Unique identifier for the style              |
| `name`            | string   | Human-readable style name                    |
| `description`     | string   | Brief visual description (60 words)          |
| `template_prompt` | string   | Detailed prompt for consistent reproduction  |
| `colors`          | string[] | Hex color palette (3-4 colors)               |
| `variation_type`  | string   | "minimal" or "full"                          |
| `text_placement`  | string   | Where title text goes (e.g., "bottom-third") |
| `icon_style`      | string   | Icon/visual element style description        |
| `preview_url`     | string   | Permanent public URL to preview image        |

---

## Support

For issues or questions about the Thumbnail Templates API, contact the backend team or check the [main API documentation](./README.md).
