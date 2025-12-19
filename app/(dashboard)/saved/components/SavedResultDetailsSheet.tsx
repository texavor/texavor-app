import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Binoculars,
  FileText,
  Microscope,
  Loader2,
  Calendar,
  Tag,
  Search,
  ArrowRight,
  FileEdit,
  Eye,
  Target,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { SavedResult } from "../hooks/useSavedResultsApi";
import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { ScoreMeter } from "@/components/ScoreMeter";

interface SavedResultDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SavedResult | null;
}

export default function SavedResultDetailsSheet({
  open,
  onOpenChange,
  result,
}: SavedResultDetailsSheetProps) {
  const router = useRouter();
  const { blogs } = useAppStore();

  // Fetch fresh details when open to get relations like articles
  const { data: freshResult, isLoading } = useQuery({
    queryKey: ["savedResult", result?.id, blogs?.id],
    queryFn: async () => {
      if (!result?.id || !blogs?.id) return null;
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/saved_results/${result.id}`
      );
      return res.data.data || res.data;
    },
    enabled: !!result?.id && !!blogs?.id && open,
  });

  const displayResult = freshResult || result;

  // Mutation to create article from outline
  const createArticleMutation = useMutation({
    mutationFn: async () => {
      if (!displayResult || !blogs?.id) return;

      const outlineId = displayResult.id;
      const data = displayResult.result_data;

      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/articles`,
        {
          title: data.title || displayResult.title || "Untitled Article",
          content: data.meta_description || "",
          saved_result_id: outlineId,
          source: "texavor",
        }
      );
      return res.data;
    },
    onSuccess: (articleData) => {
      onOpenChange(false);
      router.push(`/article/${articleData?.id}`);
      toast.success("Article created successfully!");
    },
    onError: (err) => {
      console.error("Failed to create article", err);
      toast.error("Failed to create article.");
    },
  });

  if (!displayResult) return null;

  const getIcon = () => {
    switch (displayResult.result_type) {
      case "keyword_research":
        return <Binoculars className="h-6 w-6 text-blue-500" />;
      case "outline_generation":
        return <FileText className="h-6 w-6 text-green-500" />;
      case "topic_generation":
        return <Microscope className="h-6 w-6 text-purple-500" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getLabel = () => {
    switch (displayResult.result_type) {
      case "keyword_research":
        return "Keyword Research";
      case "outline_generation":
        return "Outline";
      case "topic_generation":
        return "Topic";
      default:
        return displayResult.result_type;
    }
  };

  const handlePrimaryAction = () => {
    switch (displayResult.result_type) {
      case "keyword_research":
        router.push(
          `/keyword-research?q=${encodeURIComponent(
            displayResult.search_params?.query || ""
          )}&mode=${displayResult.search_params?.mode || ""}`
        );
        break;
      case "topic_generation":
        // Topic searches often use 'keyword' param
        const keyword =
          displayResult.search_params?.keywords?.[0] || displayResult.title;
        router.push(`/topic-generation?keyword=${encodeURIComponent(keyword)}`);
        // Or if we want to pass the ID to load it:
        // router.push(`/topic-generation?id=${displayResult.id}`);
        // But user requirement says: "for topic is shoudl generate outline"
        // Wait, "for keyword it should have generate topic"
        // "for topic is shoudl generate outline"
        break;
      case "outline_generation":
        // Generate/View Article
        const articles = displayResult.articles || [];
        if (articles.length > 0) {
          router.push(`/article/${articles[0].id}`);
        } else {
          createArticleMutation.mutate();
        }
        break;
    }
  };

  const handleGenerateValues = () => {
    switch (displayResult.result_type) {
      case "keyword_research":
        // "for keyword it should have generate topic"
        router.push(
          `/topic-generation?keyword=${encodeURIComponent(
            displayResult.search_params?.query || displayResult.title
          )}`
        );
        break;
      case "topic_generation":
        // "for topic is shoudl generate outline"
        router.push(
          `/outline-generation?topic=${encodeURIComponent(displayResult.title)}`
        );
        break;
      case "outline_generation":
        // "and outline should have generate article"
        const articles = displayResult.articles || [];
        if (articles.length > 0) {
          router.push(`/article/${articles[0].id}`);
        } else {
          createArticleMutation.mutate();
        }
        break;
    }
  };

  const renderContent = () => {
    const data = displayResult.result_data || {};
    const params = displayResult.search_params || {};

    return (
      <div className="space-y-8">
        {displayResult.result_type === "keyword_research" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Search Query
                </label>
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-gray-900 text-lg">
                    {params.query || displayResult.title}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {params.mode && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Mode
                  </label>
                  <div className="font-medium text-gray-900 capitalize flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    {params.mode}
                  </div>
                </div>
              )}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Results Found
                </label>
                <div className="font-bold text-gray-900 text-xl flex items-center gap-2">
                  <List className="h-4 w-4 text-gray-400" />
                  {data?.results?.length || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {displayResult.result_type === "topic_generation" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Topic Title
              </label>
              <div className="font-bold text-gray-900 text-xl leading-tight font-poppins">
                {displayResult.title}
              </div>
            </div>

            {params.keywords && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
                  Source Keywords
                </label>
                <div className="flex flex-wrap gap-2">
                  {params.keywords.map((k: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(data.difficulty !== undefined ||
              data.opportunity !== undefined) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.difficulty !== undefined && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Difficulty
                      </label>
                      <span className="font-bold text-gray-900 text-lg">
                        {data.difficulty}/10
                      </span>
                    </div>
                    <ScoreMeter value={data.difficulty / 10} inverse={true} />
                    <p className="text-xs text-gray-500">
                      {data.difficulty <= 3
                        ? "Easy to rank"
                        : data.difficulty <= 7
                        ? "Moderate competition"
                        : "High competition"}
                    </p>
                  </div>
                )}
                {data.opportunity !== undefined && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Opportunity
                      </label>
                      <span className="font-bold text-gray-900 text-lg">
                        {data.opportunity}/10
                      </span>
                    </div>
                    <ScoreMeter value={data.opportunity / 10} />
                    <p className="text-xs text-gray-500">
                      {data.opportunity >= 7
                        ? "High potential"
                        : "Average potential"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {data.reason && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                  <Target className="h-4 w-4" /> Why this topic?
                </h4>
                <p className="text-sm text-blue-900 leading-relaxed">
                  {data.reason}
                </p>
              </div>
            )}
          </div>
        )}

        {displayResult.result_type === "outline_generation" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Outline Title
              </label>
              <div className="font-bold text-gray-900 text-xl leading-tight font-poppins">
                {displayResult.title}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Sections
                </label>
                <div className="font-bold text-gray-900 text-2xl">
                  {data.sections?.length || 0}
                </div>
              </div>
              {data.estimated_word_count && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Est. Words
                  </label>
                  <div className="font-bold text-gray-900 text-2xl">
                    {data.estimated_word_count}
                  </div>
                </div>
              )}
            </div>

            {data.meta_description && (
              <div className="bg-white p-0 rounded-xl">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Description
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                  {data.meta_description}
                </div>
              </div>
            )}

            {displayResult.articles && displayResult.articles.length > 0 && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <div className="font-semibold text-green-900 text-sm">
                    Article Created
                  </div>
                  <div className="text-green-700 text-xs">
                    This outline has been converted to an article.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 mt-auto">
          <div className="flex gap-4 text-sm text-gray-500 items-center">
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                Saved {format(new Date(displayResult.saved_at), "MMM d, yyyy")}
              </span>
            </div>
            {data.tone && (
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <span className="text-xs font-medium capitalize">
                  Tone: {data.tone}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getPrimaryButtonText = () => {
    if (createArticleMutation.isPending) return "Creating Article...";

    switch (displayResult.result_type) {
      case "keyword_research":
        return "Generate Topic";
      case "topic_generation":
        return "Generate Outline";
      case "outline_generation":
        if (displayResult.articles && displayResult.articles.length > 0) {
          return "View Article";
        }
        return "Generate Article";
      default:
        return "View";
    }
  };

  const getPrimaryButtonIcon = () => {
    if (createArticleMutation.isPending)
      return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;

    switch (displayResult.result_type) {
      case "keyword_research":
        return <Microscope className="mr-2 h-4 w-4" />;
      case "topic_generation":
        return <FileEdit className="mr-2 h-4 w-4" />;
      case "outline_generation":
        if (displayResult.articles && displayResult.articles.length > 0) {
          return <Eye className="mr-2 h-4 w-4" />;
        }
        return <FileText className="mr-2 h-4 w-4" />;
      default:
        return <ArrowRight className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full min-w-[500px] p-0 gap-0 bg-white">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              {getIcon()}
            </div>
            <div className="flex flex-col gap-1 items-start">
              <SheetTitle className="text-lg font-semibold font-poppins text-[#0A2918]">
                {displayResult.title}
              </SheetTitle>
              <Badge
                variant="secondary"
                className="font-normal text-xs uppercase tracking-wider bg-gray-100 text-gray-600"
              >
                {getLabel()}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && !freshResult ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            renderContent()
          )}
        </div>

        <div className="p-6 border-t bg-gray-50/50 mt-auto">
          <Button
            className="w-full bg-[#104127] hover:bg-[#0d3320] text-white shadow-none"
            size="lg"
            onClick={handleGenerateValues}
            disabled={createArticleMutation.isPending}
          >
            {getPrimaryButtonIcon()}
            {getPrimaryButtonText()}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
