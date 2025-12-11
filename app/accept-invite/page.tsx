"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying invitation...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No invitation token provided.");
      return;
    }

    const acceptInvitation = async () => {
      try {
        const res = await axiosInstance.post(
          `/api/v1/invitations/accept?token=${token}`
        );

        if (res.data?.redirect) {
          router.push(res.data.redirect);
          return;
        }

        setStatus("success");
        setMessage("You have successfully joined the team!");
        // Refresh profile/teams
        // Redirect after delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error: any) {
        console.error("Accept failed", error);
        setStatus("error");
        setMessage(
          error.response?.data?.error ||
            "Failed to accept invitation. It may have expired."
        );

        if (error.response?.status === 401 && error.response?.data?.redirect) {
          // Need login (legacy handling just in case)
          router.push(error.response.data.redirect);
        }
      }
    };

    acceptInvitation();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {status === "loading" && (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            )}
            {status === "error" && <XCircle className="h-6 w-6 text-red-600" />}
          </div>
          <CardTitle>
            {status === "loading" && "Joining Team..."}
            {status === "success" && "Welcome Aboard!"}
            {status === "error" && "Invitation Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          {status === "success" && (
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          )}
          {status === "error" && (
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
