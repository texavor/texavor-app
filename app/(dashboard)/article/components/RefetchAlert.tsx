import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefetchAlertProps {
  onRefetch: () => void;
  isRefetching: boolean;
  className?: string;
}

export const RefetchAlert = ({
  onRefetch,
  isRefetching,
  className = "",
}: RefetchAlertProps) => {
  return (
    <div
      className={`relative bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-50/60 border border-none rounded-xl p-4 flex gap-3 items-start shadow-none mb-6 ${className}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-amber-900">
            Plain Text Content
          </h4>
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">
          This article was imported as plain text. Headers and tables might be
          missing.{" "}
          <Button
            onClick={onRefetch}
            disabled={isRefetching}
            size="sm"
            variant="link"
            className="h-auto p-0 text-amber-900 font-semibold underline underline-offset-4 hover:text-amber-700"
          >
            {isRefetching ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Refetching...
              </span>
            ) : (
              "Fix structure"
            )}
          </Button>
        </p>
      </div>
    </div>
  );
};
