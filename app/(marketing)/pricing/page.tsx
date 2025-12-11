"use client";

import { useState } from "react";
import { PRICING_TIERS, BillingPeriodType } from "@/lib/pricing";
import { useCreateCheckoutSession } from "@/app/(dashboard)/settings/hooks/useSubscriptionApi";
import { redirectToCheckout } from "@/lib/stripe";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] =
    useState<BillingPeriodType>("yearly");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();

  const handleSubscribe = async (priceId: string, tierKey: string) => {
    setLoadingTier(tierKey);
    try {
      await redirectToCheckout(
        {
          priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/failure`,
        },
        createCheckoutSession
      );
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f4f0] py-20 px-4">
      <div className="max-w-6xl mx-auto">
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
                billingPeriod === "monthly" ? "yearly" : "monthly"
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
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col">
            <h3 className="font-poppins font-semibold text-2xl text-[#0A2918] mb-2">
              {PRICING_TIERS.starter.name}
            </h3>
            <p className="font-inter text-sm text-gray-600 mb-6">
              {PRICING_TIERS.starter.description}
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-bold text-4xl text-[#0A2918]">
                  ${PRICING_TIERS.starter[billingPeriod].price}
                </span>
              </div>
              {billingPeriod === "yearly" &&
                PRICING_TIERS.starter.yearly.savings && (
                  <p className="font-inter text-sm text-green-600 mt-1 font-medium">
                    Save ${PRICING_TIERS.starter.yearly.savings}/year
                  </p>
                )}
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {PRICING_TIERS.starter.features.map((feature, i) => (
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
              onClick={() =>
                handleSubscribe(
                  PRICING_TIERS.starter[billingPeriod].priceId,
                  "starter"
                )
              }
              disabled={loadingTier === "starter"}
              className="w-full bg-[#0A2918] hover:bg-[#0A2918]/90"
            >
              {loadingTier === "starter" ? "Loading..." : "Get Started"}
            </Button>
          </div>

          {/* Professional Plan (Recommended) */}
          <div className="bg-[#0A2918] text-white rounded-2xl p-8 shadow-lg flex flex-col relative">
            {/* Recommended Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-medium">
              Recommended
            </div>

            <h3 className="font-poppins font-semibold text-2xl mb-2">
              {PRICING_TIERS.professional.name}
            </h3>
            <p className="font-inter text-sm text-white/80 mb-6">
              {PRICING_TIERS.professional.description}
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-bold text-4xl">
                  ${PRICING_TIERS.professional[billingPeriod].price}
                </span>
              </div>
              {billingPeriod === "yearly" &&
                PRICING_TIERS.professional.yearly.savings && (
                  <p className="font-inter text-sm text-green-400 mt-1 font-medium">
                    Save ${PRICING_TIERS.professional.yearly.savings}/year
                  </p>
                )}
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {PRICING_TIERS.professional.features.map((feature, i) => (
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
              onClick={() =>
                handleSubscribe(
                  PRICING_TIERS.professional[billingPeriod].priceId,
                  "professional"
                )
              }
              disabled={loadingTier === "professional"}
              variant="secondary"
              className="w-full bg-white text-[#0A2918] hover:bg-white/90"
            >
              {loadingTier === "professional" ? "Loading..." : "Get Started"}
            </Button>
          </div>

          {/* Business Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col">
            <h3 className="font-poppins font-semibold text-2xl text-[#0A2918] mb-2">
              {PRICING_TIERS.business.name}
            </h3>
            <p className="font-inter text-sm text-gray-600 mb-6">
              {PRICING_TIERS.business.description}
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-bold text-4xl text-[#0A2918]">
                  ${PRICING_TIERS.business[billingPeriod].price}
                </span>
              </div>
              {billingPeriod === "yearly" &&
                PRICING_TIERS.business.yearly.savings && (
                  <p className="font-inter text-sm text-green-600 mt-1 font-medium">
                    Save ${PRICING_TIERS.business.yearly.savings}/year
                  </p>
                )}
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {PRICING_TIERS.business.features.map((feature, i) => (
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
              onClick={() =>
                handleSubscribe(
                  PRICING_TIERS.business[billingPeriod].priceId,
                  "business"
                )
              }
              disabled={loadingTier === "business"}
              className="w-full bg-[#0A2918] hover:bg-[#0A2918]/90"
            >
              {loadingTier === "business" ? "Loading..." : "Get Started"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="font-inter text-gray-600">
            All plans include a 7-day free trial. No credit card required.
          </p>
          <p className="font-inter text-sm text-gray-500 mt-2">
            Need a custom plan?{" "}
            <a
              href="/contact"
              className="text-[#0A2918] hover:underline font-medium"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
