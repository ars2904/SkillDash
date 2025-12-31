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
}

interface UserState {
  user: User | null;
  role: 'client' | 'expert' | null;
  setUser: (user: User | null) => void;
  setRole: (role: 'client' | 'expert' | null) => void;
  updateStats: (newExp: number, newLevel: number, newRank: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      
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

      logout: () => {
        set({ user: null, role: null });
        localStorage.removeItem('skilldash-session');
      },
    }),
    { name: 'skilldash-session' }
  )
);