"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  History,
  FileText,
  TrendingUp,
  Target,
  Trash2,
  X,
  Save,
  PenTool,
  Check,
} from "lucide-react";
import { ScoreMeter, Gauge } from "@/components/ScoreMeter";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentSearches } from "@/components/dashboard/RecentSearches";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSavedResultsApi } from "../saved/hooks/useSavedResultsApi";

const OpportunityMeter = ({ value }: { value: number }) => {
  const segments = Array.from({ length: 10 }, (_, i) => i < value);
  return (
    <div className="flex w-full gap-1 pt-1">
      {segments.map((isFilled, index) => {
        let color = "bg-gray-200";
        if (isFilled) {
          if (value <= 3)
            color = "bg-red-500"; // Low
          else if (value <= 7)
            color = "bg-yellow-500"; // Medium
          else color = "bg-green-500"; // High
        }
        return <div key={index} className={`h-2 w-full rounded-sm ${color}`} />;
      })}
    </div>
  );
};

const TopicGenerationClient = () => {
  const { blogs } = useAppStore();
  const [topics, setTopics] = useState<any[]>([]);
  const [savedTopics, setSavedTopics] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveResult } = useSavedResultsApi();

  const handleSaveTopic = (topic: any, searchKeyword: string) => {
    if (savedTopics.has(topic.title)) return;

    saveResult.mutate(
      {
        result_type: "topic_generation",
        title: topic.title || searchKeyword, // Ensure we have a title
        result_data: topic,
        search_params: { keywords: [searchKeyword] }, // Use the actual search keyword
        tags: ["topic"],
      },
      {
        onSuccess: () => {
          setSavedTopics((prev) => new Set(prev).add(topic.title));
          toast.success("Topic saved successfully!");
        },
        onError: () => toast.error("Failed to save topic."),
      },
    );
  };

  const handleGenerateOutline = (topicTitle: string) => {
    router.push(`/outline-generation?topic=${encodeURIComponent(topicTitle)}`);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: string) => {
      return axiosInstance.post(`/api/v1/blogs/${blogs?.id}/topic_generation`, {
        keywords: [data],
      });
    },
    onSuccess: (res) => {
      setTopics(res?.data?.data || []);
      queryClient.invalidateQueries({
        queryKey: ["recentSearches", blogs?.id, "topic_generation"],
      });
    },
  });

  const form = useForm({
    defaultValues: {
      keywords: "",
    },
    onSubmit: async ({ value }) => {
      if (value.keywords) {
        mutate(value.keywords);
      }
    },
  });

  useEffect(() => {
    const keywordParam = searchParams.get("keyword");
    if (keywordParam) {
      const decoded = decodeURIComponent(keywordParam);
      form.setFieldValue("keywords", decoded);
    }
  }, [searchParams, form]);

  const handleRecentSearch = (keyword: string) => {
    form.setFieldValue("keywords", keyword);
    mutate(keyword);
  };

  const allCompetitors =
    topics?.[0]?.candidates.flatMap((c: any) => c.competing_articles) || [];
  const uniqueCompetitors = [...new Set(allCompetitors)];

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 max-h-[170px]">
        <div className="bg-white rounded-xl w-full lg:w-8/12 p-4 space-y-2 border-none shadow-none">
          <p className="font-poppins text-black font-medium">Generate Topic</p>
          <p className="font-inter text-[#7A7A7A] text-sm font-normal">
            Search tags, keywords or combination of words to generate articles
            title and description
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-2"
          >
            <form.Field
              name="keywords"
              children={(field) => (
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Search Keywords or idea"
                  required
                  className="bg-white text-black font-inter"
                />
              )}
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-[50%] bg-[#104127] text-white hover:bg-[#104127]"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </form>
        </div>
        <div className="bg-white rounded-xl w-full lg:w-4/12 border-none shadow-none overflow-hidden">
          <RecentSearches
            type="topic_generation"
            onSelect={(keyword) => handleRecentSearch(keyword)}
          />
        </div>
      </div>

      <div className="mt-8">
        {isPending && (
          <div className="flex justify-center items-center mt-8 text-center bg-white p-12 rounded-xl w-full">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <p className="font-poppins font-medium">Generating topics...</p>
          </div>
        )}
        {!isPending && topics && topics?.length > 0 && (
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="space-y-6 w-full lg:w-8/12 overflow-y-auto max-h-[calc(100vh-300px)] no-scrollbar rounded-xl">
              {topics?.map((topic, index) => (
                <div key={index}>
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    {topic?.candidates?.map(
                      (candidate: any, cIndex: number) => (
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full no-underline shadow-none border-none"
                          key={cIndex}
                        >
                          <AccordionItem
                            value={`item-${cIndex}`}
                            className="bg-white shadow-nonoe border-none rounded-xl"
                          >
                            <AccordionTrigger className="px-4 pt-4 pb-2 text-left  hover:no-underline cursor-pointer">
                              <div className="w-full">
                                <div className="flex items-start justify-between gap-4 mb-3 w-full">
                                  <h3 className="font-semibold font-poppins text-lg text-gray-900 leading-tight flex-1 no-underline">
                                    {candidate.title}
                                  </h3>
                                  <div className="flex gap-2 flex-shrink-0 items-start">
                                    <div className="bg-green-50 font-inter text-green-700 capitalize px-3 py-1 rounded-full text-xs font-semibold border border-green-200 whitespace-nowrap">
                                      {candidate.content_type}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm font-normal leading-relaxed font-inter">
                                  {candidate.description}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                              {/* Content Sections with Icons */}
                              <div className="px-4 space-y-5 border-t-[1px] pt-4">
                                {/* Reason Section */}
                                <div className="flex gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Target className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                      Why This Topic?
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {candidate.reason}
                                    </p>
                                  </div>
                                </div>

                                {/* Unique Angle Section */}
                                <div className="flex gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                      Unique Approach
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {candidate.unique_angle}
                                    </p>
                                  </div>
                                </div>

                                {/* Meta Information */}
                                <div className="flex gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                      Content Details
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="bg-gray-100 capitalize text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200">
                                        📝 {candidate.cluster_type}
                                      </span>
                                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200">
                                        📏 {candidate.word_count_range} words
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Metrics Footer */}
                              <div className="bg-gray-50 px-4 py-2 mt-4 border-t border-gray-100 rounded-bl-xl rounded-br-xl">
                                <div className="grid grid-cols-2 gap-6">
                                  {/* Difficulty Score */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Difficulty
                                      </span>
                                      <span
                                        className={`text-2xl font-bold ${
                                          candidate.difficulty <= 3
                                            ? "text-green-600"
                                            : candidate.difficulty <= 7
                                              ? "text-yellow-600"
                                              : "text-red-600"
                                        }`}
                                      >
                                        {candidate.difficulty}
                                        <span className="text-sm text-gray-500 font-normal">
                                          /10
                                        </span>
                                      </span>
                                    </div>
                                    <ScoreMeter
                                      value={candidate.difficulty / 10}
                                      inverse={true}
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">
                                      {candidate.difficulty <= 3
                                        ? "Easy to rank"
                                        : candidate.difficulty <= 6
                                          ? "Moderate effort"
                                          : "Challenging topic"}
                                    </p>
                                  </div>

                                  {/* Opportunity Score */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Opportunity
                                      </span>
                                      <span className="text-2xl font-bold text-green-600">
                                        {candidate.opportunity}
                                        <span className="text-sm text-gray-500 font-normal">
                                          /10
                                        </span>
                                      </span>
                                    </div>
                                    <ScoreMeter
                                      value={candidate.opportunity / 10}
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">
                                      {candidate.opportunity >= 8
                                        ? "High traffic potential"
                                        : candidate.opportunity >= 5
                                          ? "Good potential"
                                          : "Limited potential"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    variant={
                                      savedTopics.has(candidate.title)
                                        ? "secondary"
                                        : "ghost"
                                    }
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveTopic(candidate, topic.keyword);
                                    }}
                                    disabled={savedTopics.has(candidate.title)}
                                    className={`h-8 px-2 ${
                                      savedTopics.has(candidate.title)
                                        ? "text-green-700 bg-green-50"
                                        : "text-gray-500 hover:text-[#104127] hover:bg-[#EAF9F2]"
                                    }`}
                                    title={
                                      savedTopics.has(candidate.title)
                                        ? "Topic Saved"
                                        : "Save Topic"
                                    }
                                  >
                                    {savedTopics.has(candidate.title) ? (
                                      <Check className="h-4 w-4 mr-1" />
                                    ) : (
                                      <Save className="h-4 w-4 mr-1" />
                                    )}
                                    {savedTopics.has(candidate.title)
                                      ? "Saved"
                                      : "Save"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGenerateOutline(candidate.title);
                                    }}
                                    className="h-8 px-2 text-xs border-[#104127] text-[#104127] hover:bg-[#EAF9F2]"
                                    title="Generate Outline"
                                  >
                                    <PenTool className="h-4 w-4 mr-1" />
                                    Generate Outline
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white max-h-[calc(100vh-300px)] w-full lg:w-4/12 p-4 rounded-xl no-scrollbar overflow-y-auto">
              {topics && topics.length > 0 && topics[0] && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-black capitalize font-poppins mb-2">
                      Keyword Analysis
                    </h3>
                    <p className="bg-primary/5 text-sm font-inter text-gray-700 p-2 rounded-md">
                      {topics?.[0]?.keyword}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Gauge
                      label="Difficulty"
                      value={topics[0].difficulty}
                      inverse={true}
                      max={10}
                    />
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-black font-poppins">
                          Opportunity
                        </p>
                        <p className="text-sm font-inter">
                          {topics[0].opportunity}/10
                        </p>
                      </div>
                      <OpportunityMeter value={topics[0].opportunity} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-black font-poppins">
                          Authority Score
                        </p>
                        <p className="text-sm font-inter">
                          {topics[0].authority_score}
                        </p>
                      </div>
                      <ScoreMeter value={topics[0].authority_score / 10} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-black font-poppins">
                          AI Visibility
                        </p>
                        <p className="text-sm font-inter">
                          {topics[0].ai_visibility_score ?? topics[0].geo_score}
                        </p>
                      </div>
                      <ScoreMeter
                        value={
                          (topics[0].ai_visibility_score ??
                            topics[0].geo_score) / 10
                        }
                      />
                    </div>
                  </div>
                  {uniqueCompetitors.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="text-base font-bold text-black font-poppins mb-2">
                        Top Competitors
                      </h4>
                      <ul className="space-y-2">
                        {uniqueCompetitors.map((competitor: any, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(
                                competitor,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {competitor}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {!isPending && (!topics || topics.length === 0) && (
          <div className="mt-8 text-center rounded-xl bg-white p-12 w-full">
            <p className="text-xl font-semibold font-poppins">
              No topics generated.
            </p>
            <p className="font-inter text-sm text-gray-400">
              Use the form above to get started or try different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicGenerationClient;
