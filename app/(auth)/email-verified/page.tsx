"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { axiosInstance } from "@/lib/axiosInstace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

type VerifyEmailForm = {
  email: string;
};

function VerifyEmailLoading() {
  return (
    <div className="flex flex-col items-center justify-center w-full p-6">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-10 grid gap-6 text-center sm:border sm:border-border sm:bg-card sm:rounded-xl shadow-none mx-auto">
        <div className="flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground font-inter text-sm md:text-base">
          Verifying...
        </p>
      </div>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get("success") === "true";
  const errors = searchParams.get("errors");

  // --- API request ---
  async function resendVerification(data: VerifyEmailForm) {
    try {
      const res = await axiosInstance.post("/api/v1/confirmation", {
        user: { email: data.email },
      });
      if (res?.data?.status?.code === 200) {
        toast.success(res?.data?.status?.message);
      } else {
        toast.error("Unable to send verification email. Try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while resending verification email.");
    }
  }

  const mutation = useMutation({ mutationFn: resendVerification });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center w-full p-6">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-10 grid gap-6 text-center sm:border sm:border-border sm:bg-card sm:rounded-xl shadow-none mx-auto">
        {success ? (
          <>
            <h1 className="text-3xl font-bold text-foreground font-poppins">
              Email Verified!
            </h1>
            <p className="text-muted-foreground font-inter text-sm md:text-base">
              Your email has been successfully verified. You can now log in to
              your account.
            </p>
            <Button
              asChild
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-poppins"
            >
              <Link href="/login">Login Now</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground font-poppins">
              {errors === "Email was already confirmed, please try signing in"
                ? "Email Already Confirmed"
                : "Verification Failed"}
            </h1>
            <p className="text-muted-foreground font-inter text-sm md:text-base">
              {errors}
            </p>

            {errors === "Email was already confirmed, please try signing in" ? (
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-poppins"
              >
                Go to Login
              </Button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="grid gap-4"
              >
                <form.Field
                  name="email"
                  children={(field) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="bg-background text-foreground font-inter"
                    />
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-poppins"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? "Sending..."
                    : "Re-request Verification Email"}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
