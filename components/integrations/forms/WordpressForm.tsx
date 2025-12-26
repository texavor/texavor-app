import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import React from "react";

interface WordpressFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WordpressForm({ formData, handleChange }: WordpressFormProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="site_url" className="text-foreground/80 font-inter">
          Site URL
        </Label>
        <Input
          id="site_url"
          name="site_url"
          value={formData.site_url || ""}
          onChange={handleChange}
          required
          placeholder="https://your-site.com"
          className="font-inter"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-foreground/80 font-inter">
          Username
        </Label>
        <Input
          id="username"
          name="username"
          value={formData.username || ""}
          onChange={handleChange}
          required
          placeholder="WP Admin Username"
          className="font-inter"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-foreground/80 font-inter">
          Application Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={handleChange}
          required
          placeholder="Application Password"
          className="font-inter"
        />
      </div>

      {/* WordPress Requirements Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
        <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-amber-900 font-inter font-semibold mb-1">
            WordPress Requirements
          </p>
          <p className="text-xs text-amber-800 font-inter leading-relaxed">
            Application Passwords are only available on{" "}
            <span className="font-semibold">self-hosted WordPress</span>{" "}
            (WordPress.org) or{" "}
            <span className="font-semibold">WordPress.com Business plan</span>{" "}
            and above. Free, Personal, and Premium plans do not support
            Application Passwords.
          </p>
        </div>
      </div>
    </>
  );
}
