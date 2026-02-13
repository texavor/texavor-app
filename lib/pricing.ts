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
  free: {
    name: "Free",
    description: "Try Texavor's AI power for free",
    monthly: {
      price: 0,
      priceId: "",
    },
    yearly: {
      price: 0,
      priceId: "",
    },
    features: [
      "350 AI Credits/month",
      "Keyword Research & Topic Gen",
      "Outline Generation",
      "Article Analysis",
      "Content Decay Analysis",
      "Unlimited Custom Authors",
      "2 Integrations",
      "Standard Support",
      "No Team Access",
      "No Competitor Analysis",
    ],
  },
  starter: {
    name: "Starter",
    description: "Perfect for individuals and new blogs",
    monthly: {
      price: 11,
      priceId: process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID!,
    },
    yearly: {
      price: 110,
      priceId: process.env.LEMONSQUEEZY_STARTER_YEARLY_VARIANT_ID!,
      savings: 22,
    },
    features: [
      "1,100 AI Credits/month",
      "Keyword Research & Topic Gen",
      "Outline Generation",
      "Article Analysis",
      "Content Decay Analysis",
      "Unlimited Custom Authors",
      "5 Integrations (WordPress, etc.)",
      "5 Competitors Tracked",
      "3 Keyword Discoveries/month",
      "Standard Support",
    ],
  },
  professional: {
    name: "Professional",
    description: "For growing content teams & agencies",
    monthly: {
      price: 29,
      priceId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!,
    },
    yearly: {
      price: 290,
      priceId: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID!,
      savings: 58,
    },
    features: [
      "2,900 AI Credits/month",
      "Keyword Research & Topic Gen",
      "Outline Generation",
      "Article Analysis",
      "Content Decay Analysis",
      "Unlimited Custom Authors",
      "Unlimited Integrations",
      "10 Team Members",
      "15 Competitors Tracked",
      "Unlimited Keyword Discovery",
      "Priority Support",
    ],
  },
  /* 
  business: {
    name: "Business",
    description: "High volume production & large teams",
    monthly: {
      price: 199,
      priceId: process.env.LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID!,
    },
    yearly: {
      price: 1990,
      priceId: process.env.LEMONSQUEEZY_BUSINESS_YEARLY_VARIANT_ID!,
      savings: 398,
    },
    features: [
      "20,000 AI Credits/month",
      "~200 Full Articles/month",
      "Unlimited Custom Authors",
      "Unlimited Integrations",
      "25 Team Members",
      "Unlimited Competitors",
      "Unlimited Keyword Discovery",
      "Dedicated Account Manager",
    ],
  },
  */
};

export type BillingPeriodType = "monthly" | "yearly";
export type PricingTierKey = keyof typeof PRICING_TIERS;
