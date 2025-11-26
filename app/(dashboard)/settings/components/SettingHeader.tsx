"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface SettingHeaderProps {
  title: string;
  description?: string;
}

export const SettingHeader = ({
  title,
  description,
  children,
}: SettingHeaderProps & { children?: React.ReactNode }) => {
  const router = useRouter();

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/settings")}
        className="mb-4 -ml-2 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Settings
      </Button>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-poppins font-semibold text-[#0A2918] mb-2">
            {title}
          </h1>
          {description && (
            <p className="font-inter text-gray-600">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
