import type { AeoVisibilityScore } from "../types/aeo.types";

export const getScoreColor = (
  score: number,
): "green" | "blue" | "yellow" | "orange" | "red" | "gray" => {
  if (score >= 80) return "green";
  if (score >= 60) return "blue";
  if (score >= 40) return "yellow";
  if (score >= 20) return "orange";
  if (score > 0) return "red";
  return "gray";
};

export const getScoreGradient = (
  color: "green" | "blue" | "yellow" | "orange" | "red" | "gray",
): string => {
  const gradients = {
    green:
      "radial-gradient(circle at 10% 90%, #1a5d3a 0%, transparent 60%), linear-gradient(to top right, #104127 0%, #0d3520 100%)",
    blue: "radial-gradient(circle at 10% 90%, #1e40af 0%, transparent 60%), linear-gradient(to top right, #1e3a8a 0%, #1e293b 100%)",
    yellow:
      "radial-gradient(circle at 10% 90%, #ca8a04 0%, transparent 60%), linear-gradient(to top right, #a16207 0%, #713f12 100%)",
    orange:
      "radial-gradient(circle at 10% 90%, #c2410c 0%, transparent 60%), linear-gradient(to top right, #9a3412 0%, #7c2d12 100%)",
    red: "radial-gradient(circle at 10% 90%, #b91c1c 0%, transparent 60%), linear-gradient(to top right, #991b1b 0%, #7f1d1d 100%)",
    gray: "radial-gradient(circle at 10% 90%, #4b5563 0%, transparent 60%), linear-gradient(to top right, #374151 0%, #1f2937 100%)",
  };
  return gradients[color];
};

export const getInterpretationBadge = (
  interpretation: string,
): { bg: string; text: string } => {
  const badges: Record<string, { bg: string; text: string }> = {
    Excellent: { bg: "#dcfce7", text: "#166534" },
    Good: { bg: "#dbeafe", text: "#1e40af" },
    Fair: { bg: "#fef3c7", text: "#92400e" },
    Poor: { bg: "#fed7aa", text: "#9a3412" },
    Critical: { bg: "#fee2e2", text: "#991b1b" },
    "No data": { bg: "#f3f4f6", text: "#4b5563" },
  };
  return badges[interpretation] || badges["No data"];
};

export const formatTrendChange = (trend: {
  direction: "up" | "down" | "neutral";
  change: number;
}): string => {
  if (trend.direction === "neutral") return "No change";
  const arrow = trend.direction === "up" ? "↑" : "↓";
  return `${arrow} ${Math.abs(trend.change).toFixed(1)} points`;
};

export const getPlatformIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    chatgpt: "🤖",
    claude: "🧠",
    gemini: "✨",
    perplexity: "🔍",
    deepseek: "🌊",
    copilot: "💡",
    meta: "🔷",
  };
  return icons[platform.toLowerCase()] || "🤖";
};

export const formatMentionRate = (mentions: number, total: number): string => {
  return `${mentions}/${total}`;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    software_selection: "#3b82f6",
    product_discovery: "#8b5cf6",
    brand_awareness: "#ec4899",
    local_services: "#f59e0b",
    general: "#6b7280",
  };
  return colors[category] || colors.general;
};

export const formatCategoryName = (category: string): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
