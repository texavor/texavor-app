"use client";

import { SettingHeader } from "../components/SettingHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScoreMeter } from "@/components/ScoreMeter";
import {
  useGetSubscription,
  useCreateCustomerPortal,
} from "../hooks/useSubscriptionApi";
import { useGetUsage } from "../hooks/useUsageApi";
import { redirectToCustomerPortal } from "@/lib/stripe";
import { useRouter } from "next/navigation";
import { Calendar, CreditCard } from "lucide-react";

export default function SubscriptionPage() {
  const { data: subscription, isLoading: isSubLoading }: any =
    useGetSubscription();
  const { data: usageData, isLoading: isUsageLoading } = useGetUsage();
  const isLoading = isSubLoading || isUsageLoading;
  const { mutateAsync: createCustomerPortal, isPending: isPortalLoading } =
    useCreateCustomerPortal();
  const router = useRouter();

  const handleManageSubscription = async () => {
    await redirectToCustomerPortal(
      {
        returnUrl: window.location.href,
      },
      createCustomerPortal
    );
  };

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
      case "trial":
        return "bg-gray-100 text-gray-800";
      case "starter":
        return "bg-blue-100 text-blue-800";
      case "professional":
        return "bg-purple-100 text-purple-800";
      case "business":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toLocaleString();
  };

  const resourceLabels: Record<string, string> = {
    articles: "Articles",
    outlines: "Outlines",
    topics: "Topic Ideas",
    keyword_queries: "Keyword Queries",
    integrations: "Integrations",
    authors: "Authors",
    competitors: "Competitors",
  };

  return (
    <div>
      <SettingHeader
        title="Subscription"
        description="Manage your subscription and billing"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Left Column: Subscription Details & Alerts */}
        <div className="space-y-6">
          {/* Current Subscription */}
          <Card className="p-6 border-none shadow-sm">
            <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
              Current Subscription
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <Badge
                className={`${getTierColor(
                  subscription?.tier || "trial"
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

            {/* Subscription Details for Active Subscriptions */}
            {subscription?.subscription_details && (
              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span className="font-inter">
                    Renews on{" "}
                    {new Date(
                      subscription.subscription_details.current_period_end
                    ).toLocaleDateString()}
                  </span>
                  <span className="text-gray-500">
                    ({subscription.subscription_details.days_until_renewal}{" "}
                    days)
                  </span>
                </div>
                {subscription.subscription_details.cancel_at_period_end && (
                  <p className="text-sm text-orange-600 font-medium">
                    Your subscription will be canceled at the end of the current
                    period.
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {subscription?.status === "trial" ? (
                <Button
                  onClick={() => router.push("/pricing")}
                  className="bg-[#0A2918] hover:bg-[#0A2918]/90"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              ) : (
                <Button
                  onClick={handleManageSubscription}
                  disabled={isPortalLoading}
                  variant="outline"
                >
                  {isPortalLoading ? "Loading..." : "Manage Subscription"}
                </Button>
              )}
            </div>
          </Card>

          {/* Upgrade CTA for Trial Users */}
          {subscription?.tier === "trial" && (
            <Card className="p-6 border-2 border-[#0A2918] bg-gradient-to-br from-[#0A2918]/5 to-transparent shadow-sm">
              <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-2">
                Unlock More Features
              </h3>
              <p className="font-inter text-gray-600 mb-4">
                Upgrade to a paid plan to get more articles, outlines, and
                advanced features.
              </p>
              <Button
                onClick={() => router.push("/pricing")}
                className="bg-[#0A2918] hover:bg-[#0A2918]/90"
              >
                View Plans
              </Button>
            </Card>
          )}

          {/* Suggested Upgrade */}
          {subscription?.suggested_upgrade_tier &&
            subscription.tier !== "business" && (
              <Card className="p-6 border-2 border-orange-200 bg-orange-50/50 shadow-sm">
                <h3 className="font-poppins font-semibold text-lg text-orange-900 mb-2">
                  Consider Upgrading
                </h3>
                <p className="font-inter text-orange-800 mb-4">
                  You're using your plan heavily. Upgrade to{" "}
                  <span className="font-semibold capitalize">
                    {subscription.suggested_upgrade_tier}
                  </span>{" "}
                  for higher limits and more features.
                </p>
                <Button
                  onClick={() => router.push("/pricing")}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Upgrade to {subscription.suggested_upgrade_tier}
                </Button>
              </Card>
            )}
        </div>

        {/* Right Column: Usage Limits & All Time Stats */}
        <div className="space-y-6">
          {/* Usage This Month */}
          <Card className="p-6 border-none shadow-sm">
            <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
              Usage This Month
            </h3>
            <div className="space-y-6">
              {usageData?.current_month && (
                <>
                  {/* Articles */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-inter text-sm text-gray-700">
                        Articles
                      </span>
                      <span className="font-inter text-sm font-medium text-gray-900">
                        {usageData.current_month.articles_created} /{" "}
                        {formatLimit(usageData.current_month.articles_limit)}
                      </span>
                    </div>
                    {usageData.current_month.articles_limit !== -1 && (
                      <ScoreMeter
                        value={
                          usageData.current_month.articles_created /
                          usageData.current_month.articles_limit
                        }
                        inverse={true}
                      />
                    )}
                  </div>

                  {/* Outlines */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-inter text-sm text-gray-700">
                        Outlines
                      </span>
                      <span className="font-inter text-sm font-medium text-gray-900">
                        {usageData.current_month.outlines_created} /{" "}
                        {formatLimit(usageData.current_month.outlines_limit)}
                      </span>
                    </div>
                    {usageData.current_month.outlines_limit !== -1 && (
                      <ScoreMeter
                        value={
                          usageData.current_month.outlines_created /
                          usageData.current_month.outlines_limit
                        }
                        inverse={true}
                      />
                    )}
                  </div>

                  {/* Topics */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-inter text-sm text-gray-700">
                        Topic Ideas
                      </span>
                      <span className="font-inter text-sm font-medium text-gray-900">
                        {usageData.current_month.topics_generated} /{" "}
                        {formatLimit(usageData.current_month.topics_limit)}
                      </span>
                    </div>
                    {usageData.current_month.topics_limit !== -1 && (
                      <ScoreMeter
                        value={
                          usageData.current_month.topics_generated /
                          usageData.current_month.topics_limit
                        }
                        inverse={true}
                      />
                    )}
                  </div>

                  {/* Keyword Queries */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-inter text-sm text-gray-700">
                        Keyword Queries
                      </span>
                      <span className="font-inter text-sm font-medium text-gray-900">
                        {usageData.current_month.keyword_queries} /{" "}
                        {formatLimit(usageData.current_month.keyword_limit)}
                      </span>
                    </div>
                    {usageData.current_month.keyword_limit !== -1 && (
                      <ScoreMeter
                        value={
                          usageData.current_month.keyword_queries /
                          usageData.current_month.keyword_limit
                        }
                        inverse={true}
                      />
                    )}
                  </div>

                  {/* Integrations */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-inter text-sm text-gray-700">
                        Integrations
                      </span>
                      <span className="font-inter text-sm font-medium text-gray-900">
                        {usageData.current_month.integrations_used} /{" "}
                        {formatLimit(
                          usageData.current_month.integrations_limit
                        )}
                      </span>
                    </div>
                    {usageData.current_month.integrations_limit !== -1 && (
                      <ScoreMeter
                        value={
                          usageData.current_month.integrations_used /
                          usageData.current_month.integrations_limit
                        }
                        inverse={true}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* All Time Stats */}
          <Card className="p-6 border-none shadow-sm">
            <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
              All Time Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#0A2918] font-poppins">
                  {usageData?.all_time.total_articles.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 font-inter mt-1">
                  Total Articles
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#0A2918] font-poppins">
                  {usageData?.all_time.total_words.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 font-inter mt-1">
                  Total Words
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#0A2918] font-poppins">
                  {usageData?.all_time.total_outlines.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 font-inter mt-1">
                  Total Outlines
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
