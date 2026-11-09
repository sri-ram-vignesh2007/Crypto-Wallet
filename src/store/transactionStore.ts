// src/store/transactionStore.ts
// Institutional Multi-Asset Balance & Transaction Activity Store with Persistent State

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cura_transactions_v2';
const BALANCES_STORAGE_KEY = 'cura_balances_v2';

export interface WalletTransaction {
  id: string;
  type: 'sent' | 'received' | 'swap';
  asset: string;          // e.g. "ETH" or "ETH → USDC"
  amount: string;         // e.g. "0.52"
  receivedAmount?: string;// e.g. "6858.00" (for swaps)
  value: string;          // e.g. "$1,782.40"
  time: string;           // e.g. "Just now" or "2 min ago"
  status: 'confirmed' | 'pending' | 'failed';
  risk: 'normal' | 'attention' | 'high';
  hash: string;
  from?: string;
  to?: string;
  timestamp: number;
}

export interface UserBalances {
  ETH: number;
  BTC: number;
  SOL: number;
  USDC: number;
}

const DEFAULT_BALANCES: UserBalances = {
  ETH: 306.45,
  BTC: 7.70,
  SOL: 1095.00,
  USDC: 89790.00,
};

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    type: 'sent',
    asset: 'ETH',
    amount: '0.52',
    value: '$1,782.40',
    time: '2 min ago',
    status: 'confirmed',
    risk: 'normal',
    hash: '0xabc1234567890abcdef1234567890abcdef1234',
    to: '0x742d...8f32',
    timestamp: Date.now() - 120000,
  },
  {
    id: 'tx-2',
    type: 'received',
    asset: 'USDC',
    amount: '500',
    value: '$500.00',
    time: '1 hour ago',
    status: 'confirmed',
    risk: 'normal',
    hash: '0xdef4567890abcdef1234567890abcdef12345678',
    from: '0x8a3f...1c9d',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'tx-3',
    type: 'swap',
    asset: 'ETH → USDC',
    amount: '0.25',
    receivedAmount: '857.30',
    value: '$857.30',
    time: '3 hours ago',
    status: 'confirmed',
    risk: 'normal',
    hash: '0xghi7890abcdef1234567890abcdef1234567890',
    timestamp: Date.now() - 10800000,
  },
  {
    id: 'tx-4',
    type: 'sent',
    asset: 'SOL',
    amount: '2.5',
    value: '$418.25',
    time: '5 hours ago',
    status: 'pending',
    risk: 'normal',
    hash: '0xjkl01234567890abcdef1234567890abcdef12',
    to: '0x9b2e...4f1a',
    timestamp: Date.now() - 18000000,
  },
  {
    id: 'tx-5',
    type: 'received',
    asset: 'POL',
    amount: '1,250',
    value: '$1,062.50',
    time: '1 day ago',
    status: 'confirmed',
    risk: 'normal',
    hash: '0xmno34567890abcdef1234567890abcdef123456',
    from: '0x4c8d...7e9f',
    timestamp: Date.now() - 86400000,
  },
];

interface TransactionStoreState {
  transactions: WalletTransaction[];
  balances: UserBalances;
  loadTransactions: () => Promise<void>;
  addTransaction: (tx: WalletTransaction) => void;
  executeSwap: (
    fromSymbol: string,
    toSymbol: string,
    fromAmount: number,
    toAmount: number,
    usdValue: string
  ) => void;
  resetTransactions: () => void;
}

export const useTransactionStore = create<TransactionStoreState>((set, get) => ({
  transactions: INITIAL_TRANSACTIONS,
  balances: DEFAULT_BALANCES,

  loadTransactions: async () => {
    try {
      const [rawTxs, rawBalances] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(BALANCES_STORAGE_KEY),
      ]);

      if (rawTxs) {
        set({ transactions: JSON.parse(rawTxs) });
      }
      if (rawBalances) {
        set({ balances: JSON.parse(rawBalances) });
      }
    } catch {}
  },

  addTransaction: (tx: WalletTransaction) => {
    const updated = [tx, ...get().transactions];
    set({ transactions: updated });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  executeSwap: (
    fromSymbol: string,
    toSymbol: string,
    fromAmount: number,
    toAmount: number,
    usdValue: string
  ) => {
    const currentBalances = { ...get().balances };

    // Deduct from fromSymbol if recognized
    const fromKey = fromSymbol.toUpperCase() as keyof UserBalances;
    if (currentBalances[fromKey] !== undefined) {
      currentBalances[fromKey] = Math.max(0, currentBalances[fromKey] - fromAmount);
    }

    // Add to toSymbol if recognized
    const toKey = toSymbol.toUpperCase() as keyof UserBalances;
    if (currentBalances[toKey] !== undefined) {
      currentBalances[toKey] = currentBalances[toKey] + toAmount;
    }

    // Create realistic transaction hash
    const randomHex = Math.random().toString(16).substring(2, 10);
    const txHash = `0x${randomHex}${Date.now().toString(16)}c4c1605f6e89`;

    const newTx: WalletTransaction = {
      id: `swap-${Date.now()}`,
      type: 'swap',
      asset: `${fromSymbol} → ${toSymbol}`,
      amount: fromAmount.toFixed(fromAmount < 1 ? 4 : 2),
      receivedAmount: toAmount.toFixed(toAmount < 1 ? 4 : 2),
      value: usdValue,
      time: 'Just now',
      status: 'confirmed',
      risk: 'normal',
      hash: txHash,
      timestamp: Date.now(),
    };

    const updatedTxs = [newTx, ...get().transactions];

    set({
      balances: currentBalances,
      transactions: updatedTxs,
    });

    // Persist both
    Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTxs)),
      AsyncStorage.setItem(BALANCES_STORAGE_KEY, JSON.stringify(currentBalances)),
    ]).catch(() => {});
  },

  resetTransactions: () => {
    set({
      transactions: INITIAL_TRANSACTIONS,
      balances: DEFAULT_BALANCES,
    });
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    AsyncStorage.removeItem(BALANCES_STORAGE_KEY).catch(() => {});
  },
}));

