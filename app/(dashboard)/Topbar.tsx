"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import {
  FileText,
  LogOut,
  PenSquare,
  Sparkles,
  ListTree,
  Home,
  ChevronRight,
  Target,
  Users,
  Image,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { toast } from "sonner";

// Page title mapping based on routes
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/article": "Article",
  "/keyword-research": "Keyword Research",
  "/topic-generation": "Topic Generation",
  "/outline-generation": "Outline Generator",
  "/integrations": "Integrations",
  "/settings": "Settings",
  "/settings/usage": "Usage",
  "/settings/subscription": "Subscription",
  "/support": "Support",
  "/blogs": "Blogs",
  "/docs": "Docs",
};

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  LayoutDashboardIcon,
  Paperclip,
  Binoculars,
  Microscope,
  Blocks,
  Settings,
  MessageCircleQuestion,
  Newspaper,
  TableOfContents,
} from "lucide-react";

// Icon mapping based on routes
const ROUTE_ICONS: Record<string, React.ReactNode> = {
  "/dashboard": <LayoutDashboardIcon className="h-4 w-4" />,
  "/article": <Paperclip className="h-4 w-4" />,
  "/keyword-research": <Binoculars className="h-4 w-4" />,
  "/topic-generation": <Microscope className="h-4 w-4" />,
  "/outline-generation": <ListTree className="h-4 w-4" />,
  "/competitor-analysis": <Target className="h-4 w-4" />,
  "/integrations": <Blocks className="h-4 w-4" />,
  "/settings": <Settings className="h-4 w-4" />,
  "/support": <MessageCircleQuestion className="h-4 w-4" />,
  "/team": <Users className="h-4 w-4" />,
  "/blogs": <Newspaper className="h-4 w-4" />,
  "/docs": <TableOfContents className="h-4 w-4" />,
};

import { usePermissions } from "@/hooks/usePermissions";

const Topbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { clear, user, mainLoading, blogs } = useAppStore();
  const { role } = usePermissions();

  // ... (keep getPageTitle, getBreadcrumbs, handleLogout)

  // In the return JSX, replace user email part:
  /*
                <div className="flex flex-col">
                <p className="font-poppins text-sm font-medium">
                  {user?.first_name || "User"} {user?.last_name || ""}
                </p>
                <p className="text-xs text-gray-500 max-w-[260px] truncate capitalize">
                  {role || "Viewer"}
                </p>
              </div>
  */

  // Get dynamic page title based on current pathname
  const getPageTitle = (path: string) => {
    const segment = path.split("/").pop() || "";

    // Check if segment is a UUID
    const isUUID =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        segment,
      );

    if (isUUID) {
      return segment.slice(0, 8);
    }

    return (
      PAGE_TITLES[path] ||
      PAGE_TITLES[`/${segment}`] ||
      segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Page"
    );
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const isDeep = segments.length > 1;

    return segments.map((segment, index) => {
      // Skip "view" segment in breadcrumbs for cleaner navigation
      if (segment === "view" && segments[index - 1] === "article") {
        return null;
      }

      const path = `/${segments.slice(0, index + 1).join("/")}`;
      const isLast = index === segments.length - 1;
      const isFirst = index === 0;
      const title = getPageTitle(path);
      const icon = ROUTE_ICONS[`/${segment}`] || ROUTE_ICONS[path];

      return (
        <React.Fragment key={path}>
          <BreadcrumbItem>
            {isLast ? (
              <BreadcrumbPage
                className={`${
                  isFirst ? "text-black" : "text-green-800"
                } font-poppins font-medium flex items-center gap-2`}
              >
                {title}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 px-2 text-black hover:text-gray-700 font-medium font-poppins"
                  onClick={() => {
                    const isArticleId =
                      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
                        segment,
                      );

                    if (role === "viewer" && isArticleId) {
                      router.push(`/article/view/${segment}`);
                    } else {
                      router.push(path);
                    }
                  }}
                >
                  {icon}
                </Button>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isLast && <BreadcrumbSeparator />}
        </React.Fragment>
      );
    });
  };

  const handleLogout = async () => {
    try {
      // Single call to our Next.js API route which handles everything
      const res = await axios.post("/api/logout");
      toast.success("Logout Successfull!");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("access_expires_at");
      localStorage.removeItem("user");
      clear();
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex items-start gap-4 w-full py-4">
      {/* First Div - Breadcrumbs (Expanded) */}
      <div className="flex-1">
        <div className="bg-white w-full rounded-xl px-4 h-12 flex items-center">
          <Breadcrumb>
            <BreadcrumbList>{getBreadcrumbs()}</BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Third Div - User Profile */}
      <div className="bg-white p-2 rounded-xl w-[320px] h-12 flex flex-col justify-center shrink-0">
        <div className="flex items-center justify-between w-full cursor-pointer px-2">
          {mainLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="rounded-full h-6 w-6 bg-[#f9f4f0]" />
              <div className="flex flex-col space-y-2">
                <Skeleton className="w-[200px] h-[14px] rounded-xl bg-[#f9f4f0]" />
                <Skeleton className="w-[220px] h-[14px] rounded-xl bg-[#f9f4f0]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar className="rounded-full">
                <AvatarImage
                  src={user?.avatar || "/placeholder-user.jpg"}
                  className="h-6 w-6"
                />
                <AvatarFallback className="bg-[#f9f4f0] rounded-full p-1 font-medium text-sm max-w-[260px] truncate">
                  {user?.first_name?.slice(0, 2)?.toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-poppins text-sm font-medium">
                  {user?.first_name || "User"} {user?.last_name || ""}
                </p>
                <p className="text-xs text-gray-500 max-w-[260px] truncate capitalize">
                  {role || "Viewer"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
