import { Suspense } from "react";
import { Metadata } from "next";
import PricingClientPage from "./PricingClientPage";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f4f0]" />}>
      <PricingClientPage />
    </Suspense>
  );
}
