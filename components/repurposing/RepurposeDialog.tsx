"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MarkdownViewer from "@/components/MarkdownViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Twitter,
  Linkedin,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Share2,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstace";
import { cn } from "@/lib/utils";

// --- Types ---

type Platform = "twitter" | "linkedin" | "reddit";

interface TwitterResponse {
  platform: "twitter";
  hooks: string[];
  tweets: string[];
  thread_count: number;
}

interface LinkedInResponse {
  platform: "linkedin";
  hooks: string[];
  body: string;
}

interface RedditResponse {
  platform: "reddit";
  titles: string[];
  body: string;
}

// Union type for any platform data
type PlatformData = TwitterResponse | LinkedInResponse | RedditResponse;

// API Responses
interface GetRepurposeResponse {
  id?: number;
  article_id?: number;
  twitter_content?: TwitterResponse | null;
  linkedin_content?: LinkedInResponse | null;
  reddit_content?: RedditResponse | null;
  created_at?: string;
  updated_at?: string;
}

interface PostRepurposeResponse {
  status: string;
  data: PlatformData;
}

interface RepurposeDialogProps {
  articleId: string;
  blogId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- Icons ---
const XIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
  >
    <title>X</title>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const RedditIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
  >
    <title>Reddit</title>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

export function RepurposeDialog({
  articleId,
  blogId,
  open,
  onOpenChange,
}: RepurposeDialogProps) {
  const [activeTab, setActiveTab] = useState<Platform>("twitter");
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  // --- GET: Fetch existing repurposed content ---
  const { data: existingData, isLoading: isLoadingExisting } = useQuery({
    queryKey: ["repurposing", blogId, articleId],
    queryFn: async () => {
      const res = await axiosInstance.get<GetRepurposeResponse>(
        `/api/v1/blogs/${blogId}/articles/${articleId}/repurposing`,
      );
      // Map API response (snake_case) to component expectations
      const data = res.data || {};
      return {
        twitter: data.twitter_content,
        linkedin: data.linkedin_content,
        reddit: data.reddit_content,
      };
    },
    enabled: open, // Only fetch when dialog opens
    // staleTime removed to always fetch latest on open
  });

  // --- POST: Generate content ---
  const { mutate, isPending } = useMutation({
    mutationFn: async (platform: Platform) => {
      const res = await axiosInstance.post<PostRepurposeResponse>(
        `/api/v1/blogs/${blogId}/articles/${articleId}/repurposing`,
        { platform },
      );
      // Support both { status: "success", data: ... } and direct object response
      const responseData = res.data;
      if (responseData && "data" in responseData) {
        return responseData.data;
      }
      return responseData as unknown as PlatformData; // Fallback if backend returns direct object
    },
    onSuccess: (newData, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ["repurposing", blogId, articleId],
        (old: any) => {
          return {
            ...old,
            [variables]: newData,
          };
        },
      );
      toast.success(`Generated content for ${variables}`);
    },
    onError: () => {
      toast.error("Failed to generate content. Please try again.");
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getCopyText = (data: PlatformData) => {
    if (data.platform === "twitter") {
      return data.tweets.join("\n\n---\n\n");
    } else if (data.platform === "linkedin") {
      return data.body;
    } else if (data.platform === "reddit") {
      return `${data.titles[0]}\n\n${data.body}`;
    }
    return "";
  };

  const renderContent = (platform: Platform) => {
    const data = existingData?.[platform];
    const isLoading = isPending && activeTab === platform;

    return (
      <div className="flex flex-col h-full font-inter relative overflow-hidden">
        {/* Sticky Header for Actions */}
        {(data || isLoading) && (
          <div className="flex items-center justify-end gap-2 p-4 bg-white z-10 sticky top-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate(platform)}
              disabled={isPending}
              className="font-inter text-xs h-8 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5 mr-2", isPending && "animate-spin")}
              />
              Regenerate
            </Button>
            {data && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleCopy(getCopyText(data as any))}
                className="font-inter text-xs h-8 border-gray-200"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-2" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-2" />
                )}
                Copy Content
              </Button>
            )}
          </div>
        )}

        <div className="flex-1 h-full bg-white relative overflow-y-auto max-h-[calc(100vh-400px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-inter text-muted-foreground animate-pulse">
                  Generating amazing content for {platform}...
                </p>
              </div>
            ) : !data ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                <div className="p-4 border rounded-full bg-gray-50/50">
                  {platform === "twitter" && (
                    <XIcon className="h-10 w-10 text-black" />
                  )}
                  {platform === "linkedin" && (
                    <Linkedin className="h-10 w-10 text-[#0077b5]" />
                  )}
                  {platform === "reddit" && (
                    <RedditIcon className="h-10 w-10 text-[#FF4500]" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold font-poppins text-gray-900">
                    No content generated yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto font-inter">
                    Click the button below to generate {platform} content from
                    your article using AI.
                  </p>
                </div>
                <Button
                  onClick={() => mutate(platform)}
                  className="font-poppins"
                  variant="default"
                >
                  Generate {platform === "twitter" ? "Twitter Thread" : "Post"}
                </Button>
              </div>
            ) : (
              // --- Render Data Inside ScrollArea ---
              <div className="space-y-8  mx-auto">
                {platform === "twitter" && (data as TwitterResponse).tweets && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg border bg-gray-50/50 space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-poppins">
                        Suggested Hooks
                      </h4>
                      <div className="grid gap-2">
                        {((data as TwitterResponse).hooks || []).map(
                          (hook, i) => (
                            <div
                              key={i}
                              className="bg-white border rounded-md p-3 text-sm text-gray-700 hover:border-gray-400 transition-colors cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(hook);
                                toast.success("Hook copied!");
                              }}
                            >
                              {hook}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="bg-white border rounded-xl overflow-hidden">
                      <div className="bg-black/5 px-4 py-3 border-b flex items-center gap-2">
                        <XIcon className="h-4 w-4 text-black" />
                        <span className="text-xs font-semibold text-gray-900">
                          Twitter / X Preview
                        </span>
                      </div>
                      <div className="space-y-0 divide-y">
                        {((data as TwitterResponse).tweets || []).map(
                          (tweet, i) => (
                            <div
                              key={i}
                              className="bg-white p-4 hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="flex gap-4">
                                <div className="flex-col items-center hidden sm:flex pt-1">
                                  <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm">
                                    <XIcon className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-sm text-gray-900">
                                      You
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {i + 1}/
                                      {(data as TwitterResponse).thread_count}
                                    </span>
                                  </div>
                                  <p className="text-[15px] whitespace-pre-wrap leading-relaxed text-gray-800 font-normal">
                                    {tweet}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {platform === "linkedin" && (data as LinkedInResponse).body && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg border bg-gray-50/50 space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-poppins">
                        Suggested Hooks
                      </h4>
                      <div className="grid gap-2">
                        {((data as LinkedInResponse).hooks || []).map(
                          (hook, i) => (
                            <div
                              key={i}
                              className="bg-white border rounded-md p-3 text-sm text-gray-700 hover:border-gray-400 transition-colors cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(hook);
                                toast.success("Hook copied!");
                              }}
                            >
                              {hook}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="bg-white border rounded-xl overflow-hidden">
                      <div className="bg-[#f3f2ef] px-4 py-3 border-b flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-[#0a66c2]" />
                        <span className="text-xs font-semibold text-gray-600">
                          LinkedIn Preview
                        </span>
                      </div>
                      <div className="p-6">
                        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">
                          {(data as LinkedInResponse).body}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {platform === "reddit" && (data as RedditResponse).body && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg border bg-gray-50/50 space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-poppins">
                        Title Options
                      </h4>
                      <div className="grid gap-2">
                        {((data as RedditResponse).titles || []).map(
                          (title, i) => (
                            <div
                              key={i}
                              className="bg-white border rounded-md p-3 text-sm font-medium text-gray-900 hover:border-gray-400 transition-colors cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(title);
                                toast.success("Title copied!");
                              }}
                            >
                              {title}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="bg-white border rounded-xl overflow-hidden">
                      <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center gap-2">
                        <RedditIcon className="h-5 w-5 text-[#FF4500]" />
                        <span className="text-xs font-semibold text-[#FF4500]">
                          Reddit Preview (Markdown)
                        </span>
                      </div>
                      <div className="p-6 bg-white">
                        <MarkdownViewer
                          content={(data as RedditResponse).body}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-white max-h-[82vh] min-h-[82vh] overflow-hidden p-0 flex flex-col gap-0">
        <div className="p-6 pb-2 border-b">
          <DialogHeader>
            <DialogTitle className="font-poppins text-xl">
              Repurpose Content
            </DialogTitle>
            <DialogDescription className="font-inter">
              Generate optimized content for social media platforms.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs
            defaultValue="twitter"
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as Platform)}
            className="flex flex-col h-full"
          >
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-lg">
                <TabsTrigger
                  value="twitter"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 font-poppins text-sm gap-2"
                >
                  <XIcon className="h-4 w-4 text-black" />
                  Twitter / X
                </TabsTrigger>
                <TabsTrigger
                  value="linkedin"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 font-poppins text-sm gap-2"
                >
                  <Linkedin className="h-4 w-4 text-[#0077b5]" />
                  LinkedIn
                </TabsTrigger>
                <TabsTrigger
                  value="reddit"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 font-poppins text-sm gap-2"
                >
                  <RedditIcon className="h-4 w-4 text-[#FF4500]" />
                  Reddit
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 bg-white">
              <TabsContent value="twitter" className="m-0 h-full">
                {renderContent("twitter")}
              </TabsContent>
              <TabsContent value="linkedin" className="m-0 h-full">
                {renderContent("linkedin")}
              </TabsContent>
              <TabsContent value="reddit" className="m-0 h-full">
                {renderContent("reddit")}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
