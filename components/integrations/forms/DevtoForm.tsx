import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { CustomMultiSelect } from "@/components/ui/CustomMultiSelect";

interface DevtoFormProps {
  formData: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  discovered?: {
    organizations?: any[];
    series?: string[];
    tags?: string[];
  };
  showCredentials?: boolean;
}

export function DevtoForm({
  formData,
  handleChange,
  discovered,
  showCredentials = true,
}: DevtoFormProps) {
  return (
    <div className="space-y-4">
      {showCredentials && (
        <div className="space-y-1.5">
          <Label htmlFor="api_key" className="text-foreground/80 font-inter">
            API Key
          </Label>
          <Input
            id="api_key"
            name="api_key"
            value={formData.api_key || ""}
            onChange={handleChange}
            required={!formData.api_key}
            placeholder="Your Dev.to API Key"
            className="font-inter"
            // If we have discovered data, it means we are connected, so API key is likely set/masked.
            // But user might want to change it.
          />
        </div>
      )}
    </div>
  );
}
