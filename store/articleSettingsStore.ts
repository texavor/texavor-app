import { create } from "zustand";

export interface ArticleDetails {
  id?: string;
  title: string;
  content: string;
  slug: string;
  canonical_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  scheduled_at: string | null;
  published_at: string | null;
  author_id: string | null;
  tags: string[];
  categories: string[];
  key_phrases: string[];
  key_phrases: string[];
  article_publications: string[];
  platform_settings?: Record<string, any>;
}

interface ArticleSettingsState {
  formData: ArticleDetails;
  platformSettings: Record<string, any>;
  publishMode: "publish" | "schedule";
  isInitialized: boolean;

  // Actions
  initialize: (data: ArticleDetails) => void;
  setFormData: (
    updater:
      | Partial<ArticleDetails>
      | ((prev: ArticleDetails) => Partial<ArticleDetails>)
  ) => void;
  setPlatformSettings: (
    updater:
      | Record<string, any>
      | ((prev: Record<string, any>) => Record<string, any>)
  ) => void;
  setPublishMode: (mode: "publish" | "schedule") => void;
  reset: () => void;
}

const defaultFormData: ArticleDetails = {
  title: "",
  content: "",
  slug: "",
  canonical_url: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  scheduled_at: null,
  published_at: null,
  author_id: null,
  tags: [],
  categories: [],
  key_phrases: [],
  article_publications: [],
};

export const useArticleSettingsStore = create<ArticleSettingsState>((set) => ({
  formData: defaultFormData,
  platformSettings: {},
  publishMode: "publish",
  isInitialized: false,

  initialize: (data) =>
    set((state) => {
      // If already initialized for this ID, don't overwrite?
      // User wants persistence only while on page.
      // We will assume 'initialize' is called wisely by the consumer.
      return {
        formData: { ...defaultFormData, ...data },
        platformSettings: data.platform_settings || {},
        publishMode: data.scheduled_at ? "schedule" : "publish",
        isInitialized: true,
      };
    }),

  setFormData: (updater) =>
    set((state) => {
      const newData =
        typeof updater === "function" ? updater(state.formData) : updater;
      return { formData: { ...state.formData, ...newData } };
    }),

  setPlatformSettings: (updater) =>
    set((state) => {
      const newSettings =
        typeof updater === "function"
          ? updater(state.platformSettings)
          : updater;
      return {
        platformSettings: { ...state.platformSettings, ...newSettings },
      };
    }),

  setPublishMode: (mode) => set({ publishMode: mode }),

  reset: () =>
    set({
      formData: defaultFormData,
      platformSettings: {},
      publishMode: "publish",
      isInitialized: false,
    }),
}));
