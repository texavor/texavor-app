import React from "react";
import { Gauge } from "@/components/ScoreMeter";
import { PlatformScores } from "./types";

interface AeoHeroSectionProps {
  aeoScore: number;
  answerabilityScore: number;
  platformScores: PlatformScores;
}

const platforms = [
  { key: "chatgpt", label: "ChatGPT", icon: "/ai/chatgpt.png" },
  { key: "gemini", label: "Gemini", icon: "/ai/gemini.jpg" },
  { key: "perplexity", label: "Perplexity", icon: "/ai/perplexity.png" },
];

export const AeoHeroSection = ({
  aeoScore,
  answerabilityScore,
  platformScores,
}: AeoHeroSectionProps) => {
  return (
    <div className="bg-primary/5 rounded-xl p-4 space-y-6">
      <div className="flex justify-around items-center">
        <Gauge value={aeoScore} label="AEO Score" />
        <Gauge value={answerabilityScore} label="Answerability" />
      </div>

      <div className="flex justify-center gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.key}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="relative">
              <img
                src={platform.icon}
                alt={platform.label}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-white ${
                  (platformScores?.[platform.key] || 0) >= 80
                    ? "bg-green-500"
                    : (platformScores?.[platform.key] || 0) >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              >
                {platformScores?.[platform.key] || 0}
              </div>
            </div>
            <span className="text-[10px] font-medium text-gray-500">
              {platform.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
