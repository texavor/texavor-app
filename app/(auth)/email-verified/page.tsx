"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { axiosInstance } from "@/lib/axiosInstace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type VerifyEmailForm = {
  email: string;
};

export default function VerifyEmailPage() {
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
    <div className="flex items-center justify-center bg-[#EEDED3] p-6">
      <div className="w-[450px] rounded-lg p-10 grid gap-6 text-center">
        {success ? (
          <>
            <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
              Email Verified!
            </h1>
            <p className="text-[#7A7A7A] font-inter">
              Your email has been successfully verified. You can now log in to
              your account.
            </p>
            <Button
              asChild
              className="w-full bg-[#104127] text-white hover:bg-[#104127]"
            >
              <Link href="/login">Login Now</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
              {errors === "Email was already confirmed, please try signing in"
                ? "Email Already Confirmed"
                : "Verification Failed"}
            </h1>
            <p className="text-[#7A7A7A] font-inter">{errors}</p>

            {errors === "Email was already confirmed, please try signing in" ? (
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-[#104127] text-white hover:bg-[#104127]"
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
                      className="bg-white text-black font-inter"
                    />
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[#104127] text-white hover:bg-[#104127]"
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
