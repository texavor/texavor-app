"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@/components/Editor";
import InsightsPanel from "./InsightsPanel";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useParams } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import ArticleDetailsSheet from "@/components/ArticleDetailsSheet";
import { ThumbnailUploadDialog } from "@/components/ThumbnailUploadDialog";

export default function CreateArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { blogs, zenMode, toggleZenMode } = useAppStore();

  const existingId = params?.article_id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleId, setArticleId] = useState({ id: existingId });
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  // Prevent autosave from firing before initial fetch completes
  const isInitialLoadDone = useRef(false);

  const { data: fetchedArticle, isLoading } = useQuery({
    queryKey: ["article", existingId, blogs?.id],
    queryFn: async () => {
      // Don't fetch if it's a new article
      if (existingId === "new") {
        isInitialLoadDone.current = true;
        return null;
      }

      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/articles/${existingId}`
      );
      if (!res?.data) return null;
      return res.data;
    },
    enabled: !!existingId && !!blogs?.id && existingId !== "new",
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (fetchedArticle) {
      // Only update state if data has changed significantly or if it's initial load.
      // Since we disabled refetchOnWindowFocus, this mainly runs on navigation (ID change).
      setTitle(fetchedArticle.title || "");
      setContent(fetchedArticle.content || "");
      setThumbnailUrl(fetchedArticle.thumbnail_url || null);
      setArticleId(fetchedArticle);
      isInitialLoadDone.current = true;
    }
  }, [fetchedArticle]);

  const { data: fetchedInsights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["articleInsight", existingId, blogs?.id],
    queryFn: async () => {
      if (existingId === "new") return null;

      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/articles/${existingId}/article_analyses`
      );
      if (!res?.data) return null;
      return res.data;
    },
    enabled: !!existingId && !!blogs?.id && existingId !== "new",
  });

  useEffect(() => {
    if (fetchedInsights) {
      setInsights(fetchedInsights);
    }
  }, [fetchedInsights]);

  const createMutation = useMutation({
    mutationFn: async (payload: { title: string; content: string }) => {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogs.id}/articles`,
        { title: payload?.title, content: payload?.content, source: "texavor" }
      );
      return res.data;
    },
    onSuccess: (data) => {
      setArticleId(data); // Set the full article object
      // Optionally update URL without full reload if you want
      // router.replace(`/article/${data.id}`);
      // But replacing URL might trigger re-mount depending on Next.js config
      // For now, updating state is critical so subsequent saves use PATCH.
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axiosInstance.patch(
        `/api/v1/blogs/${blogs.id}/articles/${articleId?.id}`,
        payload
      );
    },
  });

  useEffect(() => {
    // Only block if we are expecting a specific existing article to load and it hasn't loaded yet
    if (existingId && existingId !== "new" && !isInitialLoadDone.current)
      return;

    const shouldSave =
      debouncedTitle.trim().length > 0 || debouncedContent.trim().length > 0;
    if (!shouldSave) return;

    // Check if we have a real ID (from DB) or if it's still 'new' or undefined
    const isNewArticle = !articleId?.id || articleId.id === "new";

    if (isNewArticle) {
      if (!createMutation.isPending) {
        createMutation.mutate({
          title: debouncedTitle,
          content: debouncedContent,
        });
      }
    } else {
      updateMutation.mutate({
        title: debouncedTitle,
        content: debouncedContent,
      });
    }
  }, [debouncedTitle, debouncedContent]);

  const [showMetrics, setShowMetrics] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  const handleThumbnailSuccess = (url: string) => {
    setThumbnailUrl(url);
  };

  const toggleMetricsVisibility = () => setShowMetrics((prev) => !prev);

  const handleAnalyzeClick = async () => {
    if (!articleId?.id || articleId.id === "new") return; // Cannot analyze unsaved article

    setIsAnalyzing(true);

    try {
      const res = await axiosInstance?.post(
        `/api/v1/blogs/${blogs.id}/articles/${articleId?.id}/article_analyses`
      );
      setInsights(res?.data);
    } catch (error) {
      console.log(error);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="relative">
      <div className="flex justify-between gap-2">
        {/* LEFT — Editor */}
        <div
          className={`${
            showMetrics && !zenMode ? "w-8/12" : "w-full"
          } space-y-4 transition-all duration-300`}
        >
          <Editor
            value={content}
            onChange={setContent}
            title={title}
            onTitleChange={setTitle}
            thumbnailUrl={thumbnailUrl}
            onAddCover={() => setIsThumbnailDialogOpen(true)}
            onSettingsClick={() => setIsDetailsSheetOpen(true)}
            showMetrics={showMetrics}
            onToggleMetrics={toggleMetricsVisibility}
          />
        </div>

        {/* RIGHT — Insights Panel */}
        {!zenMode && showMetrics && (
          <div className="w-4/12 transition-all duration-300 sticky top-0">
            <InsightsPanel
              showMetrics={showMetrics}
              toggleMetricsVisibility={toggleMetricsVisibility}
              isAnalyzing={isAnalyzing}
              onAnalyzeClick={handleAnalyzeClick}
              insights={insights}
            />
          </div>
        )}
      </div>

      <ArticleDetailsSheet
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        articleData={{
          ...articleId,
          title,
          content,
          // Default values for missing fields to avoid crashes if backend data is partial
          slug: (articleId as any)?.slug || "",
          canonical_url: (articleId as any)?.canonical_url || "",
          seo_title: (articleId as any)?.seo_title || "",
          seo_description: (articleId as any)?.seo_description || "",
          seo_keywords: (articleId as any)?.seo_keywords || "",
          scheduled_at: (articleId as any)?.scheduled_at || null,
          published_at: (articleId as any)?.published_at || null,
          author_id: (articleId as any)?.author_id || null,
          tags: (articleId as any)?.tags || [],
          categories: (articleId as any)?.categories || [],
          key_phrases: (articleId as any)?.key_phrases || [],
          cross_post_platforms: (articleId as any)?.cross_post_platforms || [],
        }}
        onSave={(data) => {
          updateMutation.mutate(data);
          setIsDetailsSheetOpen(false);
        }}
      />

      {/* Thumbnail Upload Dialog */}
      <ThumbnailUploadDialog
        isOpen={isThumbnailDialogOpen}
        onClose={() => setIsThumbnailDialogOpen(false)}
        articleId={articleId?.id}
        articleTitle={title}
        articleContent={content}
        onSuccess={handleThumbnailSuccess}
      />
    </div>
  );
}
