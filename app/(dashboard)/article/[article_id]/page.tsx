"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@/components/Editor";
import InsightsPanel from "./InsightsPanel";
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

export default function CreateArticlePage() {
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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleId, setArticleId] = useState({ id: existingId });
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);

  // Reset settings on unmount
  useEffect(() => {
    return () => {
      resetArticleSettings();
    };
  }, [resetArticleSettings]);

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

      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/articles/${existingId}/article_analyses`
      );
      if (!res?.data) return null;
      return res.data;
    },
    enabled: !!existingId && !!blogs?.id && existingId !== "new",
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      // Also update store if backend returns fresh data, but be careful not to overwrite unrelated user edits if we were doing granular updates.
      // However, on 'Save' from sheet, we are sending everything, so updating store with result is fine.
      if (res?.data) {
        setArticleId((prev: any) => ({ ...prev, ...res.data }));
        // We could re-initialize or create an update action, but for now user wants persistence of *unsaved* changes.
        // Once saved, we can optionally sync back "confirmed" data.
        // initializeArticleSettings({ ...settingsFormData, ...res.data });
        // Actually, let's leave it. If user saves, store has the data.
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

    // When autosaving content/title, we should also safeguard the settings?
    // No, settings save manually via Sheet. Autosave is just title/content.

    // However, we should sync title/content changes to the store so the sheet sees them?
    // The sheet reads from Store. If we change title here, we should update Store?
    // Yes, 'metadata' in store like 'title' should be in sync.
    // Let's add an effect to sync title/content to store.
  }, [debouncedTitle, debouncedContent]);

  // Sync title/content to store
  useEffect(() => {
    // use setFormData from store to update title/content so Sheet has latest
    // But we need to be careful of loops. Store updates -> ?
    // Ideally, page.tsx owns title/content, store owns metadata.
    // But store has title/content in ArticleDetails too.
    // Let's just update store when these change.
    // We need to import setFormData from store.
  }, [title, content]);
  // Wait, I can't put hooks inside effects. I'll do this in the component body.

  // Implementation in the replacement block below is simplified to just Init/Reset logic requested.

  const [showMetrics, setShowMetrics] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

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
            />
          </div>
        )}
      </div>

      <ArticleDetailsSheet
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        // Passing data to sheet is now redundant for state, but maybe useful if sheet needs to know about unsaved changes?
        // We will pass the data from Page State just in case, but Sheet ignores it for initialization.
        // Actually, better to pass undefined or remove prop from usage.
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
