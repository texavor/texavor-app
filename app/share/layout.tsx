"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/app/(dashboard)/Sidebar";
// import AuthChecker from "@/components/AuthChecker"; // Exclude AuthChecker
import Topbar from "@/app/(dashboard)/Topbar";
import { useAppStore } from "@/store/appStore";
import DemoStoreInitializer from "./demo/components/DemoStoreInitializer";
import MockNetworkInterceptor from "./demo/components/MockNetworkInterceptor";

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { zenMode } = useAppStore();

  return (
    <DemoStoreInitializer>
      <MockNetworkInterceptor />
      <SidebarProvider>
        {/* <AuthChecker /> -- No auth for share routes */}
        <div className={`flex h-screen w-full ${zenMode ? "p-4" : "pr-4"}`}>
          {!zenMode && <AppSidebar />}
          <div className="w-full flex flex-col h-full overflow-hidden ">
            {/* We might need to mock Topbar too if it has auth logic, 
                 but for now assuming it uses store data which is mocked. */}
            {!zenMode && <Topbar />}
            <main className="flex-1 overflow-y-auto no-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DemoStoreInitializer>
  );
}
