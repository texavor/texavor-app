import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { DiscoveryUsage } from "../hooks/useKeywordDiscoveryApi";

interface UsageCardProps {
  usage: DiscoveryUsage | undefined;
  isLoading: boolean;
}

export function UsageCard({ usage, isLoading }: UsageCardProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="p-4 bg-white border-none shadow-none">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium font-poppins text-gray-700">
              Loading usage...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!usage) return null;

  const isLimitReached = usage.remaining === 0;
  const isLowRemaining = usage.remaining > 0 && usage.remaining <= 2;

  return (
    <Card className="p-4 bg-white border-none shadow-none">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium font-poppins text-gray-700">
            Keyword Discoveries
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold font-poppins text-[#0A2918]">
              {usage.used} / {usage.limit}
            </p>
            <span className="text-sm text-gray-500 font-inter">this month</span>
          </div>
          {isLimitReached && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-orange-50 rounded-md">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-orange-800 font-inter">
                You've reached your monthly limit. Upgrade to discover more
                keywords.
              </p>
            </div>
          )}
          {isLowRemaining && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 rounded-md">
              <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800 font-inter">
                Only {usage.remaining}{" "}
                {usage.remaining === 1 ? "discovery" : "discoveries"} remaining
                this month.
              </p>
            </div>
          )}
        </div>
        {isLimitReached && (
          <Button
            onClick={() => router.push("/pricing")}
            size="sm"
            className="bg-[#104127] hover:bg-[#104127]/90"
          >
            Upgrade
          </Button>
        )}
      </div>
    </Card>
  );
}
