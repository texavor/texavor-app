"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  ArrowLeftToLine,
  Binoculars,
  Blocks,
  LayoutDashboardIcon,
  ListTree,
  Microscope,
  Paperclip,
  Settings,
  ArrowRightToLine,
  MessageCircleQuestion,
  Newspaper,
  TableOfContents,
  ExternalLink,
  LogOutIcon,
  Target,
  Bookmark,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/appStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SideBarOption = [
  {
    icon: <LayoutDashboardIcon className="h-4 w-4" />,
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <Paperclip className="h-4 w-4" />,
    title: "Article",
    href: "/article",
  },
  {
    icon: <Binoculars className="h-4 w-4" />,
    title: "Keyword Research",
    href: "/keyword-research",
  },
  {
    icon: <Microscope className="h-4 w-4" />,
    title: "Topic Generation",
    href: "/topic-generation",
  },
  {
    icon: <ListTree className="h-4 w-4" />,
    title: "Outline Generator",
    href: "/outline-generation",
  },
  {
    icon: <Target className="h-4 w-4" />,
    title: "Competitor Analysis",
    href: "/competitor-analysis",
  },
  {
    icon: <Bookmark className="h-4 w-4" />,
    title: "Saved",
    href: "/saved",
  },
];

const SideBarOptionSettings = [
  {
    icon: <Blocks className="h-4 w-4" />,
    title: "Integrations",
    href: "/integrations",
  },
  {
    icon: <ImageIcon className="h-4 w-4" />,
    title: "Thumbnail Styles",
    href: "/settings/thumbnail-styles",
  },
  {
    icon: <Settings className="h-4 w-4" />,
    title: "Settings",
    href: "/settings",
  },
];

const SideBarOptionExternal = [
  {
    icon: <MessageCircleQuestion className="h-4 w-4" />,
    title: "Support",
    href: "/support",
  },
  {
    icon: <Newspaper className="h-4 w-4" />,
    title: "Blogs",
    href: "/blogs",
    external: true,
  },
  {
    icon: <TableOfContents className="h-4 w-4" />,
    title: "Docs",
    href: "/docs",
    external: true,
  },
];

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  isSideOpen: boolean;
  external?: boolean;
  isActive?: boolean;
}

const SidebarItem = ({
  icon,
  title,
  href,
  isSideOpen,
  external,
  isActive,
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <Tooltip open={isSideOpen ? false : undefined}>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={`flex gap-2 cursor-pointer w-full ${
              isSideOpen ? "justify-start" : "justify-center"
            } ${isActive ? "bg-secondary" : ""}`}
          >
            {icon}
            {isSideOpen && <p className="font-poppins font-base">{title}</p>}
            {external && isSideOpen && (
              <ExternalLink className="size-3 stroke-2 text-black ml-auto" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </Link>
  );
};

const AppSidebar = () => {
  const [isSideOpen, setIsSideOpen] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const { blogs, mainLoading, clear } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open");
    if (saved !== null) {
      setIsSideOpen(JSON.parse(saved));
    }
    setIsHydrated(true);
  }, []);

  // Persist sidebar state to localStorage whenever it changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("sidebar-open", JSON.stringify(isSideOpen));
    }
  }, [isSideOpen, isHydrated]);

  const handleLogout = async () => {
    try {
      // Use axiosInstance to send headers if available
      // Note: We import axiosInstance from lib, so we need to update imports or just add headers manually here
      // But since we are importing axios directly on line 30, let's fix that import first or just use axios with headers.
      // Actually, let's just use axiosInstance if possible, but I need to see imports.
      // existing import is `import axios from "axios";`
      // I will assume I can change line 30 in a separate edit or just use axios with manual header.

      const token = localStorage.getItem("auth_token");
      await axios.post(
        "/api/logout",
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      toast.success("Logout Successfull!");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("access_expires_at");
      localStorage.removeItem("user");

      // Manually clear the cookie to prevent middleware loop
      document.cookie =
        "_easywrite_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      clear();
      window.location.href = "/login";
    }
  };

  return (
    <div
      className={`h-screen flex flex-col justify-between p-4 gap-4 transition-all ease-in-out duration-300 ${
        isSideOpen ? "w-[250px]" : "w-[78px]"
      }`}
    >
      {/* --- TOP BLOG CARD --- */}
      <div className="bg-white p-2 rounded-xl w-full min-h-12 flex flex-col justify-center">
        {isSideOpen ? (
          <div className="flex justify-between w-full items-center px-2">
            {mainLoading ? (
              <div className="flex gap-2 items-center">
                <Skeleton className="rounded-full h-6 w-6 bg-[#f9f4f0]" />
                <Skeleton className="w-[100px] h-[20px] rounded-xl bg-[#f9f4f0]" />
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <Avatar className="rounded-full">
                  <AvatarImage
                    src={`${blogs?.website_url}/favicon.ico`}
                    className="h-6 w-6"
                  />
                  <AvatarFallback className="bg-[#f9f4f0] rounded-full p-1 font-medium text-sm">
                    {blogs?.name?.slice(0, 2)?.toUpperCase() || "BL"}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium font-poppins truncate max-w-[130px]">
                  {blogs?.name || "Blog"}
                </p>
              </div>
            )}
            <div
              className="cursor-pointer"
              onClick={() => setIsSideOpen(!isSideOpen)}
            >
              <ArrowLeftToLine className="h-4 w-4 stroke-2 text-gray-600 hover:text-gray-600" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Avatar className="rounded-full">
                <AvatarImage
                  src={`${blogs?.website_url}/favicon.ico`}
                  className="h-6 w-6"
                />
                <AvatarFallback className="bg-[#f9f4f0] rounded-full p-1 font-medium text-sm">
                  {blogs?.name?.slice(0, 2)?.toUpperCase() || "BL"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div
              className="cursor-pointer flex justify-center"
              onClick={() => setIsSideOpen(!isSideOpen)}
            >
              <ArrowRightToLine className="h-4 w-4 stroke-2 text-gray-600 hover:text-gray-600" />
            </div>
          </div>
        )}
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <div className="bg-white p-2 rounded-xl w-full flex-grow overflow-y-auto overflow-x-hidden">
        <div className="space-y-1 flex flex-col pb-2">
          {SideBarOption.map((sidebar) => (
            <SidebarItem
              key={sidebar.title}
              {...sidebar}
              isSideOpen={isSideOpen}
              isActive={
                pathname === sidebar.href ||
                pathname.startsWith(`${sidebar.href}/`)
              }
            />
          ))}
        </div>

        <div className="border-b-[1px] px-2" />

        <div className="space-y-1 flex flex-col py-2">
          {SideBarOptionSettings.map((sidebar) => (
            <SidebarItem
              key={sidebar.title}
              {...sidebar}
              isSideOpen={isSideOpen}
              isActive={
                pathname === sidebar.href ||
                pathname.startsWith(`${sidebar.href}/`)
              }
            />
          ))}
        </div>
        <div className="border-b-[1px] px-2" />

        <div className="space-y-1 flex flex-col pt-2">
          {SideBarOptionExternal?.map((sidebar) => (
            <SidebarItem
              key={sidebar.title}
              {...sidebar}
              isSideOpen={isSideOpen}
              isActive={
                pathname === sidebar.href ||
                pathname.startsWith(`${sidebar.href}/`)
              }
            />
          ))}
        </div>
      </div>

      <Tooltip open={isSideOpen ? false : undefined}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={`bg-red-200 p-2 rounded-xl w-full hover:bg-red-200 flex gap-2 ${
              isSideOpen ? "justify-start" : "justify-center"
            }`}
            onClick={handleLogout}
          >
            <LogOutIcon className="size-4" />
            {isSideOpen && <p className="font-poppins text-normal">Logout</p>}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Logout</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default AppSidebar;
