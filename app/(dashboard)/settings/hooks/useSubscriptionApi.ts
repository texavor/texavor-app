import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { Subscription } from "../types";

// Get subscription information
export const useGetSubscription = (blogId?: string, options = {}) => {
  return useQuery<Subscription>({
    queryKey: ["subscription", blogId],
    queryFn: async () => {
      const url = blogId
        ? `/api/v1/blogs/${blogId}/subscription`
        : "/api/v1/subscription";
      const response = await axiosInstance.get<Subscription>(url);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Create Stripe checkout session
export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async ({
      priceId,
      successUrl,
      cancelUrl,
    }: {
      priceId: string;
      successUrl: string;
      cancelUrl: string;
    }) => {
      const response = await axiosInstance.post(
        "/api/v1/stripe/checkout_sessions",
        {
          price_id: priceId,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }
      );
      return response.data;
    },
  });
};

// Create Stripe customer portal session
export const useCreateCustomerPortal = () => {
  return useMutation({
    mutationFn: async ({ returnUrl }: { returnUrl: string }) => {
      const response = await axiosInstance.post(
        "/api/v1/stripe/customer_portal",
        {
          return_url: returnUrl,
        }
      );
      return response.data;
    },
  });
};
