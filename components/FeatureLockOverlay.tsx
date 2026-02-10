"use client";

import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface FeatureLockOverlayProps {
  feature: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function FeatureLockOverlay({
  feature,
  title = "Premium Feature",
  description = "Upgrade your plan to unlock this advanced AI tool.",
  children,
}: FeatureLockOverlayProps) {
  const { isLocked, isLoading } = useFeatureAccess();
  const router = useRouter();

  if (isLoading) {
    return <>{children}</>; // Don't block while loading to prevent flash
  }

  if (isLocked(feature)) {
    return (
      <div className="relative w-full h-full min-h-[400px]">
        {/* Blurred Content Background */}
        <div className="absolute inset-0 filter blur-sm opacity-50 pointer-events-none select-none overflow-hidden">
          {children}
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20 max-w-md text-center">
            <div className="bg-[#104127]/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#104127]" />
            </div>

            <h3 className="text-2xl font-bold font-poppins text-gray-900 mb-2">
              {title}
            </h3>

            <p className="text-gray-600 mb-8 font-inter">{description}</p>

            <Button
              onClick={() => router.push("/settings/subscription")}
              className="w-full bg-[#104127] hover:bg-[#0d3320] text-white font-semibold py-6 text-lg rounded-xl shadow-lg border-none hover:shadow-xl transition-all duration-300 group"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Upgrade to Unlock
            </Button>

            <p className="mt-4 text-xs text-gray-500">
              Start your 14-day free trial on the Professional plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
