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
    <div className="mx-auto grid w-[450px] gap-6 p-10 md:rounded-tl-lg md:rounded-bl-lg h-full bg-[#EEDED3]">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
          Forgot Password
        </h1>
        <p className="text-balance text-[#7A7A7A] font-inter">
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
              className="bg-white text-black font-inter"
            />
          )}
        />
        <Button
          type="submit"
          className="w-full bg-[#104127] text-white hover:bg-[#104127]"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Sending..." : "Send password reset email"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-[#7A7A7A] font-inter">
        Remember your password?{" "}
        <Link href="/login" className="underline text-[#271041] font-medium">
          Login
        </Link>
      </div>
    </div>
  );
}
