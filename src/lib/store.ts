import { create } from 'zustand';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updatePassword: async (newPassword) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));