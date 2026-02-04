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
}

const MetricCard = ({
  label,
  value,
  subtext,
  type = "secondary",
  className,
  labelClassName,
  icon,
}: MetricCardProps) => {
  const isPrimary = type === "primary";

  return (
    <div
      className={cn(
        "rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
        isPrimary
          ? "bg-[#104127] text-white shadow-lg"
          : "bg-primary/5 dark:bg-zinc-900 border border-border/50 text-foreground shadow-none",
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
        <div className="flex justify-between items-start mb-4">
          <h3
            className={cn(
              "text-lg font-medium flex items-center gap-2 font-poppins",
              isPrimary
                ? "text-green-50"
                : "text-slate-600 dark:text-slate-400",
              labelClassName,
            )}
          >
            {icon}
            {label}
          </h3>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:-translate-y-1 hover:translate-x-1",
              isPrimary
                ? "bg-white text-[#104127]"
                : "bg-white border border-border text-slate-800 dark:bg-zinc-800 dark:text-slate-200",
            )}
          >
            <MoveUpRight className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div
            className={cn(
              "text-5xl font-bold tracking-tight mb-2 font-inter",
              isPrimary ? "text-white" : "text-slate-900 dark:text-white",
            )}
          >
            {value}
          </div>
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
      </div>
    </div>
  );
};

export default MetricCard;
