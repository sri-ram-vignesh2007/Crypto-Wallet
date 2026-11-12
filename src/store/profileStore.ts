// src/store/profileStore.ts

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'profile_data_v1';

interface ProfileState {
  email: string;
  name: string;
  username: string;
  avatar: string;
  googleAccount: string;
  isGoogleVerified: boolean;
  country: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  hasCompletedOnboarding: boolean;  // persisted: has user completed initial onboarding?
  isSignedIn: boolean;
  showPortfolioBalance: boolean;
  allowPublicPortfolio: boolean;
  allowDirectMessages: boolean;
  isBiometricEnabled: boolean;

  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setUsername: (username: string) => void;
  setAvatar: (avatar: string) => void;
  setGoogleVerified: (googleEmail: string, verified?: boolean) => void;
  setCountry: (country: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  updatePersonalDetails: (data: {
    name: string;
    username: string;
    email: string;
    googleAccount?: string;
    country?: string;
    phoneNumber?: string;
  }) => void;
  setEmailVerified: (verified: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setSignedIn: (signedIn: boolean) => void;
  setShowPortfolioBalance: (show: boolean) => void;
  setAllowPublicPortfolio: (allow: boolean) => void;
  setAllowDirectMessages: (allow: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  signOut: () => void;
  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  email: '',
  name: '',
  username: '',
  avatar: 'U',
  googleAccount: '',
  isGoogleVerified: false,
  country: 'India 🇮🇳',
  phoneNumber: '',
  isEmailVerified: false,
  hasCompletedOnboarding: false,
  isSignedIn: false,
  showPortfolioBalance: true,
  allowPublicPortfolio: true,
  allowDirectMessages: true,
  isBiometricEnabled: true,

  setEmail: (email) => set({ email }),
  setName: (name) => {
    set({ name });
    setTimeout(() => get().saveProfile(), 0);
  },
  setUsername: (username) => {
    set({ username });
    setTimeout(() => get().saveProfile(), 0);
  },
  setAvatar: (avatar) => {
    set({ avatar });
    setTimeout(() => get().saveProfile(), 0);
  },
  setGoogleVerified: (googleAccount, verified = true) => {
    set({ googleAccount, isGoogleVerified: verified, email: googleAccount });
    setTimeout(() => get().saveProfile(), 0);
  },
  setCountry: (country) => {
    set({ country });
    setTimeout(() => get().saveProfile(), 0);
  },
  setPhoneNumber: (phoneNumber) => {
    set({ phoneNumber });
    setTimeout(() => get().saveProfile(), 0);
  },
  updatePersonalDetails: (data) => {
    set({
      name: data.name,
      username: data.username,
      email: data.email,
      googleAccount: data.googleAccount || get().googleAccount,
      country: data.country || get().country,
      phoneNumber: data.phoneNumber || get().phoneNumber,
      isGoogleVerified: data.googleAccount ? true : get().isGoogleVerified,
      avatar: (data.name ? data.name.charAt(0).toUpperCase() : 'U'),
    });
    setTimeout(() => get().saveProfile(), 0);
  },
  setEmailVerified: (isEmailVerified) => set({ isEmailVerified }),
  setShowPortfolioBalance: (showPortfolioBalance) => {
    set({ showPortfolioBalance });
    setTimeout(() => get().saveProfile(), 0);
  },
  setAllowPublicPortfolio: (allowPublicPortfolio) => {
    set({ allowPublicPortfolio });
    setTimeout(() => get().saveProfile(), 0);
  },
  setAllowDirectMessages: (allowDirectMessages) => {
    set({ allowDirectMessages });
    setTimeout(() => get().saveProfile(), 0);
  },
  setBiometricEnabled: (isBiometricEnabled) => {
    set({ isBiometricEnabled });
    setTimeout(() => get().saveProfile(), 0);
  },

  setOnboardingComplete: (hasCompletedOnboarding) => {
    set({ hasCompletedOnboarding });
    setTimeout(() => get().saveProfile(), 0);
  },

  setSignedIn: (isSignedIn) => set({ isSignedIn }),

  signOut: () => {
    set({ isSignedIn: false });
  },

  loadProfile: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          email: data.email || '',
          name: data.name || '',
          username: data.username || '',
          avatar: data.avatar || 'U',
          googleAccount: data.googleAccount || '',
          isGoogleVerified: data.isGoogleVerified || false,
          country: data.country || 'India 🇮🇳',
          phoneNumber: data.phoneNumber || '',
          isEmailVerified: data.isEmailVerified || false,
          hasCompletedOnboarding: data.hasCompletedOnboarding || false,
          showPortfolioBalance: data.showPortfolioBalance !== undefined ? data.showPortfolioBalance : true,
          allowPublicPortfolio: data.allowPublicPortfolio !== undefined ? data.allowPublicPortfolio : true,
          allowDirectMessages: data.allowDirectMessages !== undefined ? data.allowDirectMessages : true,
          isBiometricEnabled: data.isBiometricEnabled !== undefined ? data.isBiometricEnabled : true,
        });
      }
    } catch (e) {
      console.log('No profile found');
    }
  },

  saveProfile: async () => {
    try {
      const state = get();
      const data = {
        email: state.email,
        name: state.name,
        username: state.username,
        avatar: state.avatar,
        googleAccount: state.googleAccount,
        isGoogleVerified: state.isGoogleVerified,
        country: state.country,
        phoneNumber: state.phoneNumber,
        isEmailVerified: state.isEmailVerified,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        showPortfolioBalance: state.showPortfolioBalance,
        allowPublicPortfolio: state.allowPublicPortfolio,
        allowDirectMessages: state.allowDirectMessages,
        isBiometricEnabled: state.isBiometricEnabled,
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
      username: '',
      avatar: 'U',
      isEmailVerified: false,
      hasCompletedOnboarding: false,
      isSignedIn: false,
      showPortfolioBalance: true,
      allowPublicPortfolio: true,
      allowDirectMessages: true,
      isBiometricEnabled: true,
    });
    setTimeout(async () => {
      try { await AsyncStorage.removeItem(STORAGE_KEY); }
      catch (e) { console.log('Failed to clear persisted profile'); }
    }, 0);
  },
}));
