# Frontend Guide: Async Freshness Analysis

Since `check_freshness` is now an asynchronous background job (latency ~5-10s), the frontend needs to **Poll** the API to check when the result is ready.

## Recommended UX Flow

1. User clicks **"Check Freshness"**.
2. Button shows **Spinner / "Analyzing..."**.
3. Frontend polls `GET /api/v1/blogs/:id/articles/:id` every **3 seconds**.
4. When `freshness_score` updates (or `last_updated` changes), we stop polling.
5. UI updates with the new score.

---

## React / TypeScript Implementation

Here is a ready-to-use hook and handler function.

```tsx
import { useState, useRef } from "react";
import { toast } from "sonner"; // or your toast library of choice

export const useFreshnessAnalysis = (
  blogId: string,
  articleId: string,
  onUpdate: (article: any) => void
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const MAX_ATTEMPTS = 20; // Stop after 60 seconds (20 * 3s)

  const checkFreshness = async () => {
    setIsAnalyzing(true);
    let attempts = 0;

    try {
      // 1. Trigger Analysis
      const triggerRes = await fetch(
        `/api/v1/blogs/${blogId}/articles/${articleId}/check_freshness`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // Add Auth headers if needed
        }
      );

      if (!triggerRes.ok) throw new Error("Failed to start analysis");

      // toast.info("Analyzing content freshness...");

      // 2. Start Polling
      pollInterval.current = setInterval(async () => {
        attempts++;

        try {
          const res = await fetch(
            `/api/v1/blogs/${blogId}/articles/${articleId}`
          );
          const data = await res.json();

          // CHECK: specific conditions to know if it's done.
          // For now, we assume if we get a valid score (and maybe compare with old if passed) it's good.
          // Or better: check if `needs_freshness_update` becomes false?

          if (
            data.freshness_score !== null &&
            data.freshness_score !== undefined
          ) {
            // Success condition met
            clearInterval(pollInterval.current!);
            setIsAnalyzing(false);
            onUpdate(data);
            // toast.success("Freshness analysis complete!");
          }

          if (attempts >= MAX_ATTEMPTS) {
            clearInterval(pollInterval.current!);
            setIsAnalyzing(false);
            toast.warning(
              "Analysis is taking longer than expected. Please refresh manually."
            );
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000); // Poll every 3 seconds
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
      toast.error("Failed to start analysis");
    }
  };

  // Cleanup on unmount
  // useEffect(() => () => clearInterval(pollInterval.current), []);

  return { checkFreshness, isAnalyzing };
};
```

### Usage in Component

```tsx
const MyArticleComponent = ({ article }) => {
  const { checkFreshness, isAnalyzing } = useFreshnessAnalysis(
    article.blog_id,
    article.id,
    (updatedArticle) => {
      // Update local state with new article data
      setArticle(updatedArticle);
    }
  );

  return (
    <Button onClick={checkFreshness} disabled={isAnalyzing}>
      {isAnalyzing ? (
        <>
          <Spinner className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        "Check Freshness"
      )}
    </Button>
  );
};
```
