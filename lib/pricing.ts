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
      priceId: "price_1SXzX9SucOCMoXUrWaXeeNYx", // TODO: Replace with actual Stripe price ID
    },
    yearly: {
      price: 249,
      priceId: "price_1SXzWRSucOCMoXUrPD12PB6W", // TODO: Replace with actual Stripe price ID
      savings: 99,
    },
    features: [
      "30 articles/month",
      "30 outlines/month",
      "60 topic ideas/month",
      "200 keyword queries/month",
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
      priceId: "price_1SXzY4SucOCMoXUrrMQLMe33", // TODO: Replace with actual Stripe price ID
    },
    yearly: {
      price: 749,
      priceId: "price_1SXzYhSucOCMoXUr8BIglE6e", // TODO: Replace with actual Stripe price ID
      savings: 199,
    },
    features: [
      "150 articles/month",
      "150 outlines/month",
      "300 topic ideas/month",
      "800 keyword queries/month",
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
      priceId: "price_1SXzZRSucOCMoXUrctu6icY8", // TODO: Replace with actual Stripe price ID
    },
    yearly: {
      price: 1399,
      priceId: "price_1SXzaESucOCMoXUrvrDsFkyA", // TODO: Replace with actual Stripe price ID
      savings: 389,
    },
    features: [
      "400 articles/month",
      "400 outlines/month",
      "800 topic ideas/month",
      "2,000 keyword queries/month",
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
