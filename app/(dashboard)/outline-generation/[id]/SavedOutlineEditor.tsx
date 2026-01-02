"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { OutlineEditor } from "../components/OutlineEditor";
import { useOutlineApi, OutlineData } from "../hooks/useOutlineApi";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const SavedOutlineEditor = () => {
  const params = useParams();
  const router = useRouter();
  const { blogs } = useAppStore();
  const outlineId = params?.id as string;

  const [currentOutline, setCurrentOutline] = useState<OutlineData | null>(
    null
  );
  const [linkedArticle, setLinkedArticle] = useState<any>(null);

  const { updateOutline } = useOutlineApi();

  // Mutation to create article from outline
  const createArticleMutation = useMutation({
    mutationFn: async () => {
      if (!currentOutline || !blogs?.id) return;

      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/articles`,
        {
          title: currentOutline.title || "Untitled Article",
          content: currentOutline.meta_description || "",
          saved_result_id: currentOutline.id,
          source: "texavor",
        }
      );
      return res.data;
    },
    onSuccess: (articleData) => {
      router.push(`/article/${articleData?.id}`);
      toast.success("Article created successfully!");
    },
    onError: (err) => {
      console.error("Failed to create article", err);
      toast.error("Failed to create article.");
    },
  });

  // Fetch saved outline
  const {
    data: savedResult,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["savedResult", outlineId, blogs?.id],
    queryFn: async () => {
      if (!outlineId || outlineId === "new") return null;

      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/saved_results/${outlineId}`
      );

      const data = res?.data?.data || res?.data;

      // Set linked article if exists
      if (data?.articles && data.articles.length > 0) {
        setLinkedArticle(data.articles[0]);
      }

      return data;
    },
    enabled: !!outlineId && !!blogs?.id && outlineId !== "new",
    refetchOnWindowFocus: false,
  });

  // Show loading if query is fetching OR if dependencies aren't ready yet
  const isLoadingData = isLoading || isFetching || !blogs?.id;

  // Transform saved result to outline data
  useEffect(() => {
    if (savedResult) {
      const outlineData: OutlineData = {
        id: savedResult.id,
        ...savedResult.result_data,
        topic: savedResult.search_params?.topic || "",
        created_at: savedResult.saved_at,
      };
      setCurrentOutline(outlineData);
    }
  }, [savedResult]);

  const handleUpdate = (data: OutlineData) => {
    if (data.id) {
      updateOutline.mutate(
        { id: data.id, outline: data },
        {
          onSuccess: (updated) => {
            setCurrentOutline(updated);
          },
        }
      );
    }
  };

  const handleReturnToArticle = () => {
    if (linkedArticle?.id) {
      router.push(`/article/${linkedArticle.id}`);
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6 w-full h-full">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-none border-none">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Editor and Panel Skeleton */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Editor Skeleton */}
          <div className="w-full lg:w-8/12 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-none border-none space-y-2"
                >
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Metrics Skeleton */}
          <div className="w-full lg:w-4/12">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-16 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-3">
                <Skeleton className="h-6 w-32" />
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOutline && !isLoadingData) {
    return (
      <div className="flex justify-center items-center mt-8 text-center bg-white p-12 rounded-xl w-full">
        <div>
          <p className="font-poppins font-medium text-lg mb-4">
            Outline not found
          </p>
          <Button onClick={() => router.push("/outline-generation")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Outline Generation
          </Button>
        </div>
      </div>
    );
  }

  // Type guard: at this point, currentOutline is guaranteed to be non-null
  if (!currentOutline) return null;

  return (
    <div className="space-y-6 w-full h-full">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-none border-none">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/saved")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold font-poppins text-[#0A2918]">
              Edit Outline
            </h1>
            <p className="text-sm text-gray-500 font-inter">
              Refine your outline before generating the article
            </p>
          </div>
        </div>

        {linkedArticle ? (
          <Button
            className="bg-[#104127] hover:bg-[#0d3320] text-white shadow-none"
            onClick={() => router.push(`/article/${linkedArticle.id}`)}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Article
          </Button>
        ) : (
          <Button
            className="bg-[#104127] hover:bg-[#0d3320] text-white shadow-none"
            onClick={() => createArticleMutation.mutate()}
            disabled={createArticleMutation.isPending}
          >
            {createArticleMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Article
          </Button>
        )}
      </div>

      {/* Editor and Metrics Panel */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Editor */}
        <div className="w-full lg:w-8/12">
          <OutlineEditor
            initialData={currentOutline}
            onSave={handleUpdate}
            onChange={(updatedOutline) => setCurrentOutline(updatedOutline)}
            isSaving={updateOutline.isPending}
            isEditMode={true}
            linkedArticle={linkedArticle}
          />
        </div>

        {/* Right: Metrics & Navigation */}
        <div className="w-full lg:w-4/12">
          <div className="sticky top-4 space-y-4">
            {/* Metrics */}
            <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-4">
              <h3 className="font-poppins text-lg font-semibold text-gray-900">
                Outline Metrics
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider mb-1">
                    Est. Word Count
                  </span>
                  <span className="text-2xl font-bold text-[#104127]">
                    {currentOutline.estimated_word_count?.toLocaleString() ||
                      "0"}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">words</span>
                </div>

                {currentOutline.target_keywords &&
                  currentOutline.target_keywords.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider mb-2">
                        Target Keywords
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {currentOutline.target_keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium border border-green-100"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {currentOutline.tone && (
                  <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Tone
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {currentOutline.tone}
                    </span>
                  </div>
                )}

                {currentOutline.target_audience && (
                  <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Audience
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {currentOutline.target_audience}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Table of Contents Navigation */}
            <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-4">
              <h3 className="font-poppins text-base font-semibold text-gray-900">
                Outline Structure
              </h3>
              <div className="space-y-1 max-h-[calc(100vh-530px)] overflow-y-auto no-scrollbar pr-2">
                <button
                  onClick={() => {
                    document
                      .getElementById("outline-intro")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Introduction
                </button>

                {currentOutline.sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      document
                        .getElementById(`outline-section-${idx}`)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 pl-4"
                  >
                    <span className="text-gray-400 text-xs">{idx + 1}.</span>
                    <span className="truncate">{section.heading}</span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    document
                      .getElementById("outline-conclusion")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Conclusion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedOutlineEditor;
