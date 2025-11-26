"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export const SettingCard = ({
  icon,
  title,
  description,
  href,
}: SettingCardProps) => {
  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group border-none bg-white h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="w-12 h-12 rounded-full bg-[#104127]/10 flex items-center justify-center mb-4 group-hover:bg-[#104127]/20 transition-colors">
              <div className="text-[#104127]">{icon}</div>
            </div>
            <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-2">
              {title}
            </h3>
            <p className="font-inter text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#104127] transition-colors flex-shrink-0 mt-1" />
        </div>
      </Card>
    </Link>
  );
};
