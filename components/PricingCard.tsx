"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PricingTier, BillingPeriodType } from "@/lib/pricing";

interface PricingCardProps {
  tierKey: string;
  tier: PricingTier;
  billingPeriod: BillingPeriodType;
  onSubscribe: (priceId: string) => void;
  isLoading?: boolean;
}

export function PricingCard({
  tierKey,
  tier,
  billingPeriod,
  onSubscribe,
  isLoading = false,
}: PricingCardProps) {
  const pricing = tier[billingPeriod];

  return (
    <Card
      className={`relative p-8 border-2 transition-all hover:shadow-lg ${
        tier.recommended
          ? "border-[#0A2918] shadow-md"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {tier.recommended && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0A2918] text-white px-4 py-1">
          Recommended
        </Badge>
      )}

      <div className="text-center mb-6">
        <h3 className="font-poppins font-bold text-2xl text-[#0A2918] mb-2">
          {tier.name}
        </h3>
        <p className="font-inter text-sm text-gray-600">{tier.description}</p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-poppins font-bold text-5xl text-[#0A2918]">
            ${pricing.price}
          </span>
          <span className="font-inter text-gray-600">
            /{billingPeriod === "monthly" ? "mo" : "yr"}
          </span>
        </div>
        {billingPeriod === "yearly" && pricing.savings && (
          <p className="font-inter text-sm text-green-600 mt-2 font-medium">
            Save ${pricing.savings}/year
          </p>
        )}
      </div>

      <Button
        onClick={() => onSubscribe(pricing.priceId)}
        disabled={isLoading}
        className={`w-full mb-6 ${
          tier.recommended
            ? "bg-[#0A2918] hover:bg-[#0A2918]/90"
            : "bg-gray-900 hover:bg-gray-800"
        }`}
      >
        {isLoading ? "Loading..." : "Get Started"}
      </Button>

      <div className="space-y-3">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="font-inter text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
