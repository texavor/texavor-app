import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format platform names for display
 * Converts platform IDs like 'custom_webhook' to 'Custom Webhook'
 */
export function formatPlatformName(platform: string): string {
  if (!platform) return "";

  // Handle special cases
  const specialCases: Record<string, string> = {
    custom_webhook: "Custom Webhook",
    customwebhook: "Custom Webhook",
    devto: "Dev.to",
    hashnode: "Hashnode",
    medium: "Medium",
    wordpress: "WordPress",
    webflow: "Webflow",
    shopify: "Shopify",
  };

  const normalized = platform.toLowerCase().replace(/[.\s-]/g, "_");
  return specialCases[normalized] || platform;
}
