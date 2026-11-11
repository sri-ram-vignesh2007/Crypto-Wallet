// src/store/walletStore.ts
// MULTI-CHAIN & MULTI-WALLET STATE — supports up to 4 distinct wallets, ALL chains and ALL tokens

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { WalletManager } from '../core/WalletManager';
import { SecureKeyManager } from '../core/SecureKeyManager';
import { rpcManager } from '../core/RPCManager';
import { Token } from '../core/ChainConfig';

export interface TokenBalance {
  token: Token;
  balance: string;
  valueUsd: number;
}

export interface MultiWalletItem {
  id: string;
  name: string;
  address: string;
  solanaAddress?: string;
  bitcoinAddress?: string;
  createdAt: number;
}

const STORAGE_MULTI_WALLETS = 'cura_multi_wallets_v3';
const STORAGE_ACTIVE_INDEX = 'cura_active_wallet_idx_v3';

interface WalletState {
  address: string | null;
  selectedChain: string;
  balance: string;              // Native token balance (for backward compat)
  balances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  hasWallet: boolean;
  totalValueUsd: number;

  // Multi-wallet properties (up to 4 wallets)
  wallets: MultiWalletItem[];
  activeWalletIndex: number;
  activeWallet: MultiWalletItem | null;

  setSelectedChain: (chain: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  loadWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  createWallet: () => Promise<{ address: string; warning: string }>;
  importWallet: (mnemonic: string) => Promise<{ address: string }>;
  createAdditionalWallet: (customName?: string) => Promise<{ success: boolean; wallet?: MultiWalletItem; error?: string }>;
  switchWallet: (index: number) => Promise<void>;
  renameWallet: (id: string, newName: string) => Promise<void>;
  deleteWallet: (id: string) => Promise<{ success: boolean; error?: string }>;
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
  hasWallet: true,
  totalValueUsd: 0,
  wallets: [
    {
      id: 'wallet-1',
      name: 'Main Wallet',
      address: '0x71C67EaE6976A0C3e54BaF88215382A61d4b389A',
      createdAt: Date.now(),
    },
  ],
  activeWalletIndex: 0,
  activeWallet: {
    id: 'wallet-1',
    name: 'Main Wallet',
    address: '0x71C67EaE6976A0C3e54BaF88215382A61d4b389A',
    createdAt: Date.now(),
  },

  setSelectedChain: (selectedChain) => {
    set({ selectedChain });
    get().refreshBalances();
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  loadWallet: async () => {
    set({ isLoading: false, error: null, hasWallet: true });
    try {
      const exists = await WalletManager.hasWallet();

      let primaryAddress = '0x71C67EaE6976A0C3e54BaF88215382A61d4b389A';
      let primarySol = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      let primaryBtc = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

      if (exists) {
        const addr = await WalletManager.getReceiveAddress();
        if (addr) primaryAddress = addr;
        const solAddr = await WalletManager.getSolanaAddress();
        if (solAddr) primarySol = solAddr;
        const btcAddr = await WalletManager.getBitcoinAddress();
        if (btcAddr) primaryBtc = btcAddr;
      }

      // Load saved multi-wallets from storage
      let savedWallets: MultiWalletItem[] = [];
      try {
        const raw = await AsyncStorage.getItem(STORAGE_MULTI_WALLETS);
        if (raw) savedWallets = JSON.parse(raw);
      } catch {}

      if (!savedWallets || savedWallets.length === 0) {
        savedWallets = [
          {
            id: 'wallet-1',
            name: 'Main Wallet',
            address: primaryAddress,
            solanaAddress: primarySol,
            bitcoinAddress: primaryBtc,
            createdAt: Date.now(),
          },
        ];
        await AsyncStorage.setItem(STORAGE_MULTI_WALLETS, JSON.stringify(savedWallets));
      }

      let activeIdx = 0;
      try {
        const savedIdx = await AsyncStorage.getItem(STORAGE_ACTIVE_INDEX);
        if (savedIdx !== null) {
          const parsed = parseInt(savedIdx, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < savedWallets.length) {
            activeIdx = parsed;
          }
        }
      } catch {}

      const active = savedWallets[activeIdx] || savedWallets[0];
      set({
        wallets: savedWallets,
        activeWalletIndex: activeIdx,
        activeWallet: active,
        address: active.address,
        hasWallet: true,
        isLoading: false,
      });

      // Refresh balances in background without blocking initial app load
      get().refreshBalances().catch(() => {});
    } catch (err: any) {
      set({ error: err.message, hasWallet: true, isLoading: false });
    }
  },

  switchWallet: async (index: number) => {
    const { wallets } = get();
    if (index < 0 || index >= wallets.length) return;

    const selected = wallets[index];
    set({
      activeWalletIndex: index,
      activeWallet: selected,
      address: selected.address,
    });
    try {
      await AsyncStorage.setItem(STORAGE_ACTIVE_INDEX, index.toString());
    } catch {}

    await get().refreshBalances();
  },

  createAdditionalWallet: async (customName?: string) => {
    const { wallets } = get();
    if (wallets.length >= 4) {
      return { success: false, error: 'Maximum limit of 4 wallets reached' };
    }

    try {
      const nextAccountIndex = wallets.length;
      const derived = await SecureKeyManager.deriveAccount(nextAccountIndex);
      const evmAddr = derived ? derived.evmAddress : ethers.Wallet.createRandom().address;
      const solAddr = derived ? derived.solanaAddress : undefined;
      const btcAddr = derived ? derived.bitcoinAddress : undefined;

      const newWallet: MultiWalletItem = {
        id: `wallet-${Date.now()}`,
        name: customName?.trim() || `Wallet ${wallets.length + 1}`,
        address: evmAddr,
        solanaAddress: solAddr,
        bitcoinAddress: btcAddr,
        createdAt: Date.now(),
      };

      const updated = [...wallets, newWallet];
      const newActiveIdx = updated.length - 1;

      set({
        wallets: updated,
        activeWalletIndex: newActiveIdx,
        activeWallet: newWallet,
        address: newWallet.address,
      });

      await AsyncStorage.setItem(STORAGE_MULTI_WALLETS, JSON.stringify(updated));
      await AsyncStorage.setItem(STORAGE_ACTIVE_INDEX, newActiveIdx.toString());

      await get().refreshBalances();
      return { success: true, wallet: newWallet };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create wallet' };
    }
  },

  renameWallet: async (id: string, newName: string) => {
    const { wallets, activeWalletIndex } = get();
    const updated = wallets.map(w => w.id === id ? { ...w, name: newName.trim() || w.name } : w);
    set({
      wallets: updated,
      activeWallet: updated[activeWalletIndex] || updated[0],
    });
    try {
      await AsyncStorage.setItem(STORAGE_MULTI_WALLETS, JSON.stringify(updated));
    } catch {}
  },

  deleteWallet: async (id: string) => {
    const { wallets, activeWalletIndex } = get();
    if (wallets.length <= 1) {
      return { success: false, error: 'Cannot delete your only wallet.' };
    }

    const filtered = wallets.filter(w => w.id !== id);
    let newIdx = activeWalletIndex;
    if (newIdx >= filtered.length) {
      newIdx = filtered.length - 1;
    }

    const active = filtered[newIdx];
    set({
      wallets: filtered,
      activeWalletIndex: newIdx,
      activeWallet: active,
      address: active.address,
    });

    try {
      await AsyncStorage.setItem(STORAGE_MULTI_WALLETS, JSON.stringify(filtered));
      await AsyncStorage.setItem(STORAGE_ACTIVE_INDEX, newIdx.toString());
    } catch {}

    await get().refreshBalances();
    return { success: true };
  },

  refreshBalances: async () => {
    const { address, selectedChain } = get();
    if (!address) return;

    set({ isLoading: true });
    try {
      const allBalances = await rpcManager.getAllBalances(address, selectedChain);
      
      // USD price reference
      const prices: Record<string, number> = {
        'ETH': 3500, 'BNB': 720, 'MATIC': 0.85, 'AVAX': 42, 'FTM': 0.72,
        'CRO': 0.15, 'USDT': 1, 'USDC': 1, 'DAI': 1,
        'UNI': 12, 'LINK': 18, 'WBTC': 72000, 'SHIB': 0.000025,
        'CAKE': 3.5, 'tBNB': 0, 'POL': 0.85, 'SOL': 185,
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
      const initialWallet: MultiWalletItem = {
        id: 'wallet-1',
        name: 'Main Wallet',
        address: result.address,
        solanaAddress: result.solanaAddress,
        bitcoinAddress: result.bitcoinAddress,
        createdAt: Date.now(),
      };
      set({
        address: result.address,
        hasWallet: true,
        balance: '0',
        balances: [],
        wallets: [initialWallet],
        activeWalletIndex: 0,
        activeWallet: initialWallet,
      });
      await AsyncStorage.setItem(STORAGE_MULTI_WALLETS, JSON.stringify([initialWallet]));
      await AsyncStorage.setItem(STORAGE_ACTIVE_INDEX, '0');
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
      const initialWallet: MultiWalletItem = {
        id: 'wallet-1',
        name: 'Main Wallet',
        address: result.address,
        solanaAddress: result.solanaAddress,
        bitcoinAddress: result.bitcoinAddress,
        createdAt: Date.now(),
      };
      set({
        address: result.address,
        hasWallet: true,
        balance: '0',
        balances: [],
        wallets: [initialWallet],
        activeWalletIndex: 0,
        activeWallet: initialWallet,
      });
      await AsyncStorage.setItem(STORAGE_MULTI_WALLETS, JSON.stringify([initialWallet]));
      await AsyncStorage.setItem(STORAGE_ACTIVE_INDEX, '0');
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
      const targetChain = token?.chainKey || selectedChain;
      const result = await WalletManager.sendCrypto(toAddress, amount, targetChain, token);

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
      await AsyncStorage.removeItem(STORAGE_MULTI_WALLETS);
      await AsyncStorage.removeItem(STORAGE_ACTIVE_INDEX);
      set({
        address: null,
        selectedChain: 'ethereum',
        balance: '0',
        balances: [],
        hasWallet: false,
        totalValueUsd: 0,
        wallets: [],
        activeWalletIndex: 0,
        activeWallet: null,
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
