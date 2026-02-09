import React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthoritySignalsProps {
  score: number;
}

const getScoreColor = (value: number) => {
  if (value >= 80) return "text-green-600";
  if (value >= 40) return "text-yellow-600";
  return "text-red-600";
};

export const AuthoritySignals = ({ score }: AuthoritySignalsProps) => {
  const scoreColor = getScoreColor(score);

  return (
    <div className="bg-primary/5 rounded-xl overflow-hidden">
      <div className="bg-[#104127]/10 px-4 py-2 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#104127]" />
        <h4 className="font-bold text-[#104127] text-sm">Authority Signal</h4>
      </div>

      <div className="p-4 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          Based on first-person insights
        </span>
        <div className="text-right">
          <span
            className={`text-2xl font-bold font-poppins block ${scoreColor}`}
          >
            {score}
          </span>
          <span className="text-[10px] text-gray-400">/ 100</span>
        </div>
      </div>
    </div>
  );
};
