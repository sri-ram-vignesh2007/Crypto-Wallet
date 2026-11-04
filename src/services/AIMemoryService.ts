// src/services/AIMemoryService.ts
// AI Memory — learns user preferences, patterns, and behaviors to personalize the wallet experience
// Stores: favorite chains, preferred DEXs, risk level, frequent contacts, default slippage, notification prefs

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ai_memory_v1';

export interface UserPreferences {
  // Chain & Network
  favoriteChains: string[];           // e.g., ['ethereum', 'arbitrum', 'base']
  defaultChain: string;               // default chain for new transactions
  
  // Trading & Swapping
  preferredDEXs: string[];            // e.g., ['1inch', '0x', 'Uniswap V3']
  defaultSlippage: number;            // e.g., 0.5 (percentage)
  autoSlippage: boolean;              // auto-adjust based on volatility
  maxGasPriceGwei: number;            // e.g., 50
  preferL2: boolean;                  // prefer L2 when available
  
  // Risk & Security
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  requireBiometricForAll: boolean;
  dailyLimitUsd: number;
  largeTxThresholdUsd: number;
  autoRevokeApprovals: boolean;       // auto-revoke after use
  
  // Contacts & Address Book
  frequentContacts: Array<{ label: string; address: string; count: number }>;
  
  // Notifications
  notifications: {
    priceAlerts: boolean;
    governanceProposals: boolean;
    nftFloorAlerts: boolean;
    largeTransferAlerts: boolean;
    stakingRewards: boolean;
    securityAlerts: boolean;
  };
  
  // Display
  currency: 'USD' | 'EUR' | 'GBP';
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  
  // AI Behavior
  aiVerbosity: 'concise' | 'normal' | 'detailed';
  aiAutoExplain: boolean;             // auto-explain transactions
  preferredAIModel: string;           // model ID from FREE_MODELS
  
  // Learning metadata
  lastUpdated: number;
  interactionCount: number;
}

export interface InteractionEvent {
  id: string;
  type: 'send' | 'swap' | 'buy' | 'stake' | 'vote' | 'claim' | 'settings_change' | 'screen_view';
  timestamp: number;
  chain?: string;
  token?: string;
  amountUsd?: number;
  dex?: string;
  contactLabel?: string;
  screenName?: string;
  settingKey?: string;
  settingValue?: any;
}

export class AIMemoryService {
  private static defaultPreferences: UserPreferences = {
    favoriteChains: ['ethereum'],
    defaultChain: 'ethereum',
    preferredDEXs: ['1inch', '0x', 'Uniswap V3'],
    defaultSlippage: 0.5,
    autoSlippage: true,
    maxGasPriceGwei: 50,
    preferL2: true,
    riskLevel: 'moderate',
    requireBiometricForAll: true,
    dailyLimitUsd: 1000,
    largeTxThresholdUsd: 500,
    autoRevokeApprovals: false,
    frequentContacts: [],
    notifications: {
      priceAlerts: true,
      governanceProposals: true,
      nftFloorAlerts: true,
      largeTransferAlerts: true,
      stakingRewards: true,
      securityAlerts: true,
    },
    currency: 'USD',
    theme: 'system',
    compactMode: false,
    aiVerbosity: 'normal',
    aiAutoExplain: true,
    preferredAIModel: 'meta-llama/llama-3.3-70b-instruct:free',
    lastUpdated: Date.now(),
    interactionCount: 0,
  };

  /** Get current preferences (creates defaults if none exist) */
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const prefs = JSON.parse(raw);
        // Merge with defaults to handle new fields
        return { ...this.defaultPreferences, ...prefs };
      }
    } catch { /* noop */ }
    return { ...this.defaultPreferences };
  }

  /** Save preferences */
  static async savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    const current = await this.getPreferences();
    const updated = { 
      ...current, 
      ...prefs, 
      lastUpdated: Date.now(),
      interactionCount: current.interactionCount + 1,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  /** Record an interaction event for learning */
  static async recordInteraction(event: Omit<InteractionEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(`${STORAGE_KEY}_events`);
      const events: InteractionEvent[] = raw ? JSON.parse(raw) : [];
      
      const newEvent: InteractionEvent = {
        ...event,
        id: Math.random().toString(36).slice(2),
        timestamp: Date.now(),
      };
      
      events.unshift(newEvent);
      // Keep last 500 events
      if (events.length > 500) events.length = 500;
      
      await AsyncStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(events));
      
      // Auto-learn from certain events
      await this.learnFromEvent(newEvent);
    } catch { /* noop */ }
  }

  /** Learn preferences from user behavior */
  private static async learnFromEvent(event: InteractionEvent): Promise<void> {
    const prefs = await this.getPreferences();
    let changed = false;

    switch (event.type) {
      case 'send':
        if (event.chain && !prefs.favoriteChains.includes(event.chain)) {
          prefs.favoriteChains = [event.chain, ...prefs.favoriteChains].slice(0, 5);
          changed = true;
        }
        if (event.contactLabel) {
          const existing = prefs.frequentContacts.find(c => c.label === event.contactLabel);
          if (existing) {
            existing.count++;
          } else {
            prefs.frequentContacts.unshift({ label: event.contactLabel, address: '', count: 1 });
          }
          prefs.frequentContacts.sort((a, b) => b.count - a.count);
          prefs.frequentContacts = prefs.frequentContacts.slice(0, 10);
          changed = true;
        }
        break;

      case 'swap':
        if (event.dex && !prefs.preferredDEXs.includes(event.dex)) {
          prefs.preferredDEXs = [event.dex, ...prefs.preferredDEXs].slice(0, 5);
          changed = true;
        }
        if (event.chain && !prefs.favoriteChains.includes(event.chain)) {
          prefs.favoriteChains = [event.chain, ...prefs.favoriteChains].slice(0, 5);
          changed = true;
        }
        break;

      case 'settings_change':
        // Settings changes are already handled by savePreferences
        break;
    }

    if (changed) {
      prefs.lastUpdated = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
  }

  /** Get interaction history */
  static async getInteractions(limit: number = 50): Promise<InteractionEvent[]> {
    try {
      const raw = await AsyncStorage.getItem(`${STORAGE_KEY}_events`);
      const events: InteractionEvent[] = raw ? JSON.parse(raw) : [];
      return events.slice(0, limit);
    } catch {
      return [];
    }
  }

  /** Get smart defaults for a new transaction based on learned preferences */
  static async getSmartDefaults(context: 'send' | 'swap' | 'buy'): Promise<Partial<UserPreferences>> {
    const prefs = await this.getPreferences();
    
    switch (context) {
      case 'send':
        return {
          defaultChain: prefs.defaultChain,
          dailyLimitUsd: prefs.dailyLimitUsd,
          largeTxThresholdUsd: prefs.largeTxThresholdUsd,
        };
      case 'swap':
        return {
          defaultChain: prefs.defaultChain,
          preferredDEXs: prefs.preferredDEXs,
          defaultSlippage: prefs.defaultSlippage,
          autoSlippage: prefs.autoSlippage,
          maxGasPriceGwei: prefs.maxGasPriceGwei,
          preferL2: prefs.preferL2,
        };
      case 'buy':
        return {
          defaultChain: prefs.defaultChain,
          currency: prefs.currency,
        };
    }
  }

  /** Get personalized AI prompt context */
  static async getAIContext(): Promise<string> {
    const prefs = await this.getPreferences();
    const contacts = prefs.frequentContacts.slice(0, 5).map(c => c.label).join(', ');
    const chains = prefs.favoriteChains.join(', ');
    const dexes = prefs.preferredDEXs.join(', ');
    
    return `User preferences: Risk=${prefs.riskLevel}, Favorite chains=${chains}, Preferred DEXs=${dexes}, Default slippage=${prefs.defaultSlippage}%, Frequent contacts=${contacts || 'none'}, Currency=${prefs.currency}, AI verbosity=${prefs.aiVerbosity}.`;
  }

  /** Reset all memory (for privacy/debug) */
  static async reset(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEY, `${STORAGE_KEY}_events`]);
  }

  /** Export memory for backup */
  static async export(): Promise<string> {
    const prefs = await this.getPreferences();
    const events = await this.getInteractions(1000);
    return JSON.stringify({ preferences: prefs, interactions: events }, null, 2);
  }
}