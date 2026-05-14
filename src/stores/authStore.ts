import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AUTH_TOKEN_KEY } from '../lib/apiClient';
import type { AppUser } from '../types/auth';

type AuthSession = {
  user: AppUser;
  token: string;
};

type AuthState = {
  // PARAM FOR GLOBAL STATE
  user: AppUser | null;
  token: string | null;

  // ACTION FOR AUTH STATE
  actionSetUser: (user: AppUser) => void;
  actionSetToken: (token: string) => void;
  actionSetSession: (session: AuthSession) => void;
  actionClearAuth: () => void;
  actionLogout: () => void;
};

const authStore: StateCreator<AuthState> = (set, get) => ({
  // PARAM FOR GLOBAL STATE
  user: null,
  token: null,

  // ACTION FOR AUTH STATE
  actionSetUser: (user) => {
    set({ user: user });
  },

  actionSetToken: (token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    set({ token: token });
  },

  actionSetSession: (session) => {
    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    set({
      user: session.user,
      token: session.token,
    });
  },

  actionClearAuth: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    set({
      user: null,
      token: null,
    });
  },

  actionLogout: () => {
    get().actionClearAuth();
  },
});

const usePersist = {
  name: 'project-auth-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state: AuthState) => ({
    user: state.user,
    token: state.token,
  }),
};

export const useAuthStore = create<AuthState>()(persist(authStore, usePersist));
