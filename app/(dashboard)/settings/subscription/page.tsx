"use client";

import { SettingHeader } from "../components/SettingHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useGetSubscription } from "../hooks/useSubscriptionApi";

export default function SubscriptionPage() {
  const { data: subscription, isLoading } = useGetSubscription();

  if (isLoading) {
    return (
      <div>
        <SettingHeader
          title="Subscription"
          description="Manage your subscription and billing"
        />
        <div className="space-y-6 max-w-3xl">
          <Card className="p-6 border-none">
            <Skeleton className="h-8 w-48 bg-[#f9f4f0] mb-4" />
            <Skeleton className="h-20 w-full bg-[#f9f4f0]" />
          </Card>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-gray-100 text-gray-800";
      case "pro":
        return "bg-blue-100 text-blue-800";
      case "enterprise":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    return "bg-green-500";
  };

  const calculatePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div>
      <SettingHeader
        title="Subscription"
        description="Manage your subscription and billing"
      />

      <div className="space-y-6 max-w-3xl">
        {/* Current Subscription */}
        <Card className="p-6 border-none">
          <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
            Current Subscription
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <Badge
              className={`${getTierColor(
                subscription?.tier || "free"
              )} text-lg px-4 py-2 capitalize`}
            >
              {subscription?.tier} Plan
            </Badge>
            <Badge
              variant={
                subscription?.status === "active" ? "default" : "secondary"
              }
              className="capitalize"
            >
              {subscription?.status}
            </Badge>
          </div>
          {subscription?.trial_ends_at && (
            <p className="text-sm text-gray-600 font-inter">
              Trial ends on{" "}
              {new Date(subscription.trial_ends_at).toLocaleDateString()}
            </p>
          )}
        </Card>

        {/* Usage Limits */}
        <Card className="p-6 border-none">
          <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
            Usage Limits
          </h3>
          <div className="space-y-6">
            {/* Articles */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-inter text-sm text-gray-700">
                  Articles Created
                </span>
                <span className="font-inter text-sm font-medium text-gray-900">
                  {subscription?.usage.articles_created || 0}{" "}
                  {subscription?.usage.articles_limit === -1
                    ? "/ Unlimited"
                    : `/ ${subscription?.usage.articles_limit || 0}`}
                </span>
              </div>
              {subscription?.usage.articles_limit !== -1 && (
                <Progress
                  value={calculatePercentage(
                    subscription?.usage.articles_created || 0,
                    subscription?.usage.articles_limit || 1
                  )}
                  className="h-2"
                />
              )}
            </div>

            {/* API Calls */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-inter text-sm text-gray-700">
                  API Calls This Month
                </span>
                <span className="font-inter text-sm font-medium text-gray-900">
                  {subscription?.usage.api_calls_this_month?.toLocaleString() ||
                    0}{" "}
                  {subscription?.usage.api_calls_limit === -1
                    ? "/ Unlimited"
                    : `/ ${
                        subscription?.usage.api_calls_limit?.toLocaleString() ||
                        0
                      }`}
                </span>
              </div>
              {subscription?.usage.api_calls_limit !== -1 && (
                <Progress
                  value={calculatePercentage(
                    subscription?.usage.api_calls_this_month || 0,
                    subscription?.usage.api_calls_limit || 1
                  )}
                  className="h-2"
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
