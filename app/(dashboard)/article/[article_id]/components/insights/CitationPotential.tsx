import React from "react";
import { CitationPotentialData } from "./types";
import { TrendingUp, FileText } from "lucide-react";
import { ScoreMeter } from "@/components/ScoreMeter";

interface CitationPotentialProps {
  data: CitationPotentialData;
}

export const CitationPotential = ({ data }: CitationPotentialProps) => {
  if (!data) return null;

  return (
    <div className="bg-primary/5 rounded-xl p-4 space-y-4">
      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
        <span className="bg-[#104127]/10 text-[#104127] p-1 rounded-md">
          <TrendingUp className="w-3 h-3" />
        </span>
        Citation Potential
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* Prediction Badge */}
        <div className="bg-white/40 rounded-lg p-3 flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            Prediction
          </span>
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full uppercase ${
              data.prediction?.toLowerCase() === "high"
                ? "bg-green-100/50 text-green-700 border border-green-200"
                : data.prediction?.toLowerCase() === "medium"
                  ? "bg-yellow-100/50 text-yellow-700 border border-yellow-200"
                  : "bg-red-100/50 text-red-700 border border-red-200"
            }`}
          >
            {data.prediction}
          </span>
        </div>

        {/* Citation Rate Meter */}
        <div className="bg-white/40 rounded-lg p-3 flex flex-col items-center justify-center text-center w-full">
          <div className="flex justify-between w-full mb-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              Rate
            </span>
            <span className="text-xs font-bold text-gray-900">
              {data.citation_rate}%
            </span>
          </div>
          <ScoreMeter value={data.citation_rate / 10} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs bg-white/40 border border-gray-100 p-2 rounded-md text-gray-700">
        <FileText className="w-4 h-4 text-gray-400" />
        <span className="font-semibold">Detected Type:</span>{" "}
        <span className="capitalize">{data.content_type}</span>
      </div>

      {data.insights && data.insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
            Key Insights
          </p>
          <ul className="space-y-1">
            {data.insights.map((insight, idx) => (
              <li
                key={idx}
                className="text-xs text-gray-600 flex gap-2 items-start"
              >
                <span className="text-[#104127] text-[10px] mt-0.5">●</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
