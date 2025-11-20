import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  count: string | number;
  trend?: number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  subTitle?: string;
}

export const StatsCard = ({
  title,
  count,
  trend,
  icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-600",
  subTitle,
}: StatsCardProps) => {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-start justify-between">
        <div className="flex gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              iconBgColor
            )}
          >
            <div className={cn("w-6 h-6", iconColor)}>{icon}</div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 font-inter">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900 font-poppins">
                {count}
              </h3>
              {trend !== undefined && (
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend > 0
                      ? "text-green-600"
                      : trend < 0
                      ? "text-red-600"
                      : "text-gray-500"
                  )}
                >
                  {trend > 0 ? (
                    <ArrowUp className="w-3 h-3 mr-0.5" />
                  ) : trend < 0 ? (
                    <ArrowDown className="w-3 h-3 mr-0.5" />
                  ) : (
                    <Minus className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
            {subTitle && (
              <p className="text-xs text-gray-400 font-inter">{subTitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
