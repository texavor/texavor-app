import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstace";

export const useSubscription = () => {
  const [loading, setLoading] = useState(false);

  const subscribe = async (
    plan: "starter" | "professional" | "business",
    interval: "monthly" | "yearly"
  ) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/api/v1/checkout", {
        plan,
        interval,
        redirect_url: `${window.location.origin}/subscription/success`,
      });
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error("Checkout failed", error);
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/api/v1/checkout/portal");
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch (error) {
      console.error("Portal failed", error);
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, manageSubscription, loading };
};
