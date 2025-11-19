// src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Article } from '../interface';


interface AuthState {
  token: string | null;
  setToken: (token: string) => void; 
  clearToken: () => void; 
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (newToken) => set({ token: newToken }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);


interface ArticleState {
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  hasLoaded: boolean; // Para saber se já fizemos o fetch inicial alguma vez
  setHasLoaded: (status: boolean) => void;
}

export const useArticleStore = create<ArticleState>((set) => ({
  articles: [],
  hasLoaded: false,
  setArticles: (articles) => set({ articles }),
  setHasLoaded: (status) => set({ hasLoaded: status }),
}));