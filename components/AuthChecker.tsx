"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { axiosInstance, baseURL } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import axios from "axios";
import { useEffect } from "react";

interface AuthData {
  user: any;
  blogs: any[];
}

interface SubscriptionData {
  tier: "trial" | "starter" | "professional" | "business";
  status: "active" | "inactive" | "trial" | "canceled";
}

const AuthChecker = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setBlogs, setMainLoading } = useAppStore();

  const excluded = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/confirm-email",
    "/email-verified",
    "/google-callback",
  ];

  const isExcludedPath = excluded.some((p) => pathname.startsWith(p));

  const { isFetching, data, isSuccess, isError } = useQuery<AuthData>({
    queryKey: ["auth-check"],
    queryFn: async () => {
      const res = await axiosInstance.get<AuthData>(`${baseURL}/me`);
      return res.data;
    },
    enabled: !isExcludedPath,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch subscription data separately
  const { data: subscriptionData } = useQuery<SubscriptionData>({
    queryKey: ["subscription-check"],
    queryFn: async () => {
      const res = await axiosInstance.get<SubscriptionData>(
        `${baseURL}/api/v1/subscription`
      );
      return res.data;
    },
    enabled: isSuccess && !!data, // Only fetch after auth check succeeds
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // ✅ ADDED: This useEffect handles the "onSuccess" logic
  useEffect(() => {
    if (isSuccess && data) {
      setUser(data.user);
      setBlogs(data.blogs?.[0]);

      // Check if user has blogs first
      if (data.blogs?.length === 0) {
        router.push("/onboarding");
        return;
      }

      // Check if blog is still processing
      if (
        data.blogs?.find(
          (ele: any) =>
            ele?.status === "pending" || ele?.status === "processing"
        )
      ) {
        router.push("/onboarding/processing");
        return;
      }

      // Check subscription status - redirect to pricing if no active plan
      if (subscriptionData) {
        const subscriptionTier = subscriptionData.tier;
        const subscriptionStatus = subscriptionData.status;

        // Don't redirect if already on pricing, onboarding, or subscription pages
        const isPricingPage = pathname.startsWith("/pricing");
        const isOnboardingPage = pathname.startsWith("/onboarding");
        const isSubscriptionPage = pathname.startsWith("/subscription");

        // Redirect to pricing if user is on trial or doesn't have an active subscription
        if (
          !isPricingPage &&
          !isOnboardingPage &&
          !isSubscriptionPage &&
          (subscriptionTier === "trial" || subscriptionStatus !== "active")
        ) {
          router.push("/pricing");
        }
      }
    }
  }, [isSuccess, data, subscriptionData, setUser, setBlogs, router, pathname]);

  // ✅ ADDED: This useEffect handles the "onError" logic
  useEffect(() => {
    if (isError) {
      const logout = async () => {
        await axios.post("/api/logout");
      };
      logout();
    }
  }, [isError]);

  // This effect remains the same
  useEffect(() => {
    setMainLoading(isFetching);
  }, [isFetching, setMainLoading]);

  return null;
};

export default AuthChecker;
