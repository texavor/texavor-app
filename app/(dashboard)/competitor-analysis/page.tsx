import { Metadata } from "next";
import CompetitorAnalysisClient from "./CompetitorAnalysisClient";

export const metadata: Metadata = {
  title: "Competitor Analysis",
};

export default function Page() {
  return <CompetitorAnalysisClient />;
}
