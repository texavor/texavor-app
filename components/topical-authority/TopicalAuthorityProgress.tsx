"use client";

import React from "react";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopicalAuthorityProgressProps {
  status: string;
  data: any;
  onReset: () => void;
  onRunSuggested: (topic: string) => void;
}

export function TopicalAuthorityProgress({
  status,
  data,
  onReset,
  onRunSuggested,
}: TopicalAuthorityProgressProps) {
  if (status === "failed") {
    if (data?.status === "validation_failed") {
      return (
        <div className="bg-red-50 border-none shadow-none rounded-xl p-6 flex flex-col items-center justify-center min-h-[400px] text-center font-poppins">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl text-red-800 font-semibold mb-2">
            Generation Failed
          </h3>
          <p className="text-red-600 mb-6 font-inter max-w-md">{data.error}</p>

          {data.suggested_topic && (
            <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm w-full max-w-md">
              <p className="text-sm text-gray-500 mb-2">
                Refund issued. Try our suggested topic instead:
              </p>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <span
                  className="font-medium text-gray-800 flex-1 truncate"
                  title={data.suggested_topic}
                >
                  {data.suggested_topic}
                </span>
                <Button
                  onClick={() => onRunSuggested(data.suggested_topic)}
                  variant="secondary"
                  className="shrink-0"
                >
                  Run Suggested
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={onReset}
            variant="ghost"
            className="mt-6 text-gray-500"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      );
    }

    return (
      <div className="bg-red-50 border-none shadow-none rounded-xl p-6 flex flex-col items-center justify-center min-h-[400px] text-center font-poppins">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl text-red-800 font-semibold mb-2">
          System Error
        </h3>
        <p className="text-red-600 mb-6 font-inter max-w-md">
          {data?.error ||
            "An unexpected system error occurred during generation."}
        </p>
        <p className="text-sm font-medium mb-4 text-gray-700">
          A refund has been issued to your credits.
        </p>
        <Button onClick={onReset} variant="outline" className="border-red-200">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Pending/Processing state
  return (
    <div className="bg-white border-none shadow-none rounded-xl p-10 flex flex-col items-center justify-center min-h-[400px] text-center font-poppins">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#104127]/10 rounded-full blur-xl animate-pulse"></div>
        <Loader2 className="w-16 h-16 text-[#104127] animate-spin relative z-10" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Gathering SEO Data & Structuring Map
      </h3>
      <p className="text-gray-500 font-inter max-w-sm">
        This process involves deep SERP analysis, competitor evaluation, and AI
        reasoning. It can take 30-60 seconds. Please do not navigate away.
      </p>
    </div>
  );
}
