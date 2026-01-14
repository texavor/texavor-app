import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/empty-state.png"
            alt="404 - Page Not Found"
            width={400}
            height={400}
            className="w-full max-w-md"
            priority
          />
        </div>

        <div className="space-y-4 mb-8">
          <h1 className="text-6xl font-bold font-poppins text-[#0A2918]">
            404
          </h1>
          <h2 className="text-2xl font-semibold font-poppins text-gray-700">
            Page Not Found
          </h2>
          <p className="text-gray-500 font-inter max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            asChild
            variant="outline"
            className="gap-2 font-inter border-none shadow-none"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button
            asChild
            className="gap-2 font-inter bg-[#104127] hover:bg-[#0A2918]"
          >
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
