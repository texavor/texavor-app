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
import { usePermissions } from "@/hooks/usePermissions";

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

  const { role, isLoadingPermissions } = usePermissions();
  const isViewer = role === "viewer";

  const existingId = params?.article_id as string;

  // All state hooks MUST be called before any early returns
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentHtml, setContentHtml] = useState("");
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
  // Track original fetched content to prevent unnecessary saves
  const fetchedTitleRef = useRef<string>("");
  const fetchedContentRef = useRef<string>("");

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect viewer if trying to access editor
  // IMPORTANT: Only redirect after permissions are loaded to avoid race condition
  useEffect(() => {
    // Don't redirect until permissions are loaded
    if (isLoadingPermissions) return;

    if (isViewer && existingId) {
      // Redirect to view-only page for existing articles
      router.push(`/article/view/${existingId}`);
    }
  }, [isViewer, existingId, router, isLoadingPermissions]);

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
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/articles/${existingId}`
      );
      if (!res?.data) return null;
      return res.data;
    },
    enabled: !!existingId && !!blogs?.id && !isViewer,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (fetchedArticle) {
      // Only update state if data has changed significantly or if it's initial load.
      // Since we disabled refetchOnWindowFocus, this mainly runs on navigation (ID change).
      const fetchedTitle = fetchedArticle.title || "";
      const fetchedContent = fetchedArticle.content || "";

      setTitle(fetchedTitle);
      setContent(fetchedContent);
      setThumbnailUrl(fetchedArticle.thumbnail_url || null);
      setArticleId(fetchedArticle);
      setSavedResultId(fetchedArticle.saved_result_id || null);

      // Store the original fetched values to compare against later
      fetchedTitleRef.current = fetchedTitle;
      fetchedContentRef.current = fetchedContent;
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
        platform_settings: {
          ...(fetchedArticle.platform_settings || {}),
          ...Object.fromEntries(
            (fetchedArticle.article_publications || [])
              .filter((p: any) => typeof p === "object")
              .map((p: any) => {
                const integrationId = p.integration_id || p.integration?.id;
                // Merge existing store settings, settings from DB (if any were flattened), and the new structured publication_settings
                // The DB returns nested publication_settings: { devto: { ... } }
                // We need to extract the relevant inner object based on platform.

                // Try to find the inner settings object. It should be under the platform name key.
                // But p.publication_settings keys might be "devto", "hashnode". Unsure of platform from just 'p' if integration is not expanded,
                // but p usually has integration: { platform: "..." }.

                const platformName =
                  p.integration?.platform || p.integration?.id || "";
                const normalizedPlatform = platformName
                  .toLowerCase()
                  .replace(/[.\s-_]/g, "");

                const dbSettings =
                  p.publication_settings?.[normalizedPlatform] ||
                  p.publication_settings?.[platformName] ||
                  {};

                return [
                  integrationId,
                  {
                    ...(fetchedArticle.platform_settings?.[integrationId] ||
                      {}), // Legacy/Fallback
                    ...dbSettings, // New structured settings
                    platform_author_id: p.platform_author_id, // Ensure author overrides
                  },
                ];
              })
          ),
        },
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
    enabled: !!existingId && !!blogs?.id && !isViewer,
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
    enabled: !!savedResultId && !!blogs?.id && !isViewer,
    refetchOnWindowFocus: false,
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
    if (existingId && !isInitialLoadDone.current) return;

    const shouldSave =
      debouncedTitle.trim().length > 0 || debouncedContent.trim().length > 0;
    if (!shouldSave) return;

    // For existing articles, check if content has actually changed from fetched version
    const titleChanged = debouncedTitle !== fetchedTitleRef.current;
    const contentChanged = debouncedContent !== fetchedContentRef.current;

    // Don't save if nothing has changed
    if (!titleChanged && !contentChanged) return;

    // Update the refs to the new values after we decide to save
    fetchedTitleRef.current = debouncedTitle;
    fetchedContentRef.current = debouncedContent;

    const performAutoSave = async () => {
      await handleManualSave();
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
    if (articleId?.id) {
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
    if (!articleId?.id) return; // Cannot analyze unsaved article

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

    // Update existing article
    await updateMutation.mutateAsync({
      article: {
        title: title || "",
        content: content || "",
        content_html: contentHtml || "",
      },
    });
  };

  // Show loading state until mounted on client or while fetching initial data
  if (!mounted || isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
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
            onChange={(md, html) => {
              setContent(md);
              if (html) setContentHtml(html);
            }}
            title={title}
            onTitleChange={setTitle}
            thumbnailUrl={thumbnailUrl}
            onAddCover={() => setIsThumbnailDialogOpen(true)}
            onRemoveCover={handleRemoveCover}
            onSettingsClick={() => setIsDetailsSheetOpen(true)}
            onSave={handleManualSave}
            isSaving={updateMutation.isPending}
            showMetrics={showMetrics}
            onToggleMetrics={toggleMetricsVisibility}
            isLoading={isLoading}
            readOnly={isViewer}
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
              articleId={articleId?.id ? articleId.id : undefined}
            />
          </div>
        )}
      </div>

      <ArticleDetailsSheet
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        currentTitle={title}
        currentContent={content}
        currentContentHtml={contentHtml}
        onSave={(data, keepOpen) => {
          // Wrapped in { article: ... } to match backend expectation
          updateMutation.mutate({ article: data });
          if (!keepOpen) {
            setIsDetailsSheetOpen(false);
          }
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
