"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Suspense } from "react";

function ShopifyErrorLoading() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Loader2 className="h-12 w-12 animate-spin text-red-500" />
    </div>
  );
}

function ShopifyErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams.get("message") || "An unknown error occurred";

  const handleRetry = () => {
    router.push("/integrations");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="w-full border-red-100 shadow-lg overflow-hidden">
          <CardHeader className="text-center pb-2 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <div className="flex justify-center mb-6 mt-4">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center relative"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.div>
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-red-100"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-2xl font-poppins text-red-950 mb-1">
                Connection Failed
              </CardTitle>
              <CardDescription className="font-inter">
                Unable to connect your Shopify store
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-inter break-words">
                {decodeURIComponent(errorMessage)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-600 font-inter bg-gray-50 p-4 rounded-lg"
            >
              <p className="font-semibold mb-2 text-gray-900">Common issues:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Invalid shop domain</li>
                <li>Authorization was denied</li>
                <li>Network connection issue</li>
                <li>Shopify store not accessible</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Button
                onClick={handleRetry}
                className="flex-1 gap-2 bg-[#104127] hover:bg-[#0A2918] text-white font-inter transition-all hover:shadow-md"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={handleGoBack}
                className="flex-1 gap-2 font-inter hover:bg-gray-100"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ShopifyErrorPage() {
  return (
    <Suspense fallback={<ShopifyErrorLoading />}>
      <ShopifyErrorContent />
    </Suspense>
  );
}
