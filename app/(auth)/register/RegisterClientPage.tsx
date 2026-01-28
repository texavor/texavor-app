"use client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { axiosInstance, baseURL } from "@/lib/axiosInstace";

// A type for our form state
type MyForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get query params
  const emailParam = searchParams.get("email") || "";
  const redirectTo = searchParams.get("redirect_to");

  // Extract invite token from redirect_to if present
  let inviteToken = "";
  if (redirectTo && redirectTo.includes("token=")) {
    // Simple extraction assuming token is in the redirect url
    // redirect_to=/accept-invite?token=ABC
    const match = redirectTo.match(/token=([^&]*)/);
    if (match) {
      inviteToken = match[1];
    }
  }

  async function postData(data: MyForm) {
    try {
      const payload: any = {
        user: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password: data.password,
          confirm_password: data.confirmPassword,
          terms: data.terms,
        },
      };

      if (inviteToken) {
        payload.invite_token = inviteToken;
      }

      const res = await axiosInstance.post("/api/v1/signup", payload);

      // Extract and save token if present (Auto-login support)
      const authHeader = res.headers["authorization"];
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", token);
            document.cookie = `_texavor_session=${token}; path=/; secure; samesite=strict; max-age=2592000`;
          }
        }
      }

      if (
        res?.data?.status?.code === 200 ||
        res?.status === 201 ||
        res?.status === 200
      ) {
        if (inviteToken && redirectTo) {
          // If user registered with an invite, they are likely auto-confirmed (handled by backend)
          // Redirect them to the accept-invite page
          router.push(redirectTo);
        } else {
          router.push(
            `/confirm-email?email=${encodeURIComponent(payload.user.email)}`,
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const mutation = useMutation({
    mutationFn: postData,
  });

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: emailParam,
      password: "",
      confirmPassword: "",
      terms: false,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div className="mx-auto grid w-[450px] gap-6 p-10">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
          Sign up
        </h1>
        <p className="text-balance text-[#7A7A7A] font-inter">
          Create your account and build your authority in search.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="grid grid-cols-2 gap-4"
      >
        <form.Field
          name="firstName"
          children={(field) => (
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              placeholder="Enter First Name"
              required
              className="bg-white text-black font-inter"
            />
          )}
        />
        <form.Field
          name="lastName"
          children={(field) => (
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              placeholder="Enter Last Name"
              required
              className="bg-white text-black font-inter"
            />
          )}
        />
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
              className="bg-white  text-black col-span-2 font-inter"
            />
          )}
        />
        <form.Field
          name="password"
          children={(field) => (
            <div className="relative col-span-2">
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                required
                className="bg-white font-inter text-black pr-10"
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
        <form.Field
          name="confirmPassword"
          children={(field) => (
            <div className="relative col-span-2">
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                className="bg-white font-inter text-black pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          )}
        />
        <form.Field
          name="terms"
          children={(field) => (
            <div className="flex items-center space-x-2 col-span-2">
              <Checkbox
                id={field.name}
                name={field.name}
                checked={field.state.value}
                onBlur={field.handleBlur}
                onCheckedChange={(checked) =>
                  field.handleChange(checked === true)
                }
                className="border-gray-400"
              />
              <Label
                htmlFor={field.name}
                className="text-sm font-inter font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#7A7A7A]"
              >
                I Agree To The
                <Link
                  href="https://www.texavor.com/terms-and-conditions"
                  target="_blank"
                  className="underline text-[#104127] font-medium font-inter"
                >
                  Terms
                </Link>
                &
                <Link
                  href="https://www.texavor.com/privacy-policy"
                  target="_blank"
                  className="underline text-[#104127] font-medium font-inter"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
          )}
        />
        <form.Subscribe
          selector={(state) => state.values.terms}
          children={(terms) => (
            <Button
              disabled={!terms || mutation.isPending}
              type="submit"
              className="w-full bg-[#104127] text-white hover:bg-[#104127] col-span-2"
            >
              {mutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          )}
        />
      </form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-400" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#EEE5DC] px-2 text-muted-foreground rounded-sm font-inter">
            or sign up via
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
        Already Have An Account?{" "}
        <Link
          href="/login"
          className="underline text-[#104127] font-medium font-inter"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default function RegisterClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
