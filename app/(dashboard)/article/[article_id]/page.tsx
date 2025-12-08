"use client";

import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import Editor from "@/components/Editor";
import InsightsPanel from "./InsightsPanel";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Maximize,
  Minimize,
  Settings,
  ImageIcon,
  AlignLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleDetailsSheet from "@/components/ArticleDetailsSheet";
import { ThumbnailUploadDialog } from "@/components/ThumbnailUploadDialog";

export default function CreateArticlePage({ params }: any) {
  const router = useRouter();
  const { blogs, zenMode, toggleZenMode } = useAppStore();
  // ... (keeping the rest same, just showing the import change context)
  // Actually I need to replace the usage too.

  // I will use a larger range to cover both import and usage.

  const existingId = params?.article_id;

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
    queryKey: ["article", blogs],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs.id}/articles/${existingId}`
      );
      if (!res?.data) return null;

      setTitle(res?.data.title || "");
      setContent(res?.data.content || "");
      setThumbnailUrl(res?.data.thumbnail_url || null);
      setArticleId(res?.data);
      isInitialLoadDone.current = true;

      return res.data; // Return the data
    },
    enabled: !!existingId && !!blogs?.id,
  });

  const { data: fetchedInsights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["articleInsight", blogs],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs.id}/articles/${existingId}/article_analyses`
      );
      if (!res?.data) return null;

      setInsights(res?.data);

      return res.data; // Return the data
    },
    enabled: !!existingId && !!blogs?.id,
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
      setArticleId(data.id);
      router.replace(`/article/${data.id}`);
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
    if (existingId && !isInitialLoadDone.current) return; // block autosave until initial fetch done

    const shouldSave =
      debouncedTitle.trim().length > 0 || debouncedContent.trim().length > 0;
    if (!shouldSave) return;

    if (!articleId) {
      createMutation.mutate({
        title: debouncedTitle,
        content: debouncedContent,
      });
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
      {/* Zen Mode Toggle */}
      <div className="flex justify-between gap-2">
        {/* LEFT — Editor */}
        <div
          className={`${
            showMetrics && !zenMode ? "w-8/12" : "w-full"
          } space-y-4 transition-all duration-300`}
        >
          <div className="bg-white rounded-xl p-6 relative">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsThumbnailDialogOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Cover
              </Button>
            </div>

            {/* Thumbnail Preview */}
            {thumbnailUrl && (
              <div className="mb-4 relative group">
                <img
                  src={thumbnailUrl}
                  alt="Article cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsThumbnailDialogOpen(true)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change Cover
                </Button>
              </div>
            )}

            {/* Zen Mode and Settings Buttons */}
            <Button
              onClick={toggleZenMode}
              variant="ghost"
              size="icon"
              className={`z-50 bg-white shadow-md hover:bg-gray-100 ${
                zenMode ? "fixed top-4 right-4" : "absolute top-2 right-2"
              }`}
              title={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
            >
              {zenMode ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>

            <Button
              onClick={() => setIsDetailsSheetOpen(true)}
              variant="ghost"
              size="icon"
              className={`z-50 bg-white shadow-md hover:bg-gray-100 ${
                zenMode ? "fixed top-4 right-16" : "absolute top-2 right-14"
              }`}
              title="Article Details"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Title Input */}
            <Textarea
              placeholder="Article Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              className="border-none font-poppins text-4xl font-semibold resize-none focus:ring-0 shadow-none focus-visible:ring-[0px] pr-12 overflow-y-auto overflow-x-visible h-[6rem]"
            />
          </div>

          <Editor value={content} onChange={setContent} title={title} />
        </div>

        {/* RIGHT — Insights Panel */}
        {!zenMode && (
          <div
            className={`${
              showMetrics ? "w-4/12" : "w-12"
            } transition-all duration-300`}
          >
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
