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
  Users,
  Sparkles,
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
import { usePermissions } from "@/hooks/usePermissions";

const SideBarGeneral = [
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
    icon: <Bookmark className="h-4 w-4" />,
    title: "Saved",
    href: "/saved",
  },
];

const SideBarResearch = [
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Keyword Discovery",
    href: "/keyword-discovery",
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
    href: "/thumbnail-styles",
  },
  {
    icon: <Settings className="h-4 w-4" />,
    title: "Settings",
    href: "/settings",
  },
  {
    icon: <Users className="h-4 w-4" />,
    title: "Team",
    href: "/team",
  },
];

const SideBarOptionExternal = [
  {
    icon: <Newspaper className="h-4 w-4" />,
    title: "Blogs",
    href: "http://texavor.com/blog",
    external: true,
  },
  {
    icon: <TableOfContents className="h-4 w-4" />,
    title: "Docs",
    href: "http://texavor.com/docs",
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
  const button = (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={`flex cursor-pointer w-full hover:bg-[#f9f4f0] ${
        isSideOpen ? "justify-start gap-2" : "justify-center"
      } ${isActive ? "bg-[#f9f4f0]" : ""}`}
    >
      <div className={`shrink-0 ${isActive ? "text-[#104127]" : ""}`}>
        {icon}
      </div>
      {isSideOpen && (
        <p className="font-poppins font-base whitespace-nowrap">{title}</p>
      )}
      {external && isSideOpen && (
        <ExternalLink className="size-3 stroke-2 text-black ml-auto" />
      )}
    </Button>
  );

  if (isSideOpen) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {button}
      </Link>
    );
  }

  // When sidebar is closed, wrap in Tooltip
  if (!isSideOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {button}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // When sidebar is open, no Tooltip needed
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {button}
    </Link>
  );
};

const AppSidebar = () => {
  const [isSideOpen, setIsSideOpen] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const { blogs, mainLoading, clear } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();

  const { role, research_tools, settings } = usePermissions();

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
      const token = localStorage.getItem("auth_token");
      await axios.post(
        "/api/logout",
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
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
        "_texavor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      clear();
      window.location.href = "/login";
    }
  };

  // Filter General Options
  const filteredGeneralOptions = SideBarGeneral.filter((opt) => {
    // Saved page - hide for viewers
    if (opt.href === "/saved" && role === "viewer") {
      return false;
    }
    return true;
  });

  // Filter Research Options (already pre-filtered by list definition, but check permissions)
  const filteredResearchOptions = SideBarResearch.filter((opt) => {
    return research_tools;
  });

  // Filter Settings Options
  const filteredSettingsOptions = SideBarOptionSettings.filter((opt) => {
    // Team - Visible to everyone except Writer and Viewer
    // (Editor has view-only access, so they should see it)
    if (opt.href === "/team") {
      return role !== "writer" && role !== "viewer";
    }
    // Other settings - restricted by 'settings' permission
    if (
      ["/integrations", "/thumbnail-styles", "/settings"].includes(opt.href)
    ) {
      return settings;
    }
    return true;
  });

  return (
    <div
      className={`h-screen flex flex-col justify-between p-4 gap-4 transition-all ease-in-out duration-300 ${
        isSideOpen ? "min-w-[250px]" : "w-[78px]"
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
              <div className="flex gap-2 items-center overflow-hidden">
                <Avatar className="rounded-full shrink-0">
                  <AvatarImage
                    src={`${blogs?.website_url}/favicon.ico`}
                    className="h-6 w-6"
                  />
                  <AvatarFallback className="bg-[#f9f4f0] rounded-full p-1 font-medium text-sm">
                    {blogs?.name?.slice(0, 2)?.toUpperCase() || "BL"}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium font-poppins truncate flex-1">
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
          <div
            className="flex justify-center items-center cursor-pointer group"
            onClick={() => setIsSideOpen(!isSideOpen)}
          >
            <Avatar className="rounded-full group-hover:opacity-80 transition-opacity">
              <AvatarImage
                src={`${blogs?.website_url}/favicon.ico`}
                className="h-6 w-6"
              />
              <AvatarFallback className="bg-[#f9f4f0] rounded-full p-1 font-medium text-sm">
                {blogs?.name?.slice(0, 2)?.toUpperCase() || "BL"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <div className="bg-white p-2 rounded-xl w-full flex-grow overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* General Group */}
        {isSideOpen && (
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 font-poppins">
            GENERAL
          </p>
        )}
        <div className="space-y-1 flex flex-col pb-2">
          {filteredGeneralOptions.map((sidebar) => (
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

        {/* Research Group */}
        {research_tools && filteredResearchOptions.length > 0 && (
          <>
            {!isSideOpen && <div className="border-b-[1px] mx-2 my-2" />}
            {isSideOpen && (
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 font-poppins mt-2">
                RESEARCH
              </p>
            )}
            <div className="space-y-1 flex flex-col pb-2">
              {filteredResearchOptions.map((sidebar) => (
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
          </>
        )}

        {/* Settings Group */}
        {filteredSettingsOptions.length > 0 && (
          <>
            {!isSideOpen && <div className="border-b-[1px] mx-2 my-2" />}
            {isSideOpen && (
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 font-poppins mt-2">
                SETTINGS
              </p>
            )}
            <div className="space-y-1 flex flex-col pb-2">
              {filteredSettingsOptions.map((sidebar) => (
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
          </>
        )}

        {/* Support/External Group */}
        {!isSideOpen && <div className="border-b-[1px] mx-2 my-2" />}
        {isSideOpen && (
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 font-poppins mt-2">
            SUPPORT
          </p>
        )}
        <div className="space-y-1 flex flex-col pb-2">
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
            <LogOutIcon className="size-4 shrink-0" />
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
