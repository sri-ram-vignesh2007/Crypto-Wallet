// src/services/SecurityService.ts
// Smart Spending Limits + Emergency Lock + Guardian Recovery + Agent Mode rules.
// All values persisted in AsyncStorage. These are *enforcement points* the
// app consults before signing or sending transactions.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_SECURITY_KEY = 'security_limits_v1';
const STORAGE_GUARDIANS    = 'guardians_v1';
const STORAGE_AGENT_RULES  = 'agent_rules_v1';
const STORAGE_LOCK_STATE   = 'emergency_lock_v1';

export interface SpendingLimits {
  dailyLimitUsd: number;       // 0 = unlimited
  largeTransferThresholdUsd: number; // require extra auth above this
  spentTodayUsd: number;
  spentTodayDay: number; // day-of-year for reset
}

export class SecurityService {
  static async getLimits(): Promise<SpendingLimits> {
    const raw = await AsyncStorage.getItem(STORAGE_SECURITY_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fallthrough */ }
    }
    return {
      dailyLimitUsd: 1000,            // sensible default
      largeTransferThresholdUsd: 500,
      spentTodayUsd: 0,
      spentTodayDay: dayOfYear(),
    };
  }

  static async setLimits(limits: Partial<SpendingLimits>): Promise<void> {
    const cur = await SecurityService.getLimits();
    const next = { ...cur, ...limits };
    await AsyncStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(next));
  }

  /** Returns an error message if the tx should be blocked, otherwise null. */
  static async checkSend(amountUsd: number): Promise<string | null> {
    const limits = await SecurityService.getLimits();
    const today = dayOfYear();
    if (limits.spentTodayDay !== today) {
      limits.spentTodayDay = today;
      limits.spentTodayUsd = 0;
      await AsyncStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(limits));
    }

    if (limits.dailyLimitUsd > 0 && (limits.spentTodayUsd + amountUsd) > limits.dailyLimitUsd) {
      return `This transfer exceeds your daily limit of $${limits.dailyLimitUsd}. Spent today: $${limits.spentTodayUsd.toFixed(2)}.`;
    }
    return null;
  }

  /** Record an outgoing send so the daily tally stays accurate. */
  static async recordSend(amountUsd: number): Promise<void> {
    const limits = await SecurityService.getLimits();
    const today = dayOfYear();
    if (limits.spentTodayDay !== today) {
      limits.spentTodayDay = today;
      limits.spentTodayUsd = 0;
    }
    limits.spentTodayUsd += amountUsd;
    await AsyncStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(limits));
  }

  static async requiresExtraAuth(amountUsd: number): Promise<boolean> {
    const limits = await SecurityService.getLimits();
    return amountUsd > limits.largeTransferThresholdUsd;
  }
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

// ============================================
// Emergency Lock
// ============================================
export interface EmergencyLockState {
  locked: boolean;
  lockedAt: number;
  reason?: string;
}

export class EmergencyLockService {
  static async getState(): Promise<EmergencyLockState> {
    const raw = await AsyncStorage.getItem(STORAGE_LOCK_STATE);
    return raw ? JSON.parse(raw) : { locked: false, lockedAt: 0 };
  }

  static async lock(reason: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_LOCK_STATE, JSON.stringify({ locked: true, lockedAt: Date.now(), reason }));
  }

  static async unlock(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_LOCK_STATE);
  }
}

// ============================================
// Guardian Recovery
// ============================================
export interface Guardian {
  id: string;
  name: string;
  address: string;          // guardian's wallet address
  emailOrPhone?: string;     // optional contact
  role: 'friend' | 'hardware' | 'device';
}

export class GuardianService {
  static async list(): Promise<Guardian[]> {
    const raw = await AsyncStorage.getItem(STORAGE_GUARDIANS);
    return raw ? JSON.parse(raw) : [];
  }

  static async add(g: Omit<Guardian, 'id'>): Promise<void> {
    const list = await GuardianService.list();
    list.push({ ...g, id: Math.random().toString(36).slice(2) });
    await AsyncStorage.setItem(STORAGE_GUARDIANS, JSON.stringify(list));
  }

  static async remove(id: string): Promise<void> {
    const list = (await GuardianService.list()).filter(g => g.id !== id);
    await AsyncStorage.setItem(STORAGE_GUARDIANS, JSON.stringify(list));
  }

  /** Minimum # of guardian approvals required to recover. */
  static async recoveryThreshold(): Promise<number> {
    const list = await GuardianService.list();
    return Math.max(1, Math.ceil(list.length * 0.6)); // 60% majority
  }
}

// ============================================
// Agent Mode — recurring self-custody rules
// ============================================
export interface AgentRule {
  id: string;
  description: string;      // human description
  amountUsd: number;
  frequencyDays: number;
  intervalAsset: string;    // e.g. "BTC", "ETH"
  lastRun?: number;
  paused: boolean;
  createdAt: number;
}

export class AgentService {
  static async listRules(): Promise<AgentRule[]> {
    const raw = await AsyncStorage.getItem(STORAGE_AGENT_RULES);
    return raw ? JSON.parse(raw) : [];
  }

  static async addRule(rule: Omit<AgentRule, 'id' | 'createdAt' | 'paused'>): Promise<void> {
    const list = await AgentService.listRules();
    list.push({
      ...rule,
      id: Math.random().toString(36).slice(2),
      paused: false,
      createdAt: Date.now(),
    });
    await AsyncStorage.setItem(STORAGE_AGENT_RULES, JSON.stringify(list));
  }

  static async togglePause(id: string): Promise<void> {
    const list = (await AgentService.listRules()).map(r => r.id === id ? { ...r, paused: !r.paused } : r);
    await AsyncStorage.setItem(STORAGE_AGENT_RULES, JSON.stringify(list));
  }

  static async removeRule(id: string): Promise<void> {
    const list = (await AgentService.listRules()).filter(r => r.id !== id);
    await AsyncStorage.setItem(STORAGE_AGENT_RULES, JSON.stringify(list));
  }

  /** Returns any due rules — the UI then prepares a tx and asks for approval. */
  static async dueRules(): Promise<AgentRule[]> {
    const list = await AgentService.listRules();
    const now = Date.now();
    return list.filter(r => !r.paused && (!r.lastRun || (now - r.lastRun) / 86400000 >= r.frequencyDays));
  }

  static async markRun(id: string): Promise<void> {
    const list = (await AgentService.listRules()).map(r =>
      r.id === id ? { ...r, lastRun: Date.now() } : r
    );
    await AsyncStorage.setItem(STORAGE_AGENT_RULES, JSON.stringify(list));
  }
}

// ============================================
// Social Recovery — recipient claim ledger
// ============================================
export interface SocialClaim {
  id: string;
  senderAddress: string;
  recipientHandle: string;  // email/phone/username given by the sender
  amountUsd: number;
  tokenSymbol: string;
  claimedAddress?: string;  // wallet that claimed it
  claimedAt?: number;
  createdAt: number;
  note?: string;
}

const STORAGE_SOCIAL_CLAIMS = 'social_claims_v1';

export class SocialRecoveryService {
  static async listClaims(): Promise<SocialClaim[]> {
    const raw = await AsyncStorage.getItem(STORAGE_SOCIAL_CLAIMS);
    return raw ? JSON.parse(raw) : [];
  }

  static async createClaim(claim: Omit<SocialClaim, 'id' | 'createdAt'>): Promise<void> {
    const list = await SocialRecoveryService.listClaims();
    list.push({ ...claim, id: Math.random().toString(36).slice(2), createdAt: Date.now() });
    await AsyncStorage.setItem(STORAGE_SOCIAL_CLAIMS, JSON.stringify(list));
  }

  /** Mark a claim as claimed (recipient must provide their wallet address). */
  static async claim(id: string, recipientAddress: string): Promise<void> {
    const list = (await SocialRecoveryService.listClaims()).map(c =>
      c.id === id ? { ...c, claimedAddress: recipientAddress, claimedAt: Date.now() } : c
    );
    await AsyncStorage.setItem(STORAGE_SOCIAL_CLAIMS, JSON.stringify(list));
  }
}
