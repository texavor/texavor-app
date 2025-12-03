"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, XCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SubscriptionFailurePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/pricing");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleTryAgain = () => {
    router.push("/pricing");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-[#f9f4f0]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-background to-orange-50/30" />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg z-10"
      >
        {/* Card with subtle glassmorphism */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100/50 overflow-hidden">
          {/* Top accent bar */}
          <motion.div
            className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />

          <div className="p-8 sm:p-10">
            {/* Error icon */}
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
                <div className="relative h-20 w-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <XCircle
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                </div>

                {/* Single subtle ripple */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-400/30"
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
              <h1 className="text-3xl font-bold font-poppins text-red-700 mb-3">
                Payment Cancelled
              </h1>
              <div className="flex items-center justify-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-red-600" />
                <p className="text-base font-medium text-gray-700 font-inter">
                  Subscription not activated
                </p>
              </div>

              <p className="text-sm text-gray-600 font-inter">
                Your payment was cancelled. No charges have been made.
              </p>
            </motion.div>

            {/* Information highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="space-y-2.5 mb-8"
            >
              {[
                "No payment was processed",
                "You can try again anytime",
                "Need help? Contact our support",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-sm text-gray-700 font-inter"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
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
              <div className="relative overflow-hidden rounded-xl bg-red-50 p-4 border border-red-100">
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-inter mb-1">
                    Redirecting in{" "}
                    <span className="font-semibold text-red-700">
                      {countdown}s
                    </span>
                  </p>
                </div>

                {/* Progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-red-500"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 8, ease: "linear" }}
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
                onClick={handleTryAgain}
                className="w-full h-11 gap-2 bg-[#104127] hover:bg-[#0A2918] text-white font-inter font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                Try Again
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
