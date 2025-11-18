"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  ArrowLeftToLine,
  Binoculars,
  Blocks,
  Calendar,
  LayoutDashboardIcon,
  Microscope,
  Paperclip,
  Settings,
  User,
  ArrowRightToLine,
  MessageCircleQuestion,
  Newspaper,
  TableOfContents,
  ExternalLink,
  LogOutIcon,
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
import { useRouter } from "next/navigation";

const SideBarOption = [
  {
    icon: <LayoutDashboardIcon className="h-4 w-4" />,
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <User className="h-4 w-4" />,
    title: "Onboarding",
    href: "/onboarding",
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
    icon: <Calendar className="h-4 w-4" />,
    title: "Article Calendar",
    href: "/article-calendar",
  },
];

const SideBarOptionSettings = [
  {
    icon: <Blocks className="h-4 w-4" />,
    title: "Integration",
    href: "/integration",
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
    href: "/integration",
  },
  {
    icon: <Newspaper className="h-4 w-4" />,
    title: "Blogs",
    href: "/settings",
    external: true,
  },
  {
    icon: <TableOfContents className="h-4 w-4" />,
    title: "Docs",
    href: "/settings",
    external: true,
  },
];

const AppSidebar = () => {
  const [isSideOpen, setIsSideOpen] = useState(true);
  const { blogs, mainLoading, clear } = useAppStore();
  const router = useRouter();

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
            <Link href={sidebar.href} key={sidebar.title}>
              <Tooltip open={isSideOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex gap-2 cursor-pointer w-full ${
                      isSideOpen ? "justify-start" : "justify-center"
                    }`}
                  >
                    {sidebar.icon}
                    {isSideOpen && (
                      <p className="font-poppins font-base">{sidebar.title}</p>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{sidebar.title}</p>
                </TooltipContent>
              </Tooltip>
            </Link>
          ))}
        </div>

        <div className="border-b-[1px] px-2" />

        <div className="space-y-1 flex flex-col pt-2">
          {SideBarOptionSettings.map((sidebar) => (
            <Link href={sidebar.href} key={sidebar.title}>
              <Tooltip open={isSideOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex gap-2 cursor-pointer w-full ${
                      isSideOpen ? "justify-start" : "justify-center"
                    }`}
                  >
                    {sidebar.icon}
                    {isSideOpen && (
                      <p className="font-poppins font-base">{sidebar.title}</p>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{sidebar.title}</p>
                </TooltipContent>
              </Tooltip>
            </Link>
          ))}
        </div>
        <div className="border-b-[1px] px-2" />

        <div className="space-y-1 flex flex-col pt-2">
          {SideBarOptionExternal?.map((sidebar) => (
            <Link href={sidebar.href} key={sidebar.title}>
              <Tooltip open={isSideOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex gap-2 cursor-pointer w-full ${
                      isSideOpen ? "justify-start" : "justify-center"
                    }`}
                  >
                    {sidebar.icon}
                    {isSideOpen && (
                      <p className="font-poppins font-base">{sidebar.title}</p>
                    )}
                    {sidebar?.external && isSideOpen && (
                      <ExternalLink className="size-3 stroke-2 text-black" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{sidebar.title}</p>
                </TooltipContent>
              </Tooltip>
            </Link>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        className="bg-red-200 p-2 rounded-xl w-full hover:bg-red-200"
        onClick={handleLogout}
      >
        <p className="font-poppins text-normal">Logout</p>
        <LogOutIcon className="size-4" />
      </Button>
    </div>
  );
};

export default AppSidebar;
