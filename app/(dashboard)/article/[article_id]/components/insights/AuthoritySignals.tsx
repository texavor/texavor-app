import React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthoritySignalsProps {
  score: number;
}

export const AuthoritySignals = ({ score }: AuthoritySignalsProps) => {
  return (
    <div className="bg-primary/5 rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-[#104127]/10 p-2 rounded-full text-[#104127]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Authority Signal
          </span>
          <span className="text-sm font-semibold text-gray-700">
            Based on first-person insights
          </span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold font-poppins text-gray-900 block">
          {score}
        </span>
        <span className="text-[10px] text-gray-400">/ 100</span>
      </div>
    </div>
  );
};
