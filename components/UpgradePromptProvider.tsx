"use client";

import { useEffect, useState } from "react";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { UpgradePromptData } from "@/app/(dashboard)/settings/types";
import { setUpgradePromptCallback } from "@/lib/upgradePromptState";

export function UpgradePromptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [promptData, setPromptData] = useState<UpgradePromptData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Register the callback to show the upgrade prompt
    setUpgradePromptCallback((data: UpgradePromptData) => {
      setPromptData(data);
      setIsOpen(true);
    });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setPromptData(null);
  };

  return (
    <>
      {children}
      {promptData && (
        <UpgradePrompt
          open={isOpen}
          onClose={handleClose}
          message={promptData.message}
          currentUsage={promptData.current_usage}
          limit={promptData.limit}
          suggestedTier={promptData.suggested_tier}
          required={promptData.required}
          available={promptData.available}
        />
      )}
    </>
  );
}
