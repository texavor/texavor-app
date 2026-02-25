"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Network, Loader2 } from "lucide-react";

interface TopicalAuthorityFormProps {
  onSuccess: (jobId: number) => void;
}

export function TopicalAuthorityForm({ onSuccess }: TopicalAuthorityFormProps) {
  const { blogs } = useAppStore();

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = { topic };
      if (tone) payload.tone = tone;
      if (targetAudience) payload.target_audience = targetAudience;

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
    <div className="bg-white p-6 rounded-xl border-none shadow-none font-poppins h-full">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-[#104127]" />
        <h2 className="text-lg font-semibold text-gray-800">Generate Map</h2>
      </div>
      <p className="text-sm text-gray-500 font-inter mb-6">
        Enter a broad "Seed Topic" (e.g., "SaaS Marketing", "Dog Training") to
        generate a comprehensive 3-tier authority map. This requires 350
        credits.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="topic">
            Seed Topic <span className="text-red-500">*</span>
          </Label>
          <Input
            id="topic"
            placeholder="e.g. SaaS Marketing"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border-gray-200"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tone (Optional)</Label>
          <Input
            id="tone"
            placeholder="e.g. Professional, Casual"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="border-gray-200"
          />
          <p className="text-[13px] text-gray-500">
            Defaults to blog's tone if empty
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
          <Input
            id="targetAudience"
            placeholder="e.g. Founders, Beginners"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="border-gray-200"
          />
          <p className="text-[13px] text-gray-500">
            Defaults to blog's audience if empty
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-[#104127] hover:bg-[#104127]/90 text-white flex gap-2 items-center border-none shadow-none"
            disabled={mutation.isPending || !blogs?.id}
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mutation.isPending ? "Starting..." : "Generate Map (350 Credits)"}
          </Button>
        </div>
      </form>
    </div>
  );
}
