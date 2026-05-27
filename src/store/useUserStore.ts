import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Usuario {
  nombre: string;
  telefono: string;
  email: string;
  isAdmin?: boolean;
}

interface UserState {
  usuario: Usuario | null;
  setUsuario: (user: Usuario) => void;
  borrarUsuario: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      usuario: null,
      setUsuario: (user) => set({ usuario: user }),
      borrarUsuario: () => set({ usuario: null }),
    }),
    { name: 'lingote-user-profile-v3' }
  )
);
