"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance, baseURL } from "@/lib/axiosInstace";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function VerifyEmailLoading() {
  return (
    <div className="flex items-center justify-center bg-[#EEDED3] p-6">
      <div className="w-[450px] rounded-lg p-10 grid gap-6 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#104127]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A2918] font-poppins">
          Verifying Your Email
        </h1>
        <p className="text-[#7A7A7A] font-inter">
          Please wait while we confirm your email address...
        </p>
      </div>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("confirmation_token");

    if (!token) {
      router.push(
        "/email-verified?success=false&errors=Missing confirmation token.",
      );
      return;
    }

    const backendUrl = `${baseURL}/api/v1/confirmation?confirmation_token=${token}`;

    // According to backend flow:
    // 1. Frontend redirects browser to Backend API
    // 2. Backend verifies and redirects browser back to Frontend /email-verified?...
    window.location.href = backendUrl;
  }, [searchParams, router]);

  return <VerifyEmailLoading />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
