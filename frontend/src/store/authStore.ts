import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  onboardingCompleted?: boolean;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // saves to local storage
    }
  )
);
