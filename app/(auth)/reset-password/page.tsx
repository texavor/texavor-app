"use client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState, Suspense } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type MyForm = {
  password: string;
  password_confirmation: string;
};

function ResetPasswordLoading() {
  return (
    <div className="mx-auto grid w-[450px] gap-6 p-10">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
          Loading...
        </h1>
        <p className="text-balance text-[#7A7A7A] font-inter">Please wait...</p>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("reset_password_token");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  async function postData(data: MyForm) {
    try {
      await axiosInstance.patch("/api/v1/password", {
        user: {
          ...data,
          token,
        },
      });
      toast.success("Password has been reset successfully.");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
    }
  }

  const mutation = useMutation({ mutationFn: postData });

  const form = useForm({
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.password_confirmation) {
        toast.error("Passwords do not match.");
        return;
      }
      mutation.mutate(value);
    },
  });

  return (
    <div className="mx-auto grid w-[450px] gap-6 p-10">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
          Reset Password
        </h1>
        <p className="text-balance text-[#7A7A7A] font-inter">
          Enter your new password below.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="grid gap-4"
      >
        <form.Field
          name="password"
          children={(field) => (
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                required
                className="bg-white text-black pr-10 font-inter"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff
                    className="h-4 w-4 text-gray-500"
                    aria-hidden="true"
                  />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" aria-hidden="true" />
                )}
              </Button>
            </div>
          )}
        />
        <form.Field
          name="password_confirmation"
          children={(field) => (
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type={showPasswordConfirmation ? "text" : "password"}
                placeholder="Confirm New Password"
                required
                className="bg-white text-black pr-10 font-inter"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswordConfirmation((prev) => !prev)}
              >
                {showPasswordConfirmation ? (
                  <EyeOff
                    className="h-4 w-4 text-gray-500"
                    aria-hidden="true"
                  />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" aria-hidden="true" />
                )}
              </Button>
            </div>
          )}
        />
        <div className="mt-3 text-right text-sm text-[#7A7A7A]">
          <Link
            href="/login"
            className="underline text-[#271041] font-medium font-inter"
          >
            Back to Login
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full bg-[#104127] text-white hover:bg-[#104127]"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
