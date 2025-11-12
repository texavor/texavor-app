"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BouncingLogo from "@/components/BouncingLogo";

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="mx-auto grid w-[450px] gap-6 p-10">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#0A2918]">
          Authenticating with Google...
        </h1>
        <p className="text-balance text-[#7A7A7A]">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
