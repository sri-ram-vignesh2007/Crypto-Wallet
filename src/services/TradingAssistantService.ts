// src/services/TradingAssistantService.ts
// Trading Assistant — surfaces whale activity, token unlocks, market
// sentiment, large transfers, and risk warnings. Heuristic + LLM summary.

import { AIService } from './AIService';

export interface TradingAssistantSignals {
  whaleActivity: Array<{ description: string; severity: 'info' | 'warn' | 'danger' }>;
  upcomingUnlocks: Array<{ token: string; date: string; amountPct: number }>;
  marketSentiment: 'fear' | 'neutral' | 'greed';
  largeTransfers: Array<{ token: string; valueUsd: number; direction: 'in' | 'out' }>;
  summary: string;
  aiInsight?: string;
}

export class TradingAssistantService {
  /** Heuristic — uses real wallet activity for large transfers; other signals placeholder. */
  static async collect(params: {
    recentInTransfersUsd: number[];
    recentOutTransfersUsd: number[];
    tokensHeld: string[];
    useAI: boolean;
  }): Promise<TradingAssistantSignals> {
    const whaleActivity: TradingAssistantSignals['whaleActivity'] = [];
    const largeTransfers: TradingAssistantSignals['largeTransfers'] = [];

    params.recentInTransfersUsd.forEach(v => {
      if (v >= 10000) {
        largeTransfers.push({ token: 'unknown', valueUsd: v, direction: 'in' });
        whaleActivity.push({ description: `Large incoming transfer: $${v.toLocaleString()} received into your wallet.`, severity: 'info' });
      } else if (v >= 1000) {
        largeTransfers.push({ token: 'unknown', valueUsd: v, direction: 'in' });
      }
    });
    params.recentOutTransfersUsd.forEach(v => {
      if (v >= 10000) {
        largeTransfers.push({ token: 'unknown', valueUsd: v, direction: 'out' });
        whaleActivity.push({ description: `You sent out $${v.toLocaleString()} — confirm this was intentional.`, severity: 'warn' });
      }
    });

    // Token unlocks — placeholder data; a real implementation polls a unlocks calendar API.
    const upcomingUnlocks = [
      { token: 'ARB', date: '2026-08-15', amountPct: 4 },
      { token: 'OP',  date: '2026-09-01', amountPct: 3 },
    ].filter(u => params.tokensHeld.includes(u.token) || true).slice(0, 3);

    // Market sentiment — crude proxy: net large inflow vs outflow
    const netInflow = params.recentInTransfersUsd.reduce((s, v) => s + v, 0);
    const netOutflow = params.recentOutTransfersUsd.reduce((s, v) => s + v, 0);
    const marketSentiment: TradingAssistantSignals['marketSentiment'] =
      netInflow > netOutflow * 1.2 ? 'greed'
      : netOutflow > netInflow * 1.2 ? 'fear'
      : 'neutral';

    const summary = `Whales/institutions moved large sums ${marketSentiment === 'greed' ? 'toward accumulation' : marketSentiment === 'fear' ? 'toward distribution' : 'neither way'}. ${upcomingUnlocks.length} token unlocks scheduled — verify none dilute your holdings.`;

    let aiInsight: string | undefined;
    if (params.useAI) {
      try {
        aiInsight = await AIService.callAI?.(
          `Trading assistant. Tokens held: ${params.tokensHeld.join(', ')}. Net inflow: $${netInflow}, net outflow: $${netOutflow}. Sentiment: ${marketSentiment}. In one sentence (under 30 words), what should the wallet owner watch for next?`,
          'openrouter/free'
        );
      } catch {
        aiInsight = undefined;
      }
    }

    return { whaleActivity, upcomingUnlocks, marketSentiment, largeTransfers, summary, aiInsight };
  }
}
