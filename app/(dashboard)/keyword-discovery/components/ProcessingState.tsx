import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Clock } from "lucide-react";
import { DiscoveryProgress } from "../hooks/useKeywordDiscoveryApi";

interface ProcessingStateProps {
  totalKeywords?: number;
  progress?: DiscoveryProgress;
}

export function ProcessingState({
  totalKeywords,
  progress,
}: ProcessingStateProps) {
  return (
    <Card className="p-12 bg-white border-none shadow-none text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-[#104127] opacity-30" />
          <Sparkles className="h-8 w-8 text-[#104127] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold font-poppins text-[#0A2918]">
            Discovering Keywords...
          </h3>
          <p className="text-sm text-gray-600 font-inter">
            We're analyzing your blog content, competitors, and AI predictions.
          </p>
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="w-full max-w-md space-y-3 mt-6">
            {/* Stage Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 font-inter">
                {progress.current_stage}
              </span>
              <span className="text-gray-500 font-inter">
                Stage {progress.stage_number}/{progress.total_stages}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#104127] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            {/* Percentage and Time */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium font-inter">
                {progress.percentage}% complete
              </span>
              {progress.estimated_seconds_remaining !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-inter">
                    ~{progress.estimated_seconds_remaining}s remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {totalKeywords !== undefined && totalKeywords > 0 && !progress && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 font-inter">
              Processing{" "}
              <span className="font-bold text-[#104127]">{totalKeywords}</span>{" "}
              keywords
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 font-inter mt-4">
          This may take up to 2 minutes. The page will auto-refresh when
          complete.
        </p>
      </div>
    </Card>
  );
}
