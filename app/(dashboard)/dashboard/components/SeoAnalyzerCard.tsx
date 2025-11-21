"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SeoData {
  good: number;
  average: number;
  poor: number;
}

interface SeoAnalyzerCardProps {
  data?: SeoData;
}

export const SeoAnalyzerCard = ({ data }: SeoAnalyzerCardProps) => {
  const total = (data?.good || 0) + (data?.average || 0) + (data?.poor || 0);
  const goodPercent =
    total > 0 ? Math.round(((data?.good || 0) / total) * 100) : 0;
  const averagePercent =
    total > 0 ? Math.round(((data?.average || 0) / total) * 100) : 0;
  const poorPercent =
    total > 0 ? Math.round(((data?.poor || 0) / total) * 100) : 0;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold font-poppins text-gray-900">
          SEO Score Analyzer
        </CardTitle>
        <p className="text-sm text-gray-500 font-inter">
          <span className="font-bold text-gray-900">{total}</span> Articles
          Analyzed
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span style={{ width: `${goodPercent}%` }} className="text-left">
                {goodPercent}%
              </span>
              <span
                style={{ width: `${averagePercent}%` }}
                className="text-left"
              >
                {averagePercent}%
              </span>
              <span style={{ width: `${poorPercent}%` }} className="text-right">
                {poorPercent}%
              </span>
            </div>
            <div className="flex h-3 w-full rounded-full overflow-hidden">
              <div
                className="bg-blue-400"
                style={{ width: `${goodPercent}%` }}
              />
              <div
                className="bg-pink-400"
                style={{ width: `${averagePercent}%` }}
              />
              <div
                className="bg-orange-200"
                style={{ width: `${poorPercent}%` }}
              />
            </div>
            <div className="flex gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs text-gray-500 font-medium">Good</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-pink-400" />
                <span className="text-xs text-gray-500 font-medium">
                  Average
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-200" />
                <span className="text-xs text-gray-500 font-medium">Poor</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
