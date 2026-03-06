"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface TopicalAuthorityFormProps {
  onSuccess: (jobId: number) => void;
  defaultTopic?: string;
}

export function TopicalAuthorityForm({
  onSuccess,
  defaultTopic,
}: TopicalAuthorityFormProps) {
  const { blogs } = useAppStore();

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [error, setError] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [expertiseContext, setExpertiseContext] = useState("");
  const [editorialGuidelines, setEditorialGuidelines] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  React.useEffect(() => {
    if (defaultTopic) {
      setTopic(defaultTopic);
    }
  }, [defaultTopic]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = { topic };
      if (tone) payload.tone = tone;
      if (targetAudience) payload.target_audience = targetAudience;
      if (authorName) payload.author_name = authorName;
      if (expertiseContext) payload.expertise_context = expertiseContext;
      if (editorialGuidelines)
        payload.editorial_guidelines = editorialGuidelines;

      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/topical_authorities`,
        payload,
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.job_id) {
        onSuccess(data.job_id);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!topic || topic.trim().length < 2) {
      setError("Topic must be at least 2 characters.");
      return;
    }

    if (!blogs?.id) return;
    mutation.mutate();
  };

  return (
    <div className="font-inter">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Single card with Seed Topic + Tone + Audience */}
        <div className="bg-white rounded-xl p-5 border-none shadow-none space-y-4">
          {/* Seed Topic */}
          <div className="space-y-1.5">
            <Label
              htmlFor="topic"
              className="text-sm font-semibold text-gray-800"
            >
              Seed Topic <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="e.g. SaaS Marketing, Dog Training, AI SEO"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border-gray-200 h-11 text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-[11px] text-gray-400">
              Enter a broad topic. The AI will create pillars, subtopics, and
              article ideas.
            </p>
          </div>

          {/* Tone + Audience in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="tone"
                className="text-sm font-medium text-gray-700"
              >
                Tone
              </Label>
              <Input
                id="tone"
                placeholder="e.g. Professional, Casual"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="border-gray-200 h-10 text-sm"
              />
              <p className="text-[11px] text-gray-400">Defaults to blog tone</p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="targetAudience"
                className="text-sm font-medium text-gray-700"
              >
                Target Audience
              </Label>
              <Input
                id="targetAudience"
                placeholder="e.g. Founders, Beginners"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="border-gray-200 h-10 text-sm"
              />
              <p className="text-[11px] text-gray-400">
                Defaults to blog audience
              </p>
            </div>
          </div>

          {/* Advanced toggle — inside the same card */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer px-0"
            >
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              Advanced Settings
            </button>

            {showAdvanced && (
              <div className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="authorName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Author Name
                  </Label>
                  <Input
                    id="authorName"
                    placeholder="e.g. Jane Doe"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="border-gray-200 h-10 text-sm"
                  />
                  <p className="text-[11px] text-gray-400">
                    Injects human attribution into content logic
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="expertiseContext"
                    className="text-sm font-medium text-gray-700"
                  >
                    Expertise Context
                  </Label>
                  <Input
                    id="expertiseContext"
                    placeholder="e.g. 10 years scaling B2B SaaS MRR"
                    value={expertiseContext}
                    onChange={(e) => setExpertiseContext(e.target.value)}
                    className="border-gray-200 h-10 text-sm"
                  />
                  <p className="text-[11px] text-gray-400">
                    Informs AI on specific expertise angles
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="editorialGuidelines"
                    className="text-sm font-medium text-gray-700"
                  >
                    Editorial Guidelines
                  </Label>
                  <Input
                    id="editorialGuidelines"
                    placeholder="e.g. Must include data-backed case studies"
                    value={editorialGuidelines}
                    onChange={(e) => setEditorialGuidelines(e.target.value)}
                    className="border-gray-200 h-10 text-sm"
                  />
                  <p className="text-[11px] text-gray-400">
                    Enforces editorial rules across the generated map
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit button — compact, right-aligned inside the card */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="h-9 px-6 bg-[#104127] hover:bg-[#104127]/90 text-white flex gap-2 items-center border-none shadow-none text-sm font-medium"
              disabled={mutation.isPending || !blogs?.id}
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {mutation.isPending
                ? "Starting..."
                : "Generate Map (350 Credits)"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
