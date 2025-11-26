"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ShopifySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/integrations");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoNow = () => {
    router.push("/integrations");
  };

  return (
    <div className="relative flex items-center justify-center min-h-[80vh] p-4">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-background to-teal-50/30" />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg z-10"
      >
        {/* Card with subtle glassmorphism */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 overflow-hidden">
          {/* Top accent bar */}
          <motion.div
            className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />

          <div className="p-8 sm:p-10">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
                className="relative"
              >
                {/* Main icon container */}
                <div className="relative h-20 w-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <CheckCircle2
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                </div>

                {/* Single subtle ripple */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </motion.div>
            </div>

            {/* Title and description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold font-poppins text-[#104127] mb-3">
                Successfully Connected!
              </h1>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Store className="w-4 h-4 text-emerald-600" />
                <p className="text-base font-medium text-gray-700 font-inter">
                  @{shop || "your-store.myshopify.com"}
                </p>
              </div>

              {/* Shop domain display box */}
              {shop && (
                <div className="max-w-sm mx-auto mb-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 font-mono">
                    {shop}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 font-inter">
                Your Shopify integration is now active
              </p>
            </motion.div>

            {/* Feature highlights - simplified */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="space-y-2.5 mb-8"
            >
              {[
                "Publish articles directly to your blog",
                "Seamless content synchronization",
                "Manage everything from one place",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-sm text-gray-700 font-inter"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <p>{feature}</p>
                </div>
              ))}
            </motion.div>

            {/* Countdown timer - cleaner design */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mb-6"
            >
              <div className="relative overflow-hidden rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-inter mb-1">
                    Redirecting in{" "}
                    <span className="font-semibold text-emerald-700">
                      {countdown}s
                    </span>
                  </p>
                </div>

                {/* Progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-emerald-500"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <Button
                onClick={handleGoNow}
                className="w-full h-11 gap-2 bg-[#104127] hover:bg-[#0A2918] text-white font-inter font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                Go to Integrations
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
