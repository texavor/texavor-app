"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { axiosInstance, baseURL } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";

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

  useEffect(() => {
    const run = async () => {
      // Skip excluded routes
      if (excluded.some((p) => pathname.startsWith(p))) return;

      try {
        setMainLoading(true);
        const res = await axiosInstance.get(`${baseURL}/me`);
        setUser(res?.data?.user);
        setBlogs(res?.data?.blogs?.[0]);
        setMainLoading(false);
        if (res?.data?.blogs?.length === 0) {
          router.push("/onboarding");
        } else if (
          res?.data?.blogs?.find(
            (ele: any) =>
              ele?.status === "pending" || ele?.status === "processing"
          )
        ) {
          router.push("/onboarding/processing");
        }
      } catch {
        router.replace("/login");
      }
    };
    run();
  }, [pathname]);

  return null;
};

export default AuthChecker;
