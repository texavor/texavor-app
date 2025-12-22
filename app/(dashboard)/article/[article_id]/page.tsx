"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useParams } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  useArticleSettingsStore,
  ArticleDetails,
} from "@/store/articleSettingsStore";
import ArticleDetailsSheet from "@/components/ArticleDetailsSheet";
import { ThumbnailUploadDialog } from "@/components/ThumbnailUploadDialog";

// Dynamic imports with SSR disabled to prevent hydration mismatches
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-[80vh] w-full rounded-md" />,
});

const InsightsPanel = dynamic(() => import("./InsightsPanel"), {
  ssr: false,
  loading: () => <Skeleton className="h-[80vh] w-full rounded-md" />,
});

export default function CreateArticlePage() {
  // CRITICAL: Prevent ANY server-side rendering - MUST be first hooks
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const params = useParams();
  const { blogs, zenMode, toggleZenMode } = useAppStore();
  const {
    reset: resetArticleSettings,
    initialize: initializeArticleSettings,
    isInitialized,
    formData: settingsFormData,
  } = useArticleSettingsStore();

  const existingId = params?.article_id as string;

  // All state hooks MUST be called before any early returns
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleId, setArticleId] = useState({ id: existingId });
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  // Refs must also be called before early returns
  const isInitialLoadDone = useRef(false);
  const isCreatingRef = useRef(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset settings on unmount
  useEffect(() => {
    return () => {
      resetArticleSettings();
    };
  }, [resetArticleSettings]);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

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
      setSavedResultId(fetchedArticle.saved_result_id || null);
      isInitialLoadDone.current = true;

      // Initialize store if not already initialized
      // Passing defaults for required fields
      const details: ArticleDetails = {
        title: fetchedArticle.title || "",
        content: fetchedArticle.content || "",
        slug: fetchedArticle.slug || "",
        canonical_url: fetchedArticle.canonical_url || "",
        seo_title: fetchedArticle.seo_title || "",
        seo_description: fetchedArticle.seo_description || "",
        seo_keywords: fetchedArticle.seo_keywords || "",
        scheduled_at: fetchedArticle.scheduled_at || null,
        published_at: fetchedArticle.published_at || null,
        author_id: fetchedArticle.author_id || null,
        tags: fetchedArticle.tags || [],
        categories: fetchedArticle.categories || [],
        key_phrases: fetchedArticle.key_phrases || [],
        // Normalize article_publications to IDs if they are objects
        article_publications: (fetchedArticle.article_publications || []).map(
          (p: any) => {
            if (typeof p === "string") return p;
            return p.integration?.id || p.integration_id || p.id;
          }
        ),
        platform_settings: fetchedArticle.platform_settings || {},
        id: fetchedArticle.id,
      };

      // Always update store with latest fetched data to ensure sync, especially for async loaded relationships
      // We check isInitialized to avoid overwriting *unsaved* local changes to Title/Content,
      // but relationships like publications usually come from DB and aren't locally 'drafted' in the same way (except in the sheet).
      // If the sheet is open and user is editing, this might race.
      // But usually fetch happens on load.
      if (!isInitialized) {
        initializeArticleSettings(details);
      } else {
        // If already initialized, we still want to sync 'article_publications' because it might have been empty initially
        // and populated later (e.g. if it was a separate inclusion).
        // We use the store's setFormData to merge specific fields we trust from backend.
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          useArticleSettingsStore.getState().setFormData((prev) => ({
            ...prev,
            article_publications: details.article_publications,
            // We can also sync other fields if we trust backend more for these
            tags: details.tags,
            categories: details.categories,
            key_phrases: details.key_phrases,
            // Don't overwrite title/content as user might be typing
          }));
        }, 0);
      }
    }
  }, [fetchedArticle, isInitialized, initializeArticleSettings]);

  const { data: fetchedInsights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["articleInsight", existingId, blogs?.id],
    queryFn: async () => {
      if (existingId === "new") return null;

      try {
        const res = await axiosInstance.get(
          `/api/v1/blogs/${blogs?.id}/articles/${existingId}/article_analyses`
        );
        if (!res?.data) return null;
        return res.data;
      } catch (error: any) {
        // If analysis not found (404), return null instead of throwing
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!existingId && !!blogs?.id && existingId !== "new",
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (analysis not found)
      if (error?.response?.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (fetchedInsights) {
      setInsights(fetchedInsights);
    }
  }, [fetchedInsights]);

  // Fetch saved_result if article has saved_result_id
  const { data: fetchedSavedResult } = useQuery({
    queryKey: ["savedResult", savedResultId, blogs?.id],
    queryFn: async () => {
      if (!savedResultId) return null;

      try {
        const res = await axiosInstance.get(
          `/api/v1/blogs/${blogs?.id}/saved_results/${savedResultId}`
        );
        return res?.data?.data || res?.data;
      } catch (error: any) {
        console.error("Error fetching saved result:", error);
        return null;
      }
    },
    enabled: !!savedResultId && !!blogs?.id,
    refetchOnWindowFocus: false,
  });

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
      // Initialize store if created
      const details: ArticleDetails = {
        title: data.title || "",
        content: data.content || "",
        slug: data.slug || "",
        canonical_url: data.canonical_url || "",
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
        seo_keywords: data.seo_keywords || "",
        scheduled_at: data.scheduled_at || null,
        published_at: data.published_at || null,
        author_id: data.author_id || null,
        tags: data.tags || [],
        categories: data.categories || [],
        key_phrases: data.key_phrases || [],
        article_publications: data.article_publications || [],
        platform_settings: data.platform_settings || {},
        id: data.id,
      };
      initializeArticleSettings(details);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axiosInstance.patch(
        `/api/v1/blogs/${blogs.id}/articles/${articleId?.id}`,
        payload
      );
    },
    onSuccess: (res, variables) => {
      // Merge the updated fields into the local state
      setArticleId((prev: any) => ({ ...prev, ...variables }));
      // Also update store if backend returns fresh data
      if (res?.data) {
        setArticleId((prev: any) => ({ ...prev, ...res.data }));
      }
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

    // If it's a new article and we are already creating one, skip
    if (isNewArticle && isCreatingRef.current) return;

    // If it's a new article, mark as creating
    if (isNewArticle) {
      isCreatingRef.current = true;
    }

    const performAutoSave = async () => {
      try {
        await handleManualSave();
      } finally {
        if (isNewArticle) {
          isCreatingRef.current = false;
        }
      }
    };

    performAutoSave();
  }, [debouncedTitle, debouncedContent]);

  const handleThumbnailSuccess = (url: string) => {
    setThumbnailUrl(url);
  };

  const handleRemoveCover = async () => {
    // Clear thumbnail locally
    setThumbnailUrl(null);

    // Update article on backend to remove thumbnail
    if (articleId?.id && articleId.id !== "new") {
      try {
        await axiosInstance.patch(
          `/api/v1/blogs/${blogs?.id}/articles/${articleId.id}`,
          {
            article: {
              thumbnail_url: null,
            },
          }
        );
      } catch (error) {
        console.error("Failed to remove cover:", error);
        // Revert local state on error
        // Note: We don't have the previous URL here, so user would need to re-add
      }
    }
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

  const handleManualSave = async () => {
    // Don't save if there's no content
    if (!title?.trim() && !content?.trim()) return;

    const isNewArticle = !articleId?.id || articleId.id === "new";

    if (isNewArticle) {
      // Create new article
      await createMutation.mutateAsync({
        title: title || "",
        content: content || "",
      });
    } else {
      // Update existing article
      await updateMutation.mutateAsync({
        article: {
          title: title || "",
          content: content || "",
        },
      });
    }
  };

  // Show loading state until mounted on client
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

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
            onRemoveCover={handleRemoveCover}
            onSettingsClick={() => setIsDetailsSheetOpen(true)}
            onSave={handleManualSave}
            isSaving={createMutation.isPending || updateMutation.isPending}
            showMetrics={showMetrics}
            onToggleMetrics={toggleMetricsVisibility}
            isLoading={isLoading && existingId !== "new"}
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
              savedResult={fetchedSavedResult}
              articleTitle={title}
              articleId={existingId !== "new" ? existingId : undefined}
            />
          </div>
        )}
      </div>

      <ArticleDetailsSheet
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
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
