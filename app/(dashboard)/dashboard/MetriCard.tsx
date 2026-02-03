import React from "react";
import { MoveUpRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string | React.ReactNode;
  value: string | number;
  subtext?: string | React.ReactNode;
  type?: "primary" | "secondary";
  className?: string;
  labelClassName?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    change: number;
  };
  interpretation?:
    | "Excellent"
    | "Good"
    | "Fair"
    | "Poor"
    | "Critical"
    | "No data";
  scoreColor?: "green" | "blue" | "yellow" | "orange" | "red" | "gray";
  customGradient?: string;
}

const MetricCard = ({
  label,
  value,
  subtext,
  type = "secondary",
  className,
  labelClassName,
  icon,
  trend,
  interpretation,
  scoreColor,
  customGradient,
  gaugeValue,
}: MetricCardProps & { gaugeValue?: number }) => {
  const isPrimary = type === "primary";

  // Get interpretation badge colors
  const getInterpretationStyle = () => {
    if (!interpretation) return null;
    const styles: Record<string, { bg: string; text: string }> = {
      Excellent: { bg: "#dcfce7", text: "#166534" },
      Good: { bg: "#dbeafe", text: "#1e40af" },
      Fair: { bg: "#fef3c7", text: "#92400e" },
      Poor: { bg: "#fed7aa", text: "#9a3412" },
      Critical: { bg: "#fee2e2", text: "#991b1b" },
      "No data": { bg: "#f3f4f6", text: "#4b5563" },
    };
    return styles[interpretation];
  };

  const interpretationStyle = getInterpretationStyle();

  // Gauge Calculation
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = gaugeValue || 0;
  const dashoffset = circumference - (progress / 100) * circumference;

  // Dynamic stroke color for gauge
  const getStrokeColor = () => {
    if (interpretationStyle?.bg) return interpretationStyle.bg; // Use the badge background color (lighter) or text color?
    // Actually usually we want the "Good" color.
    // Let's use the styles logic:
    if (interpretation === "Excellent") return "#86efac"; // green-300
    if (interpretation === "Good") return "#93c5fd"; // blue-300
    if (interpretation === "Fair") return "#fde047"; // yellow-300
    if (interpretation === "Poor") return "#fdba74"; // orange-300
    if (interpretation === "Critical") return "#fca5a5"; // red-300
    return "#e2e8f0";
  };
  const gaugeColor = getStrokeColor();

  return (
    <div
      className={cn(
        "rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
        isPrimary
          ? "bg-[#104127] text-white shadow-lg"
          : "bg-white dark:bg-zinc-900 border-none text-foreground shadow-none",
        className,
      )}
    >
      {/* Dynamic Background for Primary */}
      {isPrimary && (
        <div
          className="absolute inset-0 opacity-100 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 10% 90%, #1a5d3a 0%, transparent 60%), linear-gradient(to top right, #104127 0%, #0d3520 100%)",
          }}
        />
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <h3
              className={cn(
                "text-lg font-medium font-poppins",
                isPrimary
                  ? "text-green-50"
                  : "text-slate-600 dark:text-slate-400",
                labelClassName,
              )}
            >
              {label}
            </h3>
          </div>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:-translate-y-1 hover:translate-x-1 shrink-0 ml-2",
              isPrimary
                ? "bg-white text-[#104127]"
                : "bg-white border border-border text-slate-800 dark:bg-zinc-800 dark:text-slate-200",
            )}
          >
            <MoveUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          {/* Left Column: Value, Trend, Subtext */}
          <div className="flex flex-col">
            <div
              className={cn(
                "text-5xl font-bold tracking-tight mb-2 font-inter",
                isPrimary ? "text-white" : "text-slate-900 dark:text-white",
              )}
            >
              {value}
            </div>

            {/* Interpretation Badge (Only if no gauge on the right) */}
            {interpretation &&
              interpretationStyle &&
              (!isPrimary || gaugeValue === undefined) && (
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2 w-fit"
                  style={{
                    backgroundColor: interpretationStyle.bg,
                    color: interpretationStyle.text,
                  }}
                >
                  {interpretation}
                </div>
              )}

            {/* Trend Indicator */}
            {trend && trend.direction !== "neutral" && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium mb-1",
                  isPrimary
                    ? "text-green-100"
                    : "text-slate-600 dark:text-slate-400",
                )}
              >
                <span
                  className={
                    // Keep green/red for trend regardless of card type?
                    // On Green card, red might fade. Use specific colors.
                    trend.direction === "up"
                      ? isPrimary
                        ? "text-green-300"
                        : "text-green-600"
                      : isPrimary
                        ? "text-red-300"
                        : "text-red-500"
                  }
                >
                  {trend.direction === "up" ? "↑" : "↓"}
                </span>
                <span>{Math.abs(trend.change).toFixed(1)} vs last period</span>
              </div>
            )}

            {subtext && (
              <div
                className={cn(
                  "text-sm font-medium flex items-center gap-1.5 font-inter",
                  isPrimary
                    ? "text-green-100"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                {subtext}
              </div>
            )}
          </div>

          {/* Right Column: Gauge + Interpretation (If gauge exists) */}
          {isPrimary && gaugeValue !== undefined && (
            <div className="flex flex-col items-center gap-3 mr-2">
              <div className="relative">
                <svg width="80" height="80" className="rotate-[-90deg]">
                  {/* Track */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                  />
                  {/* Progress */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Badge Below Gauge */}
              {interpretation && interpretationStyle && (
                <div
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: interpretationStyle.bg,
                    color: interpretationStyle.text,
                  }}
                >
                  {interpretation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
