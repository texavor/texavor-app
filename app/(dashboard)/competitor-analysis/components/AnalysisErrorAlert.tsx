import { AlertCircle, XCircle } from "lucide-react";

interface AnalysisErrorAlertProps {
  errorMessage: string;
  className?: string;
}

export default function AnalysisErrorAlert({
  errorMessage,
  className = "",
}: AnalysisErrorAlertProps) {
  return (
    <div
      className={`relative bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-50/60 border border-amber-200/60 rounded-xl p-4 flex gap-3 items-start shadow-sm ${className}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-700" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-amber-900">
            Analysis Failed
          </h4>
        </div>
        <p className="text-sm text-amber-800 leading-relaxed break-words">
          {errorMessage}
        </p>
      </div>
    </div>
  );
}
