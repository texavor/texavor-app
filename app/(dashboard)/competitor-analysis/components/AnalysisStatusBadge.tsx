import { Badge } from "@/components/ui/badge";
import { Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface AnalysisStatusBadgeProps {
  status: "pending" | "analyzing" | "completed" | "failed";
  className?: string;
}

export default function AnalysisStatusBadge({
  status,
  className = "",
}: AnalysisStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock,
      className:
        "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 shadow-sm",
      animate: false,
    },
    analyzing: {
      label: "Analyzing",
      icon: Loader2,
      className:
        "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200 shadow-sm",
      animate: true,
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className:
        "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200 shadow-sm",
      animate: false,
    },
    failed: {
      label: "Failed",
      icon: AlertCircle,
      className:
        "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200 shadow-sm",
      animate: false,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className} font-inter text-xs px-3 py-1.5 flex items-center gap-2 transition-all duration-200 hover:shadow-md`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.animate ? "animate-spin" : ""}`} />
      <span className="font-medium">{config.label?.slice(0, 20)}</span>
    </Badge>
  );
}
