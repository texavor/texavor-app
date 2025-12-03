// Stripe utility functions for checkout and customer portal

import { toast } from "sonner";

export interface CheckoutSessionParams {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CustomerPortalParams {
  returnUrl?: string;
}

/**
 * Redirect to Stripe checkout with the given price ID
 */
export const redirectToCheckout = async (
  params: CheckoutSessionParams,
  createCheckoutSession: (data: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }) => Promise<{ checkout_url: string; session_id: string }>
) => {
  try {
    const successUrl =
      params.successUrl ||
      `${window.location.origin}/dashboard/subscription?success=true`;
    const cancelUrl =
      params.cancelUrl || `${window.location.origin}/pricing?canceled=true`;

    const data = await createCheckoutSession({
      priceId: params.priceId,
      successUrl,
      cancelUrl,
    });

    if (data?.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      toast.error("Failed to create checkout session");
    }
  } catch (error: any) {
    console.error("Checkout error:", error);
    toast.error(error?.response?.data?.error || "Failed to start checkout");
  }
};

/**
 * Redirect to Stripe customer portal
 */
export const redirectToCustomerPortal = async (
  params: CustomerPortalParams,
  createCustomerPortal: (data: {
    returnUrl: string;
  }) => Promise<{ portal_url: string }>
) => {
  try {
    const returnUrl =
      params.returnUrl || `${window.location.origin}/dashboard/subscription`;

    const data = await createCustomerPortal({ returnUrl });

    if (data?.portal_url) {
      window.location.href = data.portal_url;
    } else {
      toast.error("Failed to open customer portal");
    }
  } catch (error: any) {
    console.error("Customer portal error:", error);
    toast.error(
      error?.response?.data?.error || "Failed to open customer portal"
    );
  }
};
