import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const secureStorage: StateStorage = {
  getItem: async (key) => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      const value = await AsyncStorage.getItem(key);
      return value;
    }
  },
  setItem: async (key, value) => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};


interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  isHydrated: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
  updateUser: (user: any) => void;

  setIsChecking: (state: boolean) => void;
  setIsAuthenticated: (state: boolean) => void;
  setIsHydrated: (state: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isChecking: true,
      isHydrated: false,

      login: (user, token) => {
        let userData = { ...user };

        // Match web app's fallback: decode role from token if missing
        if (!userData.role && token) {
          try {
            const decoded: any = jwtDecode(token);
            if (decoded.role) {
              userData.role = decoded.role;
            }
          } catch (e) {
            console.error("Failed to decode token for role:", e);
          }
        }

        set({ user: userData, token, isAuthenticated: true, isChecking: false });
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isChecking: false,
        }),

      updateUser: (user) => set({ user }),

      setIsChecking: (state: boolean) => set({ isChecking: state }),
      setIsAuthenticated: (state: boolean) => set({ isAuthenticated: state }),
      setIsHydrated: (state: boolean) => set({ isHydrated: state }),
    }),
    {
      name: "auth-ilife-learn",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setIsHydrated(true);
          state.setIsChecking(false);
          if (state.user && state.token) {
            state.setIsAuthenticated(true);
          }
        }
      },
    },
  ),
);

export default useAuthStore;
