import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubstackFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SubstackForm: React.FC<SubstackFormProps> = ({
  formData,
  handleChange,
}) => {
  const [showCookie, setShowCookie] = React.useState(false);

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="subdomain" className="text-foreground/80 font-inter">
          Substack Subdomain <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="subdomain"
            name="subdomain"
            placeholder="your-blog"
            value={formData.subdomain || ""}
            onChange={handleChange}
            className="font-inter flex-1"
          />
          <span className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
            .substack.com
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-inter">
          Enter the subdomain (e.g. "texavor" for texavor.substack.com)
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="cookie" className="text-foreground/80 font-inter">
            Session Cookie (substack.sid){" "}
            <span className="text-red-500">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="font-inter text-xs leading-5">
                  1. Go to your Substack dashboard
                  <br />
                  2. Open Developer Tools (F12) -&gt; Application -&gt; Cookies
                  <br />
                  3. Find "substack.sid" and copy its value.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="relative">
          <Input
            id="cookie"
            name="cookie"
            type={showCookie ? "text" : "password"}
            placeholder="s%3A..."
            value={formData.cookie || ""}
            onChange={handleChange}
            className="font-inter pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCookie(!showCookie)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showCookie ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground font-inter">
          Required to authenticate and publish on your behalf.
        </p>
      </div>
    </div>
  );
};
