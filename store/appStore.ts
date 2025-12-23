import { create } from "zustand";

interface AppState {
  user: any | null;
  blogs: any;
  mainLoading: any;
  zenMode: boolean;
  setUser: (user: any) => void;
  setBlogs: (blogs: any[]) => void;
  setMainLoading: (mainLoading: any) => void;
  addBlog: (blog: any) => void;
  toggleZenMode: () => void;
  clear: () => void;
  teams: any[];
  currentTeam: any | null;
  teamMembers: any[];
  setTeams: (teams: any[]) => void;
  setCurrentTeam: (team: any) => void;
  setTeamMembers: (members: any[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  blogs: [],
  mainLoading: true,
  zenMode: false,
  teams: [],
  currentTeam: null,
  setMainLoading: (mainLoading) => set({ mainLoading }),
  setUser: (user) => set({ user }),
  setBlogs: (blogs) => set({ blogs }),
  addBlog: (blog: any) => set((state) => ({ blogs: [...state.blogs, blog] })),
  toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
  setTeams: (teams) => set({ teams }),
  setCurrentTeam: (currentTeam) => set({ currentTeam }),
  teamMembers: [],
  setTeamMembers: (teamMembers) => set({ teamMembers }),
  clear: () =>
    set({
      user: null,
      blogs: [],
      zenMode: false,
      teams: [],
      currentTeam: null,
      teamMembers: [],
    }),
}));
