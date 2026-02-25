"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function ConfirmEmailLoading() {
  return (
    <div className="mx-auto grid w-full max-w-sm sm:max-w-md gap-6 p-6 sm:p-10 sm:border sm:border-border sm:bg-card sm:rounded-xl shadow-none self-center mt-10 md:mt-0">
      <div className="grid gap-2 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <p className="text-balance text-muted-foreground font-inter text-sm md:text-base">
          Loading...
        </p>
      </div>
    </div>
  );
}

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  async function resendConfirmationEmail() {
    // Add your API endpoint here
    try {
      const res = await axiosInstance.post("/api/v1/confirmation", {
        user: {
          email: email,
        },
      });
      if (res?.data?.status?.code === 200) {
        toast.success(res?.data?.status?.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const mutation = useMutation({ mutationFn: resendConfirmationEmail });

  return (
    <div className="mx-auto grid w-full max-w-sm sm:max-w-md gap-6 p-6 sm:p-10 sm:border sm:border-border sm:bg-card sm:rounded-xl shadow-none self-center mt-10 md:mt-0">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold text-foreground font-poppins">
          Confirm Your Email
        </h1>
        <p className="text-balance text-muted-foreground font-inter text-sm md:text-base">
          We've sent a confirmation email to your address. Please check your
          inbox and click the link to complete your registration.
        </p>
      </div>
      <div className="grid gap-4">
        <p className="text-center text-sm text-muted-foreground font-inter">
          Didn't receive the email? Check your spam folder or request a new one.
        </p>
        <Button
          type="button"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-poppins"
          onClick={() => mutation.mutate()}
        >
          Resend Confirmation Email
        </Button>
      </div>
      <div className="mt-4 text-center text-sm">
        <Link
          href="/login"
          className="underline text-primary font-medium font-inter"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<ConfirmEmailLoading />}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
