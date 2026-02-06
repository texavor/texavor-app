"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";
import AuthChecker from "@/components/AuthChecker";
import Topbar from "./Topbar";
import { useAppStore } from "@/store/appStore";
import CrispChat from "@/components/CrispChat";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { zenMode } = useAppStore();

  return (
    <SidebarProvider>
      <AuthChecker />
      <CrispChat />
      <div className={`flex h-screen w-full ${zenMode ? "p-4" : "pr-4"}`}>
        {!zenMode && <AppSidebar />}
        <div className="w-full flex flex-col h-full overflow-hidden ">
          {!zenMode && <Topbar />}
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
