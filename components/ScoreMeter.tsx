import React from "react";

export const ScoreMeter = ({ value }: { value: number }) => {
  const valueOn10 = Math.round(value * 10);
  const segments = Array.from({ length: 10 }, (_, i) => i < valueOn10);
  return (
    <div className="flex w-full gap-1 pt-1">
      {segments.map((isFilled, index) => {
        let color = "bg-gray-200";
        if (isFilled) {
          if (valueOn10 <= 3) color = "bg-red-500"; // Low
          else if (valueOn10 <= 7) color = "bg-yellow-500"; // Medium
          else color = "bg-green-500"; // High
        }
        return <div key={index} className={`h-2 w-full rounded-sm ${color}`} />;
      })}
    </div>
  );
};

export const Gauge = ({
  value,
  max = 10,
  label,
}: {
  value: number;
  max?: number;
  label: string;
}) => {
  const radius = 45;
  const semiCircleCircumference = Math.PI * radius;
  const strokeDashoffset = semiCircleCircumference * (1 - value / max);

  let colorClass = "text-green-500";
  if (value / max >= 0.7) {
    colorClass = "text-red-500";
  } else if (value / max >= 0.4) {
    colorClass = "text-yellow-500";
  }

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-semibold text-black font-poppins">{label}</p>
      <div className="relative w-28 h-14 mt-1">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="currentColor"
            className={colorClass}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={semiCircleCircumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div className="absolute bottom-0 w-full text-center">
          <span className="text-xl font-bold">{value}</span>
        </div>
      </div>
    </div>
  );
};
