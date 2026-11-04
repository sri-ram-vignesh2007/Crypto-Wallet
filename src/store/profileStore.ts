// src/store/profileStore.ts

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'profile_data_v1';

interface ProfileState {
  email: string;
  name: string;
  avatar: string;
  isEmailVerified: boolean;
  hasCompletedOnboarding: boolean;  // persisted: has user ever completed initial onboarding?
  isSignedIn: boolean;              // NOT persisted — resets to false on every cold launch.

  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setEmailVerified: (verified: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setSignedIn: (signedIn: boolean) => void;
  signOut: () => void;
  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  email: '',
  name: '',
  avatar: 'U',
  isEmailVerified: false,
  hasCompletedOnboarding: false,
  // Always starts false — sign-in is required on every app launch.
  isSignedIn: false,

  setEmail: (email) => set({ email }),
  setName: (name) => set({ name }),
  setAvatar: (avatar) => set({ avatar }),
  setEmailVerified: (isEmailVerified) => set({ isEmailVerified }),

  setOnboardingComplete: (hasCompletedOnboarding) => {
    set({ hasCompletedOnboarding });
    setTimeout(() => get().saveProfile(), 0);
  },

  setSignedIn: (isSignedIn) => set({ isSignedIn }),

  signOut: () => {
    // Sign out keeps the persisted profile (so welcome screen knows the user
    // has completed onboarding before), but forces re-authentication next launch.
    set({ isSignedIn: false });
  },

  loadProfile: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        // NOTE: isSignedIn is deliberately NOT loaded from storage.
        set({
          email: data.email || '',
          name: data.name || '',
          avatar: data.avatar || 'U',
          isEmailVerified: data.isEmailVerified || false,
          hasCompletedOnboarding: data.hasCompletedOnboarding || false,
        });
      }
    } catch (e) {
      console.log('No profile found');
    }
  },

  saveProfile: async () => {
    try {
      const state = get();
      // isSignedIn is intentionally NOT persisted.
      const data = {
        email: state.email,
        name: state.name,
        avatar: state.avatar,
        isEmailVerified: state.isEmailVerified,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save profile');
    }
  },

  reset: () => {
    set({
      email: '',
      name: '',
      avatar: 'U',
      isEmailVerified: false,
      hasCompletedOnboarding: false,
      isSignedIn: false,
    });
    setTimeout(async () => {
      try { await AsyncStorage.removeItem(STORAGE_KEY); }
      catch (e) { console.log('Failed to clear persisted profile'); }
    }, 0);
  },
}));
