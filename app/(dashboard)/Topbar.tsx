"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { toast } from "sonner";

const Topbar = () => {
  const router = useRouter();
  const { clear, user, mainLoading } = useAppStore();

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
      {/* First Div */}
      <div className="w-3/12">
        <div className="bg-white w-full rounded-xl p-2 h-12 flex justify-center flex-col">
          <p className="font-poppins font-medium">Dashboard</p>
        </div>
      </div>

      {/* Second Div */}
      <div className="w-5/12 max-h-12 min-h-12">
        <div className="bg-white rounded-xl p-2 flex items-center justify-between max-h-12  max-h-12 min-h-12">
          Hello
        </div>
      </div>
      <div className="bg-white p-2 rounded-xl w-4/12 h-12 flex flex-col justify-center">
        <div className="flex items-center justify-between w-full cursor-pointer px-2">
          {mainLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="rounded-full h-6 w-6 bg-[#f9f4f0]" />
              <div className="flex flex-col space-y-2">
                <Skeleton className="w-[140px] h-[14px] rounded-xl bg-[#f9f4f0]" />
                <Skeleton className="w-[140px] h-[14px] rounded-xl bg-[#f9f4f0]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar className="rounded-full">
                <AvatarImage
                  src={user?.avatar || "/placeholder-user.jpg"}
                  className="h-6 w-6"
                />
                <AvatarFallback className="bg-[#f9f4f0] rounded-full p-1 font-medium text-sm max-w-[160px] truncate">
                  {user?.first_name?.slice(0, 2)?.toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-poppins text-sm font-medium">
                  {user?.first_name || "User"} {user?.last_name || ""}
                </p>
                <p className="text-xs text-gray-500 max-w-[260px] truncate">
                  {user?.email || "m@example.com"}
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
