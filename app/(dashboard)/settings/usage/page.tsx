"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCredits } from "../hooks/useCreditsApi";
import { ScoreMeter } from "@/components/ScoreMeter";
import {
  FileText,
  Search,
  Lightbulb,
  Image,
  CreditCard,
  PieChart,
  CalendarClock,
  Zap,
} from "lucide-react";

import { useAppStore } from "@/store/appStore";

export default function UsagePage() {
  const { blogs } = useAppStore();
  const { data: creditResponse, isLoading } = useGetCredits(blogs?.id);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-poppins font-semibold text-[#0A2918] mb-2">
            Usage & Credits
          </h1>
          <p className="font-inter text-gray-600">
            View your credit usage and plan details
          </p>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 border-none">
                <Skeleton className="h-12 w-12 rounded-full bg-[#f9f4f0] mb-4" />
                <Skeleton className="h-8 w-20 bg-[#f9f4f0] mb-2" />
                <Skeleton className="h-4 w-32 bg-[#f9f4f0]" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const credits = creditResponse?.credits;
  const tier = creditResponse?.tier;

  const formatNumber = (num: number | string | undefined) => {
    if (num === undefined) return "0";
    return Number(num).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    });
  };

  const formatDateWithOrdinal = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    const suffix = ["th", "st", "nd", "rd"];
    const v = day % 100;
    const ord = suffix[(v - 20) % 10] || suffix[v] || suffix[0]; // standard ordinal rules

    return `${day}${ord} ${month}, ${year}`;
  };

  const UsageCard = ({
    icon: Icon,
    colorClass,
    bgClass,
    label,
    value,
    subValue,
  }: {
    icon: any;
    colorClass: string;
    bgClass: string;
    label: string;
    value: string | number;
    subValue?: string;
  }) => {
    return (
      <Card className="p-6 border-none shadow-none flex flex-col justify-between h-full bg-white">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center`}
            >
              <Icon className={`h-6 w-6 ${colorClass}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-inter">{label}</p>
              <p className="text-2xl font-bold font-poppins text-[#0A2918] whitespace-nowrap">
                {value}
                {subValue && (
                  <span className="text-sm text-gray-400 font-normal ml-1">
                    {subValue}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-semibold text-[#0A2918] mb-2">
            Usage & Credits
          </h1>
          <p className="font-inter text-gray-600">
            View your credit usage and plan details
          </p>
        </div>
        <div className="px-4 py-2 bg-[#104127] rounded-lg text-white font-medium capitalization font-poppins">
          Current Plan: <span className="uppercase">{tier || "Free"}</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Credit Overview */}
        <div>
          <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
            Credit Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UsageCard
              icon={CreditCard}
              bgClass="bg-blue-50"
              colorClass="text-blue-600"
              label="Remaining Credits"
              value={formatNumber(credits?.remaining)}
              subValue={`/ ${formatNumber(credits?.limit)}`}
            />

            <UsageCard
              icon={PieChart}
              bgClass="bg-orange-50"
              colorClass="text-orange-600"
              label="Used This Month"
              value={formatNumber(credits?.used_this_month)}
            />

            <UsageCard
              icon={Zap}
              bgClass="bg-yellow-50"
              colorClass="text-yellow-600"
              label="Usage Percentage"
              value={`${formatNumber(credits?.usage_percentage)}%`}
            />

            <UsageCard
              icon={CalendarClock}
              bgClass="bg-purple-50"
              colorClass="text-purple-600"
              label="Resets At"
              value={
                credits?.reset_at
                  ? formatDateWithOrdinal(credits.reset_at)
                  : "-"
              }
            />
          </div>
          {credits?.usage_percentage !== undefined && (
            <div className="mt-6 bg-white p-6 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Monthly Limit Progress
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(credits?.usage_percentage)}%
                </span>
              </div>
              <ScoreMeter
                value={Number(credits?.usage_percentage) / 100}
                inverse={true}
              />
            </div>
          )}
        </div>

        {/* Potential Usage */}
        {credits?.potential_usage && (
          <div>
            <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
              Potential Usage (Based on {formatNumber(credits.remaining)}{" "}
              Credits)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <UsageCard
                icon={FileText}
                bgClass="bg-indigo-50"
                colorClass="text-indigo-600"
                label="Article Analyses"
                value={formatNumber(
                  credits.potential_usage.article_analysis_approx,
                )}
                subValue="approx"
              />
              <UsageCard
                icon={Search}
                bgClass="bg-teal-50"
                colorClass="text-teal-600"
                label="Keyword Queries"
                value={formatNumber(
                  credits.potential_usage.keyword_research_queries,
                )}
              />
              <UsageCard
                icon={Image}
                bgClass="bg-pink-50"
                colorClass="text-pink-600"
                label="Image Generations"
                value={formatNumber(credits.potential_usage.image_generations)}
              />
              <UsageCard
                icon={Lightbulb}
                bgClass="bg-green-50"
                colorClass="text-green-600"
                label="Topic Generations"
                value={formatNumber(credits.potential_usage.topic_generations)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
