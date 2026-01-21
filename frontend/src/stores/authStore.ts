/**
 * 认证状态管理 (Zustand)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { TOKEN_KEY } from '../config';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: User, token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoggedIn: false,
            isLoading: true,

            setUser: (user, token) => {
                localStorage.setItem(TOKEN_KEY, token);
                set({ user, token, isLoggedIn: true, isLoading: false });
            },

            logout: () => {
                localStorage.removeItem(TOKEN_KEY);
                set({ user: null, token: null, isLoggedIn: false, isLoading: false });
            },

            setLoading: (isLoading) => set({ isLoading }),

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: 'chezi-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isLoggedIn: state.isLoggedIn,
            }),
        }
    )
);
