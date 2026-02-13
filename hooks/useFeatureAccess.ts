import { useGetUsage } from "@/app/(dashboard)/settings/hooks/useUsageApi";
import { useAppStore } from "@/store/appStore";

export const useFeatureAccess = () => {
  const { blogs } = useAppStore();
  const { data: usage, isLoading } = useGetUsage(blogs?.id);

  const getLimit = (feature: string): number => {
    if (!usage?.subscription?.limits) return -1; // Default to unlimited if no data yet to avoid premature locking
    const limits = usage.subscription.limits as any;
    const limit = limits[feature];
    return limit === undefined ? -1 : limit;
  };

  const isLocked = (feature: string): boolean => {
    const limit = getLimit(feature);
    return limit === 0;
  };

  const hasReachedLimit = (
    feature: string,
    currentUsageOverride?: number,
  ): boolean => {
    const limit = getLimit(feature);
    if (limit === -1) return false;
    if (limit === 0) return true;

    // Map feature names to usage keys if they differ
    // usage.current_month vs usage.subscription.usage
    // We'll rely on provided override or try to find it in common places
    let current = currentUsageOverride || 0;

    if (currentUsageOverride === undefined && usage) {
      // Try to find usage in current_month or subscription.usage
      // This part might need adjustment based on exact API mapping
      // For now, valid usages are passed in by components primarily
    }

    return current >= limit;
  };

  return {
    isLocked,
    hasReachedLimit,
    getLimit,
    isLoading,
    tier: usage?.subscription?.tier,
    usage,
  };
};
