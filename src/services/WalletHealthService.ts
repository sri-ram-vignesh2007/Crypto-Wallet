// src/services/WalletHealthService.ts
// Wallet Health Score — seed backup, device security, wallet age,
// risky approvals, large exposure. Local-only heuristic (no API needed).

const STORAGE_KEY = 'wallet_health_v1';

export interface WalletHealthInput {
  hasBackedUpSeed: boolean;
  hasDeviceBiometricsEnabled: boolean;
  walletCreatedAt: number;
  riskyApprovalsCount: number;
  largestExposureUsd: number;
  totalValueUsd: number;
}

export interface WalletHealthResult {
  score: number;              // 0-100
  level: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  checks: Array<{ label: string; ok: boolean; detail: string; penalty: number }>;
  recommendations: string[];
  // Persisted so future audits can show a history trend.
  timestamp: number;
}

export class WalletHealthService {
  static evaluate(input: WalletHealthInput): WalletHealthResult {
    const checks: WalletHealthResult['checks'] = [];
    const recommendations: string[] = [];

    if (!input.hasBackedUpSeed) {
      checks.push({ label: 'Seed phrase backup', ok: false, detail: 'Seed phrase has not been confirmed as backed up.', penalty: 35 });
      recommendations.push('Write down your 24-word seed phrase on paper and store it offline.');
    } else {
      checks.push({ label: 'Seed phrase backup', ok: true, detail: 'Seed phrase backup confirmed.', penalty: 0 });
    }

    if (!input.hasDeviceBiometricsEnabled) {
      checks.push({ label: 'Device biometrics', ok: false, detail: 'No fingerprint/Face ID enrolled — anyone holding your phone can open the wallet.', penalty: 20 });
      recommendations.push('Set up fingerprint or Face ID in your phone settings.');
    } else {
      checks.push({ label: 'Device biometrics', ok: true, detail: 'Biometrics enabled on this device.', penalty: 0 });
    }

    const ageDays = (Date.now() - input.walletCreatedAt) / 86400000;
    if (ageDays < 1) {
      checks.push({ label: 'Wallet age', ok: false, detail: 'Wallet is brand-new — be cautious of phishing in the first weeks.', penalty: 5 });
      recommendations.push('Be extra cautious with links and approvals for the first few weeks.');
    } else {
      checks.push({ label: 'Wallet age', ok: true, detail: `Wallet age: ${ageDays.toFixed(0)} days.`, penalty: 0 });
    }

    if (input.riskyApprovalsCount > 0) {
      const pen = Math.min(25, input.riskyApprovalsCount * 5);
      checks.push({ label: 'Risky approvals', ok: false, detail: `${input.riskyApprovalsCount} unlimited token approvals are active.`, penalty: pen });
      recommendations.push(`Revoke ${input.riskyApprovalsCount} unlimited token approval(s) you no longer need.`);
    } else {
      checks.push({ label: 'Risky approvals', ok: true, detail: 'No unlimited token approvals detected.', penalty: 0 });
    }

    if (input.totalValueUsd > 0) {
      const exposurePct = input.totalValueUsd > 0 ? (input.largestExposureUsd / input.totalValueUsd) * 100 : 0;
      if (exposurePct > 70) {
        checks.push({ label: 'Concentration exposure', ok: false, detail: `${exposurePct.toFixed(0)}% of your portfolio is in one asset.`, penalty: 10 });
        recommendations.push(`Diversify — more than 70% is concentrated in a single asset.`);
      } else {
        checks.push({ label: 'Concentration exposure', ok: true, detail: `Top exposure: ${exposurePct.toFixed(0)}%.`, penalty: 0 });
      }
    }

    let score = 100;
    for (const c of checks) score -= c.penalty;
    score = Math.max(0, Math.min(100, score));

    let level: WalletHealthResult['level'] = 'critical';
    if (score >= 90) level = 'excellent';
    else if (score >= 75) level = 'good';
    else if (score >= 55) level = 'fair';
    else if (score >= 35) level = 'poor';

    return { score, level, checks, recommendations, timestamp: Date.now() };
  }

  static async saveHistory(result: WalletHealthResult): Promise<void> {
    try {
      const raw = await AsyncStorage_getHistory();
      raw.push(result);
      await setHistory(raw);
    } catch { /* noop */ }
  }

  static async getHistory(): Promise<WalletHealthResult[]> {
    return AsyncStorage_getHistory();
  }
}

// Local helpers (kept inline so the file is self-contained)
import AsyncStorage from '@react-native-async-storage/async-storage';
async function AsyncStorage_getHistory(): Promise<WalletHealthResult[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}
async function setHistory(list: WalletHealthResult[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
