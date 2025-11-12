// src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


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