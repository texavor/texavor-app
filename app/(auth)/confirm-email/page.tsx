"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ConfirmEmailPage() {
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
    <div className="mx-auto grid w-[450px] gap-6 p-10 md:rounded-tl-lg md:rounded-bl-lg  bg-[#EEDED3]">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
          Confirm Your Email
        </h1>
        <p className="text-balance text-[#7A7A7A] font-inter">
          We've sent a confirmation email to your address. Please check your
          inbox and click the link to complete your registration.
        </p>
      </div>
      <div className="grid gap-4">
        <p className="text-center text-sm text-[#7A7A7A] font-inter">
          Didn't receive the email? Check your spam folder or request a new one.
        </p>
        <Button
          type="submit"
          className="w-full bg-[#104127] text-white hover:bg-[#104127]"
          onClick={() => mutation.mutate()}
        >
          Resend Confirmation Email
        </Button>
      </div>
      <div className="mt-4 text-center text-sm">
        <Link
          href="/login"
          className="underline text-[#271041] font-medium font-inter"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
