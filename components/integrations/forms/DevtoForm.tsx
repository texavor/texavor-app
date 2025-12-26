import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface DevtoFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DevtoForm({ formData, handleChange }: DevtoFormProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="api_key" className="text-foreground/80 font-inter">
        API Key
      </Label>
      <Input
        id="api_key"
        name="api_key"
        value={formData.api_key || ""}
        onChange={handleChange}
        required
        placeholder="Your Dev.to API Key"
        className="font-inter"
      />
    </div>
  );
}
