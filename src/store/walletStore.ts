// src/store/walletStore.ts
// MULTI-CHAIN WALLET STATE — supports ALL chains and ALL tokens

import { create } from 'zustand';
import { WalletManager } from '../core/WalletManager';
import { rpcManager } from '../core/RPCManager';
import { Token } from '../core/ChainConfig';

export interface TokenBalance {
  token: Token;
  balance: string;
  valueUsd: number;
}

interface WalletState {
  address: string | null;
  selectedChain: string;
  balance: string;              // Native token balance (for backward compat)
  balances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  hasWallet: boolean;
  totalValueUsd: number;

  setSelectedChain: (chain: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  loadWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  createWallet: () => Promise<{ address: string; warning: string }>;
  importWallet: (mnemonic: string) => Promise<{ address: string }>;
  sendCrypto: (
    toAddress: string,
    amount: string,
    token?: Token
  ) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  resetWallet: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  selectedChain: 'ethereum',
  balance: '0',
  balances: [],
  isLoading: false,
  error: null,
  hasWallet: false,
  totalValueUsd: 0,

  setSelectedChain: (selectedChain) => {
    set({ selectedChain });
    get().refreshBalances();
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  loadWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const exists = await WalletManager.hasWallet();
      set({ hasWallet: exists });

      if (exists) {
        const address = await WalletManager.getReceiveAddress();
        set({ address });
        if (address) {
          await get().refreshBalances();
        }
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshBalances: async () => {
    const { address, selectedChain } = get();
    if (!address) return;

    set({ isLoading: true });
    try {
      const allBalances = await rpcManager.getAllBalances(address, selectedChain);
      
      // Mock USD prices — in production, fetch from CoinGecko API
      const prices: Record<string, number> = {
        'ETH': 3500, 'BNB': 720, 'MATIC': 0.85, 'AVAX': 42, 'FTM': 0.72,
        'CRO': 0.15, 'USDT': 1, 'USDC': 1, 'DAI': 1,
        'UNI': 12, 'LINK': 18, 'WBTC': 72000, 'SHIB': 0.000025,
        'CAKE': 3.5, 'tBNB': 0,
      };

      const balancesWithValue = allBalances.map(b => ({
        ...b,
        valueUsd: parseFloat(b.balance) * (prices[b.token.symbol] || 0),
      }));

      const totalValueUsd = balancesWithValue.reduce((sum, b) => sum + b.valueUsd, 0);
      const nativeBalance = allBalances.find(b => b.token.isNative)?.balance || '0';

      set({ 
        balances: balancesWithValue,
        totalValueUsd,
        balance: nativeBalance,
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await WalletManager.createWallet();
      set({
        address: result.address,
        hasWallet: true,
        balance: '0',
        balances: [],
      });
      return result;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  importWallet: async (mnemonic: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await WalletManager.importWallet(mnemonic);
      set({
        address: result.address,
        hasWallet: true,
        balance: '0',
        balances: [],
      });
      return result;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  sendCrypto: async (toAddress: string, amount: string, token?: Token) => {
    set({ isLoading: true, error: null });
    try {
      const { selectedChain } = get();
      const result = await WalletManager.sendCrypto(toAddress, amount, selectedChain, token);

      if (result.success) {
        await get().refreshBalances();
      } else {
        set({ error: result.error || 'Transaction failed' });
      }
      return result;
    } catch (err: any) {
      set({ error: err.message });
      return { success: false, error: err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  resetWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      if (await WalletManager.hasWallet()) {
        await WalletManager.deleteWallet();
      }
      set({
        address: null,
        selectedChain: 'ethereum',
        balance: '0',
        balances: [],
        hasWallet: false,
        totalValueUsd: 0,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));