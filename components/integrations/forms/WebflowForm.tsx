import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface WebflowFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WebflowForm({ formData, handleChange }: WebflowFormProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="token" className="text-foreground/80 font-inter">
          API Token
        </Label>
        <Input
          id="token"
          name="token"
          value={formData.token || ""}
          onChange={handleChange}
          required
          placeholder="Your Webflow API Token"
          className="font-inter"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="site_id" className="text-foreground/80 font-inter">
          Site ID
        </Label>
        <Input
          id="site_id"
          name="site_id"
          value={formData.site_id || ""}
          onChange={handleChange}
          required
          placeholder="Your Webflow Site ID"
          className="font-inter"
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="collection_id"
          className="text-foreground/80 font-inter"
        >
          Collection ID
        </Label>
        <Input
          id="collection_id"
          name="collection_id"
          value={formData.collection_id || ""}
          onChange={handleChange}
          required
          placeholder="Your Collection ID"
          className="font-inter"
        />
      </div>
    </>
  );
}
