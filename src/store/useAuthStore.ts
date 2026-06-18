import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { neonAuth } from '@/lib/neonAuth';
import { API_BASE_URL } from '@/lib/config';

export type UserRole = 'FARMER' | 'BUYER' | 'EXPORTER' | 'ADMIN';

export interface UserInfo {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  companyName?: string;
  city?: string;
  country?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  companyName?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithNeon: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  registerWithNeon: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || 'Login failed. Please verify your credentials.');
          }

          const { userId, role, accessToken, refreshToken } = result.data;
          
          // Store token in localStorage for helpers
          if (typeof window !== 'undefined') {
            localStorage.setItem('mandiprime_token', accessToken);
            localStorage.setItem('mandiprime_refresh_token', refreshToken);
          }

          set({
            user: { id: userId, email, role },
            accessToken,
            refreshToken,
            error: null,
          });

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'An error occurred during login.';
          set({ error: message });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      loginWithNeon: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const result = await neonAuth.signIn.email({
            email,
            password,
          });

          if (result.error) {
            throw new Error(result.error.message || 'Neon authentication failed.');
          }

          const userObj = result.data?.user;
          if (!userObj) {
            throw new Error('No user data returned from Neon Auth.');
          }

          const mockAccessToken = 'neon_session_' + Math.random().toString(36).substring(2);
          const mockRefreshToken = 'neon_refresh_' + Math.random().toString(36).substring(2);

          if (typeof window !== 'undefined') {
            localStorage.setItem('mandiprime_token', mockAccessToken);
            localStorage.setItem('mandiprime_refresh_token', mockRefreshToken);
          }

          // Assign ADMIN role to admin email, default BUYER for others
          const assignedRole = (userObj.email.toLowerCase() === 'odhumkekar@gmail.com' ? 'ADMIN' : 'BUYER') as UserRole;

          set({
            user: { id: userObj.id, email: userObj.email, role: assignedRole, fullName: userObj.name || undefined },
            accessToken: mockAccessToken,
            refreshToken: mockRefreshToken,
            error: null,
          });

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'An error occurred during Neon login.';
          set({ error: message });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      register: async (payload: RegisterPayload) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || 'Registration failed.');
          }

          const { userId, email, role, accessToken, refreshToken } = result.data;

          if (typeof window !== 'undefined') {
            localStorage.setItem('mandiprime_token', accessToken);
            localStorage.setItem('mandiprime_refresh_token', refreshToken);
          }

          set({
            user: { id: userId, email, role, fullName: payload.fullName },
            accessToken,
            refreshToken,
            error: null,
          });

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'An error occurred during registration.';
          set({ error: message });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      registerWithNeon: async (payload: RegisterPayload) => {
        set({ loading: true, error: null });
        try {
          const result = await neonAuth.signUp.email({
            email: payload.email,
            password: payload.password || 'password123',
            name: payload.fullName || '',
          });

          if (result.error) {
            throw new Error(result.error.message || 'Neon registration failed.');
          }

          const userObj = result.data?.user;
          if (!userObj) {
            throw new Error('No user data returned from Neon Auth registration.');
          }

          const mockAccessToken = 'neon_session_' + Math.random().toString(36).substring(2);
          const mockRefreshToken = 'neon_refresh_' + Math.random().toString(36).substring(2);

          if (typeof window !== 'undefined') {
            localStorage.setItem('mandiprime_token', mockAccessToken);
            localStorage.setItem('mandiprime_refresh_token', mockRefreshToken);
          }

          set({
            user: {
              id: userObj.id,
              email: userObj.email,
              role: payload.role,
              fullName: userObj.name || undefined,
            },
            accessToken: mockAccessToken,
            refreshToken: mockRefreshToken,
            error: null,
          });

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'An error occurred during Neon registration.';
          set({ error: message });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        const token = get().refreshToken;
        set({ loading: true });
        
        // Remove local tokens immediately
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mandiprime_token');
          localStorage.removeItem('mandiprime_refresh_token');
        }

        try {
          if (token) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken: token }),
            });
          }
        } catch (err) {
          console.error('Logout error on backend:', err);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            error: null,
            loading: false,
          });
        }
      },
    }),
    {
      name: 'mandiprime-auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
