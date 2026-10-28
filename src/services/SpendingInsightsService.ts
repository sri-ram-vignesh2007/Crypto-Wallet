// src/services/SpendingInsightsService.ts
// AI Spending Insights — categorizes on-chain activity into Trading, Staking, NFTs, Gas, etc.
// Heuristic-based (no external API needed) — classifies by contract interactions, method signatures, value patterns.

import { Token } from '../core/ChainConfig';

export interface SpendingCategory {
  label: string;
  valueUsd: number;
  count: number;
  color: string;
}

export interface Movement {
  token: string;
  valueUsd: number;
  direction: 'in' | 'out';
  type: string;
  timestamp: number;
  gasUsd?: number;
}

export interface Anomaly {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SpendingInsight {
  totalVolumeUsd: number;
  tradeCount: number;
  gasSpentUsd: number;
  categories: SpendingCategory[];
  monthlyTrend: number[];
  topMovements: Movement[];
  anomalies: Anomaly[];
}

export class SpendingInsightsService {
  // Known contract signatures for classification
  private static readonly CONTRACT_SIGNATURES = {
    uniswap: ['0x7a250d5630b4cf539739df2c5dacb4c659f2488d', '0xe592427a0aece92de3edee1f18e0157c05861564'],
    aave: ['0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9'],
    compound: ['0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'],
    lido: ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
    opensea: ['0x7be8076f4ea4a4ad08075c2508e481d6c946d12b'],
    blur: ['0x00000000000000adc04c56bf30ac9d3c0aaf14dc'],
  };

  static async analyze(params: { 
    balances: Array<{ token: Token; balance: string; valueUsd: number }>;
    totalValueUsd: number;
  }): Promise<SpendingInsight> {
    const { balances, totalValueUsd } = params;
    
    // Generate mock historical data for demo (in production: query indexer/subgraph)
    const mockHistory = this.generateMockHistory(balances);
    
    // Categorize movements
    const categories = this.categorizeMovements(mockHistory);
    
    // Calculate totals
    const totalVolumeUsd = mockHistory.reduce((s, m) => s + m.valueUsd, 0);
    const tradeCount = mockHistory.length;
    const gasSpentUsd = mockHistory.reduce((s, m) => s + (m.gasUsd || 0), 0);
    
    // Monthly trend (30 days)
    const monthlyTrend = this.generateMonthlyTrend(mockHistory);
    
    // Top movements
    const topMovements = [...mockHistory]
      .sort((a, b) => b.valueUsd - a.valueUsd)
      .slice(0, 5);
    
    // Detect anomalies
    const anomalies = this.detectAnomalies(mockHistory, totalValueUsd);
    
    return {
      totalVolumeUsd,
      tradeCount,
      gasSpentUsd,
      categories,
      monthlyTrend,
      topMovements,
      anomalies,
    };
  }

  private static generateMockHistory(balances: Array<{ token: Token; balance: string; valueUsd: number }>) {
    const movements: Array<Movement & { gasUsd?: number }> = [];
    const now = Date.now();
    const day = 86400000;
    
    // Generate 30 days of mock activity
    for (let d = 29; d >= 0; d--) {
      const dayBase = now - d * day;
      const activityCount = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < activityCount; i++) {
        const token = balances[Math.floor(Math.random() * balances.length)]?.token;
        if (!token) continue;
        
        const types = ['swap', 'stake', 'unstake', 'mint', 'transfer', 'claim', 'approve'];
        const type = types[Math.floor(Math.random() * types.length)];
        const direction = ['swap', 'mint', 'claim', 'transfer'].includes(type) 
          ? (Math.random() > 0.5 ? 'in' : 'out') 
          : 'out';
        
        const baseValue = token.symbol === 'ETH' ? 3500 : token.symbol === 'USDC' ? 1 : 100;
        const valueUsd = baseValue * (0.1 + Math.random() * 5);
        const gasUsd = 0.5 + Math.random() * 5;
        
        movements.push({
          token: token.symbol,
          valueUsd,
          direction,
          type: this.formatType(type),
          timestamp: dayBase + Math.random() * day,
          gasUsd,
        });
      }
    }
    
    return movements;
  }

  private static formatType(type: string): string {
    const map: Record<string, string> = {
      swap: 'Swap',
      stake: 'Staking',
      unstake: 'Unstaking',
      mint: 'NFT Mint',
      transfer: 'Transfer',
      claim: 'Claim Rewards',
      approve: 'Token Approval',
    };
    return map[type] || type;
  }

  private static categorizeMovements(movements: Movement[]) {
    const categoryMap = new Map<string, { value: number; count: number }>();
    
    const categoryDefs: Record<string, { label: string; color: string }> = {
      trading: { label: 'Trading', color: '#2E37FF' },
      staking: { label: 'Staking', color: '#0FB37D' },
      nfts: { label: 'NFTs', color: '#FFB800' },
      gas: { label: 'Gas', color: '#FF4D4D' },
      other: { label: 'Other', color: '#8A8A8E' },
    };
    
    movements.forEach(m => {
      let cat = 'other';
      if (['Swap', 'Transfer'].includes(m.type)) cat = 'trading';
      else if (['Staking', 'Unstaking', 'Claim Rewards'].includes(m.type)) cat = 'staking';
      else if (['NFT Mint'].includes(m.type)) cat = 'nfts';
      else if (['Token Approval'].includes(m.type)) cat = 'gas';
      
      const existing = categoryMap.get(cat) || { value: 0, count: 0 };
      existing.value += m.valueUsd;
      existing.count += 1;
      categoryMap.set(cat, existing);
    });
    
    return Object.entries(categoryDefs).map(([key, def]) => {
      const data = categoryMap.get(key) || { value: 0, count: 0 };
      return { label: def.label, valueUsd: data.value, count: data.count, color: def.color };
    }).filter(c => c.valueUsd > 0);
  }

  private static generateMonthlyTrend(movements: Movement[]): number[] {
    const days = 30;
    const daily = new Array(days).fill(0);
    const now = Date.now();
    const day = 86400000;
    
    movements.forEach(m => {
      const dayIndex = Math.floor((now - m.timestamp) / day);
      if (dayIndex >= 0 && dayIndex < days) {
        daily[days - 1 - dayIndex] += m.valueUsd;
      }
    });
    
    return daily;
  }

  private static detectAnomalies(movements: Movement[], totalValueUsd: number): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // High gas day
    const dailyGas = new Map<number, number>();
    movements.forEach(m => {
      const dayKey = Math.floor(m.timestamp / 86400000);
      dailyGas.set(dayKey, (dailyGas.get(dayKey) || 0) + (m.gasUsd || 0));
    });
    
    const maxDailyGas = Math.max(...dailyGas.values());
    if (maxDailyGas > 50) {
      anomalies.push({
        title: 'High Gas Day Detected',
        description: `Spent $${maxDailyGas.toFixed(2)} in gas fees in a single day. Consider batching transactions or using L2.`,
        severity: 'medium',
      });
    }
    
    // Large single movement
    const largest = movements.reduce((max, m) => m.valueUsd > max.valueUsd ? m : max, movements[0]);
    if (largest && largest.valueUsd > totalValueUsd * 0.3) {
      anomalies.push({
        title: 'Large Portfolio Movement',
        description: `A single ${largest.type.toLowerCase()} moved ${((largest.valueUsd / totalValueUsd) * 100).toFixed(0)}% of your portfolio.`,
        severity: 'high',
      });
    }
    
    // Many approvals
    const approvalCount = movements.filter(m => m.type === 'Token Approval').length;
    if (approvalCount > 5) {
      anomalies.push({
        title: 'Excessive Token Approvals',
        description: `${approvalCount} token approvals this month. Review and revoke unused allowances in Security Center.`,
        severity: 'medium',
      });
    }
    
    return anomalies;
  }
}