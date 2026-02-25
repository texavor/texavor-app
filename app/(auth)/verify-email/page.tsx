"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance, baseURL } from "@/lib/axiosInstace";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function VerifyEmailLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-6 w-full">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-10 grid gap-6 text-center sm:border sm:border-border sm:bg-card sm:rounded-xl shadow-none mx-auto">
        <div className="flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-poppins">
          Verifying Your Email
        </h1>
        <p className="text-muted-foreground font-inter text-sm md:text-base">
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
