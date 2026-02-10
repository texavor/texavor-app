"use client";

import { useState } from "react";
import { PRICING_TIERS, BillingPeriodType } from "@/lib/pricing";
import { Check, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function PricingClientPage() {
  const [billingPeriod, setBillingPeriod] =
    useState<BillingPeriodType>("yearly");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { subscribe, manageSubscription, loading } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(
        "/api/logout",
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      toast.success("Logout Successful!");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("access_expires_at");
      localStorage.removeItem("user");

      // Manually clear the cookie to prevent middleware loop
      document.cookie =
        "_texavor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      window.location.href = "/login";
    }
  };

  const handleSubscribe = async (tierKey: string) => {
    setLoadingTier(tierKey);
    try {
      // tierKey is 'starter', 'professional', or 'business'
      // billingPeriod is 'monthly' or 'yearly'
      await subscribe(
        tierKey as "starter" | "professional" | "business",
        billingPeriod,
      );
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f4f0] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Logout Button Moved to Footer */}

        {/* Payment Failure Banner */}
        {reason === "payment_failed" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
              <div className="text-left">
                <h3 className="text-red-800 font-semibold font-poppins text-lg">
                  Payment Failed
                </h3>
                <p className="text-red-700 text-sm font-inter">
                  Your last subscription payment failed. Please update your
                  payment method to continue using Texavor without interruption.
                </p>
              </div>
            </div>
            <Button
              onClick={manageSubscription}
              disabled={loading}
              variant="destructive"
              className="whitespace-nowrap bg-red-600 hover:bg-red-700"
            >
              {loading ? "Loading..." : "Update Payment Method"}
            </Button>
          </div>
        )}

        {/* Trial Ended Banner */}
        {reason === "trial_ended" && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
              <div className="text-left">
                <h3 className="text-amber-800 font-semibold font-poppins text-lg">
                  Trial Ended
                </h3>
                <p className="text-amber-800 text-sm font-inter">
                  Your free trial has ended. Choose a plan below to keep
                  creating amazing content.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-poppins font-bold text-5xl text-[#0A2918] mb-3">
            Pricing to Suit All
          </h1>
          <p className="font-inter text-lg text-gray-600">
            Choose the plan that fits your content creation needs
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center items-center gap-3 mb-12">
          <span
            className={`font-inter text-sm ${
              billingPeriod === "monthly"
                ? "text-gray-900 font-medium"
                : "text-gray-500"
            }`}
          >
            Billed Monthly
          </span>
          <button
            onClick={() =>
              setBillingPeriod(
                billingPeriod === "monthly" ? "yearly" : "monthly",
              )
            }
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              billingPeriod === "yearly" ? "bg-[#0A2918]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                billingPeriod === "yearly" ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`font-inter text-sm ${
              billingPeriod === "yearly"
                ? "text-gray-900 font-medium"
                : "text-gray-500"
            }`}
          >
            Billed Yearly
          </span>
        </div>

        {/* Pricing Cards Grid - All 3 Tiers */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-xs border border-gray-200 flex flex-col">
            <h3 className="font-poppins font-semibold text-2xl text-[#0A2918] mb-2">
              {PRICING_TIERS.free.name}
            </h3>
            <p className="font-inter text-sm text-gray-600 mb-6">
              {PRICING_TIERS.free.description}
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-bold text-4xl text-[#0A2918]">
                  $0
                </span>
              </div>
              <p className="font-inter text-sm text-gray-500 mt-1 font-medium">
                Forever free
              </p>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {PRICING_TIERS.free.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-gray-500" strokeWidth={3} />
                  </div>
                  <span className="font-inter text-sm text-gray-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full border-[#0A2918] text-[#0A2918] hover:bg-[#0A2918]/5"
            >
              Get Started
            </Button>
          </div>

          {/* Starter Plan (Recommended) */}
          <div className="bg-[#0A2918] text-white rounded-2xl p-8 shadow-lg flex flex-col relative transform md:-translate-y-4 md:h-[calc(100%+2rem)]">
            {/* Recommended Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-medium border-2 border-[#0A2918]">
              Recommended
            </div>

            <h3 className="font-poppins font-semibold text-2xl mb-2">
              {PRICING_TIERS.starter.name}
            </h3>
            <p className="font-inter text-sm text-white/80 mb-6">
              {PRICING_TIERS.starter.description}
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-bold text-4xl">
                  ${PRICING_TIERS.starter[billingPeriod].price}
                </span>
              </div>
              {billingPeriod === "yearly" &&
                PRICING_TIERS.starter.yearly.savings && (
                  <p className="font-inter text-sm text-green-400 mt-1 font-medium">
                    Save ${PRICING_TIERS.starter.yearly.savings}/year
                  </p>
                )}
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {PRICING_TIERS.starter.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-inter text-sm text-white/90">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleSubscribe("starter")}
              disabled={loadingTier === "starter"}
              variant="secondary"
              className="w-full bg-white text-[#0A2918] hover:bg-white/90"
            >
              {loadingTier === "starter" ? "Loading..." : "Get Started"}
            </Button>
          </div>

          {/* Professional Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-xs border border-gray-200 flex flex-col">
            <h3 className="font-poppins font-semibold text-2xl text-[#0A2918] mb-2">
              {PRICING_TIERS.professional.name}
            </h3>
            <p className="font-inter text-sm text-gray-600 mb-6">
              {PRICING_TIERS.professional.description}
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-bold text-4xl text-[#0A2918]">
                  ${PRICING_TIERS.professional[billingPeriod].price}
                </span>
              </div>
              {billingPeriod === "yearly" &&
                PRICING_TIERS.professional.yearly.savings && (
                  <p className="font-inter text-sm text-green-600 mt-1 font-medium">
                    Save ${PRICING_TIERS.professional.yearly.savings}/year
                  </p>
                )}
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {PRICING_TIERS.professional.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#0A2918] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#0A2918]" strokeWidth={3} />
                  </div>
                  <span className="font-inter text-sm text-gray-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleSubscribe("professional")}
              disabled={loadingTier === "professional"}
              className="w-full bg-[#0A2918] hover:bg-[#0A2918]/90"
            >
              {loadingTier === "professional" ? "Loading..." : "Get Started"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="font-inter text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="font-inter text-sm text-gray-500 mt-2">
            Need a custom plan?{" "}
            <a
              href="mailto:hello@texavor.com"
              className="text-[#0A2918] hover:underline font-medium"
            >
              Contact us
            </a>
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-500 text-white hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-inter text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
