"use client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { axiosInstance } from "@/lib/axiosInstace";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type MyForm = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  async function postData(data: MyForm) {
    try {
      const res = await axiosInstance.post("/api/v1/password", {
        user: {
          email: data?.email,
        },
      });
      toast.success(res?.data?.status?.message);
      // router.push("/login");
    } catch (error: any) {
      console.error(error);
    }
  }

  const mutation = useMutation({ mutationFn: postData });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div className="mx-auto grid w-full max-w-sm sm:max-w-md gap-6 p-6 sm:p-10 sm:border sm:border-border sm:bg-card sm:rounded-xl shadow-none self-center mt-10 md:mt-0">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-foreground font-poppins">
          Forgot Password
        </h1>
        <p className="text-balance text-muted-foreground font-inter text-sm md:text-base">
          Enter your email and we will send you a link to reset your password.
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
              className="bg-background text-foreground font-inter"
            />
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-poppins"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Sending..." : "Send password reset email"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground font-inter">
        Remember your password?{" "}
        <Link href="/login" className="underline text-primary font-medium">
          Login
        </Link>
      </div>
    </div>
  );
}
