"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SeoAnalyzerCard = () => {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold font-poppins text-gray-900">
          SEO Score Analyzer
        </CardTitle>
        <p className="text-sm text-gray-500 font-inter">
          <span className="font-bold text-gray-900">152</span> Articles Analyzed
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span className="w-[68%] text-left">68%</span>
              <span className="w-[22%] text-left">22%</span>
              <span className="w-[10%] text-right">10%</span>
            </div>
            <div className="flex h-3 w-full rounded-full overflow-hidden">
              <div className="bg-blue-400 w-[68%]" />
              <div className="bg-pink-400 w-[22%]" />
              <div className="bg-orange-200 w-[10%]" />
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
