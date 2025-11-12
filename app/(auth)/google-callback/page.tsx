"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("auth_token");
    const user = searchParams.get("user");

    if (token && user) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", decodeURIComponent(user));
      toast.success("Logged in successfully.");
      router.push("/dashboard");
    } else {
      toast.error("Google authentication failed.");
      router.push("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="mx-auto grid w-[450px] gap-6 p-10 md:rounded-tl-lg md:rounded-bl-lg  bg-[#EEDED3]">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
          Authenticating with Google...
        </h1>
        <p className="text-balance text-[#7A7A7A] font-inter">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
}
