// src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Definimos a "forma" do nosso store (o que ele guarda)
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;  // Função para salvar o token
  clearToken: () => void; // Função para limpar o token (logout)
}

// 2. Criamos o store global
export const useAuthStore = create<AuthState>()(
  // 3. Usamos o "persist" middleware
  persist(
    (set) => ({
      // 4. Valor inicial
      token: null,
      
      // 5. Função que salva o token no estado e no localStorage
      setToken: (newToken) => set({ token: newToken }),
      
      // 6. Função que limpa o estado e o localStorage
      clearToken: () => set({ token: null }),
    }),
    {
      // 7. Configuração da persistência
      name: 'auth-storage', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage), // (Opcional) Define localStorage
    }
  )
);