import { Metadata } from "next";
import PricingClientPage from "./PricingClientPage";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function Page() {
  return <PricingClientPage />;
}
