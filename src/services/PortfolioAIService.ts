// src/services/PortfolioAIService.ts
// Portfolio AI — P/L, tax estimate, portfolio health, rebalance suggestions,
// yield opportunities. Heuristic + optional OpenRouter narrative.

import { AIService } from './AIService';

export interface PortfolioSnapshotDTO {
  holdings: Array<{ symbol: string; amount: string; valueUsd: number; costBasisUsd: number }>;
  totalValueUsd: number;
}

export interface PortfolioHealth {
  score: number;             // 0-100
  concentrationRiskLevel: 'low' | 'medium' | 'high';
  issues: string[];
  suggestions: string[];
}

export interface PortfolioAIResult {
  totalCostBasis: number;
  totalValue: number;
  totalPnLUsd: number;
  totalPnLPct: number;
  perTokenPnL: Array<{ symbol: string; pnlUsd: number; pnlPct: number }>;
  estimatedCapitalGainsUsd: number; // simple — assumes 30% of positive P/L is taxable
  taxLiabilityUsd: number;         // assumes short-term 35% (US heuristic)
  health: PortfolioHealth;
  rebalanceSuggestions: string[];
  yieldOpportunities: string[];
  aiNarrative?: string;
}

export class PortfolioAIService {
  static analyze(snapshot: PortfolioSnapshotDTO): PortfolioAIResult {
    // Total P/L
    const totalCostBasis = snapshot.holdings.reduce((s, h) => s + h.costBasisUsd, 0);
    const totalValue = snapshot.totalValueUsd;
    const totalPnLUsd = totalValue - totalCostBasis;
    const totalPnLPct = totalCostBasis > 0 ? (totalPnLUsd / totalCostBasis) * 100 : 0;

    // Per-token P/L
    const perTokenPnL = snapshot.holdings.map(h => {
      const pnlUsd = h.valueUsd - h.costBasisUsd;
      const pnlPct = h.costBasisUsd > 0 ? (pnlUsd / h.costBasisUsd) * 100 : 0;
      return { symbol: h.symbol, pnlUsd, pnlPct };
    });

    // Tax — heuristic: short-term capital gains on 30% of the realized+unrealized gain
    const estimatedCapitalGainsUsd = Math.max(0, totalPnLUsd * 0.30);
    const taxLiabilityUsd = estimatedCapitalGainsUsd * 0.35;

    // Concentration risk
    const sortedByWeight = [...snapshot.holdings].sort((a, b) => b.valueUsd - a.valueUsd);
    const topWeight = sortedByWeight[0] ? (sortedByWeight[0].valueUsd / totalValue) * 100 : 0;
    let concentrationRiskLevel: PortfolioHealth['concentrationRiskLevel'] = 'low';
    if (topWeight > 60) concentrationRiskLevel = 'high';
    else if (topWeight > 35) concentrationRiskLevel = 'medium';

    const issues: string[] = [];
    if (topWeight > 60) issues.push(`${sortedByWeight[0]?.symbol} makes up ${topWeight.toFixed(0)}% of your portfolio — high concentration.`);
    const losers = perTokenPnL.filter(p => p.pnlPct < -25);
    losers.forEach(l => issues.push(`${l.symbol} is down ${Math.abs(l.pnlPct).toFixed(0)}% from your cost basis — consider rebalancing.`));

    // Health score — starts 100, loses for concentration + losers + no diversification
    let score = 100;
    if (concentrationRiskLevel === 'high')     score -= 25;
    else if (concentrationRiskLevel === 'medium') score -= 10;
    score -= Math.min(25, losers.length * 8);
    if (snapshot.holdings.length < 3)           score -= 10;
    score = Math.max(0, Math.min(100, score));

    const suggestions: string[] = [];
    if (concentrationRiskLevel === 'high') suggestions.push(`Reduce ${sortedByWeight[0]?.symbol} below 50% by trimming or adding to other holdings.`);
    if (snapshot.holdings.length < 3) suggestions.push('Increase diversification — consider holding at least 3–4 assets.');
    if (losers.length > 0) suggestions.push(`Review losing positions (${losers.map(l => l.symbol).join(', ')}) — tax-loss harvesting may be useful.`);

    // Rebalance suggestions
    const rebalanceSuggestions: string[] = [];
    if (topWeight > 50) rebalanceSuggestions.push(`Trim ${sortedByWeight[0]?.symbol} to ~50% — current ${(topWeight).toFixed(0)}%.`);
    if (snapshot.holdings.length < 4) rebalanceSuggestions.push(`Add 1–2 uncorrelated assets (e.g. ETH, USDC) for diversification.`);

    // Yield opportunities — generic placeholder list
    const yieldOpportunities: string[] = [];
    if (snapshot.holdings.some(h => h.symbol === 'USDC' || h.symbol === 'USDT')) {
      yieldOpportunities.push('Stablecoin: Aave/Compound lending — ~4–8% APY.');
    }
    if (snapshot.holdings.some(h => h.symbol === 'ETH')) {
      yieldOpportunities.push('ETH: Lido / Rocket Pool staking — ~3–5% APY.');
    }
    if (yieldOpportunities.length === 0) {
      yieldOpportunities.push('No idle asset identified. Deposit an asset to see specific yield options.');
    }

    return {
      totalCostBasis, totalValue, totalPnLUsd, totalPnLPct,
      perTokenPnL, estimatedCapitalGainsUsd, taxLiabilityUsd,
      health: { score, concentrationRiskLevel, issues, suggestions },
      rebalanceSuggestions, yieldOpportunities,
    };
  }

  /** Optional LLM narrative summation */
  static async narrative(snapshot: PortfolioSnapshotDTO, result: PortfolioAIResult): Promise<string> {
    const prompt =
`Portfolio total: $${result.totalValue.toFixed(2)}, P/L: $${result.totalPnLUsd.toFixed(2)} (${result.totalPnLPct.toFixed(1)}%).
Health: ${result.health.score}/100 (${result.health.concentrationRiskLevel} concentration).
Holdings: ${JSON.stringify(snapshot.holdings.map(h => ({ s: h.symbol, v: h.valueUsd, c: h.costBasisUsd })))}.
Issues: ${result.health.issues.join('; ') || 'none'}.
Give a concise (max 80 words) plain-English portfolio review and 1 actionable next step.`;
    try {
      return await AIService.callAI?.(prompt, 'openrouter/free') ?? '';
    } catch {
      return '';
    }
  }

  /** Tax Assistant — generates CSV rows for capital gains. */
  static taxCSV(snapshot: PortfolioSnapshotDTO): string {
    const header = 'asset,amount,cost_basis_usd,current_value_usd,realized_gain_usd,estimated_tax_usd\n';
    const rows = snapshot.holdings.map(h => {
      const gain = Math.max(0, h.valueUsd - h.costBasisUsd);
      const tax = gain * 0.35;
      return `${h.symbol},${h.amount},${h.costBasisUsd.toFixed(2)},${h.valueUsd.toFixed(2)},${gain.toFixed(2)},${tax.toFixed(2)}`;
    });
    return header + rows.join('\n');
  }
}
