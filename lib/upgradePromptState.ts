// Global state for upgrade prompt
// This allows the axios interceptor to trigger the upgrade prompt from anywhere in the app

import { UpgradePromptData } from "@/app/(dashboard)/settings/types";

type UpgradePromptCallback = (data: UpgradePromptData) => void;

let upgradePromptCallback: UpgradePromptCallback | null = null;

export const setUpgradePromptCallback = (callback: UpgradePromptCallback) => {
  upgradePromptCallback = callback;
};

export const triggerUpgradePrompt = (data: UpgradePromptData) => {
  if (upgradePromptCallback) {
    upgradePromptCallback(data);
  }
};
