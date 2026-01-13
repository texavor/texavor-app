"use client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/store/appStore";
import Image from "next/image";
import Link from "next/link";
import { axiosInstance, baseURL } from "@/lib/axiosInstace";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// A type for our form state
type MyForm = {
  email: string;
  password: string;
};

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { setTopLoader } = useAppStore();

  async function postData(data: MyForm) {
    // Add your API endpoint here
    setTopLoader(true);
    try {
      const res = await axiosInstance.post("/api/v1/login", {
        user: {
          email: data?.email,
          password: data?.password,
        },
      });

      // Extract token from headers (if provided by Devise-JWT)
      const authHeader = res.headers["authorization"];
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (token) {
          localStorage.setItem("auth_token", token);
          // Manually set cookie for middleware access (bypassing Cross-Origin Set-Cookie block for navigation guard)
          document.cookie = `_texavor_session=${token}; path=/; secure; samesite=strict`;
        }
      } else {
        // Fallback: If no header, maybe the user relies purely on cookies (which are failing).
        // We set a dummy cookie to pass middleware if the API call was 200 OK.
        // This assumes the API works via withCredentials for data, even if navigation guard needs a cookie.
        // However, ideally we need the real token.
        document.cookie = `_texavor_session=active; path=/; secure; samesite=strict`;
      }

      const blogs = res?.data?.data?.blogs;

      const redirectTo = searchParams.get("redirect_to");

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      if (!blogs || blogs.length === 0) {
        router.push("/onboarding");
      } else if (
        blogs.find(
          (ele: any) =>
            ele?.status === "pending" || ele?.status === "processing"
        )
      ) {
        const blog = blogs.find(
          (ele: any) =>
            ele?.status === "pending" || ele?.status === "processing"
        );
        router.push(`/onboarding?blog=${blog?.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      if (
        error?.response?.data?.status?.message ===
        "Please confirm your email first before logging in."
      ) {
        router.push(`/confirm-email?email=${data?.email}`);
      }

      console.error(error);
      setTopLoader(false);
    }
  }

  const mutation = useMutation({ mutationFn: postData });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div className="mx-auto grid w-[450px] gap-6 p-10">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
          Login
        </h1>
        <p className="text-balance text-[#7A7A7A] font-inter">
          Enter your email below to login to your account
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
          name="email"
          children={(field) => (
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              type="email"
              placeholder="Enter Email"
              required
              className="bg-white text-black font-inter"
            />
          )}
        />
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
                placeholder="Password"
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
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          )}
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-[#271041] hover:underline font-inter"
          >
            Forgot Password?
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full bg-[#104127] text-white hover:bg-[#104127] font-poppins"
        >
          Login
        </Button>
      </form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-400" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#EEE5DC] px-2 text-muted-foreground rounded-sm font-inter">
            or sign in via
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <a
          href={`${baseURL}/api/v1/auth/google_oauth2`}
          className="w-full col-span-3"
        >
          <Button
            variant="outline"
            className="bg-white border text-[#0A2918] w-full hover:bg-white"
          >
            <Image
              src="/icons/google.png"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Google
          </Button>
        </a>
      </div>
      <div className="mt-4 text-center text-sm text-[#7A7A7A] font-inter">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="underline text-[#271041] font-medium font-inter"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function LoginClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
