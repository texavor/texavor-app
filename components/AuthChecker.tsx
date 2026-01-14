"use client";
import { useQuery } from "@tanstack/react-query";
import { useGetSubscription } from "@/app/(dashboard)/settings/hooks/useSubscriptionApi";
import { useRouter, usePathname } from "next/navigation";
import { axiosInstance, baseURL } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import axios from "axios";
import { useEffect } from "react";

interface AuthData {
  user: any;
  blogs: any[];
}

const AuthChecker = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    setUser,
    setBlogs,
    setMainLoading,
    setTeams,
    setCurrentTeam,
    currentTeam,
  } = useAppStore();

  const excluded = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/confirm-email",
    "/email-verified",
    "/google-callback",
    "/accept-invite",
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
  const { data: subscriptionData } = useGetSubscription(data?.blogs?.[0]?.id, {
    enabled: isSuccess && !!data, // Only fetch after auth check succeeds
  });

  // ✅ ADDED: Fetch Teams globally so RBAC works everywhere

  const { data: teamsData } = useQuery({
    queryKey: ["teams", data?.blogs?.[0]?.id],
    queryFn: async () => {
      const blogId = data?.blogs?.[0]?.id;
      if (!blogId) return [];
      const response = await axiosInstance.get(`/api/v1/blogs/${blogId}/teams`);
      return response.data; // Expecting array of teams
    },
    enabled: isSuccess && !!data?.blogs?.[0]?.id,
  });

  // ✅ ADDED: Fetch Team Members globally for RBAC
  const { data: membersData } = useQuery({
    queryKey: ["team-members-global", currentTeam?.id],
    queryFn: async () => {
      if (!currentTeam?.id)
        return { members: [], meta: { current_user_permissions: [] } };
      try {
        const response = await axiosInstance.get(
          `/api/v1/teams/${currentTeam.id}/members`
        );
        // Handle migration period where API might return array or object
        if (Array.isArray(response.data)) {
          return {
            members: response.data,
            meta: { current_user_permissions: [] },
          };
        }
        return response.data;
      } catch (error) {
        return { members: [], meta: { current_user_permissions: [] } };
      }
    },
    enabled: !!currentTeam?.id,
    // Keep it fresh but avoid constant refetches if not needed.
    // User asked for "call once the app loaded".
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync team members to store
  const { setTeamMembers } = useAppStore();
  useEffect(() => {
    if (membersData) {
      setTeamMembers(membersData.members);
      // We could also store permissions here if we add them to the store
    }
  }, [membersData, setTeamMembers]);

  // ✅ ADDED: Sync teams to store globally
  useEffect(() => {
    if (teamsData && teamsData.length > 0) {
      setTeams(teamsData);
      // Determine which team to select
      // If none selected, or selected one is not in the new list, pick the first one
      if (
        !currentTeam ||
        !teamsData.find((t: any) => t.id === currentTeam.id)
      ) {
        setCurrentTeam(teamsData[0]);
      }
    }
  }, [teamsData, currentTeam, setTeams, setCurrentTeam]);

  // ✅ ADDED: This useEffect handles the "onSuccess" logic (User & Blog)
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
      const processingBlog = data.blogs?.find(
        (ele: any) => ele?.status === "pending" || ele?.status === "processing"
      );

      if (processingBlog) {
        router.push(`/onboarding?blog=${processingBlog.id}`);
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
          (subscriptionTier === "trial" ||
            (subscriptionStatus !== "active" &&
              subscriptionStatus !== "on_trial"))
        ) {
          router.push("/pricing");
        }
      }
    }
  }, [isSuccess, data, subscriptionData, setUser, setBlogs, router, pathname]);

  // Handle logout on error
  useEffect(() => {
    if (isError) {
      const logout = async () => {
        await axios.post("/api/logout");
      };
      logout();
    }
  }, [isError]);

  // Loading state
  useEffect(() => {
    setMainLoading(isFetching);
  }, [isFetching, setMainLoading]);

  return null;
};

export default AuthChecker;
