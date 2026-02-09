import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PlatformBlockers as IPlatformBlockers,
  PlatformRecommendations,
} from "./types";
import { Sparkles, CheckCircle, XCircle } from "lucide-react";

interface PlatformBlockersProps {
  blockers: IPlatformBlockers;
  recommendations: PlatformRecommendations;
}

const platforms = [
  { key: "chatgpt", label: "ChatGPT" },
  { key: "perplexity", label: "Perplexity" },
  { key: "gemini", label: "Gemini" },
];

export const PlatformBlockers = ({
  blockers,
  recommendations,
}: PlatformBlockersProps) => {
  return (
    <div className="bg-primary/5 rounded-xl overflow-hidden">
      <div className="bg-[#104127]/10 px-4 py-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#104127]" />
        <h4 className="font-bold text-[#104127] text-sm">
          Platform Specific Suggestions
        </h4>
      </div>

      <div className="p-4">
        <Tabs defaultValue="chatgpt" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-3 h-8 bg-black/5 p-1 rounded-lg">
            {platforms.map((p) => (
              <TabsTrigger
                key={p.key}
                value={p.key}
                className="text-xs rounded-md data-[state=active]:bg-[#104127] data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
              >
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {platforms.map((platform) => {
            const platformBlockers = blockers?.[platform.key] || [];
            const recommendation = recommendations?.[platform.key];
            const hasBlockers = platformBlockers.length > 0;

            return (
              <TabsContent
                key={platform.key}
                value={platform.key}
                className="mt-0 space-y-4"
              >
                {/* Status Indicator */}
                <div
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    hasBlockers ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {hasBlockers ? (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        hasBlockers ? "text-red-700" : "text-green-800"
                      }`}
                    >
                      {hasBlockers ? "Optimization Needed" : "Optimized"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {recommendation ||
                        (hasBlockers
                          ? `Fix these issues to improve ${platform.label} formatting.`
                          : `${platform.label} requirements met.`)}
                    </p>
                  </div>
                </div>

                {/* Blockers List */}
                {hasBlockers && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Critical Issues
                    </p>
                    <ul className="space-y-2">
                      {platformBlockers.map((blocker, idx) => (
                        <li
                          key={idx}
                          className="flex gap-2 items-start text-sm text-gray-700"
                        >
                          <span className="text-red-500 font-bold">•</span>
                          {blocker}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};
