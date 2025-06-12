import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUserSession: () => void;
  updateUsername: (newUsername: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true, // Set to true, checkUserSession will set to false
  error: null,
  setUser: (user) => set({ user }),
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // Password is not validated here, just stored for potential future use or compatibility.
      // Ensure username is not accidentally overwritten if it exists from a previous session
      const existingUserString = localStorage.getItem('user');
      let username;
      if (existingUserString) {
        const existingUser = JSON.parse(existingUserString);
        if (existingUser.email === email) { // only preserve username if email matches
          username = existingUser.username;
        }
      }
      const userData: User = { id: email, email, username: username || undefined };
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ error: `Failed to sign in: ${errorMessage}`, loading: false });
    }
  },
  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // Password is not used here but kept for signature compatibility.
      const userData = { id: email, email };
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ error: `Failed to sign up: ${errorMessage}`, loading: false });
    }
  },
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      localStorage.removeItem('user');
      set({ user: null, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ error: `Failed to sign out: ${errorMessage}`, loading: false });
    }
  },
  checkUserSession: () => {
    // No need to set loading: true here as it's synchronous for the store's perspective
    // and App.tsx will handle initial loading state if needed.
    // Or, if we want the store to manage its own loading for this:
    set({ loading: true, error: null }); 
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        set({ user: JSON.parse(storedUser), loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (e) {
      console.error('Error loading user from local storage', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      set({ user: null, loading: false, error: `Failed to load session: ${errorMessage}` });
    }
  },
  updateUsername: (newUsername: string) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, username: newUsername };
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return { user: updatedUser, error: null };
        } catch (error) {
          console.error('Failed to save updated user to localStorage', error);
          return { error: 'Failed to update username in localStorage' };
        }
      }
      return {}; // No change if user is null
    });
  },
}));