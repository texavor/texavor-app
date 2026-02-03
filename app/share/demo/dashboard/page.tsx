"use client";

import DashboardClientPage from "@/app/(dashboard)/dashboard/DashboardClientPage";
import MockQueryProvider from "../components/MockQueryProvider";

export default function DemoDashboardPage() {
  return (
    <MockQueryProvider>
      <DashboardClientPage />
    </MockQueryProvider>
  );
}
