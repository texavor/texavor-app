import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface HashnodeFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function HashnodeForm({ formData, handleChange }: HashnodeFormProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="token" className="text-foreground/80 font-inter">
          Personal Access Token
        </Label>
        <Input
          id="token"
          name="token"
          value={formData.token || ""}
          onChange={handleChange}
          required
          placeholder="Your Hashnode PAT"
          className="font-inter"
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="publication_id"
          className="text-foreground/80 font-inter"
        >
          Publication ID
        </Label>
        <Input
          id="publication_id"
          name="publication_id"
          value={formData.publication_id || ""}
          onChange={handleChange}
          required
          placeholder="Your Publication ID"
          className="font-inter"
        />
      </div>
    </>
  );
}
