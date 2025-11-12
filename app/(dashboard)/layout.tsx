import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";
import AuthChecker from "@/components/AuthChecker";
import Topbar from "./Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AuthChecker />
      <div className="flex h-screen w-full pr-4">
        <AppSidebar />
        <div className="w-full">
          <Topbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
