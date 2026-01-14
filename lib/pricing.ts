// Stripe Pricing Configuration
// This file contains all pricing tiers, features, and Stripe price IDs

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface BillingPeriod {
  price: number;
  priceId: string;
  savings?: number;
}

export interface PricingTier {
  name: string;
  description: string;
  recommended?: boolean;
  monthly: BillingPeriod;
  yearly: BillingPeriod;
  features: string[];
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  starter: {
    name: "Starter",
    description: "Perfect for individuals and small blogs",
    monthly: {
      price: 29,
      priceId: process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID!,
    },
    yearly: {
      price: 249,
      priceId: process.env.LEMONSQUEEZY_STARTER_YEARLY_VARIANT_ID!,
      savings: 99,
    },
    features: [
      "30 articles/month",
      "30 outlines/month",
      "60 topic ideas/month",
      "200 keyword queries/month",
      "30 AI images/month",
      "30 AI thumbnails/month",
      "2 team members",
      "2 integrations",
      "3 authors",
      "5 competitors",
      "Email support (48h)",
    ],
  },
  professional: {
    name: "Professional",
    description: "For growing content teams",
    recommended: true,
    monthly: {
      price: 79,
      priceId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!,
    },
    yearly: {
      price: 749,
      priceId: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID!,
      savings: 199,
    },
    features: [
      "150 articles/month",
      "150 outlines/month",
      "300 topic ideas/month",
      "800 keyword queries/month",
      "150 AI images/month",
      "150 AI thumbnails/month",
      "5 team members",
      "Unlimited integrations",
      "10 authors",
      "15 competitors",
      "Priority support (24h)",
      "Full API access",
    ],
  },
  business: {
    name: "Business",
    description: "For large teams and agencies",
    monthly: {
      price: 149,
      priceId: process.env.LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID!,
    },
    yearly: {
      price: 1399,
      priceId: process.env.LEMONSQUEEZY_BUSINESS_YEARLY_VARIANT_ID!,
      savings: 389,
    },
    features: [
      "400 articles/month",
      "400 outlines/month",
      "800 topic ideas/month",
      "2,000 keyword queries/month",
      "400 AI images/month",
      "400 AI thumbnails/month",
      "10 team members",
      "Unlimited integrations",
      "Unlimited authors",
      "Unlimited competitors",
      "Priority support (12h)",
      "Advanced API access",
      "Custom integrations",
    ],
  },
};

export type BillingPeriodType = "monthly" | "yearly";
export type PricingTierKey = keyof typeof PRICING_TIERS;
