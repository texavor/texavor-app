import { create } from "zustand";
import { SmartLinksData } from "@/hooks/useSmartLinking";

interface SmartLinkState {
  data: SmartLinksData | null;
  isLoading: boolean;
  isError: boolean;
  setData: (data: SmartLinksData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (isError: boolean) => void;
  reset: () => void;
}

export const useSmartLinkStore = create<SmartLinkState>((set) => ({
  data: null,
  isLoading: false,
  isError: false,
  setData: (data) => set({ data }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (isError) => set({ isError }),
  reset: () => set({ data: null, isLoading: false, isError: false }),
}));
