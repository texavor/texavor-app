import { create } from "zustand";

interface AppState {
  user: any | null;
  blogs: any;
  mainLoading: any;
  setUser: (user: any) => void;
  setBlogs: (blogs: any[]) => void;
  setMainLoading: (mainLoading: any) => void;
  addBlog: (blog: any) => void;
  clear: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  blogs: [],
  mainLoading: true,
  setMainLoading: (mainLoading) => set({ mainLoading }),
  setUser: (user) => set({ user }),
  setBlogs: (blogs) => set({ blogs }),
  addBlog: (blog) => set((state) => ({ blogs: [...state.blogs, blog] })),
  clear: () => set({ user: null, blogs: [] }),
}));
