import React from "react";
import { Answerability } from "./types";
import { ScoreMeter } from "@/components/ScoreMeter";
import { Check, Info } from "lucide-react";

interface AnswerabilityBreakdownProps {
  data: Answerability;
}

const getScoreColor = (value: number, max: number) => {
  const percentage = (value / max) * 100;
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 40) return "text-yellow-600";
  return "text-red-600";
};

export const AnswerabilityBreakdown = ({
  data,
}: AnswerabilityBreakdownProps) => {
  if (!data) return null;

  const defColor = getScoreColor(data.breakdown.definitions, 30);
  const listColor = getScoreColor(data.breakdown.lists, 30);
  const quoteColor = getScoreColor(data.breakdown.quotes, 30);

  return (
    <div className="bg-primary/5 rounded-xl p-4 space-y-4">
      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
        <span className="bg-blue-100 text-blue-600 p-1 rounded-md">
          <Info className="w-3 h-3" />
        </span>
        Answerability Breakdown
      </h4>

      <div className="space-y-4">
        {/* Definitions */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-gray-600">Definitions</span>
            <span className={`font-bold ${defColor}`}>
              {data.breakdown.definitions}/30
            </span>
          </div>
          <ScoreMeter value={data.breakdown.definitions / 30} />
          <p className="text-[10px] text-gray-400">
            {data.definition_ready_sections} sections are definition-ready.
          </p>
        </div>

        {/* Lists */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-gray-600">Lists</span>
            <span className={`font-bold ${listColor}`}>
              {data.breakdown.lists}/30
            </span>
          </div>
          <ScoreMeter value={data.breakdown.lists / 30} />
          <p className="text-[10px] text-gray-400">
            {data.list_ready_sections} sections are list-ready.
          </p>
        </div>

        {/* Quotes */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-gray-600">Quotes</span>
            <span className={`font-bold ${quoteColor}`}>
              {data.breakdown.quotes}/30
            </span>
          </div>
          <ScoreMeter value={data.breakdown.quotes / 30} />
          <p className="text-[10px] text-gray-400">
            {data.quote_ready_sentences} sentences are likely to be quoted.
          </p>
        </div>
      </div>
    </div>
  );
};
