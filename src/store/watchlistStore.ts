// src/store/watchlistStore.ts - Persistent Watchlist Store for Cura Wallet

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_STORAGE_KEY = '@cura_wallet_watchlist_v1';

interface WatchlistState {
  watchlist: string[];
  isLoaded: boolean;
  loadWatchlist: () => Promise<void>;
  toggleWatchlist: (symbol: string) => Promise<boolean>;
  isWatched: (symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: ['BTC', 'ETH', 'SOL', 'BNB', 'USDC'],
  isLoaded: false,

  loadWatchlist: async () => {
    try {
      const data = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          set({ watchlist: parsed, isLoaded: true });
          return;
        }
      }
      set({ isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  toggleWatchlist: async (symbol: string) => {
    const sym = symbol.toUpperCase();
    const current = get().watchlist;
    let next: string[];
    let isNowWatched = false;

    if (current.includes(sym)) {
      next = current.filter(s => s !== sym);
      isNowWatched = false;
    } else {
      next = [...current, sym];
      isNowWatched = true;
    }

    set({ watchlist: next });
    try {
      await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
    } catch {}

    return isNowWatched;
  },

  isWatched: (symbol: string) => {
    return get().watchlist.includes(symbol.toUpperCase());
  },
}));

