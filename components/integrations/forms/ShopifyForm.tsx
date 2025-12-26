import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface ShopifyFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ShopifyForm({ formData, handleChange }: ShopifyFormProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="shop_domain" className="text-foreground/80 font-inter">
          Shop Domain
        </Label>
        <Input
          id="shop_domain"
          name="shop_domain"
          value={formData.shop_domain || ""}
          onChange={handleChange}
          required
          placeholder="your-store.myshopify.com"
          className="font-inter"
        />
        <p className="text-[11px] text-muted-foreground">
          Enter your Shopify store domain (e.g., yourstore.myshopify.com)
        </p>
      </div>
    </>
  );
}
