"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BouncingLogo from "@/components/BouncingLogo";

function AuthCallbackLoading() {
  return (
    <div className="mx-auto grid w-[450px] gap-6 p-10">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#0A2918]">Authenticating...</h1>
        <p className="text-balance text-[#7A7A7A]">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      document.cookie = `_texavor_session=${token}; path=/; secure; samesite=strict; max-age=2592000`;
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
}

const AuthCallbackPage = () => {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
};

export default AuthCallbackPage;
