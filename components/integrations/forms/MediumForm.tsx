import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface MediumFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MediumForm({ formData, handleChange }: MediumFormProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="token" className="text-foreground/80 font-inter">
          Integration Token
        </Label>
        <Input
          id="token"
          name="token"
          value={formData.token || ""}
          onChange={handleChange}
          required
          placeholder="Your Medium Integration Token"
          className="font-inter"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="user_id" className="text-foreground/80 font-inter">
          User ID <span className="text-gray-400">(Optional)</span>
        </Label>
        <Input
          id="user_id"
          name="user_id"
          value={formData.user_id || ""}
          onChange={handleChange}
          placeholder="Optional User ID"
          className="font-inter"
        />
      </div>
    </>
  );
}
