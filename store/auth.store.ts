import { create } from "zustand";
import Cookies from "js-cookie";
import { login, fetchCurrentUser, logout, refreshAccessToken } from "@/services/auth.service";
import { IUser, UserRoleType } from "@/types/prisma-generated";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/constants";

interface AuthState {
    auth: {
        user: IUser | null;
        isLoading: boolean;
        accessToken?: string | null;
        refreshToken?: string | null;
        hasRole: (roles: UserRoleType[]) => boolean;
        login: (params: { phoneNumber?: string; email?: string; password: string }) => Promise<void>;
        setUser: (user: IUser | null) => void;
        logout: () => Promise<void>;
        fetchUser: () => Promise<void>;
        handlRefreshToken: () => Promise<void>;
        reset: () => void;
    };
}

export const useAuthStore = create<AuthState>((set) => ({
    auth: {
        user: null,
        isLoading: true,
        accessToken: Cookies.get(ACCESS_TOKEN) || null,
        refreshToken: Cookies.get(REFRESH_TOKEN) || null,

        hasRole: (roles: UserRoleType[]): boolean => {
            const user: IUser | null = useAuthStore.getState().auth.user;
            if (!user) return false;
            return roles.includes(user.role);
        },

        setUser: (user) => set((state) => ({ ...state, auth: { ...state.auth, user, isLoading: false } })),

        reset: () => set((state) => ({ ...state, auth: { ...state.auth, user: null, isLoading: false, accessToken: null, refreshToken: null } })),

        login: async ({ phoneNumber, email, password }) => {
            try {
                const { accessToken, refreshToken, data: user } = await login({ phoneNumber, email, password });
                Cookies.set(ACCESS_TOKEN, accessToken);
                Cookies.set(REFRESH_TOKEN, refreshToken);
                set((state) => ({ ...state, auth: { ...state.auth, user, accessToken, refreshToken, isLoading: false } }));
            } catch (error) {
                console.error("Login failed", error);
                throw error;
            }
        },

        logout: async () => {
            try {
                await logout();
                Cookies.remove(ACCESS_TOKEN);
                Cookies.remove(REFRESH_TOKEN);
                set((state) => ({ ...state, auth: { ...state.auth, user: null, isLoading: false, accessToken: null, refreshToken: null } }));
            } catch (error) {
                console.error("Logout failed", error);
                throw error;
            }
        },

        fetchUser: async () => {
            try {
                const { data } = await fetchCurrentUser();
                set((state) => ({ ...state, auth: { ...state.auth, user: data, isLoading: false } }));
            } catch (error) {
                console.error("Failed to fetch user", error);
                Cookies.remove(ACCESS_TOKEN);
                Cookies.remove(REFRESH_TOKEN);
                set((state) => ({ ...state, auth: { ...state.auth, isLoading: false, user: null, accessToken: null, refreshToken: null } }));
                throw error;
            }
        },

        handlRefreshToken: async () => {
            try {
                const { accessToken } = await refreshAccessToken();
                Cookies.set(ACCESS_TOKEN, accessToken);
                set((state) => ({ ...state, auth: { ...state.auth, accessToken, isLoading: false } }));
            } catch (error) {
                console.error("Failed to refresh access token", error);
                Cookies.remove(ACCESS_TOKEN);
                Cookies.remove(REFRESH_TOKEN);
                set((state) => ({ ...state, auth: { ...state.auth, user: null, accessToken: null, refreshToken: null } }));
                throw error;
            }
        },
    },
}));
