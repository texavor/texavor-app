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
    // 🛑 REMOVED onSuccess and onError from here
  });

  // ✅ ADDED: This useEffect handles the "onSuccess" logic
  useEffect(() => {
    if (isSuccess && data) {
      setUser(data.user);
      setBlogs(data.blogs?.[0]);
      if (data.blogs?.length === 0) {
        router.push("/onboarding");
      } else if (
        data.blogs?.find(
          (ele: any) =>
            ele?.status === "pending" || ele?.status === "processing"
        )
      ) {
        router.push("/onboarding/processing");
      }
    }
  }, [isSuccess, data, setUser, setBlogs, router]);

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
