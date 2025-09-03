import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/api';

export type User = {
  name: string;
  email: string;
  roles: string[];
};

const INITIAL_USER: User = { name: '', email: '', roles: [] };

type MemberLogin = { username: string; password: string };

type AuthState = {
  user: User;
  setUser: (u: User) => void;
  updateUser: (patch: Partial<User>) => void;
  reset: () => void;

  login: (member: MemberLogin) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: INITIAL_USER,

      // 상태 조작
      setUser: (u) => set({ user: { ...u } }),
      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      reset: () => set({ user: INITIAL_USER }),

      // 액션
      login: async (member) => {
        await api.post('/api/auth/login', member, { withCredentials: true });
        await useAuthStore.getState().fetchUser();
      },

      fetchUser: async () => {
        const { data } = await api.get<User>('/api/auth/me', {
          withCredentials: true,
        });
        set({ user: data });
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout', null, { withCredentials: true });
        } finally {
          set({ user: INITIAL_USER });
        }
      },
    }),
    {
      name: 'auth', // localStorage key
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
