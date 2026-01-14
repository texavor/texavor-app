import { Metadata } from "next";
import DashboardClientPage from "./DashboardClientPage";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <DashboardClientPage />;
}
