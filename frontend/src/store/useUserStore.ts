import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  user_rank: string;
  exp: number;
  current_level: number;
  is_admin?: number;
  bio?: string;
  location?: string;
}

interface UserState {
  user: User | null;
  role: 'client' | 'expert' | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setRole: (role: 'client' | 'expert' | null) => void;
  setToken: (token: string | null) => void;
  updateStats: (newExp: number, newLevel: number, newRank: string) => void;
  updateProfile: (data: Partial<User>) => void;
  isAdmin: () => boolean;
  switchRole: (newRole: 'client' | 'expert') => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      token: null,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setToken: (token) => set({ token }),

      updateStats: (newExp, newLevel, newRank) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({
          user: {
            ...currentUser,
            exp: newExp,
            current_level: newLevel,
            user_rank: newRank
          }
        });
      },

      updateProfile: (data) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ user: { ...currentUser, ...data } });
      },

      isAdmin: () => {
        const user = get().user;
        return user?.is_admin === 1;
      },

      switchRole: (newRole) => {
        const currentUser = get().user;
        if (!currentUser || currentUser.is_admin !== 1) return;
        set({ 
          role: newRole,
          user: { ...currentUser, role: newRole }
        });
      },

      logout: () => {
        set({ user: null, role: null, token: null });
        localStorage.removeItem('skilldash-session');
      },
    }),
    { name: 'skilldash-session' }
  )
);